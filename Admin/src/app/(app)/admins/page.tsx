'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Plus,
  Key,
  Search,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Lock,
  Mail,
  User,
  X
} from 'lucide-react';
import {
  createAdminAccountAction,
  updateAdminStatusAction,
  resetAdmin2faAction
} from '@/modules/admins/actions';

interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  isSuper: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  twoFactorEnabled: boolean;
  lastLogin: string;
}

const INITIAL_ADMINS: AdminMember[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Root Super Admin',
    email: 'superadmin@cricketbuyy.com',
    role: 'Super Administrator',
    roleId: '00000000-0000-0000-0000-000000000001',
    isSuper: true,
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastLogin: 'Just now'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Operational Lead',
    email: 'ops.lead@cricketbuyy.com',
    role: 'Operations Lead',
    roleId: '00000000-0000-0000-0000-000000000002',
    isSuper: false,
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastLogin: '18 mins ago'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Risk & Surveillance Manager',
    email: 'risk.manager@cricketbuyy.com',
    role: 'Risk Manager',
    roleId: '00000000-0000-0000-0000-000000000003',
    isSuper: false,
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastLogin: '2 hours ago'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Finance Officer',
    email: 'finance@cricketbuyy.com',
    role: 'Finance Officer',
    roleId: '00000000-0000-0000-0000-000000000004',
    isSuper: false,
    status: 'ACTIVE',
    twoFactorEnabled: false,
    lastLogin: 'Yesterday'
  }
];

export default function AdminsPage() {
  const [adminsList, setAdminsList] = useState<AdminMember[]>(INITIAL_ADMINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Invite Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('00000000-0000-0000-0000-000000000002');
  const [submitting, setSubmitting] = useState(false);

  const filteredAdmins = adminsList.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const CURRENT_ACTOR_CTX = {
    actor: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'superadmin@cricketbuyy.com',
      isSuperAdmin: true,
      roles: ['super_admin'],
      permissions: ['admin:create', 'admin:update', 'admin:read', 'admin:delete']
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBanner(null);

    try {
      const res = await createAdminAccountAction(
        {
          name: formName,
          email: formEmail,
          password: formPassword,
          roleId: formRole
        },
        CURRENT_ACTOR_CTX
      );

      if (!res.success) {
        setBanner({ type: 'error', message: res.error.safeMessage || 'Failed to create admin' });
        setSubmitting(false);
        return;
      }

      const roleLabel =
        formRole === '00000000-0000-0000-0000-000000000001'
          ? 'Super Administrator'
          : formRole === '00000000-0000-0000-0000-000000000003'
          ? 'Risk Manager'
          : 'Operations Lead';

      const newMember: AdminMember = {
        id: res.data.adminId,
        name: formName,
        email: formEmail,
        role: roleLabel,
        roleId: formRole,
        isSuper: formRole === '00000000-0000-0000-0000-000000000001',
        status: 'ACTIVE',
        twoFactorEnabled: false,
        lastLogin: 'Never'
      };

      setAdminsList((prev) => [newMember, ...prev]);
      setShowInviteModal(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setBanner({
        type: 'success',
        message: `Administrator ${newMember.name} provisioned successfully with audit event emitted.`
      });
    } catch {
      setBanner({ type: 'error', message: 'An unexpected error occurred during creation.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: AdminMember) => {
    const targetStatus = admin.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setBanner(null);

    const res = await updateAdminStatusAction(
      {
        adminId: admin.id,
        status: targetStatus
      },
      CURRENT_ACTOR_CTX
    );

    if (!res.success) {
      setBanner({ type: 'error', message: res.error.safeMessage || 'Action rejected by policy' });
      return;
    }

    setAdminsList((prev) =>
      prev.map((a) => (a.id === admin.id ? { ...a, status: targetStatus } : a))
    );
    setBanner({
      type: 'success',
      message: `Account status for ${admin.name} updated to ${targetStatus}. Active sessions invalidated if suspended.`
    });
  };

  const handleReset2fa = async (admin: AdminMember) => {
    if (!confirm(`Are you sure you want to reset 2FA for ${admin.name}? They will be forced to re-enroll.`)) {
      return;
    }

    setBanner(null);
    const res = await resetAdmin2faAction(
      { adminId: admin.id },
      CURRENT_ACTOR_CTX
    );

    if (!res.success) {
      setBanner({ type: 'error', message: res.error.safeMessage || 'Failed to reset 2FA credentials' });
      return;
    }

    setAdminsList((prev) =>
      prev.map((a) => (a.id === admin.id ? { ...a, twoFactorEnabled: false } : a))
    );
    setBanner({
      type: 'success',
      message: `2FA credentials for ${admin.name} revoked. Next login will require TOTP re-pairing.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-rose-400" />
            Administrator Staff & Privileged Accounts
          </h1>
          <p className="text-xs text-slate-400">
            Provision staff profiles, manage 2FA enforcement, assign roles, and audit access credentials.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-white border border-rose-700/60 shadow-lg shadow-rose-950/40 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Provision Administrator
        </button>
      </div>

      {/* Notifications */}
      {banner && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            banner.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
        <div className="flex gap-1.5 self-end sm:self-auto">
          {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Admin Profile</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Privilege Scope</th>
                <th className="p-3.5">2FA Enforcement</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Login</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAdmins.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {a.name}
                      {a.isSuper && <Shield className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400">{a.email}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-medium text-slate-200 bg-slate-800/60 px-2 py-0.5 rounded text-[11px] border border-slate-700/60">
                      {a.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {a.isSuper ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                        <Shield className="w-3 h-3 mr-1" />
                        Wildcard (*)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Scoped RBAC</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {a.twoFactorEnabled ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        <Key className="w-2.5 h-2.5 mr-1" />
                        MFA Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800/60">
                        <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                        Unpaired
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">{a.lastLogin}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {a.twoFactorEnabled && (
                        <button
                          onClick={() => handleReset2fa(a)}
                          title="Reset MFA Credentials"
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(a)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
                          a.status === 'ACTIVE'
                            ? 'text-rose-400 hover:bg-rose-950/40 border border-rose-900/40'
                            : 'text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/40'
                        }`}
                      >
                        {a.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">Provision Administrator</h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Create an administrative profile with strictly audited access privileges.
            </p>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="officer@cricketbuyy.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Initial Password (min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Assigned RBAC Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="00000000-0000-0000-0000-000000000002">Operations Lead</option>
                  <option value="00000000-0000-0000-0000-000000000003">Risk &amp; Surveillance Manager</option>
                  <option value="00000000-0000-0000-0000-000000000004">Finance Supervisor</option>
                  <option value="00000000-0000-0000-0000-000000000001">Super Administrator (Wildcard)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-white border border-rose-700/60 shadow-lg shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
