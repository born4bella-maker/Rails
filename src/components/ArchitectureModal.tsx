import React from 'react';
import { BookOpen, ShieldAlert, Cpu, Layers, GitBranch, Scale, Lock, Terminal } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <span>PROTOTYPE SPECIFICATION</span>
              <span aria-hidden="true">·</span>
              <span>v1.0-RC</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Autonomous Agent Self-Custody & Machine Micropayment (x402) Architecture
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Prototype Notice Callout */}
        <div className="p-4 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-1.5 text-xs text-indigo-200">
          <span className="font-semibold block text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Prototype & Demonstration Layer Notice
          </span>
          <p className="text-slate-300 leading-relaxed">
            This repository is best understood as a prototype and demonstration layer rather than production-ready wallet infrastructure.
            It models the interaction patterns, regulatory guardrails, and payment rails that autonomous agent systems may need without implementing a full decentralized wallet stack.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="space-y-4 text-xs text-slate-300">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Related Architectural Concepts
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-100 block">ERC-6551 Token-Bound Accounts (TBA)</span>
              <p className="text-slate-400 leading-relaxed">
                Empowers autonomous agent NFTs to own assets, hold liquidity, and sign contracts directly. Each agent identity exists as a token-bound registry entry with autonomous self-custody.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-100 block">ERC-4337 Account Abstraction</span>
              <p className="text-slate-400 leading-relaxed">
                Decouples signing keys from custody accounts via UserOperations, Bundlers, and Paymasters. Enables ephemeral session keys, gas sponsorship, and granular transaction permissions.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-100 block">x402 HTTP Micropayments</span>
              <p className="text-slate-400 leading-relaxed">
                Revitalizes the standard HTTP 402 Payment Required response code for machine-to-machine APIs. Agents automatically detect price quotes, negotiate micro-settlements, and unlock paywalled streams.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-100 block">Trusted Execution Environments (TEE)</span>
              <p className="text-slate-400 leading-relaxed">
                Hardware enclaves (Intel SGX, AWS Nitro) protect agent private key generation and verify policy conformance using cryptographic remote attestation quotes (PCR0 measurements).
              </p>
            </div>
          </div>
        </div>

        {/* Blocked Actions & Safety Enforcement */}
        <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-2 text-xs">
          <span className="font-semibold text-rose-300 block flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Blocked Actions for Unsafe Recipients & Regulatory Guardrails
          </span>
          <p className="text-slate-300 leading-relaxed">
            Autonomous execution requires non-negotiable preemptive policy gates. If an agent attempts to dispatch
            transactions to sanctioned mixers (e.g. Tornado Cash, OFAC SDN lists) or addresses with detected phishing
            honeypots / malicious permit bytecodes, execution is blocked immediately in the pre-signing runtime.
            A verifiable audit attestation is generated documenting the blocked state.
          </p>
        </div>

        {/* Contributing & Open Source License */}
        <div className="space-y-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <span>Contributing & Experimentation</span>
          </div>
          <p>
            This is a demo-oriented project intended for experimentation and extension. Contributions that improve:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            <li>Policy safety logic and deterministic rule engines</li>
            <li>Autonomous identity modeling (DIDs, verifiable credentials, token-bound registries)</li>
            <li>x402 payment flow fidelity and sub-cent settlement rails</li>
            <li>Firebase integration and real-time state synchronization</li>
            <li>Agent self-custody wallet UX and operator signoff workflows</li>
          </ul>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono mt-3">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              Distributed under Apache-2.0 / MIT patterns
            </span>
            <span>Status: Prototype / Demo Application</span>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
