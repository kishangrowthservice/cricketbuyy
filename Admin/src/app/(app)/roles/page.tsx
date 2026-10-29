'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Lock,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  AlertCircle,
  Users
} from 'lucide-react';
import { SYSTEM_PERMISSIONS } from '../../../core/rbac/registry';

interface RoleUI {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  version: number;
  assignedUsersCount: number;
  permissions: Array<{
    action: string;
    scope: 'all' | 'team' | 'own';
    fieldMask?: string[];
  }>;
}

const INITIAL_ROLES: RoleUI[] = [
  {
    id: '1',
    name: 'Super Administrator',
    slug: 'super_admin',
    description: 'System root administrator with unrestricted wildcard capabilities (*)',
    isSystem: true,
    version: 1,
    assignedUsersCount: 2,
    permissions: [{ action: '*', scope: 'all' }]
  },
  {
    id: '2',
    name: 'Operations Administrator',
    slug: 'admin',
    description: 'General platform operations manager for customer and market operations',
    isSystem: true,
    version: 1,
    assignedUsersCount: 5,
    permissions: [
      { action: 'customer:*', scope: 'all' },
      { action: 'wallet:read', scope: 'all' },
      { action: 'wallet:deposit', scope: 'all' },
      { action: 'market:*', scope: 'all' },
      { action: 'bet:*', scope: 'all' },
      { action: 'approval:read', scope: 'all' },
      { action: 'approval:create', scope: 'all' },
      { action: 'approval:review', scope: 'all' }
    ]
  },
  {
    id: '3',
    name: 'Risk & Trading Manager',
    slug: 'risk_manager',
    description: 'Manages market odds, liabilities, voiding, and exposure thresholds',
    isSystem: true,
    version: 1,
    assignedUsersCount: 3,
    permissions: [
      { action: 'market:*', scope: 'all' },
      { action: 'bet:*', scope: 'all' },
      { action: 'risk:*', scope: 'all' },
      { action: 'customer:read', scope: 'all' }
    ]
  },
  {
    id: '4',
    name: 'Compliance & KYC Officer',
    slug: 'compliance_officer',
    description: 'Verifies customer identity, transactions and unmasked PII records',
    isSystem: true,
    version: 1,
    assignedUsersCount: 4,
    permissions: [
      { action: 'customer:read', scope: 'all' },
      { action: 'customer:read_pii', scope: 'all' },
      { action: 'customer:block', scope: 'all' },
      { action: 'audit:read', scope: 'all' }
    ]
  },
  {
    id: '5',
    name: 'Customer Support Agent',
    slug: 'support_agent',
    description: 'Tier-1 customer ticket resolution with masked PII protections',
    isSystem: true,
    version: 1,
    assignedUsersCount: 12,
    permissions: [
      { action: 'customer:read', scope: 'team', fieldMask: ['phone', 'email', 'bankAccount'] },
      { action: 'customer:update', scope: 'team' },
      { action: 'bet:read', scope: 'team' }
    ]
  }
];

export default function RolesManagementPage() {
  const [rolesList, setRolesList] = useState<RoleUI[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleUI>(INITIAL_ROLES[0]!);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleSlug, setNewRoleSlug] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Record<string, { enabled: boolean; scope: 'all' | 'team' | 'own' }>>({});

  // Group permissions by category
  const categories = Array.from(new Set(SYSTEM_PERMISSIONS.map((p) => p.category)));

  const handleTogglePermission = (action: string) => {
    setSelectedPerms((prev) => ({
      ...prev,
      [action]: {
        enabled: !prev[action]?.enabled,
        scope: prev[action]?.scope || 'all'
      }
    }));
  };

  const handleScopeChange = (action: string, scope: 'all' | 'team' | 'own') => {
    setSelectedPerms((prev) => ({
      ...prev,
      [action]: {
        enabled: true,
        scope
      }
    }));
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName || !newRoleSlug) return;

    const formattedPerms = Object.entries(selectedPerms)
      .filter(([_, val]) => val.enabled)
      .map(([action, val]) => ({
        action,
        scope: val.scope
      }));

    const created: RoleUI = {
      id: String(Date.now()),
      name: newRoleName,
      slug: newRoleSlug.toLowerCase().replace(/\s+/g, '_'),
      description: newRoleDesc,
      isSystem: false,
      version: 1,
      assignedUsersCount: 0,
      permissions: formattedPerms
    };

    setRolesList((prev) => [...prev, created]);
    setSelectedRole(created);
    setIsCreateModalOpen(false);
    setNewRoleName('');
    setNewRoleSlug('');
    setNewRoleDesc('');
    setSelectedPerms({});
  };

  const handleDeleteRole = (id: string) => {
    const role = rolesList.find((r) => r.id === id);
    if (role?.isSystem) {
      alert('System-protected roles cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete role '${role?.name}'?`)) {
      const nextList = rolesList.filter((r) => r.id !== id);
      setRolesList(nextList);
      if (selectedRole.id === id && nextList.length > 0 && nextList[0]) {
        setSelectedRole(nextList[0]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#941b2c] shrink-0" />
            <span>Roles &amp; Permissions Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Database-driven dynamic RBAC engine with scoped permissions, field-level masking, and dual-custody policies.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-bold text-white bg-[#941b2c] hover:bg-[#7a1624] rounded-xl transition-colors shadow-2xs cursor-pointer min-h-[42px] sm:min-h-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Roles Sidebar / List */}
        <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Configured Roles ({rolesList.length})
          </div>
          <div className="space-y-2">
            {rolesList.map((role) => {
              const isSelected = selectedRole.id === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-rose-50/70 border-[#941b2c] shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">{role.name}</span>
                      {role.isSystem ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          <Lock className="w-2.5 h-2.5 text-amber-600" />
                          System
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Custom
                        </span>
                      )}
                    </div>
                    {!role.isSystem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{role.description}</p>
                  <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/80 pt-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-600">{role.slug}</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {role.assignedUsersCount} users
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Role Permissions Matrix */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">{selectedRole.name}</h2>
                <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  {selectedRole.slug}
                </span>
                <span className="text-xs text-slate-400 font-medium">v{selectedRole.version}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{selectedRole.description}</p>
            </div>
            {selectedRole.slug === 'super_admin' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Unrestricted Wildcard (*)
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs">
                <Sliders className="w-3.5 h-3.5 text-[#941b2c]" />
                {selectedRole.permissions.length} Granted Permissions
              </div>
            )}
          </div>

          {/* Matrix by Category */}
          <div className="mt-6 space-y-6">
            {categories.map((category) => {
              const categoryPerms = SYSTEM_PERMISSIONS.filter((p) => p.category === category);
              return (
                <div key={category} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryPerms.map((perm) => {
                      const isSuper = selectedRole.slug === 'super_admin';
                      const matchingGrant = selectedRole.permissions.find(
                        (p) =>
                          p.action === '*' ||
                          p.action === perm.action ||
                          (p.action.endsWith(':*') && perm.action.startsWith(p.action.slice(0, -1)))
                      );
                      const isGranted = isSuper || !!matchingGrant;
                      const scope = isSuper ? 'all' : matchingGrant?.scope || 'none';
                      const hasMask = matchingGrant?.fieldMask && matchingGrant.fieldMask.length > 0;

                      return (
                        <div
                          key={perm.action}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                            isGranted
                              ? 'bg-rose-50/20 border-rose-200 shadow-2xs'
                              : 'bg-slate-50/50 border-slate-200/70 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-slate-800">{perm.action}</span>
                              {isGranted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">{perm.description}</p>
                          </div>
                          {isGranted && (
                            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/80 pt-2">
                              <span className="flex items-center gap-1 font-medium">
                                Scope:
                                <strong className="uppercase font-mono text-slate-700 text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                                  {scope}
                                </strong>
                              </span>
                              {hasMask ? (
                                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                                  <Eye className="w-3 h-3" />
                                  PII Masked
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">Unmasked</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#941b2c]" />
                Create Dynamic Custom Role
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={newRoleName}
                    onChange={(e) => {
                      setNewRoleName(e.target.value);
                      if (!newRoleSlug) {
                        setNewRoleSlug(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                      }
                    }}
                    placeholder="e.g. VIP Host Manager"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slug Identifier</label>
                  <input
                    type="text"
                    required
                    value={newRoleSlug}
                    onChange={(e) => setNewRoleSlug(e.target.value)}
                    placeholder="e.g. vip_host_manager"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  rows={2}
                  placeholder="Operational responsibilities and scope description..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c]"
                />
              </div>

              {/* Permission Matrix Selector */}
              <div className="space-y-4 border-t border-slate-200 pt-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assign Granular Permissions &amp; Scopes
                </h3>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {categories.map((cat) => (
                    <div key={cat} className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-600 border-b border-slate-200 pb-1">
                        {cat}
                      </div>
                      <div className="space-y-2">
                        {SYSTEM_PERMISSIONS.filter((p) => p.category === cat).map((p) => {
                          const state = selectedPerms[p.action] || { enabled: false, scope: 'all' };
                          return (
                            <div
                              key={p.action}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                state.enabled
                                  ? 'bg-rose-50/50 border-rose-200'
                                  : 'bg-slate-50/70 border-slate-200'
                              }`}
                            >
                              <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={state.enabled}
                                  onChange={() => handleTogglePermission(p.action)}
                                  className="accent-[#941b2c] rounded w-4 h-4 cursor-pointer"
                                />
                                <div>
                                  <div className="font-mono text-slate-900 font-bold text-xs">{p.action}</div>
                                  <div className="text-slate-500 text-[11px]">{p.description}</div>
                                </div>
                              </label>

                              {state.enabled && (
                                <div className="flex items-center gap-2 ml-4">
                                  <span className="text-[10px] text-slate-500 font-semibold">Scope:</span>
                                  <select
                                    value={state.scope}
                                    onChange={(e) =>
                                      handleScopeChange(p.action, e.target.value as 'all' | 'team' | 'own')
                                    }
                                    className="bg-white border border-slate-300 text-slate-800 rounded px-2 py-1 text-xs focus:outline-none"
                                  >
                                    <option value="all">All Data</option>
                                    <option value="team">Assigned Team</option>
                                    <option value="own">Own Records</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#941b2c] hover:bg-[#7a1624] rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  Save &amp; Deploy Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
