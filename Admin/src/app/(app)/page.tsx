'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  PauseCircle,
  PlayCircle,
  Radio,
  FileCheck,
  Check,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  type: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  resource: string;
  amount: string;
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
    priority: 'URGENT',
    resource: 'Wallet #W-8921 (Rohan S.)',
    amount: '₹2,50,000',
    details: 'IMPS Bank Transfer payout request exceeding single-transaction threshold',
    requesterId: 'adm_current', // Current viewer is maker
    requesterName: 'Root Super Admin (You)',
    expiresIn: '23m remaining',
    status: 'PENDING'
  },
  {
    id: 'app_102',
    type: 'Disputed Market Void',
    priority: 'HIGH',
    resource: 'IND vs PAK 2nd T20I (Over 18.4)',
    amount: '₹4,80,000',
    details: 'Heavy downpour stopped play; refunding 14 matched customer slips',
    requesterId: 'adm_trader_4',
    requesterName: 'Trader_Vikram',
    expiresIn: '1h 45m',
    status: 'PENDING'
  },
  {
    id: 'app_103',
    type: 'Manual Ledger Credit',
    priority: 'NORMAL',
    resource: 'Wallet #W-3042 (VIP Highroller)',
    amount: '₹75,000',
    details: 'Compensation credit following verified banking gateway timeout',
    requesterId: 'adm_support_9',
    requesterName: 'Agent_Anjali',
    expiresIn: '5h 10m',
    status: 'PENDING'
  }
];

interface LiveMatch {
  id: string;
  tournament: string;
  teamA: string;
  teamB: string;
  score: string;
  overs: string;
  status: 'IN_PLAY' | 'INNINGS_BREAK' | 'SUSPENDED';
  teamABack: number;
  teamALay: number;
  teamBBack: number;
  teamBLay: number;
  matchedVolume: string;
  bookLiability: string;
}

const LIVE_MATCHES: LiveMatch[] = [
  {
    id: 'mkt_ind_aus',
    tournament: 'India vs Australia — 3rd ODI (Nagpur)',
    teamA: 'India',
    teamB: 'Australia',
    score: 'IND 248/4',
    overs: '38.2 ov',
    status: 'IN_PLAY',
    teamABack: 1.45,
    teamALay: 1.47,
    teamBBack: 3.10,
    teamBLay: 3.15,
    matchedVolume: '₹42,85,000',
    bookLiability: '₹14,20,000'
  },
  {
    id: 'mkt_csk_mi',
    tournament: 'IPL 2026 — CSK vs MI (Wankhede)',
    teamA: 'CSK',
    teamB: 'MI',
    score: 'CSK 182/6',
    overs: '20.0 ov (Break)',
    status: 'INNINGS_BREAK',
    teamABack: 1.82,
    teamALay: 1.84,
    teamBBack: 2.10,
    teamBLay: 2.14,
    matchedVolume: '₹68,40,000',
    bookLiability: '₹22,50,000'
  },
  {
    id: 'mkt_eng_sa',
    tournament: 'England vs South Africa — 2nd T20I (Lord\'s)',
    teamA: 'South Africa',
    teamB: 'England',
    score: 'SA 94/2',
    overs: '11.1 ov',
    status: 'IN_PLAY',
    teamABack: 1.72,
    teamALay: 1.74,
    teamBBack: 2.24,
    teamBLay: 2.28,
    matchedVolume: '₹21,60,000',
    bookLiability: '₹7,80,000'
  }
];

export default function DashboardPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [matches, setMatches] = useState<LiveMatch[]>(LIVE_MATCHES);
  const [activeModalItem, setActiveModalItem] = useState<ApprovalItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [freezeAlertOpen, setFreezeAlertOpen] = useState(false);
  const currentAdminId = 'adm_current';

  const handleApprove = (item: ApprovalItem) => {
    if (item.requesterId === currentAdminId) {
      alert('Maker-Checker Invariant: You cannot approve a request created by yourself.');
      return;
    }
    setApprovals((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, status: 'APPROVED' } : a))
    );
    setActiveModalItem(null);
  };

  const handleReject = (item: ApprovalItem) => {
    if (item.requesterId === currentAdminId) {
      alert('Maker-Checker Invariant: You cannot review a request created by yourself.');
      return;
    }
    if (!rejectionReason.trim()) {
      alert('Please provide a mandatory justification for rejecting this request.');
      return;
    }
    setApprovals((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, status: 'REJECTED' } : a))
    );
    setActiveModalItem(null);
    setRejectionReason('');
  };

  const handleToggleMarketFreeze = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, status: m.status === 'SUSPENDED' ? 'IN_PLAY' : 'SUSPENDED' }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Trading Terminal Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Live Operations & Risk Terminal
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              SOCKETS: 2,840 ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time in-play cricket odds ladders, book liabilities, and 4-eyes dual custody governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFreezeAlertOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-all cursor-pointer shadow-2xs min-h-[40px] sm:min-h-0 flex-1 sm:flex-initial"
          >
            <PauseCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency Freeze</span>
          </button>
          <Link
            href="/roles"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all shadow-2xs min-h-[40px] sm:min-h-0"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>RBAC Matrix</span>
          </Link>
          <Link
            href="/markets"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-[#941b2c] hover:bg-[#7a1624] text-white transition-all shadow-2xs min-h-[40px] sm:min-h-0 flex-1 sm:flex-initial"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>In-Play Markets</span>
          </Link>
        </div>
      </div>

      {/* Primary Financial & Risk KPIs (2x2 Grid on Mobile, 4-Col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Book Exposure */}
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium">
            <span className="truncate pr-1">Active Book Liability</span>
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ₹84,50,000
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 font-medium">
              <span>Back: 48.2L</span>
              <span>Lay: 36.3L</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50">
              <div className="bg-sky-500 h-full" style={{ width: '57%' }} />
              <div className="bg-rose-500 h-full" style={{ width: '43%' }} />
            </div>
          </div>
        </div>

        {/* 24h Matched Volume */}
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium">
            <span className="truncate pr-1">24h Matched Vol</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ₹3,18,40,000
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +18.4%
            </span>
            <span className="text-slate-500 font-mono font-medium hidden sm:inline">14,280 slips</span>
          </div>
        </div>

        {/* Unmatched Order Liquidity */}
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium">
            <span className="truncate pr-1">Unmatched Book</span>
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ₹8,40,000
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
            <span className="text-slate-500 font-medium">142 orders</span>
            <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold font-mono text-[9px] sm:text-[10px]">Queue</span>
          </div>
        </div>

        {/* Dual-Custody Approval Gate */}
        <div className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium">
            <span className="truncate pr-1">4-Eyes Queue</span>
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#941b2c] shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>{approvals.filter((a) => a.status === 'PENDING').length}</span>
            <span className="text-[10px] font-sans font-semibold text-rose-700 px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200">
              Pending
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-medium">
            <span>Maker ≠ Checker</span>
            <span className="text-slate-700 font-mono font-semibold hidden sm:inline">Guarded</span>
          </div>
        </div>
      </div>

      {/* In-Play Cricket Odds Ladders (Live Trading Desk) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
              Live In-Play Cricket Odds Surveillance
            </h2>
            <p className="text-xs text-slate-500">
              Real-time Decimal Back/Lay ladder feeds with instant trading suspension controls.
            </p>
          </div>
          <Link
            href="/markets"
            className="text-xs text-[#941b2c] hover:underline font-semibold inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Sports Markets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`p-4 rounded-xl border transition-all ${
                match.status === 'SUSPENDED'
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={match.tournament}>
                  {match.tournament}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    match.status === 'IN_PLAY'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : match.status === 'INNINGS_BREAK'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {match.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <div className="text-base font-bold text-slate-900 font-mono">{match.score}</div>
                <div className="text-xs text-slate-500 font-mono font-medium">{match.overs}</div>
              </div>

              {/* Odds Ladder */}
              <div className="space-y-1.5 mb-3 text-xs">
                {/* Team A */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="font-bold text-slate-800 text-xs">{match.teamA}</span>
                  <div className="flex gap-1.5 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-300 font-bold hover:bg-sky-100 transition-colors">
                      {match.teamABack.toFixed(2)}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-300 font-bold hover:bg-rose-100 transition-colors">
                      {match.teamALay.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Team B */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="font-bold text-slate-800 text-xs">{match.teamB}</span>
                  <div className="flex gap-1.5 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded bg-sky-50 text-sky-800 border border-sky-300 font-bold hover:bg-sky-100 transition-colors">
                      {match.teamBBack.toFixed(2)}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-300 font-bold hover:bg-rose-100 transition-colors">
                      {match.teamBLay.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/80 pt-2.5">
                <span>Matched: <strong className="text-slate-800 font-mono">{match.matchedVolume}</strong></span>
                <button
                  onClick={() => handleToggleMarketFreeze(match.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer border ${
                    match.status === 'SUSPENDED'
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                      : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                  }`}
                >
                  {match.status === 'SUSPENDED' ? 'Resume Market' : 'Freeze Market'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dual Custody 4-Eyes Queue & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Approvals Queue */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-600" />
                Dual-Custody 4-Eyes Maker-Checker Queue
              </h2>
              <p className="text-xs text-slate-500">
                High-consequence financial adjustments and match voids require independent review.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Maker ≠ Checker
            </span>
          </div>

          <div className="space-y-3">
            {approvals.map((item) => {
              const isSelfMaker = item.requesterId === currentAdminId;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900">{item.type}</span>
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {item.amount}
                      </span>
                      {item.status === 'PENDING' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Review
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Approved &amp; Executed
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Rejected
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-700">{item.resource}</div>
                    <p className="text-[11px] text-slate-500">{item.details}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                      <span>Requested by: <strong className="text-slate-800 font-semibold">{item.requesterName}</strong></span>
                      <span>•</span>
                      <span className="text-amber-700 font-semibold">{item.expiresIn}</span>
                    </div>
                  </div>

                  {item.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveModalItem(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        Details
                      </button>
                      {isSelfMaker ? (
                        <div
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                          title="Self-Approval Prohibited by Policy"
                        >
                          Self-Approval Blocked
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApprove(item)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
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

        {/* Real-Time Risk Stream & High-Value Alerts */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Live Risk Stream &amp; Alerts
            </h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-700 flex items-center gap-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  High Liability Alert
                </span>
                <span className="text-[10px] text-slate-400 font-mono">2m ago</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                VIP Player #1042 placed <strong className="text-slate-800">₹1,50,000</strong> Lay on Pakistan @ 2.28 (Book Liability: ₹1,92,000).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Instant Settle Triggered
                </span>
                <span className="text-[10px] text-slate-400 font-mono">8m ago</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                IND 10-Over Session (Runs &gt; 74) settled YES. Payout ₹1,42,000 distributed to 34 wallets.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-700 flex items-center gap-1 text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                  UPI Gateway Auto-Credit
                </span>
                <span className="text-[10px] text-slate-400 font-mono">14m ago</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                HDFC Gateway matched UTR #881290 for ₹50,000 into Wallet #W-4410 with zero latency.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-700 flex items-center gap-1 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  Velocity Spike Detected
                </span>
                <span className="text-[10px] text-slate-400 font-mono">25m ago</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Player #9921 submitted 6 bet orders in 18 seconds on Fancy Line. Placed on watchlist.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-3">
            <Link
              href="/bets"
              className="w-full inline-flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <span>Inspect Full Bet Risk Stream</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3.5 sm:p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                Review Dual-Custody Request
              </h3>
              <button
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Request Type:</span>
                  <strong className="text-slate-900">{activeModalItem.type}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Transaction Amount:</span>
                  <strong className="text-amber-800 font-mono text-xs sm:text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{activeModalItem.amount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Target Entity:</span>
                  <strong className="text-slate-800 truncate max-w-[180px] sm:max-w-none">{activeModalItem.resource}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Initiating Maker:</span>
                  <strong className="text-slate-800">{activeModalItem.requesterName}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold text-xs">Operation Justification &amp; Payload:</label>
                <div className="p-3 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-700 border border-slate-200 break-words">
                  {activeModalItem.details}
                </div>
              </div>

              {activeModalItem.requesterId !== currentAdminId && (
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold text-xs">Rejection Justification (if denying):</label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c] min-h-[42px]"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer min-h-[40px] rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
              {activeModalItem.requesterId === currentAdminId ? (
                <div className="text-xs text-rose-700 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 flex items-center justify-center gap-1 font-semibold min-h-[40px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Self-approval blocked by policy
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(activeModalItem)}
                    className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[42px]"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(activeModalItem)}
                    className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer min-h-[42px]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve &amp; Execute
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Freeze Modal */}
      {freezeAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-rose-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">Emergency Market Freeze</h3>
            </div>
            <p className="text-xs text-slate-600">
              This action suspends all live cricket in-play betting order matching across all connected customer clients instantly.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setFreezeAlertOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setMatches((prev) => prev.map((m) => ({ ...m, status: 'SUSPENDED' })));
                  setFreezeAlertOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs cursor-pointer"
              >
                Confirm Full Freeze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
