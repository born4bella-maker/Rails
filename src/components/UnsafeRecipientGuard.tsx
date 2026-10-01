import React, { useState } from 'react';
import { RecipientIntel, RiskLevel, ThreatCategory } from '../types/agent-wallet';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Plus, 
  AlertTriangle, 
  ExternalLink, 
  Trash2, 
  Check, 
  Filter,
  FileText
} from 'lucide-react';

interface UnsafeRecipientGuardProps {
  recipients: RecipientIntel[];
  onAddRecipient: (recipient: RecipientIntel) => void;
  onToggleBlacklist: (address: string) => void;
  onTestAddressInWorkbench: (address: string, label: string) => void;
}

export const UnsafeRecipientGuard: React.FC<UnsafeRecipientGuardProps> = ({
  recipients,
  onAddRecipient,
  onToggleBlacklist,
  onTestAddressInWorkbench,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Address Tester state
  const [testAddressInput, setTestAddressInput] = useState('');
  const [testResult, setTestResult] = useState<{
    found: boolean;
    intel?: RecipientIntel;
    status: 'BLOCKED' | 'FLAGGED' | 'CLEAN';
  } | null>(null);

  // New recipient form state
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newCategory, setNewCategory] = useState<ThreatCategory>('phishing_drainer');
  const [newRiskLevel, setNewRiskLevel] = useState<RiskLevel>('unsafe_blocked');
  const [newReason, setNewReason] = useState('');

  const filteredRecipients = recipients.filter((rec) => {
    const matchesSearch = 
      rec.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.domain && rec.domain.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      categoryFilter === 'all' || 
      (categoryFilter === 'unsafe' && (rec.riskLevel === 'sanctioned' || rec.riskLevel === 'unsafe_blocked')) ||
      (categoryFilter === 'safe' && rec.riskLevel === 'safe') ||
      rec.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleTestAddress = () => {
    const norm = testAddressInput.trim().toLowerCase();
    const match = recipients.find(r => r.address.toLowerCase() === norm);
    if (match) {
      const isBlocked = match.riskLevel === 'sanctioned' || match.riskLevel === 'unsafe_blocked' || match.isBlacklisted;
      setTestResult({
        found: true,
        intel: match,
        status: isBlocked ? 'BLOCKED' : match.riskLevel === 'elevated' ? 'FLAGGED' : 'CLEAN',
      });
    } else {
      setTestResult({
        found: false,
        status: 'CLEAN',
      });
    }
  };

  const handleCreateRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress || !newLabel) return;

    const created: RecipientIntel = {
      address: newAddress.trim(),
      label: newLabel.trim(),
      domain: newDomain.trim() || undefined,
      category: newCategory,
      riskLevel: newRiskLevel,
      reason: newReason.trim() || 'Manually added to threat intelligence registry by operator.',
      evidenceCid: `bafybei${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      isBlacklisted: newRiskLevel === 'sanctioned' || newRiskLevel === 'unsafe_blocked',
    };

    onAddRecipient(created);
    setShowAddModal(false);
    // Reset form
    setNewAddress('');
    setNewLabel('');
    setNewDomain('');
    setNewReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Regulatory Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Unsafe Recipient Threat Intelligence & Blocklist
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Autonomous agent self-custody requires strict preemptive recipient screening.
              When an agent attempts to dispatch funds, sign permits, or invoke contracts targeting
              flagged addresses, the policy engine blocks the action before key generation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Flag Unsafe Target</span>
            </button>
          </div>
        </div>
      </div>

      {/* Address Quick Scanner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-200 mb-2">
          Pre-Flight Address Screening Simulator
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testAddressInput}
            onChange={(e) => setTestAddressInput(e.target.value)}
            placeholder="Paste address to test (e.g. 0x8589427373D6D84E98730D7795D8f6f8731FDA16)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleTestAddress}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors shrink-0"
          >
            Check Screening Result
          </button>
        </div>

        {testResult && (
          <div className={`mt-3 p-3 rounded-lg border text-xs flex items-start justify-between gap-4 ${
            testResult.status === 'BLOCKED'
              ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
              : testResult.status === 'FLAGGED'
              ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wide font-mono">
                  VERDICT: {testResult.status}
                </span>
                {testResult.intel && (
                  <span className="text-slate-300 font-sans">
                    — {testResult.intel.label} ({testResult.intel.category})
                  </span>
                )}
              </div>
              <p className="text-[11px] mt-1 text-slate-300">
                {testResult.intel 
                  ? testResult.intel.reason 
                  : 'Address is not flagged in current threat feed. Standard autonomous spending limits apply.'}
              </p>
            </div>

            {testResult.intel && (
              <button
                onClick={() => onTestAddressInWorkbench(testResult.intel!.address, testResult.intel!.label)}
                className="px-2.5 py-1 text-[11px] font-medium bg-black/40 hover:bg-black/60 rounded border border-white/10 shrink-0 transition-colors"
              >
                Test in Workbench
              </button>
            )}
          </div>
        )}
      </div>

      {/* Registry Table & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by label, domain, or 0x..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs self-start sm:self-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Targets ({recipients.length})
            </button>
            <button
              onClick={() => setCategoryFilter('unsafe')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                categoryFilter === 'unsafe'
                  ? 'bg-rose-950/60 border border-rose-900/60 text-rose-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Blocked Unsafe Targets
            </button>
            <button
              onClick={() => setCategoryFilter('safe')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                categoryFilter === 'safe'
                  ? 'bg-emerald-950/60 border border-emerald-900/60 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified Gateways
            </button>
          </div>
        </div>

        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Recipient & Domain</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Threat Classification</th>
                <th className="py-3 px-4">Policy Enforcement</th>
                <th className="py-3 px-4">Evidence Hash</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredRecipients.map((rec) => {
                const isBlocked = rec.riskLevel === 'sanctioned' || rec.riskLevel === 'unsafe_blocked';
                return (
                  <tr key={rec.address} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-100">{rec.label}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {rec.domain || 'no linked domain'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {rec.address.slice(0, 10)}...{rec.address.slice(-6)}
                    </td>
                    <td className="py-3 px-4">
                      {/* Zero-Pill text formatting with clean typographic status */}
                      <span className={`font-mono text-[11px] font-semibold ${
                        rec.riskLevel === 'sanctioned' ? 'text-rose-400' :
                        rec.riskLevel === 'unsafe_blocked' ? 'text-rose-400' :
                        rec.riskLevel === 'elevated' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {rec.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {isBlocked ? (
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>STRICT_BLOCK</span>
                        </div>
                      ) : rec.riskLevel === 'elevated' ? (
                        <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>REQUIRE_HITL</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>PERMITTED</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {rec.evidenceCid.slice(0, 12)}...
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onTestAddressInWorkbench(rec.address, rec.label)}
                          className="px-2 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                        >
                          Simulate
                        </button>
                        <button
                          onClick={() => onToggleBlacklist(rec.address)}
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                            rec.isBlacklisted
                              ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/60'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {rec.isBlacklisted ? 'Blacklisted' : 'Unblocked'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Recipient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Add Monitored Counterparty / Threat Address
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecipient} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Counterparty Label / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Known Phishing Drainer Contract"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Ethereum Address (0x...)</label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Associated Domain / ENS (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. malicious-bridge.xyz"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Threat Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ofac_sanctions">OFAC Sanctions / Mixer</option>
                    <option value="phishing_drainer">Permit / Approval Drainer</option>
                    <option value="unverified_contract">Unverified Bytecode</option>
                    <option value="suspicious_velocity">Velocity Anomaly</option>
                    <option value="trusted_api_gateway">Trusted API Gateway</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Risk Level</label>
                  <select
                    value={newRiskLevel}
                    onChange={(e) => setNewRiskLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="sanctioned">Sanctioned (Auto-Block)</option>
                    <option value="unsafe_blocked">Unsafe (Auto-Block)</option>
                    <option value="elevated">Elevated (Require HITL)</option>
                    <option value="safe">Safe (Permitted)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Evidence / Threat Intelligence Reason</label>
                <textarea
                  rows={2}
                  placeholder="Describe detected exploit, threat feed citation, or security audit evidence..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  Save to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
