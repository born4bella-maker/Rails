import React, { useState } from 'react';
import { AgentAccount, RecipientIntel, PolicyRule, TransactionAuditRecord } from '../types/agent-wallet';
import { evaluateTransaction } from '../utils/policyEngine';
import { 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Terminal, 
  Zap, 
  ArrowRight, 
  RefreshCw,
  Clock,
  Cpu,
  Layers,
  FileCode2,
  ExternalLink
} from 'lucide-react';

interface SimulationWorkbenchProps {
  selectedAgent: AgentAccount;
  recipientDb: RecipientIntel[];
  policies: PolicyRule[];
  onTransactionGenerated: (record: TransactionAuditRecord) => void;
  onOpenLedgerItem: (recordId: string) => void;
}

export const SimulationWorkbench: React.FC<SimulationWorkbenchProps> = ({
  selectedAgent,
  recipientDb,
  policies,
  onTransactionGenerated,
  onOpenLedgerItem,
}) => {
  // Custom Transaction State
  const [recipientAddress, setRecipientAddress] = useState<string>('0x192844aab01289c0018a42df98cbe01924b11f20');
  const [recipientLabel, setRecipientLabel] = useState<string>('Subnetwork Vector DB Pay-Per-Query');
  const [amount, setAmount] = useState<number>(0.005);
  const [token, setToken] = useState<'USDC' | 'ETH' | 'AGT'>('USDC');
  const [actionType, setActionType] = useState<'x402_micropayment' | 'contract_call' | 'transfer' | 'compute_rental'>('x402_micropayment');
  
  // Execution State & Animation
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingStep, setExecutingStep] = useState<number>(0);
  const [lastExecutedTx, setLastExecutedTx] = useState<TransactionAuditRecord | null>(null);

  // Quick preset loader
  const handleLoadPreset = (
    targetAddr: string, 
    label: string, 
    amt: number, 
    tok: 'USDC' | 'ETH' | 'AGT', 
    type: 'x402_micropayment' | 'contract_call' | 'transfer' | 'compute_rental'
  ) => {
    setRecipientAddress(targetAddr);
    setRecipientLabel(label);
    setAmount(amt);
    setToken(tok);
    setActionType(type);
  };

  const runSimulation = (
    overrideParams?: {
      targetAddr: string;
      label: string;
      amt: number;
      tok: 'USDC' | 'ETH' | 'AGT';
      type: 'x402_micropayment' | 'contract_call' | 'transfer' | 'compute_rental';
    }
  ) => {
    const targetAddr = overrideParams ? overrideParams.targetAddr : recipientAddress;
    const label = overrideParams ? overrideParams.label : recipientLabel;
    const amt = overrideParams ? overrideParams.amt : amount;
    const tok = overrideParams ? overrideParams.tok : token;
    const type = overrideParams ? overrideParams.type : actionType;

    setIsExecuting(true);
    setExecutingStep(1);

    // Calculate USD value
    let valueUsd = amt;
    if (tok === 'ETH') valueUsd = amt * 2654.0;
    if (tok === 'AGT') valueUsd = amt * 0.05;

    // Simulate pipeline progression
    setTimeout(() => {
      setExecutingStep(2);
      setTimeout(() => {
        setExecutingStep(3);
        setTimeout(() => {
          setExecutingStep(4);
          const result = evaluateTransaction({
            agent: selectedAgent,
            recipientAddress: targetAddr,
            recipientLabel: label,
            amount: amt,
            token: tok,
            valueUsd,
            actionType: type,
            policies,
            recipientDb,
            x402Details: type === 'x402_micropayment' ? {
              httpEndpoint: 'https://vectors.subnetwork.ai/v1/query/embedding',
              method: 'POST',
              priceRate: `${amt} ${tok} per similarity search`,
              priceAmountUsd: valueUsd,
              currency: tok,
              receiverAddress: targetAddr,
            } : undefined,
          });

          onTransactionGenerated(result);
          setLastExecutedTx(result);
          setIsExecuting(false);
        }, 350);
      }, 350);
    }, 300);
  };

  // Find recipient intel if exists
  const activeRecipientIntel = recipientDb.find(
    r => r.address.toLowerCase() === recipientAddress.toLowerCase().trim()
  );

  return (
    <div className="space-y-6">
      {/* Agent Self-Custody Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{selectedAgent.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-indigo-400">{selectedAgent.standard}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedAgent.teeEnclaveType} Enclave</span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl font-mono truncate">
              DID: {selectedAgent.did}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block text-[11px]">USDC Balance</span>
              <span className="font-mono font-semibold text-slate-100 tabular-nums">
                ${selectedAgent.balances.usdc.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">ETH Balance</span>
              <span className="font-mono font-semibold text-slate-100 tabular-nums">
                {selectedAgent.balances.eth.toFixed(3)} ETH
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Active Session Key</span>
              <span className="font-mono text-emerald-400">
                {selectedAgent.sessionKeys[0]?.label.slice(0, 18)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Test Scenarios Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">
            One-Click Test Scenarios
          </h2>
          <span className="text-xs text-slate-500">
            Simulates real autonomous agent interactions against active guardrails
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Preset 1: Safe x402 */}
          <div 
            onClick={() => {
              handleLoadPreset(
                '0x192844aab01289c0018a42df98cbe01924b11f20',
                'Subnetwork Vector DB Pay-Per-Query',
                0.005,
                'USDC',
                'x402_micropayment'
              );
              runSimulation({
                targetAddr: '0x192844aab01289c0018a42df98cbe01924b11f20',
                label: 'Subnetwork Vector DB Pay-Per-Query',
                amt: 0.005,
                tok: 'USDC',
                type: 'x402_micropayment'
              });
            }}
            className="p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Safe x402 Micropayment
              </span>
              <span className="text-[11px] font-mono text-slate-400">0.005 USDC</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Vector DB Query</p>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Autonomous agent pays $0.005 via HTTP 402 handshake. Signed by TEE, verified & streamed.
            </p>
          </div>

          {/* Preset 2: Blocked Sanctions */}
          <div 
            onClick={() => {
              handleLoadPreset(
                '0x8589427373D6D84E98730D7795D8f6f8731FDA16',
                'Tornado Cash 0.1 ETH Pool',
                0.1,
                'ETH',
                'transfer'
              );
              runSimulation({
                targetAddr: '0x8589427373D6D84E98730D7795D8f6f8731FDA16',
                label: 'Tornado Cash 0.1 ETH Pool',
                amt: 0.1,
                tok: 'ETH',
                type: 'transfer'
              });
            }}
            className="p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-rose-950/40 hover:border-rose-800/60 rounded-lg cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                BLOCKED: Unsafe Sanctions
              </span>
              <span className="text-[11px] font-mono text-slate-400">0.1 ETH</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Tornado Cash Mixer Target</p>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Target matches OFAC SDN list #14992. Policy engine halts signature & quarantines event.
            </p>
          </div>

          {/* Preset 3: Blocked Honeypot */}
          <div 
            onClick={() => {
              handleLoadPreset(
                '0x66a1012d4991206f0e9b110a30b20147e8c18712',
                'Permit2 Phishing Drainer Honeypot',
                15.0,
                'USDC',
                'contract_call'
              );
              runSimulation({
                targetAddr: '0x66a1012d4991206f0e9b110a30b20147e8c18712',
                label: 'Permit2 Phishing Drainer Honeypot',
                amt: 15.0,
                tok: 'USDC',
                type: 'contract_call'
              });
            }}
            className="p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-rose-950/40 hover:border-rose-800/60 rounded-lg cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                BLOCKED: Phishing Drainer
              </span>
              <span className="text-[11px] font-mono text-slate-400">15.0 USDC</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Permit2 Drainer Honeypot</p>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Threat feed detects malicious approval vector. Enclave refuses signing request.
            </p>
          </div>

          {/* Preset 4: HITL Threshold */}
          <div 
            onClick={() => {
              handleLoadPreset(
                '0x384192b0c721884391206f0e9b110a30b20147e8',
                'InferenceHub Decentralized GPU Gateway',
                85.0,
                'USDC',
                'compute_rental'
              );
              runSimulation({
                targetAddr: '0x384192b0c721884391206f0e9b110a30b20147e8',
                label: 'InferenceHub Decentralized GPU Gateway',
                amt: 85.0,
                tok: 'USDC',
                type: 'compute_rental'
              });
            }}
            className="p-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-amber-950/40 hover:border-amber-800/60 rounded-lg cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                HELD: HITL Approval Required
              </span>
              <span className="text-[11px] font-mono text-slate-400">85.0 USDC</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">High-Value GPU Cluster</p>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
              Exceeds autonomous $25 threshold. Held in queue awaiting operator co-signature.
            </p>
          </div>
        </div>
      </div>

      {/* Main Execution Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction Builder & Recipient Screening (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Custom Action & Recipient Dispatch
                </h3>
                <p className="text-xs text-slate-400">
                  Simulate agent request against real-time threat intelligence and policy rules
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                POL-ENGINE v1.0
              </span>
            </div>

            {/* Action Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Action / Protocol Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'x402_micropayment', label: 'x402 Micropayment' },
                  { id: 'contract_call', label: 'Contract Call' },
                  { id: 'transfer', label: 'Direct Transfer' },
                  { id: 'compute_rental', label: 'Compute Lease' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActionType(opt.id as any)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-center ${
                      actionType === opt.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Input & Threat Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Recipient Address / Contract
                </label>
                {activeRecipientIntel ? (
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${
                    activeRecipientIntel.riskLevel === 'sanctioned' || activeRecipientIntel.riskLevel === 'unsafe_blocked'
                      ? 'text-rose-400'
                      : activeRecipientIntel.riskLevel === 'elevated'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {activeRecipientIntel.riskLevel === 'sanctioned' && 'OFAC Sanctioned Match'}
                    {activeRecipientIntel.riskLevel === 'unsafe_blocked' && 'Flagged Malicious Target'}
                    {activeRecipientIntel.riskLevel === 'elevated' && 'Elevated Risk Target'}
                    {activeRecipientIntel.riskLevel === 'safe' && 'Verified Safe Counterparty'}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">Unindexed Counterparty</span>
                )}
              </div>

              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />

              {activeRecipientIntel && (
                <div className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                  activeRecipientIntel.riskLevel === 'sanctioned' || activeRecipientIntel.riskLevel === 'unsafe_blocked'
                    ? 'bg-rose-950/30 border-rose-900/50 text-rose-200'
                    : activeRecipientIntel.riskLevel === 'elevated'
                    ? 'bg-amber-950/30 border-amber-900/50 text-amber-200'
                    : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{activeRecipientIntel.label}</span>
                    <span className="text-[11px] font-mono text-slate-400">{activeRecipientIntel.domain || 'no domain'}</span>
                  </div>
                  <p className="text-[11px] opacity-90">{activeRecipientIntel.reason}</p>
                </div>
              )}
            </div>

            {/* Amount and Token */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Value / Amount
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Asset / Token
                </label>
                <select
                  value={token}
                  onChange={(e) => setToken(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="AGT">AGT (Agent Gas Token)</option>
                </select>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={() => runSimulation()}
              disabled={isExecuting}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isExecuting
                  ? 'bg-indigo-700/50 text-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
              }`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Guardrails & Enclave Sign...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Simulated Transaction</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preload Helper */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">
              Known Target Address Quick-Picks:
            </h4>
            <div className="flex flex-wrap gap-2">
              {recipientDb.map((rec) => (
                <button
                  key={rec.address}
                  type="button"
                  onClick={() => {
                    setRecipientAddress(rec.address);
                    setRecipientLabel(rec.label);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-md border font-mono transition-colors ${
                    rec.riskLevel === 'sanctioned' || rec.riskLevel === 'unsafe_blocked'
                      ? 'border-rose-900/60 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40'
                      : rec.riskLevel === 'elevated'
                      ? 'border-amber-900/60 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {rec.label.slice(0, 22)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Pipeline Monitor & Execution Trace (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Pipeline Execution Trace
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {isExecuting ? 'PROCESSING' : lastExecutedTx ? 'COMPLETED' : 'IDLE'}
              </span>
            </div>

            {/* 4 Pipeline Stages */}
            <div className="space-y-3">
              {/* Stage 1: Recipient Screening */}
              <div className={`p-3 rounded-lg border text-xs transition-all ${
                executingStep === 1
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-200'
                  : executingStep > 1
                  ? 'border-slate-800 bg-slate-950 text-slate-300'
                  : 'border-slate-800/40 bg-slate-950/40 text-slate-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">01. Threat Intel & Recipient Screening</span>
                  {executingStep > 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cross-checks recipient against OFAC SDN mixer feeds, ScamSniffer drainer signatures, and contract bytecode.
                </p>
              </div>

              {/* Stage 2: Policy & Limit Checks */}
              <div className={`p-3 rounded-lg border text-xs transition-all ${
                executingStep === 2
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-200'
                  : executingStep > 2
                  ? 'border-slate-800 bg-slate-950 text-slate-300'
                  : 'border-slate-800/40 bg-slate-950/40 text-slate-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">02. Autonomous Spending & Guardrail Engine</span>
                  {executingStep > 2 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enforces per-transaction threshold ($25), 24h rolling budget ($150), and session key allowances.
                </p>
              </div>

              {/* Stage 3: TEE Hardware Enclave */}
              <div className={`p-3 rounded-lg border text-xs transition-all ${
                executingStep === 3
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-200'
                  : executingStep > 3
                  ? 'border-slate-800 bg-slate-950 text-slate-300'
                  : 'border-slate-800/40 bg-slate-950/40 text-slate-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">03. {selectedAgent.teeEnclaveType} Attestation</span>
                  {executingStep > 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Generates hardware enclave PCR quote, verifies enclave measurement, and binds ephemeral session key.
                </p>
              </div>

              {/* Stage 4: Attestation Receipt / Settlement */}
              <div className={`p-3 rounded-lg border text-xs transition-all ${
                executingStep === 4
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-200'
                  : lastExecutedTx
                  ? 'border-slate-800 bg-slate-950 text-slate-300'
                  : 'border-slate-800/40 bg-slate-950/40 text-slate-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">04. Audit Record & Settlement</span>
                  {lastExecutedTx && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Constructs canonical payload attestation hash, Merkle audit root, and updates immutable ledger.
                </p>
              </div>
            </div>

            {/* Last Execution Outcome Card */}
            {lastExecutedTx && (
              <div className={`p-4 rounded-xl border space-y-2 mt-4 ${
                lastExecutedTx.verdict === 'APPROVED_EXECUTED'
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                  : lastExecutedTx.verdict === 'BLOCKED_POLICY_VIOLATION'
                  ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs tracking-wide">
                    {lastExecutedTx.verdict === 'APPROVED_EXECUTED' && 'TRANSACTION APPROVED & EXECUTED'}
                    {lastExecutedTx.verdict === 'BLOCKED_POLICY_VIOLATION' && 'ACTION BLOCKED FOR UNSAFE RECIPIENT'}
                    {lastExecutedTx.verdict === 'AWAITING_HITL_APPROVAL' && 'ACTION HELD FOR OPERATOR APPROVAL'}
                  </span>
                  <button
                    onClick={() => onOpenLedgerItem(lastExecutedTx.id)}
                    className="text-[11px] underline flex items-center gap-1 hover:opacity-80"
                  >
                    View Attestation
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {lastExecutedTx.violatedRule && (
                  <p className="text-xs bg-black/30 p-2 rounded border border-white/5 font-mono">
                    {lastExecutedTx.violatedRule.reason}
                  </p>
                )}

                <div className="text-[11px] space-y-1 font-mono text-slate-400 pt-1 border-t border-white/10">
                  <div className="flex justify-between">
                    <span>Attestation Hash:</span>
                    <span className="text-slate-200">{lastExecutedTx.attestation.attestationHash.slice(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enclave Type:</span>
                    <span className="text-slate-200">{lastExecutedTx.attestation.teeProvider}</span>
                  </div>
                  {lastExecutedTx.x402 && (
                    <div className="flex justify-between">
                      <span>x402 Protocol:</span>
                      <span className="text-indigo-300">HTTP {lastExecutedTx.x402.statusCode} Handshake OK</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
