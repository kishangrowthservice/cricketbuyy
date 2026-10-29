import React from 'react';
import { Wallet, Check, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FinancialPage() {
  const transactions = [
    { id: 'tx_881', type: 'DEPOSIT', user: 'demouser', amount: '₹1,00,000', method: 'UPI / IMPS', ref: 'UPI98273618', status: 'COMPLETED', time: '10 mins ago' },
    { id: 'tx_882', type: 'WITHDRAWAL', user: 'rahul_trader', amount: '₹50,000', method: 'Bank Transfer (IMPS)', ref: 'WTH_902194', status: 'PENDING_APPROVAL', time: '18 mins ago' },
    { id: 'tx_883', type: 'DEPOSIT', user: 'vip_punters', amount: '₹5,00,000', method: 'RTGS / Wire', ref: 'RTGS_88271', status: 'COMPLETED', time: '1 hour ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-rose-400" />
            Financial Ledger & Banking Approval Queue
          </h1>
          <p className="text-xs text-slate-400">Review pending withdrawals, verify deposit reference IDs, and reconcile gateway settlement.</p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Transaction ID</th>
              <th className="p-3.5">Type & Channel</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Amount (INR)</th>
              <th className="p-3.5">Reference ID</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5">
                  <span className="font-mono text-slate-300 font-medium">#{t.id}</span>
                  <div className="text-[10px] text-slate-500">{t.time}</div>
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    {t.type === 'DEPOSIT' ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ArrowDownRight className="w-3.5 h-3.5" /> Deposit
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Withdrawal
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{t.method}</div>
                </td>
                <td className="p-3.5 font-semibold text-white">{t.user}</td>
                <td className="p-3.5 font-bold text-white text-sm">{t.amount}</td>
                <td className="p-3.5 font-mono text-slate-400 text-[11px]">{t.ref}</td>
                <td className="p-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                    'bg-amber-950 text-amber-400 border border-amber-800/60'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="p-3.5 text-right space-x-1.5">
                  {t.status === 'PENDING_APPROVAL' ? (
                    <>
                      <button className="px-2 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold cursor-pointer">
                        Approve
                      </button>
                      <button className="px-2 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-semibold cursor-pointer">
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

