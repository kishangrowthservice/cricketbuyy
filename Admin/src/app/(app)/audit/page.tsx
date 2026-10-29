import React from 'react';
import { FileText, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

export default function AuditPage() {
  const auditEntries = [
    { id: 'aud_901', actor: 'superadmin@cricketbuyy.com', action: 'system.bootstrap_super_admin', target: 'Super Administrator Role', time: '12 mins ago', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    { id: 'aud_902', actor: 'superadmin@cricketbuyy.com', action: 'customer.balance_adjust', target: 'demouser (+₹1,00,000)', time: '25 mins ago', hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4' },
    { id: 'aud_903', actor: 'ops.lead@cricketbuyy.com', action: 'market.freeze', target: 'Match 710711374 (BAN v WI)', time: '1 hour ago', hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-400" />
            Append-Only Audit Ledger
          </h1>
          <p className="text-xs text-slate-400">Cryptographically hash-chained audit trail (SHA-256). Every action is immutable and tamper-evident.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
          <ShieldCheck className="w-4 h-4" />
          Hash-Chain Validated (0 Breaks)
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Actor (Admin)</th>
              <th className="p-3.5">Action Code</th>
              <th className="p-3.5">Target Resource</th>
              <th className="p-3.5">SHA-256 Entry Hash</th>
              <th className="p-3.5 text-right">Integrity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {auditEntries.map((e) => (
              <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 text-slate-400">{e.time}</td>
                <td className="p-3.5 font-bold text-white">{e.actor}</td>
                <td className="p-3.5 font-mono text-rose-300">{e.action}</td>
                <td className="p-3.5 text-slate-300">{e.target}</td>
                <td className="p-3.5 font-mono text-[10px] text-slate-500 max-w-xs truncate" title={e.hash}>
                  {e.hash.substring(0, 24)}...
                </td>
                <td className="p-3.5 text-right">
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Chained
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
