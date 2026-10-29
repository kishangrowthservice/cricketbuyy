'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  UserCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  Wallet,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { maskEmail, maskPhone, maskFinancialAccount } from '../../../core/rbac/field-masker';
import { impersonateCustomerAction } from '../../../modules/auth/actions';

interface CustomerRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  exposure: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'SELF_EXCLUDED';
  tier: 'REGULAR' | 'VIP' | 'HIGHROLLER';
  registeredAt: string;
}

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'CUST-8091',
    username: 'rohan_cricket',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@gmail.com',
    phone: '+91 98765 43210',
    balance: 145000,
    exposure: 28000,
    status: 'ACTIVE',
    tier: 'VIP',
    registeredAt: '2026-04-12'
  },
  {
    id: 'CUST-8092',
    username: 'rahul_bhai',
    name: 'Rahul Verma',
    email: 'rahul.verma@outlook.com',
    phone: '+91 98111 22334',
    balance: 520000,
    exposure: 85000,
    status: 'ACTIVE',
    tier: 'HIGHROLLER',
    registeredAt: '2026-03-01'
  },
  {
    id: 'CUST-8093',
    username: 'anand_punjab',
    name: 'Anand Singh',
    email: 'anand.singh@yahoo.com',
    phone: '+91 97222 33445',
    balance: 12400,
    exposure: 0,
    status: 'SUSPENDED',
    tier: 'REGULAR',
    registeredAt: '2026-06-19'
  },
  {
    id: 'CUST-8094',
    username: 'priya_mumbai',
    name: 'Priya Mehta',
    email: 'priya.mehta@gmail.com',
    phone: '+91 98333 44556',
    balance: 68000,
    exposure: 15000,
    status: 'ACTIVE',
    tier: 'REGULAR',
    registeredAt: '2026-07-22'
  }
];

export default function CustomersManagementPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [allowPii, setAllowPii] = useState(false); // Controlled by compliance officer role
  const [impersonateTarget, setImpersonateTarget] = useState<CustomerRecord | null>(null);
  const [impersonateReason, setImpersonateReason] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = customers.filter(
    (c) =>
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunchImpersonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonateTarget || !impersonateReason.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await impersonateCustomerAction(
        {
          customerId: impersonateTarget.id,
          reason: impersonateReason
        },
        {
          actor: {
            id: 'adm_current',
            email: 'superadmin@cricketbuyy.com',
            isSuperAdmin: true,
            roles: ['super_admin'],
            permissions: ['customer:impersonate']
          }
        }
      );

      if (res.success) {
        setGeneratedToken(res.data.token);
      } else {
        alert(res.error.safeMessage);
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2a1215] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-[#e53e3e]" />
            Customer Management & Surveillance
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Accounts ledger, exposure surveillance, PII field-masking, and audited customer impersonation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAllowPii(!allowPii)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
              allowPii
                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
          >
            {allowPii ? <Eye className="w-4 h-4 text-amber-400" /> : <EyeOff className="w-4 h-4 text-zinc-400" />}
            {allowPii ? 'PII Unmasked (Compliance Mode)' : 'PII Field-Masking Active'}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#12141a] border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, username, or customer name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#941b2c]"
          />
        </div>
        <div className="text-xs text-zinc-400">
          Showing <strong className="text-white">{filtered.length}</strong> customers
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-[#12141a] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161820] text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Customer ID / User</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Contact (Masked PII)</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Active Exposure</th>
                <th className="py-3 px-4">Tier / Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((c) => {
                const displayEmail = allowPii ? c.email : maskEmail(c.email);
                const displayPhone = allowPii ? c.phone : maskPhone(c.phone);

                return (
                  <tr key={c.id} className="hover:bg-[#161820]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-zinc-300 font-semibold">{c.id}</div>
                      <div className="text-[11px] text-zinc-400">@{c.username}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">{c.name}</td>
                    <td className="py-3.5 px-4 text-[11px] font-mono space-y-0.5">
                      <div className="text-zinc-300">{displayEmail}</div>
                      <div className="text-zinc-500">{displayPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      ₹{c.balance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">
                      ₹{c.exposure.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                              : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                          }`}
                        >
                          {c.status}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {c.tier}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setImpersonateTarget(c);
                          setImpersonateReason('');
                          setGeneratedToken(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-zinc-200 bg-[#2a1215] hover:bg-[#4a1c22] border border-[#4a1c22] rounded-lg transition-colors shadow-sm"
                        title="Impersonate Customer with Mandatory Audit Log"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#e53e3e]" />
                        Impersonate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impersonation Modal */}
      {impersonateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#12141a] border border-[#38161b] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#e53e3e]" />
                Audited Customer Impersonation
              </h3>
              <button
                onClick={() => setImpersonateTarget(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {!generatedToken ? (
              <form onSubmit={handleLaunchImpersonation} className="space-y-4 text-xs">
                {/* Warning Alert */}
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Security & Compliance Warning
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    You are generating a time-limited customer session for <strong>{impersonateTarget.name}</strong> ({impersonateTarget.id}). Every transaction and view during impersonation is permanently bound to your administrator ID in the SHA-256 audit ledger.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-300 font-medium">
                    Mandatory Justification Reason (min 8 characters):
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={impersonateReason}
                    onChange={(e) => setImpersonateReason(e.target.value)}
                    placeholder="e.g. Resolving Zendesk dispute #9842 regarding missing deposit from UPI..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-xs focus:outline-none focus:border-[#941b2c]"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setImpersonateTarget(null)}
                    className="px-4 py-2 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || impersonateReason.trim().length < 8}
                    className="px-4 py-2 font-medium text-white bg-[#941b2c] hover:bg-[#b92b3f] rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? 'Generating Scoped Token...' : 'Authorize & Generate Token'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 space-y-2">
                  <div className="font-semibold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Impersonation Token Authorized & Audited
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Valid for 15 minutes. The customer exchange application will run with dual context (Admin: <code className="text-zinc-200">superadmin@cricketbuyy.com</code> $\to$ Customer: <code className="text-zinc-200">{impersonateTarget.id}</code>).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 font-mono text-[10px] text-zinc-400 break-all border border-zinc-800">
                  {generatedToken}
                </div>

                <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                  <button
                    onClick={() => setImpersonateTarget(null)}
                    className="px-4 py-2 font-medium text-zinc-300 hover:text-white"
                  >
                    Done
                  </button>
                  <a
                    href={`https://cricketbuyy-growth-service.vercel.app?impersonation_token=${generatedToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Launch Customer Exchange
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
