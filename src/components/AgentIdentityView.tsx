import React, { useState } from 'react';
import { AgentAccount, SessionKey } from '../types/agent-wallet';
import { 
  Cpu, 
  Key, 
  ShieldCheck, 
  Plus, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface AgentIdentityViewProps {
  agent: AgentAccount;
  onAddSessionKey: (agentId: string, newKey: SessionKey) => void;
  onRevokeSessionKey: (agentId: string, keyId: string) => void;
}

export const AgentIdentityView: React.FC<AgentIdentityViewProps> = ({
  agent,
  onAddSessionKey,
  onRevokeSessionKey,
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [maxPerTx, setMaxPerTx] = useState<number>(5.0);
  const [dailyCap, setDailyCap] = useState<number>(50.0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (val: string, fieldId: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateSessionKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel) return;

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const createdKey: SessionKey = {
      id: `sk-${Date.now().toString().slice(-4)}`,
      publicKey: `0x02${Math.random().toString(36).substring(2, 10)}...${randomSuffix}`,
      fingerprint: `fp_tee_${newKeyLabel.toLowerCase().replace(/\s+/g, '_')}`,
      label: newKeyLabel,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      maxAllowancePerTx: maxPerTx,
      dailyAllowance: dailyCap,
      dailySpent: 0,
      whitelistedMethods: ['GET /v1/*', 'x402_settle'],
      status: 'active',
    };

    onAddSessionKey(agent.id, createdKey);
    setShowKeyModal(false);
    setNewKeyLabel('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
              <span>{agent.standard} STANDARD</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{agent.teeEnclaveType} HARDWARE ENCLAVE</span>
            </div>
            <h2 className="text-base font-semibold text-slate-100 mt-1">
              Autonomous Agent Self-Custody & Keyrings ({agent.name})
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Autonomous agents maintain cryptographic sovereignty via smart contract accounts.
              {agent.standard === 'ERC-6551'
                ? ` Bound to NFT #${agent.parentTokenId} on parent contract ${agent.parentNftContract?.slice(0, 10)}... Token-bound accounts allow NFTs to own assets and sign transactions autonomously.`
                : ' Powered by ERC-4337 Account Abstraction with paymaster sponsorship and scoped session keys.'}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Ephemeral Session Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* Identity & Account Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: On-Chain Wallet Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              On-Chain Identity & Account Specs
            </h3>
            <span className="font-mono text-[11px] text-emerald-400">
              {agent.standard}
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[11px]">Decentralized Identifier (DID)</span>
              <div className="flex items-center justify-between text-slate-200 mt-0.5">
                <span className="truncate pr-2">{agent.did}</span>
                <button onClick={() => handleCopy(agent.did, 'did')}>
                  {copiedField === 'did' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Smart Contract Wallet Address</span>
              <div className="flex items-center justify-between text-slate-200 mt-0.5">
                <span className="truncate pr-2">{agent.walletAddress}</span>
                <button onClick={() => handleCopy(agent.walletAddress, 'wallet')}>
                  {copiedField === 'wallet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />}
                </button>
              </div>
            </div>

            {agent.parentNftContract && (
              <div>
                <span className="text-slate-500 block text-[11px]">ERC-6551 Parent NFT Token Bound Reference</span>
                <span className="text-indigo-300">
                  NFT #{agent.parentTokenId} on {agent.parentNftContract}
                </span>
              </div>
            )}

            {agent.entryPointAddress && (
              <div>
                <span className="text-slate-500 block text-[11px]">ERC-4337 EntryPoint Contract</span>
                <span className="text-indigo-300">{agent.entryPointAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: TEE Hardware Enclave State */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Trusted Execution Environment (TEE)
            </h3>
            <span className="font-mono text-[11px] text-indigo-400">
              ENCLAVE ACTIVE
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[11px]">Enclave Provider Architecture</span>
              <span className="text-slate-200 font-semibold">{agent.teeEnclaveType}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Static Measurement Hash (PCR0 / MRENCLAVE)</span>
              <div className="flex items-center justify-between text-slate-200 mt-0.5">
                <span className="truncate pr-2">{agent.enclaveMeasurementHash}</span>
                <button onClick={() => handleCopy(agent.enclaveMeasurementHash, 'pcr0')}>
                  {copiedField === 'pcr0' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Key Isolation Invariant</span>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Private signing keys never leave hardware enclave memory. All transactions
                require remote attestation quotes before broadcast to the mempool.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Session Keys Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              Active Ephemeral Session Keys
            </h3>
            <p className="text-xs text-slate-400">
              Session keys permit agents to perform scoped machine-to-machine x402 micropayments without master key exposure.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {agent.sessionKeys.filter(k => k.status === 'active').length} Active
          </span>
        </div>

        <div className="space-y-3">
          {agent.sessionKeys.map((key) => {
            return (
              <div
                key={key.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 text-xs">{key.label}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-[11px] font-mono text-slate-400">{key.fingerprint}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>Max/Tx: <strong className="text-slate-200">${key.maxAllowancePerTx.toFixed(2)}</strong></span>
                    <span>Daily Limit: <strong className="text-slate-200">${key.dailyAllowance.toFixed(2)}</strong></span>
                    <span>Spent Today: <strong className="text-indigo-400">${key.dailySpent.toFixed(2)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    key.status === 'active' ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {key.status.toUpperCase()}
                  </span>

                  {key.status === 'active' && (
                    <button
                      onClick={() => onRevokeSessionKey(agent.id, key.id)}
                      className="px-2.5 py-1 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 rounded transition-colors"
                    >
                      Revoke Key
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Session Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                Issue Ephemeral Session Key
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSessionKey} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Session Key Purpose / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LLM Inference Micropayment Worker"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Max Spend / Tx ($)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={maxPerTx}
                    onChange={(e) => setMaxPerTx(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Daily Limit ($)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={dailyCap}
                    onChange={(e) => setDailyCap(parseFloat(e.target.value) || 5)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Generate & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
