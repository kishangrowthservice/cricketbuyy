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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Live Operations & Risk Terminal
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              SOCKETS: 2,840 ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time in-play cricket odds ladders, book liabilities, and 4-eyes dual custody governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFreezeAlertOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition-all cursor-pointer"
          >
            <PauseCircle className="w-3.5 h-3.5 text-rose-400" />
            Emergency Market Freeze
          </button>
          <Link
            href="/roles"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            RBAC Matrix
          </Link>
          <Link
            href="/markets"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-white border border-rose-700/60 shadow-lg shadow-rose-950/50 transition-all"
          >
            <Flame className="w-3.5 h-3.5" />
            In-Play Markets
          </Link>
        </div>
      </div>

      {/* Primary Financial & Risk KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Book Exposure */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Active Book Liability</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ₹84,50,000
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Back: ₹48.2L</span>
              <span>Lay: ₹36.3L</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-sky-500 h-full" style={{ width: '57%' }} />
              <div className="bg-rose-500 h-full" style={{ width: '43%' }} />
            </div>
          </div>
        </div>

        {/* 24h Matched Volume */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>24h Matched Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ₹3,18,40,000
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +18.4% vs yesterday
            </span>
            <span className="text-slate-500 font-mono">14,280 slips</span>
          </div>
        </div>

        {/* Unmatched Order Liquidity */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Unmatched Order Book</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ₹8,40,000
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">142 orders pending</span>
            <span className="text-amber-400 font-semibold font-mono">Liquidity Queue</span>
          </div>
        </div>

        {/* Dual-Custody Approval Gate */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dual-Custody Queue</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
            <span>{approvals.filter((a) => a.status === 'PENDING').length}</span>
            <span className="text-xs font-sans font-semibold text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60">
              Action Required
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>4-Eyes Maker-Checker</span>
            <span className="text-slate-300 font-mono">Anti-Collision</span>
          </div>
        </div>
      </div>

      {/* In-Play Cricket Odds Ladders (Live Trading Desk) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              Live In-Play Cricket Odds Surveillance
            </h2>
            <p className="text-xs text-slate-400">
              Real-time Decimal Back/Lay ladder feeds with instant trading suspension controls.
            </p>
          </div>
          <Link
            href="/markets"
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold inline-flex items-center gap-1 self-start sm:self-auto"
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
                  ? 'bg-rose-950/20 border-rose-900/60'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[200px]" title={match.tournament}>
                  {match.tournament}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    match.status === 'IN_PLAY'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : match.status === 'INNINGS_BREAK'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                  }`}
                >
                  {match.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <div className="text-base font-bold text-white font-mono">{match.score}</div>
                <div className="text-xs text-slate-400 font-mono">{match.overs}</div>
              </div>

              {/* Odds Ladder */}
              <div className="space-y-1.5 mb-3 text-xs">
                {/* Team A */}
                <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="font-semibold text-slate-200">{match.teamA}</span>
                  <div className="flex gap-1.5 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 font-bold">
                      {match.teamABack.toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                      {match.teamALay.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Team B */}
                <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="font-semibold text-slate-200">{match.teamB}</span>
                  <div className="flex gap-1.5 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 font-bold">
                      {match.teamBBack.toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                      {match.teamBLay.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                <span>Matched: <strong className="text-slate-200 font-mono">{match.matchedVolume}</strong></span>
                <button
                  onClick={() => handleToggleMarketFreeze(match.id)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
                    match.status === 'SUSPENDED'
                      ? 'text-emerald-400 hover:bg-emerald-950/60'
                      : 'text-rose-400 hover:bg-rose-950/60'
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
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                Dual-Custody 4-Eyes Maker-Checker Queue
              </h2>
              <p className="text-xs text-slate-400">
                High-consequence financial adjustments and match voids require independent review.
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Maker ≠ Checker
            </span>
          </div>

          <div className="space-y-3">
            {approvals.map((item) => {
              const isSelfMaker = item.requesterId === currentAdminId;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-white">{item.type}</span>
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/50">
                        {item.amount}
                      </span>
                      {item.status === 'PENDING' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/60">
                          Pending Review
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          Approved &amp; Executed
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60">
                          Rejected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300">{item.resource}</div>
                    <p className="text-[11px] text-slate-400">{item.details}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                      <span>Requested by: <strong className="text-slate-300">{item.requesterName}</strong></span>
                      <span>•</span>
                      <span className="text-amber-400">{item.expiresIn}</span>
                    </div>
                  </div>

                  {item.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveModalItem(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                      {isSelfMaker ? (
                        <div
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 bg-slate-900 border border-slate-800 rounded-lg cursor-not-allowed"
                          title="Self-Approval Prohibited by Policy"
                        >
                          Self-Approval Blocked
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApprove(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
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
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Live Risk Stream &amp; Alerts
            </h2>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  High Liability Alert
                </span>
                <span className="text-[10px] text-slate-500">2m ago</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                VIP Player #1042 placed <strong>₹1,50,000</strong> Lay on Pakistan @ 2.28 (Book Liability: ₹1,92,000).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Instant Settle Triggered
                </span>
                <span className="text-[10px] text-slate-500">8m ago</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                IND 10-Over Session (Runs &gt; 74) settled YES. Payout ₹1,42,000 distributed to 34 wallets.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  UPI Gateway Auto-Credit
                </span>
                <span className="text-[10px] text-slate-500">14m ago</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                HDFC Gateway matched UTR #881290 for ₹50,000 into Wallet #W-4410 with zero latency.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  Velocity Spike Detected
                </span>
                <span className="text-[10px] text-slate-500">25m ago</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Player #9921 submitted 6 bet orders in 18 seconds on Fancy Line. Placed on watchlist.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-3">
            <Link
              href="/bets"
              className="w-full inline-flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span>Inspect Full Bet Risk Stream</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                Review Dual-Custody Request
              </h3>
              <button
                onClick={() => setActiveModalItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Request Type:</span>
                  <strong className="text-white">{activeModalItem.type}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction Amount:</span>
                  <strong className="text-amber-400 font-mono text-sm">{activeModalItem.amount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Entity:</span>
                  <strong className="text-slate-200">{activeModalItem.resource}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Initiating Maker:</span>
                  <strong className="text-slate-200">{activeModalItem.requesterName}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Operation Justification &amp; Payload:</label>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800">
                  {activeModalItem.details}
                </div>
              </div>

              {activeModalItem.requesterId !== currentAdminId && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Rejection Justification (if denying):</label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
              {activeModalItem.requesterId === currentAdminId ? (
                <div className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Self-approval blocked by policy
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleReject(activeModalItem)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(activeModalItem)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve &amp; Execute
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Freeze Modal */}
      {freezeAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-800/80 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">Emergency Market Freeze</h3>
            </div>
            <p className="text-xs text-slate-300">
              This action suspends all live cricket in-play betting order matching across all connected customer clients instantly.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFreezeAlertOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setMatches((prev) => prev.map((m) => ({ ...m, status: 'SUSPENDED' })));
                  setFreezeAlertOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-lg shadow-lg cursor-pointer"
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
