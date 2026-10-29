import React from 'react';
import { TrendingUp, Flame, ShieldAlert } from 'lucide-react';

export default function BetsPage() {
  const bets = [
    { id: 'b_7721', user: 'demouser', match: 'Bangladesh v West Indies', selection: 'West Indies', type: 'BACK', odds: '2.14', stake: '₹5,000', profit: '₹5,700', status: 'MATCHED', time: '5 mins ago' },
    { id: 'b_7722', user: 'rahul_trader', match: 'South Africa v Australia', selection: 'Australia', type: 'LAY', odds: '1.95', stake: '₹20,000', profit: '₹19,000', status: 'MATCHED', time: '12 mins ago' },
    { id: 'b_7723', user: 'vip_punters', match: 'Arsenal v Manchester City', selection: 'Draw', type: 'BACK', odds: '3.40', stake: '₹50,000', profit: '₹1,20,000', status: 'MATCHED', time: '20 mins ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-400" />
            Live Bets Surveillance & Risk Book
          </h1>
          <p className="text-xs text-slate-400">Monitor active liabilities, inspect high-stakes positions, and void suspicious bets.</p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Bet ID / Customer</th>
              <th className="p-3.5">Match & Selection</th>
              <th className="p-3.5">Type & Odds</th>
              <th className="p-3.5">Stake (INR)</th>
              <th className="p-3.5">Potential Liability</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {bets.map((b) => (
              <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-white">{b.user}</div>
                  <div className="text-[10px] text-slate-500 font-mono">#{b.id} &bull; {b.time}</div>
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-slate-200">{b.selection}</div>
                  <div className="text-[10px] text-slate-500">{b.match}</div>
                </td>
                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.type === 'BACK' ? 'bg-sky-950 text-sky-400 border border-sky-800/60' :
                    'bg-pink-950 text-pink-400 border border-pink-800/60'
                  }`}>
                    {b.type} @ {b.odds}
                  </span>
                </td>
                <td className="p-3.5 font-bold text-white">{b.stake}</td>
                <td className="p-3.5 font-bold text-rose-400">{b.profit}</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    {b.status}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  <button className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer">
                    Void Bet
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
