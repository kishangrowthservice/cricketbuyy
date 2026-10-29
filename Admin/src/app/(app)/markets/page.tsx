import React from 'react';
import { Trophy, Tv, AlertCircle } from 'lucide-react';

export default function MarketsPage() {
  const matches = [
    { id: '710711374', name: 'Bangladesh v West Indies', sport: 'Cricket', tournament: 'ICC Champions Trophy 2026', isInPlay: true, hasTv: true, status: 'OPEN' },
    { id: '795819909', name: 'South Africa v Australia', sport: 'Cricket', tournament: 'ICC Champions Trophy 2026', isInPlay: true, hasTv: true, status: 'OPEN' },
    { id: '109283742', name: 'Arsenal v Manchester City', sport: 'Football', tournament: 'Premier League', isInPlay: true, hasTv: false, status: 'OPEN' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-rose-400" />
            Sports Fixtures & Market Operations
          </h1>
          <p className="text-xs text-slate-400">Control live stream feeds, suspend odds during reviews, and manage manual settlement.</p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Fixture Event</th>
              <th className="p-3.5">Sport / Tournament</th>
              <th className="p-3.5">Live Radar / TV</th>
              <th className="p-3.5">Market State</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {matches.map((m) => (
              <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-white">{m.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">ID: {m.id}</div>
                </td>
                <td className="p-3.5">
                  <span className="text-slate-300 font-medium">{m.sport}</span>
                  <div className="text-[10px] text-slate-500">{m.tournament}</div>
                </td>
                <td className="p-3.5">
                  {m.hasTv ? (
                    <span className="inline-flex items-center text-rose-400 font-semibold gap-1">
                      <Tv className="w-3.5 h-3.5" /> Active Radar
                    </span>
                  ) : (
                    <span className="text-slate-500">Disabled</span>
                  )}
                </td>
                <td className="p-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    {m.status}
                  </span>
                </td>
                <td className="p-3.5 text-right space-x-2">
                  <button className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer">
                    Suspend Odds
                  </button>
                  <button className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer">
                    Settle Market
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
