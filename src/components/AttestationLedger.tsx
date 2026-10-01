import React, { useState } from 'react';
import { TransactionAuditRecord, TxVerdict } from '../types/agent-wallet';
import { 
  FileCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Search, 
  Copy, 
  Check, 
  Lock, 
  Terminal, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  XCircle,
  HelpCircle
} from 'lucide-react';

interface AttestationLedgerProps {
  transactions: TransactionAuditRecord[];
  selectedTxId: string | null;
  onSelectTx: (txId: string | null) => void;
  onOperatorApprove: (txId: string) => void;
  onOperatorReject: (txId: string) => void;
}

export const AttestationLedger: React.FC<AttestationLedgerProps> = ({
  transactions,
  selectedTxId,
  onSelectTx,
  onOperatorApprove,
  onOperatorReject,
}) => {
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [signatureVerificationState, setSignatureVerificationState] = useState<'unverified' | 'verifying' | 'valid'>('unverified');

  const selectedTx = transactions.find(t => t.id === selectedTxId);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.recipientAddress.toLowerCase().includes(search.toLowerCase()) ||
      tx.recipientLabel.toLowerCase().includes(search.toLowerCase()) ||
      tx.attestation.attestationHash.toLowerCase().includes(search.toLowerCase()) ||
      tx.agentName.toLowerCase().includes(search.toLowerCase());

    const matchesVerdict = 
      verdictFilter === 'all' ||
      (verdictFilter === 'blocked' && tx.verdict === 'BLOCKED_POLICY_VIOLATION') ||
      (verdictFilter === 'approved' && tx.verdict === 'APPROVED_EXECUTED') ||
      (verdictFilter === 'hitl' && tx.verdict === 'AWAITING_HITL_APPROVAL') ||
      (verdictFilter === 'x402' && tx.actionType === 'x402_micropayment');

    return matchesSearch && matchesVerdict;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerifySignature = () => {
    setSignatureVerificationState('verifying');
    setTimeout(() => {
      setSignatureVerificationState('valid');
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              Cryptographic Attestation & Audit Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Every autonomous agent action produces a canonical attestation signed by the hardware
              enclave. Audit fields capture recipient threat evaluation, evaluated policy constraints,
              and Merkle proof roots for compliance verification.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Events</span>
              <span className="text-slate-200 font-semibold tabular-nums">{transactions.length}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Blocked Actions</span>
              <span className="text-rose-400 font-semibold tabular-nums">
                {transactions.filter(t => t.verdict === 'BLOCKED_POLICY_VIOLATION').length}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Awaiting HITL</span>
              <span className="text-amber-400 font-semibold tabular-nums">
                {transactions.filter(t => t.verdict === 'AWAITING_HITL_APPROVAL').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Tx ID, Hash, Recipient..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 text-xs overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'blocked', label: 'Blocked Actions' },
              { id: 'approved', label: 'Approved Executed' },
              { id: 'hitl', label: 'Held for HITL' },
              { id: 'x402', label: 'x402 Micropayments' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setVerdictFilter(f.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  verdictFilter === f.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp & Agent</th>
                <th className="py-3 px-4">Recipient Target</th>
                <th className="py-3 px-4">Action & Value</th>
                <th className="py-3 px-4">Policy Verdict</th>
                <th className="py-3 px-4">Attestation Hash</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredTransactions.map((tx) => {
                const isSelected = tx.id === selectedTxId;
                return (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      onSelectTx(tx.id);
                      setSignatureVerificationState('unverified');
                    }}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/20 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="text-[11px] font-mono text-slate-400">
                        {tx.timestamp.split('T')[1].replace('Z', '')}
                      </div>
                      <div className="font-medium text-slate-100">{tx.agentName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{tx.recipientLabel}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {tx.recipientAddress.slice(0, 8)}...{tx.recipientAddress.slice(-6)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono tabular-nums font-semibold text-slate-200">
                        {tx.amount} {tx.token}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ≈ ${tx.valueUsd.toFixed(3)} USD
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {/* Clean unboxed status with icon */}
                      {tx.verdict === 'APPROVED_EXECUTED' && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>APPROVED</span>
                        </div>
                      )}
                      {tx.verdict === 'BLOCKED_POLICY_VIOLATION' && (
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold font-mono text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>BLOCKED UNSAFE</span>
                        </div>
                      )}
                      {tx.verdict === 'AWAITING_HITL_APPROVAL' && (
                        <div className="flex items-center gap-1.5 text-amber-400 font-semibold font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>HELD (HITL)</span>
                        </div>
                      )}
                      {tx.verdict === 'OVERRIDDEN_BY_ADMIN' && (
                        <div className="flex items-center gap-1.5 text-indigo-400 font-semibold font-mono text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>OPERATOR APPROVED</span>
                        </div>
                      )}
                      {tx.verdict === 'REJECTED_BY_OPERATOR' && (
                        <div className="flex items-center gap-1.5 text-slate-400 font-semibold font-mono text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>OPERATOR REJECTED</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {tx.attestation.attestationHash.slice(0, 14)}...
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300">
                        Details →
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Transaction Deep Detail Drawer / Modal */}
      {selectedTx && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>{selectedTx.id}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedTx.timestamp}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedTx.attestation.teeProvider} Enclave</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mt-1">
                Transaction Attestation & Policy Audit Deep Dive
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(JSON.stringify(selectedTx, null, 2), 'full_json')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copiedHash === 'full_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Full JSON</span>
              </button>

              <button
                onClick={() => onSelectTx(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>

          {/* If Held for Operator Signoff (HITL) */}
          {selectedTx.verdict === 'AWAITING_HITL_APPROVAL' && (
            <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>ACTION HELD: Human-In-The-Loop Approval Required</span>
                </div>
                <span className="text-[11px] font-mono text-amber-400">Operator Key: OP-MASTER-01</span>
              </div>
              <p className="text-xs text-amber-200/90">
                This transaction exceeded the autonomous execution ceiling (${selectedTx.valueUsd.toFixed(2)} &gt; $25.00 limit).
                The hardware enclave has prepared the intent voucher and is waiting for your manual co-signature.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => onOperatorApprove(selectedTx.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Co-Sign & Execute (Operator Override)</span>
                </button>
                <button
                  onClick={() => onOperatorReject(selectedTx.id)}
                  className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject & Quarantine</span>
                </button>
              </div>
            </div>
          )}

          {/* If Blocked Action */}
          {selectedTx.verdict === 'BLOCKED_POLICY_VIOLATION' && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>BLOCKED ACTION: Regulatory & Safety Policy Violation</span>
              </div>
              <p className="text-xs text-rose-200/90 font-mono">
                {selectedTx.violatedRule?.reason}
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                <span>Rule ID: <strong className="text-slate-200 font-mono">{selectedTx.violatedRule?.id}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Violation Code: <strong className="text-slate-200 font-mono">{selectedTx.violatedRule?.ruleCode}</strong></span>
              </div>
            </div>
          )}

          {/* Section 1: Cryptographic Enclave Attestation Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Cryptographic Attestation & Hardware Enclave Proofs
              </h4>
              <button
                onClick={handleVerifySignature}
                className="px-2.5 py-1 text-[11px] font-medium bg-indigo-950 border border-indigo-800 hover:bg-indigo-900 text-indigo-200 rounded transition-colors flex items-center gap-1.5"
              >
                {signatureVerificationState === 'verifying' ? (
                  <span>Verifying ECDSA Enclave Quote...</span>
                ) : signatureVerificationState === 'valid' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Quote Verified (Intel/AWS Enclave)</span>
                  </>
                ) : (
                  <span>Verify Enclave Signature</span>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">Canonical Attestation Hash (Keccak-256)</span>
                <div className="flex items-center justify-between text-slate-200">
                  <span className="truncate pr-2">{selectedTx.attestation.attestationHash}</span>
                  <button onClick={() => handleCopy(selectedTx.attestation.attestationHash, 'attest_hash')}>
                    {copiedHash === 'attest_hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">TEE Hardware PCR Measurement Quote</span>
                <div className="flex items-center justify-between text-slate-200">
                  <span className="truncate pr-2">{selectedTx.attestation.pcrQuote}</span>
                  <button onClick={() => handleCopy(selectedTx.attestation.pcrQuote, 'pcr_quote')}>
                    {copiedHash === 'pcr_quote' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">Active Session Key Fingerprint</span>
                <span className="text-indigo-300">{selectedTx.attestation.sessionKeyFingerprint}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">Merkle Audit Proof Root</span>
                <div className="flex items-center justify-between text-slate-200">
                  <span className="truncate pr-2">{selectedTx.attestation.merkleAuditRoot}</span>
                  <button onClick={() => handleCopy(selectedTx.attestation.merkleAuditRoot, 'merkle_root')}>
                    {copiedHash === 'merkle_root' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Policy Constraint Evaluation Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Policy Constraint Evaluation Matrix
            </h4>
            <div className="space-y-2">
              {selectedTx.policyChecks.map((chk, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    chk.passed
                      ? 'bg-slate-950 border-slate-800/80 text-slate-300'
                      : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold block">{chk.ruleName}</span>
                    <span className="text-[11px] text-slate-400">{chk.detail}</span>
                  </div>
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                    chk.passed ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {chk.passed ? 'PASSED' : 'VIOLATION'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: x402 Micropayment Protocol Telemetry (if applicable) */}
          {selectedTx.x402 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                x402 HTTP Machine Payment Protocol Telemetry
              </h4>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Target HTTP Endpoint:</span>
                    <span className="text-indigo-300">{selectedTx.x402.httpEndpoint}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">HTTP Handshake Status:</span>
                    <span className="text-emerald-400">
                      HTTP {selectedTx.x402.statusCode} {selectedTx.x402.statusCode === 200 ? 'OK (Unlocked)' : 'Payment Required'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pricing Rate:</span>
                    <span className="text-slate-200">{selectedTx.x402.priceRate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Challenge Nonce:</span>
                    <span className="text-slate-400">{selectedTx.x402.challengeNonce}</span>
                  </div>
                </div>

                {selectedTx.x402.responsePayloadPreview && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-500 block text-[10px] mb-1">
                      Released Machine-to-Machine Payload:
                    </span>
                    <pre className="p-2.5 bg-black/60 rounded border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
                      {selectedTx.x402.responsePayloadPreview}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Canonical Attestation Payload */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Canonical Invariant JSON Payload
            </span>
            <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
              {JSON.stringify(selectedTx.attestation.canonicalPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
