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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-[#941b2c] shrink-0" />
            <span>Financial Ledger &amp; Concurrency Surveillance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time balance adjustments, optimistic concurrency locks, distributed leases, and transactional outbox.
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdjustModalOpen(true);
            setFeedback(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-[#941b2c] hover:bg-[#7a1624] rounded-xl transition-colors shadow-2xs cursor-pointer min-h-[42px] sm:min-h-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Balance Adjustment</span>
        </button>
      </div>

      {/* KPI Cards (2x2 Grid on Mobile, 4-Col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-2 sm:space-y-3"
          >
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-semibold">
              <span className="truncate pr-1">{stat.name}</span>
              <Lock className="w-3.5 h-3.5 text-[#941b2c] shrink-0" />
            </div>
            <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">{stat.value}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Transaction Cards (< md) */}
      <div className="md:hidden space-y-3">
        <div className="px-1 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Recent Financial Operations
          </h2>
          <span className="text-[10px] font-mono text-slate-500">
            {transactions.length} records
          </span>
        </div>
        {transactions.map((t) => (
          <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-slate-900">{t.id}</span>
              <span className="font-mono text-xs font-bold">
                {t.type.includes('CREDIT') || t.type === 'DEPOSIT' ? (
                  <span className="text-emerald-700">+₹{t.amount.toLocaleString('en-IN')}</span>
                ) : (
                  <span className="text-rose-700">-₹{t.amount.toLocaleString('en-IN')}</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">{t.customerName}</div>
                <div className="text-[10px] font-mono text-slate-500">{t.customerId}</div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                  {t.type}
                </span>
                <span className="font-mono text-[10px] font-bold ml-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800">
                  v{t.version}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
              <span className="text-slate-400 font-mono text-[10px]">{t.timestamp}</span>
              {t.status === 'COMPLETED' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Dispatched
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3 h-3" />
                  Pending 4-Eyes
                </span>
              )}
            </div>
            {t.reason && (
              <div className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                Reason: {t.reason}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Transactions Ledger Table (Desktop md+) */}
      <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Recent Financial Operations Ledger
          </h2>
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            {transactions.length} Recorded Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-200/80">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{t.customerName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{t.customerId}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-sm">
                    {t.type.includes('CREDIT') || t.type === 'DEPOSIT' ? (
                      <span className="text-emerald-700">+₹{t.amount.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-rose-700">-₹{t.amount.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800">
                      v{t.version}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {t.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Dispatched
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Pending 4-Eyes
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    <div className="font-medium text-slate-700">{t.timestamp}</div>
                    <div className="text-slate-500 truncate max-w-xs">{t.reason}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Balance Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3.5 sm:p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#941b2c]" />
                Manual Wallet Balance Adjustment
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      if (e.target.value === 'CUST-8092') setExpectedVersion(3);
                      else setExpectedVersion(1);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                  >
                    <option value="CUST-8091">Rohan Sharma (CUST-8091)</option>
                    <option value="CUST-8092">Rahul Verma (CUST-8092)</option>
                    <option value="CUST-8093">Anand Singh (CUST-8093)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Operation Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as 'CREDIT' | 'DEBIT')}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                  >
                    <option value="CREDIT">CREDIT (Add Funds)</option>
                    <option value="DEBIT">DEBIT (Deduct Funds)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expected Version</label>
                  <input
                    type="number"
                    required
                    value={expectedVersion}
                    onChange={(e) => setExpectedVersion(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-amber-800 font-mono font-bold focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                  />
                </div>
              </div>

              {/* Dynamic Guardrail Notices */}
              {amount > 100000 ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2 text-[11px]">
                  <FileCheck2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Dual-Custody Invariant Triggered</strong>
                    Adjustments over ₹1,00,000 cannot execute immediately. This will route to the 4-Eyes Approval queue for independent review.
                  </div>
                </div>
              ) : amount > 50000 ? (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 space-y-2 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <KeyRound className="w-4 h-4 text-purple-600" />
                    Step-Up MFA Required (&gt; ₹50,000)
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={stepUpCode}
                    onChange={(e) => setStepUpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit TOTP code"
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-slate-900 font-mono text-center tracking-widest text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Adjustment Reason (Audit Required)</label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Reconciliation for failed UPI callback ref #9812..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-white bg-[#941b2c] hover:bg-[#7a1624] rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
