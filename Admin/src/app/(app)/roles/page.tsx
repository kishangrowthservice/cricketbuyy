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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2a1215] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#e53e3e]" />
            Roles & Permissions Matrix
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Database-driven dynamic RBAC engine with scoped permissions, field-level masking, and dual-custody policies.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#941b2c] hover:bg-[#b92b3f] rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Custom Role
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Roles Sidebar / List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
            Configured Roles ({rolesList.length})
          </div>
          <div className="space-y-2">
            {rolesList.map((role) => {
              const isSelected = selectedRole.id === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#1e0d10] border-[#941b2c] shadow-md shadow-[#941b2c]/10'
                      : 'bg-[#12141a] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#161820]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{role.name}</span>
                      {role.isSystem ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          <Lock className="w-2.5 h-2.5 text-amber-400" />
                          System
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
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
                        className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{role.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/60 pt-2">
                    <span className="font-mono text-[11px] text-zinc-400">{role.slug}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-zinc-400" />
                      {role.assignedUsersCount} users
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Role Permissions Matrix */}
        <div className="lg:col-span-8 bg-[#12141a] border border-zinc-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">{selectedRole.name}</h2>
                <span className="font-mono text-xs text-[#e53e3e] bg-[#2a1215] px-2.5 py-0.5 rounded-md border border-[#4a1c22]">
                  {selectedRole.slug}
                </span>
                <span className="text-xs text-zinc-500">v{selectedRole.version}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{selectedRole.description}</p>
            </div>
            {selectedRole.slug === 'super_admin' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-800/60 text-amber-300 rounded-lg text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Unrestricted Wildcard (*)
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800/60 border border-zinc-700 text-zinc-300 rounded-lg text-xs">
                <Sliders className="w-3.5 h-3.5 text-[#e53e3e]" />
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
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 pb-1.5">
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
                          className={`p-3 rounded-lg border flex flex-col justify-between transition-colors ${
                            isGranted
                              ? 'bg-[#171216] border-[#4a1c22]/80'
                              : 'bg-[#15171e]/50 border-zinc-800/50 opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-semibold text-zinc-200">{perm.action}</span>
                              {isGranted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-zinc-600" />
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1">{perm.description}</p>
                          </div>
                          {isGranted && (
                            <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800/60 pt-2">
                              <span className="flex items-center gap-1">
                                Scope:
                                <strong className="uppercase font-mono text-zinc-300 text-[10px] bg-zinc-800 px-1.5 py-0.2 rounded">
                                  {scope}
                                </strong>
                              </span>
                              {hasMask ? (
                                <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                                  <Eye className="w-3 h-3" />
                                  PII Masked
                                </span>
                              ) : (
                                <span className="text-zinc-500">Unmasked</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#12141a] border border-[#2a1215] w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#e53e3e]" />
                Create Dynamic Custom Role
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Role Name</label>
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
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#941b2c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Slug Identifier</label>
                  <input
                    type="text"
                    required
                    value={newRoleSlug}
                    onChange={(e) => setNewRoleSlug(e.target.value)}
                    placeholder="e.g. vip_host_manager"
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg font-mono text-zinc-300 focus:outline-none focus:border-[#941b2c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
                <textarea
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  rows={2}
                  placeholder="Operational responsibilities and scope description..."
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#941b2c]"
                />
              </div>

              {/* Permission Matrix Selector */}
              <div className="space-y-4 border-t border-zinc-800 pt-4">
                <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Assign Granular Permissions & Scopes
                </h3>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {categories.map((cat) => (
                    <div key={cat} className="space-y-2">
                      <div className="text-[11px] font-semibold text-zinc-400 border-b border-zinc-800 pb-1">
                        {cat}
                      </div>
                      <div className="space-y-2">
                        {SYSTEM_PERMISSIONS.filter((p) => p.category === cat).map((p) => {
                          const state = selectedPerms[p.action] || { enabled: false, scope: 'all' };
                          return (
                            <div
                              key={p.action}
                              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                                state.enabled
                                  ? 'bg-[#1c1114] border-[#4a1c22]'
                                  : 'bg-zinc-900/60 border-zinc-800/60'
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
                                  <div className="font-mono text-white text-xs">{p.action}</div>
                                  <div className="text-zinc-400 text-[11px]">{p.description}</div>
                                </div>
                              </label>

                              {state.enabled && (
                                <div className="flex items-center gap-2 ml-4">
                                  <span className="text-[10px] text-zinc-400">Scope:</span>
                                  <select
                                    value={state.scope}
                                    onChange={(e) =>
                                      handleScopeChange(p.action, e.target.value as 'all' | 'team' | 'own')
                                    }
                                    className="bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-xs focus:outline-none"
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

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#941b2c] hover:bg-[#b92b3f] rounded-lg transition-colors shadow-sm"
                >
                  Save & Deploy Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
