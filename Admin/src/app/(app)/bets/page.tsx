'use client';

import React, { useState } from 'react';
import {
  Flame,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { BetSlipRecord, cancelBetAction, voidBetAction } from '../../../modules/bets/actions';

const INITIAL_BETS: BetSlipRecord[] = [
  {
    id: 'BET-9901',
    marketId: 'MKT-IND-PAK-01',
    marketName: 'India vs Pakistan (2nd T20I)',
    runnerName: 'India',
    customerId: 'CUST-8091',
    customerName: 'Rohan Sharma',
    type: 'BACK',
    odds: 1.74,
    stake: 50000,
    potentialProfit: 37000,
    liability: 50000,
    status: 'MATCHED',
    placedAt: '2026-10-29 16:30:12'
  },
  {
    id: 'BET-9902',
    marketId: 'MKT-IND-PAK-01',
    marketName: 'India vs Pakistan (2nd T20I)',
    runnerName: 'Pakistan',
    customerId: 'CUST-8092',
    customerName: 'Rahul Verma',
    type: 'LAY',
    odds: 2.26,
    stake: 100000,
    potentialProfit: 100000,
    liability: 126000,
    status: 'MATCHED',
    placedAt: '2026-10-29 16:35:40'
  },
  {
    id: 'BET-9903',
    marketId: 'MKT-AUS-ENG-02',
    marketName: 'Australia vs England (1st Ashes Test)',
    runnerName: 'England',
    customerId: 'CUST-8093',
    customerName: 'Anand Singh',
    type: 'BACK',
    odds: 2.14,
    stake: 15000,
    potentialProfit: 17100,
    liability: 15000,
    status: 'UNMATCHED',
    placedAt: '2026-10-29 16:40:02'
  },
  {
    id: 'BET-9904',
    marketId: 'MKT-IND-PAK-01',
    marketName: 'India vs Pakistan (2nd T20I)',
    runnerName: 'India',
    customerId: 'CUST-8094',
    customerName: 'Priya Mehta',
    type: 'BACK',
    odds: 1.72,
    stake: 25000,
    potentialProfit: 18000,
    liability: 25000,
    status: 'MATCHED',
    placedAt: '2026-10-29 16:44:18'
  }
];

export default function BetsSurveillancePage() {
  const [bets, setBets] = useState<BetSlipRecord[]>(INITIAL_BETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BACK' | 'LAY'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'MATCHED' | 'UNMATCHED' | 'CANCELLED' | 'VOIDED'>('ALL');
  const [voidModalBet, setVoidModalBet] = useState<BetSlipRecord | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = bets.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.marketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.runnerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || b.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCancelBet = async (bet: BetSlipRecord) => {
    if (confirm(`Are you sure you want to cancel unmatched bet order '${bet.id}'? ₹${bet.stake} will be refunded to customer.`)) {
      try {
        const res = await cancelBetAction(
          { betId: bet.id, reason: 'Trader cancelled unmatched order' },
          { actor: { id: 'adm_current', email: 'trader@cricketbuyy.com', isSuperAdmin: true, roles: ['risk_manager'], permissions: ['bet:cancel'] } }
        );

        if (res.success) {
          setBets((prev) => prev.map((b) => (b.id === bet.id ? { ...b, status: 'CANCELLED' } : b)));
          setFeedback(`Bet order '${bet.id}' cancelled. Stake of ₹${bet.stake.toLocaleString('en-IN')} refunded.`);
        }
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const handleVoidBetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidModalBet || !voidReason.trim()) return;

    try {
      const res = await voidBetAction(
        { betId: voidModalBet.id, reason: voidReason },
        { actor: { id: 'adm_current', email: 'trader@cricketbuyy.com', isSuperAdmin: true, roles: ['risk_manager'], permissions: ['bet:void'] } }
      );

      if (res.success) {
        setBets((prev) => prev.map((b) => (b.id === voidModalBet.id ? { ...b, status: 'VOIDED', voidReason } : b)));
        setFeedback(`Bet '${voidModalBet.id}' marked VOID with audit log. Stake refunded.`);
        setVoidModalBet(null);
        setVoidReason('');
      } else {
        alert(res.error.safeMessage);
      }
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
            <Flame className="w-7 h-7 text-[#941b2c]" />
            Bet Risk Surveillance &amp; Order Book
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time back/lay liability monitors, order cancellations, and audited dispute voiding.
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1 sm:space-y-2">
          <div className="text-[11px] sm:text-xs text-slate-500 font-semibold">Total Active Bet Exposure</div>
          <div className="text-lg sm:text-2xl font-bold text-slate-900 font-mono">₹2,16,000</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Across 3 live cricket events</div>
        </div>
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1 sm:space-y-2">
          <div className="text-[11px] sm:text-xs text-slate-500 font-semibold">Highest Liability Runner</div>
          <div className="text-lg sm:text-2xl font-bold text-rose-700 font-mono">Pakistan (Lay)</div>
          <div className="text-[10px] sm:text-[11px] text-rose-700 font-medium">₹1,26,000 potential book loss</div>
        </div>
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1 sm:space-y-2">
          <div className="text-[11px] sm:text-xs text-slate-500 font-semibold">Unmatched Slip Orders</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-800 font-mono">1 Order</div>
          <div className="text-[10px] sm:text-[11px] text-amber-700 font-medium">₹15,000 waiting for liquidity</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-slate-500 font-semibold">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'BACK' | 'LAY')}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none focus:border-[#941b2c] min-h-[38px] w-full sm:w-auto"
            >
              <option value="ALL">All Sides</option>
              <option value="BACK">BACK Only</option>
              <option value="LAY">LAY Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'MATCHED' | 'UNMATCHED' | 'CANCELLED' | 'VOIDED')}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold focus:outline-none focus:border-[#941b2c] min-h-[38px] w-full sm:w-auto"
            >
              <option value="ALL">All Status</option>
              <option value="MATCHED">Matched</option>
              <option value="UNMATCHED">Unmatched</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="VOIDED">Voided</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bet ID, customer, match..."
            className="w-full pl-9 pr-3 py-2.5 sm:py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c] min-h-[42px] sm:min-h-0"
          />
        </div>
      </div>

      {/* Mobile Bet Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.map((b) => (
          <div 
            key={b.id}
            className={`p-3.5 sm:p-4 rounded-xl border bg-white shadow-xs space-y-2.5 ${
              b.type === 'BACK' ? 'border-l-4 border-l-sky-500 border-slate-200' : 'border-l-4 border-l-rose-500 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    b.type === 'BACK'
                      ? 'bg-sky-50 text-sky-800 border border-sky-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  {b.type}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  b.status === 'MATCHED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : b.status === 'UNMATCHED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {b.status}
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-900">{b.runnerName}</div>
              <div className="text-[11px] text-slate-600 truncate">{b.marketName}</div>
              <div className="text-[10px] text-slate-400">{b.customerName} ({b.customerId}) • {b.placedAt}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-center font-mono">
              <div>
                <span className="text-[9px] text-slate-500 block">ODDS</span>
                <strong className="text-xs text-slate-900">{b.odds.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">STAKE</span>
                <strong className="text-xs text-slate-800">₹{b.stake.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">LIABILITY</span>
                <strong className="text-xs text-amber-800">₹{b.liability.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {(b.status === 'UNMATCHED' || b.status === 'MATCHED') && (
              <div className="flex gap-2 pt-1 border-t border-slate-100">
                {b.status === 'UNMATCHED' && (
                  <button
                    onClick={() => handleCancelBet(b)}
                    className="flex-1 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer min-h-[40px] flex items-center justify-center"
                  >
                    Cancel Unmatched Order
                  </button>
                )}
                {b.status === 'MATCHED' && (
                  <button
                    onClick={() => {
                      setVoidModalBet(b);
                      setVoidReason('');
                    }}
                    className="flex-1 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors cursor-pointer min-h-[40px] flex items-center justify-center shadow-2xs"
                  >
                    Void Bet
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bets Table (Desktop md+) */}
      <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Bet ID / Time</th>
                <th className="py-3 px-4">Market / Event</th>
                <th className="py-3 px-4">Selection</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4">Odds</th>
                <th className="py-3 px-4">Stake</th>
                <th className="py-3 px-4">Liability</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900">{b.id}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{b.placedAt}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{b.marketName}</div>
                    <div className="text-[11px] text-slate-500">{b.customerName} ({b.customerId})</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{b.runnerName}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        b.type === 'BACK'
                          ? 'bg-sky-50 text-sky-800 border border-sky-300'
                          : 'bg-rose-50 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {b.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{b.odds.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">₹{b.stake.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                    <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200">₹{b.liability.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        b.status === 'MATCHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'UNMATCHED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {b.status === 'UNMATCHED' && (
                      <button
                        onClick={() => handleCancelBet(b)}
                        className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer mr-1 shadow-2xs"
                      >
                        Cancel
                      </button>
                    )}
                    {b.status === 'MATCHED' && (
                      <button
                        onClick={() => {
                          setVoidModalBet(b);
                          setVoidReason('');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        Void
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Void Bet Modal */}
      {voidModalBet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Void Disputed Bet Slip
              </h3>
              <button onClick={() => setVoidModalBet(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer text-lg leading-none p-1">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              Voiding will reverse bet <strong className="text-slate-900">{voidModalBet.id}</strong> (Stake: ₹{voidModalBet.stake.toLocaleString('en-IN')}) and refund the amount to <strong className="text-slate-900">{voidModalBet.customerName}</strong>. A permanent record will be stored in the audit ledger.
            </p>

            <form onSubmit={handleVoidBetSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-semibold">Mandatory Justification Reason (min 8 chars):</label>
                <textarea
                  required
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Palpable error on odds feed during late over stoppage..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setVoidModalBet(null)} className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">Cancel</button>
                <button type="submit" disabled={voidReason.trim().length < 8} className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all disabled:opacity-50 shadow-2xs cursor-pointer">
                  Confirm &amp; Void Bet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
