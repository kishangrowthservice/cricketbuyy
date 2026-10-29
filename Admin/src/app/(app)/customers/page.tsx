import React from 'react';
import { Users, Search, Plus, Shield, ArrowUpDown } from 'lucide-react';

export default function CustomersPage() {
  const customers = [
    { id: 'c_01', uname: 'demouser', phone: '+91 98*****210', bal: '₹1,00,000', exp: '₹0.00', status: 'ACTIVE', isDemo: true, joined: 'Yesterday' },
    { id: 'c_02', uname: 'rahul_trader', phone: '+91 99*****882', bal: '₹4,52,000', exp: '₹48,000', status: 'ACTIVE', isDemo: false, joined: '3 days ago' },
    { id: 'c_03', uname: 'vip_punters', phone: '+91 97*****114', bal: '₹12,40,000', exp: '₹1,20,000', status: 'ACTIVE', isDemo: false, joined: '1 week ago' },
    { id: 'c_04', uname: 'flagged_acc_8', phone: '+91 88*****332', bal: '₹15,000', exp: '₹0.00', status: 'SUSPENDED', isDemo: false, joined: '2 weeks ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-400" />
            Customers & Wallet Accounts
          </h1>
          <p className="text-xs text-slate-400">Surveil player balances, manage exposure limits, adjust wallets, or apply account suspensions.</p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Customer Username</th>
              <th className="p-3.5">Contact (Masked PII)</th>
              <th className="p-3.5">Wallet Balance (INR)</th>
              <th className="p-3.5">Active Exposure</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    {c.uname}
                    {c.isDemo && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-950 text-sky-400 border border-sky-800/60">
                        Demo
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">ID: {c.id}</div>
                </td>
                <td className="p-3.5 font-mono text-slate-400">{c.phone}</td>
                <td className="p-3.5 font-bold text-emerald-400">{c.bal}</td>
                <td className="p-3.5 font-bold text-amber-400">{c.exp}</td>
                <td className="p-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                    'bg-red-950 text-red-400 border border-red-800/60'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-3.5 text-right space-x-2">
                  <button className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer">
                    Adjust Balance
                  </button>
                  <button className="text-xs text-slate-400 hover:text-white cursor-pointer">
                    Impersonate
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

