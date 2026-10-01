import { AgentAccount, RecipientIntel, PolicyRule, TransactionAuditRecord } from '../types/agent-wallet';

export const INITIAL_AGENTS: AgentAccount[] = [
  {
    id: 'agent-harvester',
    name: 'Harvester-Alpha',
    role: 'Autonomous Market Data & Order Book Harvester',
    did: 'did:agent:eth:0x49f381c828d19e07f92023a1098b671e3b2e7a11',
    standard: 'ERC-6551',
    walletAddress: '0x49f381c828d19e07f92023a1098b671e3b2e7a11',
    parentNftContract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    parentTokenId: '402',
    teeEnclaveType: 'Intel SGX',
    enclaveMeasurementHash: '0x8f3c71e0bb56123498aefcd11029348fa9102834b9281726aedcba829104fa22',
    balances: {
      usdc: 342.85,
      eth: 1.45,
      agt: 12500,
    },
    sessionKeys: [
      {
        id: 'sk-901',
        publicKey: '0x0283bf17a8c39e0129bc...e91a',
        fingerprint: 'fp_tee_sgx_harvester_v2',
        label: 'Micro-Query Ephemeral Key (6h TTL)',
        validUntil: '2026-10-01T04:00:00Z',
        maxAllowancePerTx: 5.0,
        dailyAllowance: 40.0,
        dailySpent: 8.42,
        whitelistedMethods: ['GET /v1/market-depth', 'GET /v1/subnetwork/telemetry', 'x402_settle'],
        status: 'active',
      },
      {
        id: 'sk-902',
        publicKey: '0x0349a12c8e0018b14a2f...11cd',
        fingerprint: 'fp_tee_sgx_batch_archiver',
        label: 'Batch Data Archivist Session Key',
        validUntil: '2026-10-02T12:00:00Z',
        maxAllowancePerTx: 15.0,
        dailyAllowance: 80.0,
        dailySpent: 0.0,
        whitelistedMethods: ['POST /v1/archive', 'x402_settle'],
        status: 'active',
      }
    ],
  },
  {
    id: 'agent-compute',
    name: 'NeuralRunner-Beta',
    role: 'Autonomous AI Inference & GPU Task Consumer',
    did: 'did:agent:eth:0x88b21ca13490f84236e78921cb91207e052cf091',
    standard: 'ERC-4337',
    walletAddress: '0x88b21ca13490f84236e78921cb91207e052cf091',
    entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    teeEnclaveType: 'AWS Nitro Enclave',
    enclaveMeasurementHash: '0x22c4a919fb42aef9128034cb72e091124890cbe3114a82190fedba001248ab91',
    balances: {
      usdc: 890.12,
      eth: 3.20,
      agt: 45000,
    },
    sessionKeys: [
      {
        id: 'sk-441',
        publicKey: '0x04192ba898cbe...8120',
        fingerprint: 'fp_nitro_gpu_runner',
        label: 'GPU Inference Session Key (12h TTL)',
        validUntil: '2026-10-01T18:00:00Z',
        maxAllowancePerTx: 25.0,
        dailyAllowance: 150.0,
        dailySpent: 42.10,
        whitelistedMethods: ['POST /v1/inference', 'x402_settle'],
        status: 'active',
      }
    ],
  },
  {
    id: 'agent-crawler',
    name: 'DeepCrawler-Gamma',
    role: 'Decentralized Academic Whitepaper Indexer',
    did: 'did:agent:eth:0x12d99c4238e90a41f1904721ab842907be1841a0',
    standard: 'ERC-6551',
    walletAddress: '0x12d99c4238e90a41f1904721ab842907be1841a0',
    parentNftContract: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    parentTokenId: '1088',
    teeEnclaveType: 'ARM TrustZone',
    enclaveMeasurementHash: '0x11029348fa9102834b9281726aedcba829104fa228f3c71e0bb56123498aefcd',
    balances: {
      usdc: 145.50,
      eth: 0.65,
      agt: 3100,
    },
    sessionKeys: [
      {
        id: 'sk-102',
        publicKey: '0x03189fedac098...771a',
        fingerprint: 'fp_trustzone_academic',
        label: 'HTTP 402 Pay-Per-Article Key',
        validUntil: '2026-10-01T10:00:00Z',
        maxAllowancePerTx: 2.0,
        dailyAllowance: 20.0,
        dailySpent: 1.25,
        whitelistedMethods: ['GET /v1/paper/download', 'x402_settle'],
        status: 'active',
      }
    ],
  }
];

export const INITIAL_RECIPIENTS: RecipientIntel[] = [
  // Blocked / Unsafe Recipients
  {
    address: '0x8589427373D6D84E98730D7795D8f6f8731FDA16',
    label: 'Tornado Cash 0.1 ETH Pool',
    domain: 'tornadocash.eth',
    riskLevel: 'sanctioned',
    category: 'ofac_sanctions',
    reason: 'Identified on OFAC SDN Sanctions List #14992 (Decentralized Crypto Mixer). Prohibited under FinCEN and Policy POL-SANCTION-001.',
    evidenceCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    lastUpdated: '2026-09-28',
    isBlacklisted: true,
  },
  {
    address: '0x66a1012d4991206f0e9b110a30b20147e8c18712',
    label: 'Permit2 Phishing Drainer Honeypot',
    domain: 'uniswap-permit2-gasless.cc',
    riskLevel: 'unsafe_blocked',
    category: 'phishing_drainer',
    reason: 'Reported by ScamSniffer & Blockaid: Deployed malicious ERC-20 permit drainer that attempts to siphon agent master allowances.',
    evidenceCid: 'bafybeih4j7a9b0c8d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x',
    lastUpdated: '2026-09-30',
    isBlacklisted: true,
  },
  {
    address: '0x9043bc5e1289c0018a42df98cbe01924b11f2003',
    label: 'Unverified Flash Loan Arbitrage Proxy',
    domain: 'dark-arb-pool.io',
    riskLevel: 'unsafe_blocked',
    category: 'unverified_contract',
    reason: 'Contract contains unverified opaque bytecode with re-entrancy vectors and unverified delegatecall to arbitrary addresses.',
    evidenceCid: 'bafybeicde3fgh4ijk5lmn6opq7rst8uvw9xyz0123456789abcdef01234',
    lastUpdated: '2026-09-29',
    isBlacklisted: true,
  },
  {
    address: '0x331288cc109e847291a004721eb849207e012345',
    label: 'Suspicious Telegram OTC Bridge',
    domain: 'fast-otc-swaps.tg',
    riskLevel: 'elevated',
    category: 'suspicious_velocity',
    reason: 'Velocity anomaly detected: 480% surge in abnormal micro-transfers within 3 hours; flagged for human-in-the-loop review.',
    evidenceCid: 'bafybeihjk1234567890abcdefghijklmnopqrstuvwxyz1234567890abc',
    lastUpdated: '2026-09-30',
    isBlacklisted: false,
  },

  // Safe / Verified Recipients
  {
    address: '0x384192b0c721884391206f0e9b110a30b20147e8',
    label: 'InferenceHub Decentralized GPU Gateway',
    domain: 'api.inference-hub.ai',
    riskLevel: 'safe',
    category: 'trusted_api_gateway',
    reason: 'Verified x402 Micropayment API provider with valid ERC-8004 attestation. Clean AML audit score 99/100.',
    evidenceCid: 'bafybeib7g6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a',
    lastUpdated: '2026-09-25',
    isBlacklisted: false,
  },
  {
    address: '0x192844aab01289c0018a42df98cbe01924b11f20',
    label: 'Subnetwork Vector DB Pay-Per-Query',
    domain: 'vectors.subnetwork.ai',
    riskLevel: 'safe',
    category: 'trusted_api_gateway',
    reason: 'Verified machine-to-machine x402 data query endpoint with cryptographic receipt generator.',
    evidenceCid: 'bafybeif0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e',
    lastUpdated: '2026-09-20',
    isBlacklisted: false,
  },
  {
    address: '0x7712990f1490f84236e78921cb91207e052cf091',
    label: 'OpenResearch Academic DOI Gateway',
    domain: 'gateway.openresearch.org',
    riskLevel: 'safe',
    category: 'verified_merchant',
    reason: 'Registered non-profit machine-to-machine repository for automated open-access archival.',
    evidenceCid: 'bafybeic1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b',
    lastUpdated: '2026-09-18',
    isBlacklisted: false,
  }
];

export const INITIAL_POLICIES: PolicyRule[] = [
  {
    id: 'POL-SANCTION-001',
    name: 'Sanctions & Mixer Shield',
    description: 'Immediately blocks any transaction targeting OFAC-listed addresses, Tornado Cash, or known crypto mixers.',
    category: 'sanctions',
    enabled: true,
    severity: 'BLOCK',
    params: {
      blockMixers: true,
    }
  },
  {
    id: 'POL-SECURITY-002',
    name: 'Phishing Honeypot & Malicious Bytecode Guard',
    description: 'Prohibits calling contracts flagged by threat feeds or contracts without verified source code on explorers.',
    category: 'contract_safety',
    enabled: true,
    severity: 'BLOCK',
    params: {
      allowUnverifiedBytecode: false,
    }
  },
  {
    id: 'POL-LIMIT-003',
    name: 'Single Transaction Autonomous Spending Cap',
    description: 'Limits individual autonomous agent transactions. Any transaction exceeding the cap triggers mandatory Human-in-the-Loop approval.',
    category: 'financial_limit',
    enabled: true,
    severity: 'REQUIRE_HITL',
    params: {
      maxSingleTxUsd: 25.0,
      hitlThresholdUsd: 25.0,
    }
  },
  {
    id: 'POL-BUDGET-004',
    name: '24-Hour Rolling Budget Protection',
    description: 'Prevents agent runaway expenditure by enforcing a daily cumulative spending ceiling across all active session keys.',
    category: 'financial_limit',
    enabled: true,
    severity: 'BLOCK',
    params: {
      dailyBudgetCapUsd: 150.0,
    }
  },
  {
    id: 'POL-HARDWARE-005',
    name: 'TEE Enclave Hardware Attestation Mandate',
    description: 'Enforces that every transaction signature must originate within a valid hardware enclave (Intel SGX / AWS Nitro) with verified quote.',
    category: 'hardware_tee',
    enabled: true,
    severity: 'BLOCK',
    params: {
      requireTeeAttestation: true,
    }
  },
  {
    id: 'POL-REPUTATION-006',
    name: 'Dynamic Recipient Risk Assessment',
    description: 'Evaluates recipient domain reputation, transaction velocity spikes, and unverified smart contract proxies.',
    category: 'reputation',
    enabled: true,
    severity: 'REQUIRE_HITL',
    params: {}
  }
];

export const INITIAL_TRANSACTIONS: TransactionAuditRecord[] = [
  {
    id: 'tx_9812_blocked_sanction',
    timestamp: '2026-09-30T16:32:10Z',
    agentId: 'agent-harvester',
    agentName: 'Harvester-Alpha',
    agentDid: 'did:agent:eth:0x49f381c828d19e07f92023a1098b671e3b2e7a11',
    recipientAddress: '0x8589427373D6D84E98730D7795D8f6f8731FDA16',
    recipientLabel: 'Tornado Cash 0.1 ETH Pool',
    recipientRisk: 'sanctioned',
    threatCategory: 'ofac_sanctions',
    amount: 0.1,
    token: 'ETH',
    valueUsd: 265.40,
    actionType: 'transfer',
    verdict: 'BLOCKED_POLICY_VIOLATION',
    violatedRule: {
      id: 'POL-SANCTION-001',
      name: 'Sanctions & Mixer Shield',
      ruleCode: 'RULE_OFAC_SANCTION_MATCH',
      reason: 'Recipient address matched SDN List #14992 (Tornado Cash). Autonomous execution aborted to protect agent self-custody compliance.'
    },
    policyChecks: [
      { ruleName: 'POL-SANCTION-001 (Sanctions & Mixer)', passed: false, detail: 'Recipient on prohibited OFAC/Mixer blacklist' },
      { ruleName: 'POL-LIMIT-003 (Autonomous Cap)', passed: false, detail: 'Exceeded $25.00 limit ($265.40 attempted)' },
      { ruleName: 'POL-HARDWARE-005 (TEE Attestation)', passed: true, detail: 'Intel SGX enclave measurement verified' }
    ],
    attestation: {
      attestationId: 'attest_0x9812_viol_blk',
      attestationHash: '0xd4e567f18b3294871928374a00192834b9281726aedcba829104fa228f3c71e0',
      signatureRsv: '0x8841a0e19...c391d84',
      teeProvider: 'Intel SGX',
      pcrQuote: '0x9f1a28cb...4419ad',
      measurementHash: '0x8f3c71e0bb56123498aefcd11029348fa9102834b9281726aedcba829104fa22',
      sessionKeyFingerprint: 'fp_tee_sgx_harvester_v2',
      merkleAuditRoot: '0x3344556677889900aabbccddeeff00112233445566778899aabbccddeeff0011',
      canonicalPayload: {
        action: 'transfer',
        target: '0x8589427373D6D84E98730D7795D8f6f8731FDA16',
        amountWei: '100000000000000000',
        token: 'ETH',
        blockedReason: 'OFAC_SANCTIONS_MATCH',
        gasEstimateGwei: 21,
      },
      verified: true
    }
  },
  {
    id: 'tx_9811_blocked_phish',
    timestamp: '2026-09-30T15:45:22Z',
    agentId: 'agent-crawler',
    agentName: 'DeepCrawler-Gamma',
    agentDid: 'did:agent:eth:0x12d99c4238e90a41f1904721ab842907be1841a0',
    recipientAddress: '0x66a1012d4991206f0e9b110a30b20147e8c18712',
    recipientLabel: 'Permit2 Phishing Drainer Honeypot',
    recipientRisk: 'unsafe_blocked',
    threatCategory: 'phishing_drainer',
    amount: 10.0,
    token: 'USDC',
    valueUsd: 10.0,
    actionType: 'contract_call',
    verdict: 'BLOCKED_POLICY_VIOLATION',
    violatedRule: {
      id: 'POL-SECURITY-002',
      name: 'Phishing Honeypot & Malicious Bytecode Guard',
      ruleCode: 'RULE_MALICIOUS_DRAINER_SIG',
      reason: 'Contract contains malicious Permit2 drainer signature. Agent guardrail blocked call to protect asset custody.'
    },
    policyChecks: [
      { ruleName: 'POL-SECURITY-002 (Phishing Guard)', passed: false, detail: 'Address flagged in threat intel feed (ScamSniffer)' },
      { ruleName: 'POL-LIMIT-003 (Autonomous Cap)', passed: true, detail: 'Within $25.00 limit ($10.00)' },
      { ruleName: 'POL-HARDWARE-005 (TEE Attestation)', passed: true, detail: 'ARM TrustZone enclave active' }
    ],
    attestation: {
      attestationId: 'attest_0x9811_drain_blk',
      attestationHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
      signatureRsv: '0x712a89cb1...99e8a0f',
      teeProvider: 'ARM TrustZone',
      pcrQuote: '0x18ab72cc...901ef4',
      measurementHash: '0x11029348fa9102834b9281726aedcba829104fa228f3c71e0bb56123498aefcd',
      sessionKeyFingerprint: 'fp_trustzone_academic',
      merkleAuditRoot: '0x44556677889900aabbccddeeff00112233445566778899aabbccddeeff001122',
      canonicalPayload: {
        action: 'contract_call',
        target: '0x66a1012d4991206f0e9b110a30b20147e8c18712',
        methodSignature: 'permit(address,TokenPermissions,uint256,bytes)',
        blockedReason: 'MALICIOUS_DRAINER_SIGNATURE',
      },
      verified: true
    }
  },
  {
    id: 'tx_9810_x402_success',
    timestamp: '2026-09-30T15:10:04Z',
    agentId: 'agent-harvester',
    agentName: 'Harvester-Alpha',
    agentDid: 'did:agent:eth:0x49f381c828d19e07f92023a1098b671e3b2e7a11',
    recipientAddress: '0x192844aab01289c0018a42df98cbe01924b11f20',
    recipientLabel: 'Subnetwork Vector DB Pay-Per-Query',
    recipientRisk: 'safe',
    threatCategory: 'trusted_api_gateway',
    amount: 0.005,
    token: 'USDC',
    valueUsd: 0.005,
    actionType: 'x402_micropayment',
    verdict: 'APPROVED_EXECUTED',
    policyChecks: [
      { ruleName: 'POL-SANCTION-001 (Sanctions Shield)', passed: true, detail: 'Recipient address verified clean' },
      { ruleName: 'POL-LIMIT-003 (Autonomous Cap)', passed: true, detail: 'Amount $0.005 is within $25.00 autonomous threshold' },
      { ruleName: 'POL-BUDGET-004 (Daily Rolling Budget)', passed: true, detail: 'Daily cumulative spend $8.425 / $150.00' },
      { ruleName: 'POL-HARDWARE-005 (TEE Attestation)', passed: true, detail: 'Intel SGX enclave signed payment voucher' }
    ],
    x402: {
      httpEndpoint: 'https://vectors.subnetwork.ai/v1/query/embedding',
      method: 'POST',
      serverRealm: 'subnetwork-vector-indexer',
      challengeNonce: 'x402_nonce_7f8a912c980b1',
      priceRate: '0.005 USDC per similarity search',
      priceAmountUsd: 0.005,
      currency: 'USDC',
      receiverAddress: '0x192844aab01289c0018a42df98cbe01924b11f20',
      statusCode: 200,
      responsePayloadPreview: '{"matches": 14, "topSimilarity": 0.9842, "vectorDim": 1536, "latencyMs": 18}'
    },
    attestation: {
      attestationId: 'attest_0x9810_x402_ok',
      attestationHash: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      signatureRsv: '0x19b841a0e19...c391d84',
      teeProvider: 'Intel SGX',
      pcrQuote: '0x55aa12cc...8899aa',
      measurementHash: '0x8f3c71e0bb56123498aefcd11029348fa9102834b9281726aedcba829104fa22',
      sessionKeyFingerprint: 'fp_tee_sgx_harvester_v2',
      merkleAuditRoot: '0x556677889900aabbccddeeff00112233445566778899aabbccddeeff00112233',
      canonicalPayload: {
        x402ChallengeId: 'x402_nonce_7f8a912c980b1',
        endpoint: 'https://vectors.subnetwork.ai/v1/query/embedding',
        payerDid: 'did:agent:eth:0x49f381c828d19e07f92023a1098b671e3b2e7a11',
        amountUsdc: '0.005',
        validUntilSeconds: 300,
      },
      verified: true
    }
  },
  {
    id: 'tx_9809_hitl_pending',
    timestamp: '2026-09-30T14:28:45Z',
    agentId: 'agent-compute',
    agentName: 'NeuralRunner-Beta',
    agentDid: 'did:agent:eth:0x88b21ca13490f84236e78921cb91207e052cf091',
    recipientAddress: '0x384192b0c721884391206f0e9b110a30b20147e8',
    recipientLabel: 'InferenceHub Decentralized GPU Gateway',
    recipientRisk: 'safe',
    threatCategory: 'trusted_api_gateway',
    amount: 85.0,
    token: 'USDC',
    valueUsd: 85.0,
    actionType: 'compute_rental',
    verdict: 'AWAITING_HITL_APPROVAL',
    policyChecks: [
      { ruleName: 'POL-SANCTION-001 (Sanctions Shield)', passed: true, detail: 'Recipient address verified clean' },
      { ruleName: 'POL-LIMIT-003 (Autonomous Cap)', passed: false, detail: 'Attempted $85.00 exceeds $25.00 autonomous threshold -> Mandatory Operator Signoff' },
      { ruleName: 'POL-BUDGET-004 (Daily Rolling Budget)', passed: true, detail: 'Within daily $150.00 cap' },
      { ruleName: 'POL-HARDWARE-005 (TEE Attestation)', passed: true, detail: 'AWS Nitro quote generated and awaiting co-signature' }
    ],
    attestation: {
      attestationId: 'attest_0x9809_hitl_held',
      attestationHash: '0x778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566',
      signatureRsv: '0x9918a0e19...c391d84',
      teeProvider: 'AWS Nitro Enclave',
      pcrQuote: '0x8899aa12cc...8899aa',
      measurementHash: '0x22c4a919fb42aef9128034cb72e091124890cbe3114a82190fedba001248ab91',
      sessionKeyFingerprint: 'fp_nitro_gpu_runner',
      merkleAuditRoot: '0x6677889900aabbccddeeff00112233445566778899aabbccddeeff0011223344',
      canonicalPayload: {
        task: 'Cluster Node Reservation: 8x H100 80GB (2 Hours)',
        recipient: '0x384192b0c721884391206f0e9b110a30b20147e8',
        amountUsdc: '85.00',
        holdReason: 'EXCEEDED_AUTONOMOUS_CAP_25_USD',
      },
      verified: true
    }
  }
];
