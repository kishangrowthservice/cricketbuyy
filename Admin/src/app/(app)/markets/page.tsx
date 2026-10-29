'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Sliders,
  AlertTriangle,
  Lock,
  ArrowUpDown,
  Search,
  FileCheck2
} from 'lucide-react';
import {
  MarketRecord,
  suspendMarketAction,
  resumeMarketAction,
  settleMarketAction,
  voidMarketAction,
  updateMarketOddsAction,
  createMarketAction
} from '../../../modules/markets/actions';

const INITIAL_MARKETS: MarketRecord[] = [
  {
    id: 'MKT-IND-PAK-01',
    eventName: 'India vs Pakistan (2nd T20I)',
    sport: 'Cricket',
    tournament: 'Asia Cup 2026',
    status: 'IN_PLAY',
    runners: [
      { id: 'run_ind', name: 'India', backPrice: 1.72, layPrice: 1.74 },
      { id: 'run_pak', name: 'Pakistan', backPrice: 2.24, layPrice: 2.28 }
    ],
    totalExposure: 480000,
    version: 2
  },
  {
    id: 'MKT-AUS-ENG-02',
    eventName: 'Australia vs England (1st Ashes Test)',
    sport: 'Cricket',
    tournament: 'The Ashes 2026',
    status: 'UPCOMING',
    runners: [
      { id: 'run_aus', name: 'Australia', backPrice: 1.95, layPrice: 1.98 },
      { id: 'run_eng', name: 'England', backPrice: 2.1, layPrice: 2.14 },
      { id: 'run_draw', name: 'The Draw', backPrice: 4.5, layPrice: 4.8 }
    ],
    totalExposure: 125000,
    version: 1
  },
  {
    id: 'MKT-CSK-MI-03',
    eventName: 'Chennai Super Kings vs Mumbai Indians',
    sport: 'Cricket',
    tournament: 'IPL 2026',
    status: 'SUSPENDED',
    runners: [
      { id: 'run_csk', name: 'Chennai Super Kings', backPrice: 1.85, layPrice: 1.88 },
      { id: 'run_mi', name: 'Mumbai Indians', backPrice: 2.05, layPrice: 2.08 }
    ],
    totalExposure: 320000,
    version: 4
  }
];

export default function MarketsManagementPage() {
  const [markets, setMarkets] = useState<MarketRecord[]>(INITIAL_MARKETS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_PLAY' | 'UPCOMING' | 'SUSPENDED' | 'SETTLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [settleModalMarket, setSettleModalMarket] = useState<MarketRecord | null>(null);
  const [voidModalMarket, setVoidModalMarket] = useState<MarketRecord | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [selectedWinnerId, setSelectedWinnerId] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = markets.filter((m) => {
    const matchesTab = activeTab === 'ALL' || m.status === activeTab;
    const matchesSearch =
      m.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tournament.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleToggleSuspend = async (market: MarketRecord) => {
    const isSuspended = market.status === 'SUSPENDED';
    try {
      if (isSuspended) {
        await resumeMarketAction({ marketId: market.id }, {
          actor: { id: 'adm_current', email: 'trader@cricketbuyy.com', isSuperAdmin: true, roles: ['risk_manager'], permissions: ['market:update'] }
        });
        setMarkets((prev) => prev.map((m) => (m.id === market.id ? { ...m, status: 'IN_PLAY' } : m)));
        setFeedback(`Trading resumed for '${market.eventName}'.`);
      } else {
        await suspendMarketAction({ marketId: market.id, reason: 'Emergency trader pause' }, {
          actor: { id: 'adm_current', email: 'trader@cricketbuyy.com', isSuperAdmin: true, roles: ['risk_manager'], permissions: ['market:suspend'] }
        });
        setMarkets((prev) => prev.map((m) => (m.id === market.id ? { ...m, status: 'SUSPENDED' } : m)));
        setFeedback(`Trading suspended for '${market.eventName}'.`);
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalMarket || !selectedWinnerId) return;

    try {
      await settleMarketAction(
        {
          marketId: settleModalMarket.id,
          winningRunnerId: selectedWinnerId,
          expectedVersion: settleModalMarket.version
        },
        {
          actor: { id: 'adm_current', email: 'trader@cricketbuyy.com', isSuperAdmin: true, roles: ['risk_manager'], permissions: ['market:settle'] }
        }
      );

      setMarkets((prev) =>
        prev.map((m) => (m.id === settleModalMarket.id ? { ...m, status: 'SETTLED', winningRunnerId: selectedWinnerId, version: m.version + 1 } : m))
      );
      setFeedback(`Market '${settleModalMarket.eventName}' settled successfully! Customer payouts calculated.`);
      setSettleModalMarket(null);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleVoidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidModalMarket || !voidReason.trim()) return;

    try {
      const res = await voidMarketAction(
        {
          marketId: voidModalMarket.id,
          reason: voidReason,
          expectedVersion: voidModalMarket.version
        },
        {
          actor: { id: 'adm_current', email: 'trader@cricketbuyy.com', isSuperAdmin: true, roles: ['risk_manager'], permissions: ['market:void'] }
        }
      );

      if (res.success) {
        if ('requiresDualCustody' in res.data && res.data.requiresDualCustody) {
          setFeedback(res.data.message as string);
        } else {
          setMarkets((prev) =>
            prev.map((m) => (m.id === voidModalMarket.id ? { ...m, status: 'VOIDED', voidReason, version: m.version + 1 } : m))
          );
          setFeedback(`Market '${voidModalMarket.eventName}' marked VOID. All stakes refunded.`);
        }
      } else {
        alert(res.error.safeMessage);
      }
      setVoidModalMarket(null);
      setVoidReason('');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2a1215] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-[#e53e3e]" />
            Sports Markets & In-Play Control Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time odds ladder management, in-play emergency suspension, and multi-version settlement.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#12141a] border border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'IN_PLAY', 'UPCOMING', 'SUSPENDED', 'SETTLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#941b2c] text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search match or tournament..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-[#941b2c]"
          />
        </div>
      </div>

      {/* Markets Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((m) => {
          const isSuspended = m.status === 'SUSPENDED';
          const isSettled = m.status === 'SETTLED';
          const isVoided = m.status === 'VOIDED';

          return (
            <div
              key={m.id}
              className={`p-5 rounded-2xl border transition-all ${
                isSuspended
                  ? 'bg-[#181112] border-amber-900/60'
                  : isSettled
                  ? 'bg-[#101217] border-zinc-800/60 opacity-80'
                  : 'bg-[#12141a] border-zinc-800 hover:border-zinc-700 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-400">{m.sport}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-400">{m.tournament}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        m.status === 'IN_PLAY'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 animate-pulse'
                          : m.status === 'SUSPENDED'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                          : m.status === 'SETTLED'
                          ? 'bg-blue-950/60 text-blue-400 border-blue-800/60'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {m.status.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">v{m.version}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{m.eventName}</h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span>ID: <code className="font-mono text-zinc-300">{m.id}</code></span>
                    <span>•</span>
                    <span>Total Market Liability: <strong className="text-amber-400 font-mono">₹{m.totalExposure.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>

                {/* Odds Ladder Display */}
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {m.runners.map((r) => {
                    const isWinner = m.winningRunnerId === r.id;
                    return (
                      <div
                        key={r.id}
                        className={`p-2.5 rounded-xl border text-center min-w-[130px] ${
                          isWinner
                            ? 'bg-emerald-950/80 border-emerald-600 shadow-md'
                            : 'bg-zinc-900/80 border-zinc-800'
                        }`}
                      >
                        <div className="text-xs font-semibold text-white truncate max-w-[110px] mx-auto">{r.name}</div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-xs">
                          <div className="bg-sky-950/80 text-sky-300 py-1 px-1.5 rounded border border-sky-800/50">
                            <span className="text-[9px] block text-sky-400/80">BACK</span>
                            <strong>{r.backPrice.toFixed(2)}</strong>
                          </div>
                          <div className="bg-rose-950/80 text-rose-300 py-1 px-1.5 rounded border border-rose-800/50">
                            <span className="text-[9px] block text-rose-400/80">LAY</span>
                            <strong>{r.layPrice.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                {!isSettled && !isVoided && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleSuspend(m)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSuspended
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900'
                      }`}
                      title={isSuspended ? 'Resume In-Play Trading' : 'Emergency In-Play Suspension'}
                    >
                      {isSuspended ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                      {isSuspended ? 'Resume' : 'Suspend'}
                    </button>

                    <button
                      onClick={() => {
                        setSettleModalMarket(m);
                        setSelectedWinnerId(m.runners[0]?.id || '');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800 hover:bg-blue-900 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Settle
                    </button>

                    <button
                      onClick={() => {
                        setVoidModalMarket(m);
                        setVoidReason('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Void
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Settle Market Modal */}
      {settleModalMarket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#12141a] border border-[#38161b] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                Settle Market Outcome
              </h3>
              <button onClick={() => setSettleModalMarket(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-zinc-300">
              Select the confirmed winner for <strong>{settleModalMarket.eventName}</strong>. Settling will calculate all customer bet slips and credit winning wallets atomically.
            </p>

            <form onSubmit={handleSettleSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-zinc-300 font-medium">Declared Winner Selection:</label>
                {settleModalMarket.runners.map((r) => (
                  <label
                    key={r.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      selectedWinnerId === r.id ? 'bg-[#2a1215] border-[#941b2c]' : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="winner"
                        checked={selectedWinnerId === r.id}
                        onChange={() => setSelectedWinnerId(r.id)}
                        className="accent-[#941b2c]"
                      />
                      <span className="font-semibold text-white">{r.name}</span>
                    </div>
                    <span className="font-mono text-zinc-400">Back {r.backPrice.toFixed(2)}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button type="button" onClick={() => setSettleModalMarket(null)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded-xl transition-all shadow-sm">
                  Confirm & Settle Payouts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Market Modal */}
      {voidModalMarket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#12141a] border border-[#38161b] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                Void Match Market
              </h3>
              <button onClick={() => setVoidModalMarket(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {voidModalMarket.totalExposure > 200000 ? (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  Dual-Custody Approval Required
                </div>
                <p className="text-[11px] text-zinc-300">
                  Total market exposure is ₹{voidModalMarket.totalExposure.toLocaleString('en-IN')} (&gt; ₹2,00,000 threshold). Submitting will route this to the Dual-Custody Approval Queue for a second sign-off.
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-300">
                Voiding will cancel all matched and unmatched bets on <strong>{voidModalMarket.eventName}</strong> and refund stakes back to customer accounts.
              </p>
            )}

            <form onSubmit={handleVoidSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-zinc-300 font-medium">Justification Reason (Mandatory):</label>
                <textarea
                  required
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Match abandoned without official result due to rain/cyclone..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#941b2c]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button type="button" onClick={() => setVoidModalMarket(null)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2 font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-xl transition-all shadow-sm">
                  Submit Void Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
