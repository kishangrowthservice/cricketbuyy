'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Plus,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  KeyRound,
  FileCheck2
} from 'lucide-react';
import { adjustWalletBalanceAction } from '../../../modules/financial/actions';

interface TransactionRecord {
  id: string;
  customerId: string;
  customerName: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'MANUAL_CREDIT' | 'MANUAL_DEBIT' | 'BET_PAYOUT';
  amount: number;
  status: 'COMPLETED' | 'PENDING_APPROVAL' | 'REJECTED';
  version: number;
  outboxDispatched: boolean;
  timestamp: string;
  reason?: string;
}

const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TXN-9021',
    customerId: 'CUST-8091',
    customerName: 'Rohan Sharma',
    type: 'DEPOSIT',
    amount: 50000,
    status: 'COMPLETED',
    version: 1,
    outboxDispatched: true,
    timestamp: '2026-10-29 16:15:20',
    reason: 'UPI Instant Net Banking Gateway'
  },
  {
    id: 'TXN-9022',
    customerId: 'CUST-8092',
    customerName: 'Rahul Verma',
    type: 'MANUAL_CREDIT',
    amount: 150000,
    status: 'PENDING_APPROVAL',
    version: 3,
    outboxDispatched: false,
    timestamp: '2026-10-29 15:42:10',
    reason: 'VIP Highroller manual bonus override (> ₹1,00,000)'
  },
  {
    id: 'TXN-9023',
    customerId: 'CUST-8093',
    customerName: 'Anand Singh',
    type: 'WITHDRAWAL',
    amount: 25000,
    status: 'COMPLETED',
    version: 1,
    outboxDispatched: true,
    timestamp: '2026-10-29 14:02:45',
    reason: 'IMPS Bank Transfer'
  }
];

export default function FinancialManagementPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUST-8091');
  const [amount, setAmount] = useState<number>(5000);
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [reason, setReason] = useState('');
  const [expectedVersion, setExpectedVersion] = useState<number>(1);
  const [stepUpCode, setStepUpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const stats = [
    { name: 'Total Platform Reserves', value: '₹4,82,50,000', change: '+8.4% today', type: 'up' },
    { name: '24h Gross Payouts', value: '₹34,10,000', change: '142 Batches', type: 'neutral' },
    { name: 'Active Concurrency Leases', value: '0 Conflicts', change: 'Redlock / Mutex Active', type: 'up' },
    { name: 'Transactional Outbox Health', value: '100% Dispatched', change: 'Zero Lag', type: 'up' }
  ];

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await adjustWalletBalanceAction(
        {
          customerId: selectedCustomerId,
          amount: Number(amount),
          type: adjustType,
          reason,
          expectedBalanceVersion: Number(expectedVersion),
          stepUpTotpCode: amount > 50000 ? stepUpCode : undefined
        },
        {
          actor: {
            id: 'adm_current',
            email: 'finance@cricketbuyy.com',
            isSuperAdmin: true,
            roles: ['finance_officer'],
            permissions: ['wallet:adjust']
          }
        }
      );

      if (!res.success) {
        setFeedback({ type: 'error', message: res.error.safeMessage });
        setIsSubmitting(false);
        return;
      }

      if ('requiresDualCustody' in res.data && res.data.requiresDualCustody) {
        setFeedback({
          type: 'success',
          message: `Notice: Ultra high-value adjustment routed to Dual-Custody 4-Eyes Queue (Request ID: ${res.data.approvalRequestId}). Second approval required.`
        });
        const newTxn: TransactionRecord = {
          id: `TXN-${Date.now().toString().slice(-4)}`,
          customerId: selectedCustomerId,
          customerName: 'Customer Record',
          type: adjustType === 'CREDIT' ? 'MANUAL_CREDIT' : 'MANUAL_DEBIT',
          amount: Number(amount),
          status: 'PENDING_APPROVAL',
          version: expectedVersion,
          outboxDispatched: false,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          reason
        };
        setTransactions((prev) => [newTxn, ...prev]);
      } else {
        const newBalance = 'newBalance' in res.data ? res.data.newBalance : 0;
        const newVersion = 'newVersion' in res.data ? res.data.newVersion : expectedVersion + 1;
        setFeedback({
          type: 'success',
          message: `Success! Balance adjusted. New balance: ₹${newBalance?.toLocaleString('en-IN')}, Version incremented to v${newVersion}.`
        });
        setExpectedVersion(newVersion);
        const newTxn: TransactionRecord = {
          id: `TXN-${Date.now().toString().slice(-4)}`,
          customerId: selectedCustomerId,
          customerName: 'Customer Record',
          type: adjustType === 'CREDIT' ? 'MANUAL_CREDIT' : 'MANUAL_DEBIT',
          amount: Number(amount),
          status: 'COMPLETED',
          version: newVersion,
          outboxDispatched: true,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          reason
        };
        setTransactions((prev) => [newTxn, ...prev]);
      }

      setReason('');
      setStepUpCode('');
    } catch (err) {
      setFeedback({ type: 'error', message: (err as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2a1215] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-[#e53e3e]" />
            Financial Ledger & Concurrency Surveillance
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time balance adjustments, optimistic concurrency locks, distributed leases, and transactional outbox.
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdjustModalOpen(true);
            setFeedback(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#941b2c] hover:bg-[#b92b3f] rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Manual Balance Adjustment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-5 rounded-xl bg-[#12141a] border border-zinc-800/80 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{stat.name}</span>
              <Lock className="w-3.5 h-3.5 text-[#e53e3e]" />
            </div>
            <div className="mt-3 text-2xl font-bold text-white tracking-tight">{stat.value}</div>
            <div className="mt-2 text-xs text-emerald-400 font-semibold">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-[#12141a] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            Recent Financial Operations Ledger
          </h2>
          <span className="text-[11px] font-mono text-zinc-400">
            {transactions.length} Recorded Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161820] text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Operation Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Optimistic Version</th>
                <th className="py-3 px-4">Outbox Status</th>
                <th className="py-3 px-4">Timestamp / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#161820]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-zinc-300">{t.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{t.customerName}</div>
                    <div className="text-[11px] font-mono text-zinc-500">{t.customerId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {t.type.includes('CREDIT') || t.type === 'DEPOSIT' ? (
                      <span className="text-emerald-400">+₹{t.amount.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-rose-400">-₹{t.amount.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-300">
                      v{t.version}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        Dispatched
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/60">
                        <Clock className="w-3 h-3" />
                        Pending 4-Eyes
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                    <div>{t.timestamp}</div>
                    <div className="text-zinc-500 truncate max-w-xs">{t.reason}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Balance Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#12141a] border border-[#38161b] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#e53e3e]" />
                Manual Wallet Balance Adjustment
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Target Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      if (e.target.value === 'CUST-8092') setExpectedVersion(3);
                      else setExpectedVersion(1);
                    }}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-[#941b2c]"
                  >
                    <option value="CUST-8091">Rohan Sharma (CUST-8091)</option>
                    <option value="CUST-8092">Rahul Verma (CUST-8092)</option>
                    <option value="CUST-8093">Anand Singh (CUST-8093)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Operation Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as 'CREDIT' | 'DEBIT')}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-[#941b2c]"
                  >
                    <option value="CREDIT">CREDIT (Add Funds)</option>
                    <option value="DEBIT">DEBIT (Deduct Funds)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono focus:outline-none focus:border-[#941b2c]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Expected Version</label>
                  <input
                    type="number"
                    required
                    value={expectedVersion}
                    onChange={(e) => setExpectedVersion(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-amber-300 font-mono focus:outline-none focus:border-[#941b2c]"
                  />
                </div>
              </div>

              {/* Dynamic Guardrail Notices */}
              {amount > 100000 ? (
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 flex items-start gap-2 text-[11px]">
                  <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Dual-Custody Invariant Triggered</strong>
                    Adjustments over ₹1,00,000 cannot execute immediately. This will route to the 4-Eyes Approval queue for independent review.
                  </div>
                </div>
              ) : amount > 50000 ? (
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-300 space-y-2 text-[11px]">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    Step-Up MFA Required (&gt; ₹50,000)
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={stepUpCode}
                    onChange={(e) => setStepUpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit TOTP code"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono text-center tracking-widest text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Adjustment Reason (Audit Required)</label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Reconciliation for failed UPI callback ref #9812..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#941b2c]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-medium text-white bg-[#941b2c] hover:bg-[#b92b3f] rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Acquiring Lock & Committing...' : 'Commit Mutation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
