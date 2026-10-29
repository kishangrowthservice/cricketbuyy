'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Wallet,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  FileCheck2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  type: string;
  resource: string;
  details: string;
  requesterId: string;
  requesterName: string;
  expiresIn: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'app_101',
    type: 'High-Value Withdrawal',
    resource: 'Wallet #W-8921 (Rohan S.)',
    details: '₹2,50,000 withdrawal via IMPS payout',
    requesterId: 'adm_current', // Current viewer is maker
    requesterName: 'Root Super Admin (You)',
    expiresIn: '23h remaining',
    status: 'PENDING'
  },
  {
    id: 'app_102',
    type: 'Disputed Market Void',
    resource: 'IND vs PAK 2nd T20I (Over 18.4)',
    details: 'Rain delay stoppage; void 14 matched bets totalling ₹4,80,000',
    requesterId: 'adm_trader_4',
    requesterName: 'Trader_Vikram',
    expiresIn: '2h remaining',
    status: 'PENDING'
  },
  {
    id: 'app_103',
    type: 'Manual Ledger Credit',
    resource: 'Wallet #W-3042 (VIP Highroller)',
    details: '₹75,000 compensation credit for bank gateway timeout',
    requesterId: 'adm_support_9',
    requesterName: 'Agent_Anjali',
    expiresIn: '18h remaining',
    status: 'PENDING'
  }
];

export default function DashboardPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [activeModalItem, setActiveModalItem] = useState<ApprovalItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const currentAdminId = 'adm_current'; // Represents current logged-in session admin

  const stats = [
    { name: 'Active Customers', value: '14,892', change: '+12.4%', changeType: 'increase', icon: Users },
    { name: 'Live Match Exposure', value: '₹54,20,500', change: '8 Active Matches', changeType: 'neutral', icon: Flame },
    { name: '24h Net Deposits', value: '₹1,28,40,000', change: '+24.1%', changeType: 'increase', icon: Wallet },
    {
      name: 'Dual-Custody Approvals',
      value: `${approvals.filter((a) => a.status === 'PENDING').length} Pending`,
      change: '4-Eyes Governance',
      changeType: 'alert',
      icon: ShieldAlert
    }
  ];

  const handleApprove = (item: ApprovalItem) => {
    if (item.requesterId === currentAdminId) {
      alert('Maker-Checker Invariant Violation: You cannot approve a request created by yourself.');
      return;
    }
    setApprovals((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, status: 'APPROVED' } : a))
    );
    setActiveModalItem(null);
  };

  const handleReject = (item: ApprovalItem) => {
    if (item.requesterId === currentAdminId) {
      alert('Maker-Checker Invariant Violation: You cannot review a request created by yourself.');
      return;
    }
    if (!rejectionReason.trim()) {
      alert('Please state a reason for rejecting this dual-custody request.');
      return;
    }
    setApprovals((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, status: 'REJECTED' } : a))
    );
    setActiveModalItem(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#2a1215] via-[#12141a] to-[#12141a] border border-[#4a1c22]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#e53e3e]" />
            Cricketbuyy Command Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time surveillance, RBAC delegation, and financial concurrency monitors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/roles"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#941b2c] hover:bg-[#b92b3f] text-white border border-[#b92b3f]/60 transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-zinc-200" />
            Roles & RBAC
          </Link>
          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            Audit Ledger
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-5 rounded-xl bg-[#12141a] border border-zinc-800/80 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{stat.name}</span>
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-300">
                  <Icon className="w-4 h-4 text-[#e53e3e]" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                <span
                  className={
                    stat.changeType === 'increase'
                      ? 'text-emerald-400 font-semibold'
                      : stat.changeType === 'alert'
                      ? 'text-amber-400 font-semibold'
                      : 'text-zinc-400'
                  }
                >
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Custody 4-Eyes Queue & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Approvals Queue */}
        <div className="lg:col-span-8 bg-[#12141a] border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                Dual-Custody 4-Eyes Approval Queue
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                High-consequence actions require independent review. Self-approval is cryptographically blocked.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Maker != Checker
            </span>
          </div>

          <div className="space-y-3">
            {approvals.map((item) => {
              const isSelfMaker = item.requesterId === currentAdminId;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{item.type}</span>
                      <span className="text-xs text-zinc-500">•</span>
                      <span className="text-xs text-zinc-300 font-medium">{item.resource}</span>
                      {item.status === 'PENDING' && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60">
                          Pending Review
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                          Approved & Executed
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/60">
                          Rejected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">{item.details}</p>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                      <span>
                        Requested by: <strong className="text-zinc-300">{item.requesterName}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-zinc-400">{item.expiresIn}</span>
                    </div>
                  </div>

                  {item.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveModalItem(item)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
                      >
                        Review
                      </button>
                      {isSelfMaker ? (
                        <div
                          className="px-3 py-1.5 text-xs font-medium text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg cursor-not-allowed"
                          title="Maker-Checker: You created this request and cannot self-approve."
                        >
                          Self-Approval Blocked
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApprove(item)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live System Guardrails */}
        <div className="lg:col-span-4 bg-[#12141a] border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-[#e53e3e]" />
            Active Platform Guardrails
          </h2>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">Tamper-Proof Audit Chain</span>
                <span className="text-emerald-400 font-mono text-[11px]">ACTIVE (SHA-256)</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Zero mutable rows. Every action cryptographically links to previous block hash.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">Financial Concurrency Lock</span>
                <span className="text-emerald-400 font-mono text-[11px]">OPTIMISTIC v2</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Row-versioning and Redis idempotency leases prevent double-credit race conditions.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200">PII Field-Level Masking</span>
                <span className="text-emerald-400 font-mono text-[11px]">ENFORCED</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Phone numbers, emails, and bank accounts are automatically masked for standard support roles.
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-3">
            <Link
              href="/roles"
              className="w-full inline-flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <span>Manage Role Matrices</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#12141a] border border-[#2a1215] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-400" />
                Review Dual-Custody Request
              </h3>
              <button
                onClick={() => setActiveModalItem(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Request Type:</span>
                  <strong className="text-white">{activeModalItem.type}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Target Resource:</span>
                  <strong className="text-zinc-200">{activeModalItem.resource}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Requested By:</span>
                  <strong className="text-zinc-200">{activeModalItem.requesterName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">TTL Expiry:</span>
                  <strong className="text-amber-400">{activeModalItem.expiresIn}</strong>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Payload Details:</label>
                <div className="p-3 rounded-lg bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-zinc-800">
                  {activeModalItem.details}
                </div>
              </div>

              {activeModalItem.requesterId !== currentAdminId && (
                <div>
                  <label className="block text-zinc-400 mb-1">Rejection Reason (if rejecting):</label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="State reason for rejecting request..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#941b2c]"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Close
              </button>
              {activeModalItem.requesterId === currentAdminId ? (
                <div className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Self-approval blocked by policy
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleReject(activeModalItem)}
                    className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(activeModalItem)}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve & Execute
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
