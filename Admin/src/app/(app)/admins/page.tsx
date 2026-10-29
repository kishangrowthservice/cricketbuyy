import React from 'react';
import { UserCheck, Shield, Plus, Key } from 'lucide-react';

export default function AdminsPage() {
  const adminList = [
    { id: 'adm_01', name: 'Root Super Admin', email: 'superadmin@cricketbuyy.com', role: 'Super Administrator', isSuper: true, status: 'ACTIVE', lastLogin: '10 mins ago' },
    { id: 'adm_02', name: 'Operational Lead', email: 'ops.lead@cricketbuyy.com', role: 'Operations Admin', isSuper: false, status: 'ACTIVE', lastLogin: '1 hour ago' },
    { id: 'adm_03', name: 'Finance Auditor', email: 'finance@cricketbuyy.com', role: 'Finance Supervisor', isSuper: false, status: 'ACTIVE', lastLogin: 'Yesterday' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-rose-400" />
            Administrator Accounts
          </h1>
          <p className="text-xs text-slate-400">Manage internal administrative staff, 2FA credentials, and system privileges.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-white border border-rose-700/60 transition-all cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          Invite Administrator
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Admin Profile</th>
              <th className="p-3.5">Assigned Role</th>
              <th className="p-3.5">Super Admin Status</th>
              <th className="p-3.5">Account Status</th>
              <th className="p-3.5">Last Login</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {adminList.map((a) => (
              <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-white">{a.name}</div>
                  <div className="text-[11px] text-slate-400">{a.email}</div>
                </td>
                <td className="p-3.5 font-medium text-slate-300">{a.role}</td>
                <td className="p-3.5">
                  {a.isSuper ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                      <Shield className="w-3 h-3 mr-1" />
                      Wildcard (Root)
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">RBAC Governed</span>
                  )}
                </td>
                <td className="p-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    {a.status}
                  </span>
                </td>
                <td className="p-3.5 text-slate-400">{a.lastLogin}</td>
                <td className="p-3.5 text-right">
                  <button className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
                    Edit Permissions
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
