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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-[#941b2c]" />
            Administrator Staff &amp; Privileged Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provision staff profiles, manage 2FA enforcement, assign roles, and audit access credentials.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#941b2c] hover:bg-[#7a1624] text-white shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Provision Administrator
        </button>
      </div>

      {/* Notifications */}
      {banner && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow-2xs ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
          />
        </div>
        <div className="flex gap-1.5 self-end sm:self-auto">
          {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#941b2c] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-slate-200/80">
              {filteredAdmins.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      {a.name}
                      {a.isSuper && <Shield className="w-3.5 h-3.5 text-[#941b2c]" />}
                    </div>
                    <div className="text-[11px] text-slate-500">{a.email}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                      {a.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {a.isSuper ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Wildcard (*)
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium text-[11px]">Scoped RBAC</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {a.twoFactorEnabled ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Key className="w-2.5 h-2.5 mr-1" />
                        MFA Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                        Unpaired
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500 text-[11px] font-medium">{a.lastLogin}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {a.twoFactorEnabled && (
                        <button
                          onClick={() => handleReset2fa(a)}
                          title="Reset MFA Credentials"
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(a)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border shadow-2xs ${
                          a.status === 'ACTIVE'
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer text-lg leading-none p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-[#941b2c]" />
              <h2 className="text-base font-bold text-slate-900">Provision Administrator</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Create an administrative profile with strictly audited access privileges.
            </p>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Assigned RBAC Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                >
                  <option value="00000000-0000-0000-0000-000000000002">Operations Lead</option>
                  <option value="00000000-0000-0000-0000-000000000003">Risk &amp; Surveillance Manager</option>
                  <option value="00000000-0000-0000-0000-000000000004">Finance Supervisor</option>
                  <option value="00000000-0000-0000-0000-000000000001">Super Administrator (Wildcard)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#941b2c] hover:bg-[#7a1624] text-white shadow-2xs transition-all cursor-pointer disabled:opacity-50"
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
