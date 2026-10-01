import React from 'react';
import { AgentAccount } from '../types/agent-wallet';
import { Shield, Cpu, BookOpen, Layers } from 'lucide-react';

interface TopNavProps {
  activeTab: 'workbench' | 'recipients' | 'policies' | 'ledger' | 'identity';
  setActiveTab: (tab: 'workbench' | 'recipients' | 'policies' | 'ledger' | 'identity') => void;
  agents: AgentAccount[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  onOpenArchitecture: () => void;
  blockedCount: number;
  pendingHitlCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  agents,
  selectedAgentId,
  onSelectAgent,
  onOpenArchitecture,
  blockedCount,
  pendingHitlCount,
}) => {
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('workbench'); }}
              className="text-lg font-semibold tracking-tight text-white hover:text-indigo-300 transition-colors"
            >
              AgentVault
            </a>
            <span className="hidden sm:inline-block text-xs font-mono text-slate-400 border-l border-slate-800 pl-3">
              Autonomous Self-Custody & x402
            </span>
          </div>

          {/* Zone 2: 4-5 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('workbench')}
              className={`transition-colors py-1 relative ${
                activeTab === 'workbench'
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simulation Workbench
              {activeTab === 'workbench' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('recipients')}
              className={`transition-colors py-1 relative flex items-center gap-1.5 ${
                activeTab === 'recipients'
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unsafe Recipient Guard
              {blockedCount > 0 && (
                <span className="text-xs text-rose-400 font-mono">
                  ({blockedCount})
                </span>
              )}
              {activeTab === 'recipients' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`transition-colors py-1 relative ${
                activeTab === 'policies'
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Policy Guardrails
              {activeTab === 'policies' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`transition-colors py-1 relative flex items-center gap-1.5 ${
                activeTab === 'ledger'
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Audit & Attestations
              {pendingHitlCount > 0 && (
                <span className="text-xs text-amber-400 font-mono">
                  ({pendingHitlCount} held)
                </span>
              )}
              {activeTab === 'ledger' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('identity')}
              className={`transition-colors py-1 relative ${
                activeTab === 'identity'
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agent Keyrings
              {activeTab === 'identity' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {/* Agent Selector Dropdown */}
            <div className="relative">
              <label htmlFor="agent-selector" className="sr-only">Active Agent</label>
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <select
                  id="agent-selector"
                  value={selectedAgentId}
                  onChange={(e) => onSelectAgent(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 font-medium"
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id} className="bg-slate-900 text-slate-200">
                      {agent.name} ({agent.standard})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={onOpenArchitecture}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Specs & Architecture</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-4 border-t border-slate-800/80 text-xs text-slate-400">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`whitespace-nowrap ${activeTab === 'workbench' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            Workbench
          </button>
          <button
            onClick={() => setActiveTab('recipients')}
            className={`whitespace-nowrap ${activeTab === 'recipients' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            Unsafe Guard ({blockedCount})
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`whitespace-nowrap ${activeTab === 'policies' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            Policies
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`whitespace-nowrap ${activeTab === 'ledger' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            Audit Ledger ({pendingHitlCount})
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`whitespace-nowrap ${activeTab === 'identity' ? 'text-indigo-400 font-semibold' : ''}`}
          >
            Keyrings
          </button>
        </div>
      </div>
    </header>
  );
};
