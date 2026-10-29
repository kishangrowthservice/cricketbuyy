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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2a1215] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Flame className="w-7 h-7 text-[#e53e3e]" />
            Bet Risk Surveillance & Order Book
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time back/lay liability monitors, order cancellations, and audited dispute voiding.
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#12141a] border border-zinc-800">
          <div className="text-xs text-zinc-400">Total Active Bet Exposure</div>
          <div className="mt-2 text-xl font-bold text-white font-mono">₹2,16,000</div>
          <div className="mt-1 text-[11px] text-zinc-500">Across 3 live events</div>
        </div>
        <div className="p-4 rounded-xl bg-[#12141a] border border-zinc-800">
          <div className="text-xs text-zinc-400">Highest Liability Runner</div>
          <div className="mt-2 text-xl font-bold text-rose-400">Pakistan (Lay)</div>
          <div className="mt-1 text-[11px] text-zinc-500">₹1,26,000 potential book loss</div>
        </div>
        <div className="p-4 rounded-xl bg-[#12141a] border border-zinc-800">
          <div className="text-xs text-zinc-400">Unmatched Slip Orders</div>
          <div className="mt-2 text-xl font-bold text-amber-300">1 Order</div>
          <div className="mt-1 text-[11px] text-zinc-500">₹15,000 waiting for liquidity</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#12141a] border border-zinc-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'BACK' | 'LAY')}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white focus:outline-none"
            >
              <option value="ALL">All Sides</option>
              <option value="BACK">BACK Only</option>
              <option value="LAY">LAY Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-zinc-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'MATCHED' | 'UNMATCHED' | 'CANCELLED' | 'VOIDED')}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="MATCHED">Matched</option>
              <option value="UNMATCHED">Unmatched</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="VOIDED">Voided</option>
            </select>
          </div>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bet ID, customer, match..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-[#941b2c]"
          />
        </div>
      </div>

      {/* Bets Table */}
      <div className="bg-[#12141a] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161820] text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
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
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-[#161820]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-semibold text-zinc-300">{b.id}</div>
                    <div className="text-[10px] text-zinc-500">{b.placedAt}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-white">{b.marketName}</div>
                    <div className="text-[11px] text-zinc-400">{b.customerName} ({b.customerId})</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-zinc-200">{b.runnerName}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        b.type === 'BACK'
                          ? 'bg-sky-950/80 text-sky-400 border border-sky-800/60'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {b.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{b.odds.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-zinc-300">₹{b.stake.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-amber-400">₹{b.liability.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        b.status === 'MATCHED'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                          : b.status === 'UNMATCHED'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {b.status === 'UNMATCHED' && (
                      <button
                        onClick={() => handleCancelBet(b)}
                        className="px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/80 rounded-lg transition-colors cursor-pointer mr-1"
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
                        className="px-2.5 py-1 text-[11px] font-medium text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#12141a] border border-[#38161b] w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                Void Disputed Bet Slip
              </h3>
              <button onClick={() => setVoidModalBet(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-zinc-300">
              Voiding will reverse bet <strong>{voidModalBet.id}</strong> (Stake: ₹{voidModalBet.stake.toLocaleString('en-IN')}) and refund the amount to <strong>{voidModalBet.customerName}</strong>. A permanent record will be stored in the audit ledger.
            </p>

            <form onSubmit={handleVoidBetSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-zinc-300 font-medium">Mandatory Justification Reason (min 8 chars):</label>
                <textarea
                  required
                  rows={3}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="e.g. Palpable error on odds feed during late over stoppage..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#941b2c]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button type="button" onClick={() => setVoidModalBet(null)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={voidReason.trim().length < 8} className="px-5 py-2 font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-xl transition-all disabled:opacity-50 shadow-sm cursor-pointer">
                  Confirm & Void Bet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
