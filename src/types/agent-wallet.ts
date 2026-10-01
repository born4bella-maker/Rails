/**
 * AgentVault - Autonomous Agent Self-Custody & Machine Micropayment (x402) Types
 * Reference: ERC-6551, ERC-4337, x402 Micropayments, TEE Signing Enclaves
 */

export type AgentStandard = 'ERC-6551' | 'ERC-4337';

export interface SessionKey {
  id: string;
  publicKey: string;
  fingerprint: string;
  label: string;
  validUntil: string;
  maxAllowancePerTx: number;
  dailyAllowance: number;
  dailySpent: number;
  whitelistedMethods: string[];
  status: 'active' | 'expired' | 'revoked';
}

export interface AgentAccount {
  id: string;
  name: string;
  role: string;
  did: string;
  standard: AgentStandard;
  walletAddress: string;
  parentNftContract?: string;
  parentTokenId?: string;
  entryPointAddress?: string; // ERC-4337 EntryPoint
  teeEnclaveType: 'Intel SGX' | 'AWS Nitro Enclave' | 'ARM TrustZone';
  enclaveMeasurementHash: string;
  balances: {
    usdc: number;
    eth: number;
    agt: number;
  };
  sessionKeys: SessionKey[];
  avatarUrl?: string;
}

export type RiskLevel = 'safe' | 'elevated' | 'unsafe_blocked' | 'sanctioned';
export type ThreatCategory = 
  | 'ofac_sanctions' 
  | 'phishing_drainer' 
  | 'unverified_contract' 
  | 'suspicious_velocity' 
  | 'verified_merchant' 
  | 'trusted_api_gateway';

export interface RecipientIntel {
  address: string;
  label: string;
  domain?: string;
  riskLevel: RiskLevel;
  category: ThreatCategory;
  reason: string;
  evidenceCid: string;
  lastUpdated: string;
  isBlacklisted: boolean;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  category: 'sanctions' | 'financial_limit' | 'reputation' | 'hardware_tee' | 'contract_safety';
  enabled: boolean;
  severity: 'BLOCK' | 'REQUIRE_HITL' | 'WARN';
  params: {
    maxSingleTxUsd?: number;
    dailyBudgetCapUsd?: number;
    hitlThresholdUsd?: number;
    allowUnverifiedBytecode?: boolean;
    requireTeeAttestation?: boolean;
    blockMixers?: boolean;
  };
}

export type TxVerdict = 
  | 'APPROVED_EXECUTED' 
  | 'BLOCKED_POLICY_VIOLATION' 
  | 'AWAITING_HITL_APPROVAL' 
  | 'OVERRIDDEN_BY_ADMIN'
  | 'REJECTED_BY_OPERATOR';

export interface X402Challenge {
  httpEndpoint: string;
  method: 'GET' | 'POST';
  serverRealm: string;
  challengeNonce: string;
  priceRate: string; // e.g. "0.005 USDC per query"
  priceAmountUsd: number;
  currency: string;
  receiverAddress: string;
  statusCode: number; // 402 -> 200
  responsePayloadPreview?: string;
}

export interface EnclaveAttestation {
  attestationId: string;
  attestationHash: string;
  signatureRsv: string;
  teeProvider: string;
  pcrQuote: string;
  measurementHash: string;
  sessionKeyFingerprint: string;
  merkleAuditRoot: string;
  canonicalPayload: Record<string, any>;
  verified: boolean;
}

export interface TransactionAuditRecord {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  agentDid: string;
  recipientAddress: string;
  recipientLabel: string;
  recipientRisk: RiskLevel;
  threatCategory: ThreatCategory;
  amount: number;
  token: 'USDC' | 'ETH' | 'AGT';
  valueUsd: number;
  actionType: 'x402_micropayment' | 'contract_call' | 'transfer' | 'compute_rental';
  verdict: TxVerdict;
  violatedRule?: {
    id: string;
    name: string;
    ruleCode: string;
    reason: string;
  };
  policyChecks: {
    ruleName: string;
    passed: boolean;
    detail: string;
  }[];
  x402?: X402Challenge;
  attestation: EnclaveAttestation;
  hitlAction?: {
    resolvedAt?: string;
    operatorDid?: string;
    note?: string;
  };
}
