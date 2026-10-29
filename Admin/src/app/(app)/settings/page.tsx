import React from 'react';
import { Sliders, ShieldAlert, Radio, Megaphone, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-rose-400" />
          Global Exchange Settings & Signal Propagation
        </h1>
        <p className="text-xs text-slate-400">Manage real-time edge signals, maintenance mode, and global branding variables.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Maintenance & Emergency Controls */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            Emergency & Maintenance Mode
          </div>
          <p className="text-xs text-slate-400">Instantly broadcast maintenance locks across all edge nodes via Redis / Edge Config without database latency.</p>
          <div className="pt-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Exchange Maintenance Mode</div>
              <div className="text-[10px] text-slate-500">Blocks new bet placements and displays maintenance splash.</div>
            </div>
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 cursor-pointer">
              Disabled
            </button>
          </div>
        </div>

        {/* Global Announcement Marquee */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <Megaphone className="w-4 h-4" />
            Live Ticker Announcement
          </div>
          <p className="text-xs text-slate-400">Update the scrolling ticker message displayed on the customer-facing header.</p>
          <input
            type="text"
            defaultValue="Welcome to Cricketbuyy.com | Official Sports & Casino Betting Exchange | 24X7 Instant Deposits & Withdrawals"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          />
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900/80 hover:bg-rose-800 text-white border border-rose-700/60 cursor-pointer">
            Broadcast Ticker Update
          </button>
        </div>
      </div>
    </div>
  );
}

