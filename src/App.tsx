/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_AGENTS, 
  INITIAL_RECIPIENTS, 
  INITIAL_POLICIES, 
  INITIAL_TRANSACTIONS 
} from './data/mockData';
import { 
  AgentAccount, 
  RecipientIntel, 
  PolicyRule, 
  TransactionAuditRecord, 
  SessionKey 
} from './types/agent-wallet';
import { TopNav } from './components/TopNav';
import { SimulationWorkbench } from './components/SimulationWorkbench';
import { UnsafeRecipientGuard } from './components/UnsafeRecipientGuard';
import { PolicyStudio } from './components/PolicyStudio';
import { AttestationLedger } from './components/AttestationLedger';
import { AgentIdentityView } from './components/AgentIdentityView';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ShieldAlert, BookOpen, ExternalLink, Scale } from 'lucide-react';

export default function App() {
  // State with LocalStorage Persistence for interactive experimentation
  const [agents, setAgents] = useState<AgentAccount[]>(() => {
    const saved = localStorage.getItem('agentvault_agents');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_AGENTS;
  });

  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-harvester');

  const [recipientDb, setRecipientDb] = useState<RecipientIntel[]>(() => {
    const saved = localStorage.getItem('agentvault_recipients');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_RECIPIENTS;
  });

  const [policies, setPolicies] = useState<PolicyRule[]>(() => {
    const saved = localStorage.getItem('agentvault_policies');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_POLICIES;
  });

  const [transactions, setTransactions] = useState<TransactionAuditRecord[]>(() => {
    const saved = localStorage.getItem('agentvault_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [activeTab, setActiveTab] = useState<'workbench' | 'recipients' | 'policies' | 'ledger' | 'identity'>('workbench');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('agentvault_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('agentvault_recipients', JSON.stringify(recipientDb));
  }, [recipientDb]);

  useEffect(() => {
    localStorage.setItem('agentvault_policies', JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem('agentvault_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Transaction execution handler
  const handleTransactionGenerated = (record: TransactionAuditRecord) => {
    setTransactions(prev => [record, ...prev]);

    // If transaction approved, update agent balances & daily spend counters
    if (record.verdict === 'APPROVED_EXECUTED') {
      setAgents(prev => prev.map(ag => {
        if (ag.id !== record.agentId) return ag;

        const newBalances = { ...ag.balances };
        if (record.token === 'USDC') newBalances.usdc = Math.max(0, newBalances.usdc - record.amount);
        if (record.token === 'ETH') newBalances.eth = Math.max(0, newBalances.eth - record.amount);
        if (record.token === 'AGT') newBalances.agt = Math.max(0, newBalances.agt - record.amount);

        const updatedSessionKeys = ag.sessionKeys.map(k => {
          if (k.status === 'active') {
            return {
              ...k,
              dailySpent: k.dailySpent + record.valueUsd,
            };
          }
          return k;
        });

        return {
          ...ag,
          balances: newBalances,
          sessionKeys: updatedSessionKeys,
        };
      }));
    }
  };

  // Recipient Blacklist toggle
  const handleToggleBlacklist = (address: string) => {
    setRecipientDb(prev => prev.map(r => {
      if (r.address.toLowerCase() === address.toLowerCase()) {
        const nextBlacklisted = !r.isBlacklisted;
        return {
          ...r,
          isBlacklisted: nextBlacklisted,
          riskLevel: nextBlacklisted ? 'unsafe_blocked' : 'safe',
        };
      }
      return r;
    }));
  };

  // Add new monitored recipient
  const handleAddRecipient = (newRec: RecipientIntel) => {
    setRecipientDb(prev => [newRec, ...prev]);
  };

  // Policy updates
  const handleUpdatePolicy = (updated: PolicyRule) => {
    setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleResetPolicies = () => {
    setPolicies(INITIAL_POLICIES);
  };

  // HITL operator overrides
  const handleOperatorApprove = (txId: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        return {
          ...tx,
          verdict: 'OVERRIDDEN_BY_ADMIN',
          hitlAction: {
            resolvedAt: new Date().toISOString(),
            operatorDid: 'did:operator:eth:0xMasterOpAdmin01',
            note: 'Manual operator override authorized after out-of-band verification.',
          }
        };
      }
      return tx;
    }));
  };

  const handleOperatorReject = (txId: string) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        return {
          ...tx,
          verdict: 'REJECTED_BY_OPERATOR',
          hitlAction: {
            resolvedAt: new Date().toISOString(),
            operatorDid: 'did:operator:eth:0xMasterOpAdmin01',
            note: 'Operator refused signing request. Quarantined.',
          }
        };
      }
      return tx;
    }));
  };

  // Session keys management
  const handleAddSessionKey = (agentId: string, newKey: SessionKey) => {
    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          sessionKeys: [newKey, ...ag.sessionKeys],
        };
      }
      return ag;
    }));
  };

  const handleRevokeSessionKey = (agentId: string, keyId: string) => {
    setAgents(prev => prev.map(ag => {
      if (ag.id === agentId) {
        return {
          ...ag,
          sessionKeys: ag.sessionKeys.map(k => k.id === keyId ? { ...k, status: 'revoked' as const } : k),
        };
      }
      return ag;
    }));
  };

  const handleTestAddressInWorkbench = (address: string, label: string) => {
    setActiveTab('workbench');
    // Workbench component will receive target via props/state
  };

  const blockedCount = recipientDb.filter(r => r.riskLevel === 'sanctioned' || r.riskLevel === 'unsafe_blocked').length;
  const pendingHitlCount = transactions.filter(t => t.verdict === 'AWAITING_HITL_APPROVAL').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-200">
      {/* Top Bar Contract (1 row, 3 zones) */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={setSelectedAgentId}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        blockedCount={blockedCount}
        pendingHitlCount={pendingHitlCount}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'workbench' && (
          <SimulationWorkbench
            selectedAgent={selectedAgent}
            recipientDb={recipientDb}
            policies={policies}
            onTransactionGenerated={handleTransactionGenerated}
            onOpenLedgerItem={(txId) => {
              setSelectedTxId(txId);
              setActiveTab('ledger');
            }}
          />
        )}

        {activeTab === 'recipients' && (
          <UnsafeRecipientGuard
            recipients={recipientDb}
            onAddRecipient={handleAddRecipient}
            onToggleBlacklist={handleToggleBlacklist}
            onTestAddressInWorkbench={(addr, lbl) => {
              setActiveTab('workbench');
            }}
          />
        )}

        {activeTab === 'policies' && (
          <PolicyStudio
            policies={policies}
            onUpdatePolicy={handleUpdatePolicy}
            onResetPolicies={handleResetPolicies}
          />
        )}

        {activeTab === 'ledger' && (
          <AttestationLedger
            transactions={transactions}
            selectedTxId={selectedTxId}
            onSelectTx={setSelectedTxId}
            onOperatorApprove={handleOperatorApprove}
            onOperatorReject={handleOperatorReject}
          />
        )}

        {activeTab === 'identity' && (
          <AgentIdentityView
            agent={selectedAgent}
            onAddSessionKey={handleAddSessionKey}
            onRevokeSessionKey={handleRevokeSessionKey}
          />
        )}
      </main>

      {/* Architecture & Specs Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Clean Unboxed Footer with Apache-2.0 / MIT patterns & Prototype Notice */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Zero-Pill cleanly formatted metadata with typographic separators */}
          <div className="flex flex-wrap items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">AgentVault</span>
            <span aria-hidden="true">·</span>
            <span>Prototype & Demonstration Layer</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">Apache-2.0 / MIT</span>
            <span aria-hidden="true">·</span>
            <span>ERC-6551 TBA</span>
            <span aria-hidden="true">·</span>
            <span>ERC-4337 Account Abstraction</span>
            <span aria-hidden="true">·</span>
            <span>x402 Micropayments</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="hover:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Architectural Guide</span>
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>TEE Enclave Emulation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
