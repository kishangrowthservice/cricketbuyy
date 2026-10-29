import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  ShieldAlert, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  ArrowDownRight
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { name: 'Active Customers', value: '14,892', change: '+12.4%', changeType: 'increase', icon: Users },
    { name: 'Live Match Exposure', value: '₹54,20,500', change: '8 Active Matches', changeType: 'neutral', icon: Flame },
    { name: '24h Net Deposits', value: '₹1,28,40,000', change: '+24.1%', changeType: 'increase', icon: Wallet },
    { name: 'Pending Review & Approvals', value: '3 Action(s)', change: 'Dual Custody', changeType: 'alert', icon: ShieldAlert }
  ];

  const pendingApprovals = [
    { id: 'app_01', type: 'High Value Withdrawal', amount: '₹2,50,000', user: 'demouser', requestedBy: 'Staff_Agent_4', status: 'REQUIRES_SECOND_SIGNATURE' },
    { id: 'app_02', type: 'Match Settlement Void', amount: '12 Bets affected', user: 'BAN v WI', requestedBy: 'Supervisor_9', status: 'PENDING_SUPER_ADMIN' },
    { id: 'app_03', type: 'Role Permission Elevation', amount: 'Finance Staff', user: 'Agent_12', requestedBy: 'Admin_Lead', status: 'PENDING_APPROVAL' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-900/40">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time surveillance, RBAC delegation, and financial concurrency monitors.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-white border border-rose-700/60 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
            Emergency Actions
          </Link>
          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Audit Ledger
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.name}</span>
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-rose-400" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  stat.changeType === 'increase' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                  stat.changeType === 'alert' ? 'bg-amber-950 text-amber-400 border border-amber-800/60 animate-pulse' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Pending Approvals Queue */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Two-Person Approval Queue (Dual Custody)
              </h2>
              <p className="text-[11px] text-slate-400">High-risk actions requiring supervisor confirmation before commit.</p>
            </div>
            <span className="text-xs text-rose-400 font-semibold cursor-pointer hover:underline">View All</span>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-white">{req.type}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Target: <span className="text-slate-300 font-medium">{req.user}</span> &bull; {req.amount} &bull; Initiator: {req.requestedBy}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-all cursor-pointer">
                    Approve
                  </button>
                  <button className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1/3): Concurrency & Security Status */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Integrity & Concurrency Status
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Database Engine</span>
              <span className="font-semibold text-emerald-400">PostgreSQL (Supabase)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Audit Hash-Chaining</span>
              <span className="font-semibold text-emerald-400">SHA-256 Validated</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Optimistic Locks</span>
              <span className="font-semibold text-emerald-400">Active (Row Versions)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Idempotency Leases</span>
              <span className="font-semibold text-emerald-400">Redis Leased (24h)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
