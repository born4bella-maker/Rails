import { 
  AgentAccount, 
  RecipientIntel, 
  PolicyRule, 
  TransactionAuditRecord, 
  TxVerdict, 
  EnclaveAttestation,
  X402Challenge,
  ThreatCategory
} from '../types/agent-wallet';

// Simple deterministic hex generator for attestation hashes and quotes
function pseudoHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  const repeated = `${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.slice(0, 64);
  return `0x${repeated}`;
}

export function generateAttestation(
  agent: AgentAccount,
  actionType: string,
  targetAddress: string,
  amount: number,
  token: string,
  verdict: TxVerdict,
  violationReason?: string
): EnclaveAttestation {
  const timestamp = Date.now().toString();
  const canonicalPayload = {
    agentDid: agent.did,
    walletAddress: agent.walletAddress,
    targetAddress,
    actionType,
    amount,
    token,
    verdict,
    violationReason: violationReason || null,
    enclaveTimestamp: timestamp,
    teeType: agent.teeEnclaveType,
    enclaveMeasurement: agent.enclaveMeasurementHash,
  };

  const payloadString = JSON.stringify(canonicalPayload);
  const attestationHash = pseudoHash(payloadString);
  const signatureRsv = `0x${pseudoHash(attestationHash + '_rsv').slice(2, 66)}1b`;
  const pcrQuote = `0x${pseudoHash(agent.enclaveMeasurementHash + timestamp).slice(2, 50)}`;
  const merkleAuditRoot = pseudoHash(`merkle_root_${attestationHash}`);

  const activeSessionKey = agent.sessionKeys.find(k => k.status === 'active') || agent.sessionKeys[0];

  return {
    attestationId: `attest_0x${pseudoHash(timestamp).slice(2, 10)}`,
    attestationHash,
    signatureRsv,
    teeProvider: agent.teeEnclaveType,
    pcrQuote,
    measurementHash: agent.enclaveMeasurementHash,
    sessionKeyFingerprint: activeSessionKey ? activeSessionKey.fingerprint : 'fp_master_enclave',
    merkleAuditRoot,
    canonicalPayload,
    verified: true,
  };
}

export function evaluateTransaction({
  agent,
  recipientAddress,
  recipientLabel,
  amount,
  token,
  valueUsd,
  actionType,
  policies,
  recipientDb,
  x402Details,
}: {
  agent: AgentAccount;
  recipientAddress: string;
  recipientLabel?: string;
  amount: number;
  token: 'USDC' | 'ETH' | 'AGT';
  valueUsd: number;
  actionType: 'x402_micropayment' | 'contract_call' | 'transfer' | 'compute_rental';
  policies: PolicyRule[];
  recipientDb: RecipientIntel[];
  x402Details?: Partial<X402Challenge>;
}): TransactionAuditRecord {
  const normAddress = recipientAddress.trim().toLowerCase();
  const knownRecipient = recipientDb.find(r => r.address.toLowerCase() === normAddress);

  const policyChecks: { ruleName: string; passed: boolean; detail: string }[] = [];
  let verdict: TxVerdict = 'APPROVED_EXECUTED';
  let violatedRule: TransactionAuditRecord['violatedRule'] = undefined;

  // 1. Sanctions & Mixer Shield (POL-SANCTION-001)
  const sanctionsPolicy = policies.find(p => p.id === 'POL-SANCTION-001');
  if (sanctionsPolicy && sanctionsPolicy.enabled) {
    if (knownRecipient?.category === 'ofac_sanctions' || knownRecipient?.riskLevel === 'sanctioned') {
      verdict = 'BLOCKED_POLICY_VIOLATION';
      violatedRule = {
        id: 'POL-SANCTION-001',
        name: 'Sanctions & Mixer Shield',
        ruleCode: 'RULE_OFAC_SANCTION_MATCH',
        reason: `Target address (${recipientAddress}) is matched on OFAC SDN Sanctions / Mixer Blocklist. Action strictly prohibited under regulatory guardrails.`,
      };
      policyChecks.push({
        ruleName: 'POL-SANCTION-001 (Sanctions & Mixer)',
        passed: false,
        detail: `Address classified as prohibited mixer / sanctioned entity: ${knownRecipient.reason}`,
      });
    } else {
      policyChecks.push({
        ruleName: 'POL-SANCTION-001 (Sanctions & Mixer)',
        passed: true,
        detail: 'Recipient passed OFAC sanctions & Tornado mixer screening.',
      });
    }
  }

  // 2. Phishing Honeypot & Malicious Bytecode Guard (POL-SECURITY-002)
  const phishingPolicy = policies.find(p => p.id === 'POL-SECURITY-002');
  if (phishingPolicy && phishingPolicy.enabled && verdict !== 'BLOCKED_POLICY_VIOLATION') {
    if (knownRecipient?.category === 'phishing_drainer' || knownRecipient?.category === 'unverified_contract' || knownRecipient?.riskLevel === 'unsafe_blocked') {
      verdict = 'BLOCKED_POLICY_VIOLATION';
      violatedRule = {
        id: 'POL-SECURITY-002',
        name: 'Phishing Honeypot & Malicious Bytecode Guard',
        ruleCode: knownRecipient.category === 'phishing_drainer' ? 'RULE_MALICIOUS_DRAINER_SIG' : 'RULE_UNVERIFIED_CONTRACT_BYTECODE',
        reason: `Target recipient is flagged unsafe (${knownRecipient.label}). ${knownRecipient.reason}`,
      };
      policyChecks.push({
        ruleName: 'POL-SECURITY-002 (Honeypot Guard)',
        passed: false,
        detail: `Violated contract safety policy: ${knownRecipient.reason}`,
      });
    } else {
      policyChecks.push({
        ruleName: 'POL-SECURITY-002 (Honeypot Guard)',
        passed: true,
        detail: 'Recipient contract bytecode verified or target is an unflagged account.',
      });
    }
  }

  // 3. Autonomous Single Transaction Spending Limit (POL-LIMIT-003)
  const limitPolicy = policies.find(p => p.id === 'POL-LIMIT-003');
  const limitThreshold = limitPolicy?.params.maxSingleTxUsd ?? 25.0;
  if (limitPolicy && limitPolicy.enabled && verdict !== 'BLOCKED_POLICY_VIOLATION') {
    if (valueUsd > limitThreshold) {
      verdict = 'AWAITING_HITL_APPROVAL';
      violatedRule = {
        id: 'POL-LIMIT-003',
        name: 'Single Transaction Autonomous Spending Cap',
        ruleCode: 'RULE_AUTONOMOUS_LIMIT_EXCEEDED',
        reason: `Attempted amount of $${valueUsd.toFixed(2)} exceeds agent autonomous threshold ($${limitThreshold.toFixed(2)}). Mandatory human-in-the-loop co-signature required.`,
      };
      policyChecks.push({
        ruleName: 'POL-LIMIT-003 (Autonomous Cap)',
        passed: false,
        detail: `Transaction value $${valueUsd.toFixed(2)} exceeds autonomous cap $${limitThreshold.toFixed(2)} -> Held for operator review`,
      });
    } else {
      policyChecks.push({
        ruleName: 'POL-LIMIT-003 (Autonomous Cap)',
        passed: true,
        detail: `Amount $${valueUsd.toFixed(2)} is within autonomous authorization cap ($${limitThreshold.toFixed(2)})`,
      });
    }
  }

  // 4. Daily Rolling Budget Cap (POL-BUDGET-004)
  const budgetPolicy = policies.find(p => p.id === 'POL-BUDGET-004');
  const dailyCap = budgetPolicy?.params.dailyBudgetCapUsd ?? 150.0;
  const currentDailySpent = agent.sessionKeys.reduce((acc, k) => acc + k.dailySpent, 0);
  if (budgetPolicy && budgetPolicy.enabled && verdict !== 'BLOCKED_POLICY_VIOLATION') {
    if (currentDailySpent + valueUsd > dailyCap) {
      verdict = 'BLOCKED_POLICY_VIOLATION';
      violatedRule = {
        id: 'POL-BUDGET-004',
        name: '24-Hour Rolling Budget Protection',
        ruleCode: 'RULE_DAILY_BUDGET_EXHAUSTED',
        reason: `Daily budget cap of $${dailyCap.toFixed(2)} would be exceeded. Current spent: $${currentDailySpent.toFixed(2)}, attempted: $${valueUsd.toFixed(2)}.`,
      };
      policyChecks.push({
        ruleName: 'POL-BUDGET-004 (Daily Budget)',
        passed: false,
        detail: `Daily budget limit of $${dailyCap.toFixed(2)} exceeded`,
      });
    } else {
      policyChecks.push({
        ruleName: 'POL-BUDGET-004 (Daily Budget)',
        passed: true,
        detail: `Current cumulative daily spend $${(currentDailySpent + valueUsd).toFixed(2)} / $${dailyCap.toFixed(2)}`,
      });
    }
  }

  // 5. Hardware TEE Attestation (POL-HARDWARE-005)
  const teePolicy = policies.find(p => p.id === 'POL-HARDWARE-005');
  if (teePolicy && teePolicy.enabled) {
    policyChecks.push({
      ruleName: 'POL-HARDWARE-005 (TEE Attestation)',
      passed: true,
      detail: `${agent.teeEnclaveType} verified quote with valid PCR measurement hash`,
    });
  }

  const attestation = generateAttestation(
    agent,
    actionType,
    recipientAddress,
    amount,
    token,
    verdict,
    violatedRule?.reason
  );

  const resolvedRecipientLabel = knownRecipient?.label || recipientLabel || 'External Counterparty';
  const resolvedRisk = knownRecipient?.riskLevel || 'safe';
  const resolvedCategory: ThreatCategory = knownRecipient?.category || (actionType === 'x402_micropayment' ? 'trusted_api_gateway' : 'verified_merchant');

  let finalX402: X402Challenge | undefined = undefined;
  if (actionType === 'x402_micropayment') {
    finalX402 = {
      httpEndpoint: x402Details?.httpEndpoint || 'https://api.inference-hub.ai/v1/compute',
      method: x402Details?.method || 'POST',
      serverRealm: x402Details?.serverRealm || 'inference-gateway',
      challengeNonce: x402Details?.challengeNonce || `x402_${pseudoHash(Date.now().toString()).slice(2, 16)}`,
      priceRate: x402Details?.priceRate || `${amount} ${token} per request`,
      priceAmountUsd: valueUsd,
      currency: token,
      receiverAddress: recipientAddress,
      statusCode: verdict === 'APPROVED_EXECUTED' ? 200 : 402,
      responsePayloadPreview: verdict === 'APPROVED_EXECUTED' 
        ? (x402Details?.responsePayloadPreview || '{"status": "success", "quotaUnlocked": true, "timestamp": ' + Date.now() + '}')
        : undefined,
    };
  }

  return {
    id: `tx_${Date.now()}_${verdict.slice(0, 4).toLowerCase()}`,
    timestamp: new Date().toISOString(),
    agentId: agent.id,
    agentName: agent.name,
    agentDid: agent.did,
    recipientAddress,
    recipientLabel: resolvedRecipientLabel,
    recipientRisk: resolvedRisk,
    threatCategory: resolvedCategory,
    amount,
    token,
    valueUsd,
    actionType,
    verdict,
    violatedRule,
    policyChecks,
    x402: finalX402,
    attestation,
  };
}
