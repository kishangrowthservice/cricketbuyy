import React from 'react';
import { KeyRound, Shield, Plus, Lock } from 'lucide-react';

export default function RolesPage() {
  const roleList = [
    { id: 'r_01', name: 'Super Administrator', slug: 'super_admin', permissionsCount: 'All Wildcard (*)', isSystem: true, description: 'Root level control with unrestricted system powers and audit immunity' },
    { id: 'r_02', name: 'Operations Admin', slug: 'operations_admin', permissionsCount: '34 Permissions', isSystem: true, description: 'Manage markets, odds radar, void bets, and supervisor approvals' },
    { id: 'r_03', name: 'Finance Lead', slug: 'finance_lead', permissionsCount: '18 Permissions', isSystem: false, description: 'Manage deposit approvals, withdrawal disbursements, and ledger reconciliations' },
    { id: 'r_04', name: 'Customer Support Agent', slug: 'support_agent', permissionsCount: '9 Permissions', isSystem: false, description: 'Read customer details (masked PII), view bet histories, and submit reset requests' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-rose-400" />
            Roles & Database-Driven RBAC
          </h1>
          <p className="text-xs text-slate-400">Define custom roles, assign granular permissions, and configure field-level masking.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-white border border-rose-700/60 transition-all cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roleList.map((r) => (
          <div key={r.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{r.name}</span>
                {r.isSystem && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    <Lock className="w-2.5 h-2.5 mr-1" />
                    System Role
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-rose-400">{r.permissionsCount}</span>
            </div>
            <p className="text-xs text-slate-400">{r.description}</p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">slug: {r.slug}</span>
              <button className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer">
                Configure Matrix →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
