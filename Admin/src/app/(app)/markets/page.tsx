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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-[#941b2c]" />
            Sports Markets &amp; In-Play Control Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time odds ladder management, in-play emergency suspension, and multi-version settlement.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer">✕</button>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'IN_PLAY', 'UPCOMING', 'SUSPENDED', 'SETTLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#941b2c] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search match or tournament..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
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
                  ? 'bg-amber-50/40 border-amber-200/80 shadow-xs'
                  : isSettled
                  ? 'bg-slate-50/60 border-slate-200 opacity-85 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-600">{m.sport}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-600 font-medium">{m.tournament}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        m.status === 'IN_PLAY'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                          : m.status === 'SUSPENDED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : m.status === 'SETTLED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {m.status.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 font-medium">v{m.version}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{m.eventName}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>ID: <code className="font-mono text-slate-700 font-semibold">{m.id}</code></span>
                    <span>•</span>
                    <span>Total Market Liability: <strong className="text-amber-800 font-mono font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">₹{m.totalExposure.toLocaleString('en-IN')}</strong></span>
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
                            ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-800 truncate max-w-[110px] mx-auto">{r.name}</div>
                        <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-xs">
                          <div className="bg-sky-50 text-sky-800 py-1 px-1.5 rounded-lg border border-sky-300 font-bold">
                            <span className="text-[9px] block text-sky-600 font-semibold">BACK</span>
                            <strong>{r.backPrice.toFixed(2)}</strong>
                          </div>
                          <div className="bg-rose-50 text-rose-800 py-1 px-1.5 rounded-lg border border-rose-300 font-bold">
                            <span className="text-[9px] block text-rose-600 font-semibold">LAY</span>
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
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                        isSuspended
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
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
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 transition-colors cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Settle
                    </button>

                    <button
                      onClick={() => {
                        setVoidModalMarket(m);
                        setVoidReason('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer shadow-2xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Settle Market Outcome
              </h3>
              <button onClick={() => setSettleModalMarket(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer text-lg leading-none p-1">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              Select the confirmed winner for <strong className="text-slate-900">{settleModalMarket.eventName}</strong>. Settling will calculate all customer bet slips and credit winning wallets atomically.
            </p>

            <form onSubmit={handleSettleSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold">Declared Winner Selection:</label>
                {settleModalMarket.runners.map((r) => (
                  <label
                    key={r.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      selectedWinnerId === r.id ? 'bg-rose-50/60 border-[#941b2c] text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-700'
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
                      <span className="font-bold text-slate-900">{r.name}</span>
                    </div>
                    <span className="font-mono text-slate-500 font-medium">Back {r.backPrice.toFixed(2)}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setSettleModalMarket(null)} className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-2xs cursor-pointer">
                  Confirm &amp; Settle Payouts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Market Modal */}
      {voidModalMarket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Void Match Market
              </h3>
              <button onClick={() => setVoidModalMarket(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer text-lg leading-none p-1">✕</button>
            </div>

            {voidModalMarket.totalExposure > 200000 ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <FileCheck2 className="w-4 h-4 text-amber-600" />
                  Dual-Custody Approval Required
                </div>
                <p className="text-[11px] text-slate-600">
                  Total market exposure is ₹{voidModalMarket.totalExposure.toLocaleString('en-IN')} (&gt; ₹2,00,000 threshold). Submitting will route this to the Dual-Custody Approval Queue for a second sign-off.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Voiding will cancel all matched and unmatched bets on <strong className="text-slate-900">{voidModalMarket.eventName}</strong> and refund stakes back to customer accounts.
              </p>
            )}

            <form onSubmit={handleVoidSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-semibold">Justification Reason (Mandatory):</label>
                <textarea
                  required
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Match abandoned without official result due to rain/cyclone..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setVoidModalMarket(null)} className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-2xs cursor-pointer">
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
