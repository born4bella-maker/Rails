import React, { useState } from 'react';
import { PolicyRule } from '../types/agent-wallet';
import { 
  Shield, 
  Sliders, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Lock, 
  Plus, 
  Cpu, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface PolicyStudioProps {
  policies: PolicyRule[];
  onUpdatePolicy: (updated: PolicyRule) => void;
  onResetPolicies: () => void;
}

export const PolicyStudio: React.FC<PolicyStudioProps> = ({
  policies,
  onUpdatePolicy,
  onResetPolicies,
}) => {
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleToggle = (policy: PolicyRule) => {
    const updated = { ...policy, enabled: !policy.enabled };
    onUpdatePolicy(updated);
    showToast(`Updated ${policy.name}`);
  };

  const handleUpdateLimit = (policyId: string, paramKey: string, value: number) => {
    const target = policies.find(p => p.id === policyId);
    if (!target) return;
    const updated = {
      ...target,
      params: {
        ...target.params,
        [paramKey]: value,
      }
    };
    onUpdatePolicy(updated);
    showToast(`Updated ${target.name} threshold`);
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Autonomous Policy & Regulatory Guardrails Studio
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Deterministic security policies executed prior to enclave signing. If an agent violates
              any rule, transaction construction aborts immediately, producing a verified non-execution
              attestation for compliance audits.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onResetPolicies}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-800 text-indigo-200 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Policy Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((policy) => {
          return (
            <div
              key={policy.id}
              className={`p-5 rounded-xl border transition-all ${
                policy.enabled
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-indigo-400 font-semibold">
                      {policy.id}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      {policy.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {policy.name}
                  </h3>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(policy)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                    policy.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      policy.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                {policy.description}
              </p>

              {/* Policy Specific Sliders & Controls */}
              {policy.id === 'POL-LIMIT-003' && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Autonomous Max Spend Limit:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      ${policy.params.maxSingleTxUsd?.toFixed(2)} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={policy.params.maxSingleTxUsd ?? 25}
                    onChange={(e) => handleUpdateLimit(policy.id, 'maxSingleTxUsd', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>$5.00</span>
                    <span>$50.00</span>
                    <span>$100.00</span>
                  </div>
                </div>
              )}

              {policy.id === 'POL-BUDGET-004' && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">24-Hour Rolling Budget Cap:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      ${policy.params.dailyBudgetCapUsd?.toFixed(2)} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="500"
                    step="25"
                    value={policy.params.dailyBudgetCapUsd ?? 150}
                    onChange={(e) => handleUpdateLimit(policy.id, 'dailyBudgetCapUsd', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>$25.00</span>
                    <span>$250.00</span>
                    <span>$500.00</span>
                  </div>
                </div>
              )}

              {/* Status and Action outcome */}
              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/50">
                <span>Enforcement Action:</span>
                <span className={`font-mono font-semibold ${
                  policy.severity === 'BLOCK' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {policy.severity === 'BLOCK' ? 'HALT & QUARANTINE' : 'TRIGGER OPERATOR HITL'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Invariants Summary */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
        <h3 className="text-xs font-semibold text-slate-200">
          Enforced Protocol Invariants
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 pt-1">
          <div className="space-y-1">
            <span className="font-semibold text-slate-200 block">Pre-Signature Gate</span>
            <p>
              Policies run in constant time inside the pre-execution runtime before enclave private key derivation.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-200 block">Audit Non-Repudiation</span>
            <p>
              Blocked events emit a verifiable signed attestation proving why execution was denied for compliance audits.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-200 block">Operator Override</span>
            <p>
              Human-in-the-loop transactions require separate operator key co-signature and cannot be bypassed by agent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
