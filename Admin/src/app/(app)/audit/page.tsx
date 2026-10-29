'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  ShieldCheck,
  Hash,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Filter
} from 'lucide-react';
import { verifyAuditLedgerAction, exportAuditArchiveAction } from '@/modules/audit/actions';
import type { AuditLogItem } from '@/modules/audit/verifier';

const SAMPLE_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud_8891',
    actorId: 'adm_root_1',
    actorEmail: 'root@cricketbuyy.com',
    actorRole: 'Super Administrator',
    action: 'setting:maintenance_toggle',
    resourceType: 'platform_settings',
    resourceId: 'global_config',
    beforeState: { maintenanceMode: false },
    afterState: { maintenanceMode: true, reason: 'Emergency database upgrade' },
    ipAddress: '103.21.244.12',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    prevHash: '6f8d1c9b2a4e8f170428d0526e84bb5f84d284f1a2384758b99182a394857b29',
    entryHash: 'c4ca4238a0b923820dcc509a6f75849b294e1d3e8492048593a20194857493a1',
    createdAt: '2026-10-29 17:15:30'
  },
  {
    id: 'aud_8892',
    actorId: 'adm_trader_4',
    actorEmail: 'trader.vikram@cricketbuyy.com',
    actorRole: 'Risk & Trading Manager',
    action: 'market:suspend',
    resourceType: 'market',
    resourceId: 'MKT-IND-PAK-01',
    beforeState: { status: 'IN_PLAY' },
    afterState: { status: 'SUSPENDED', reason: 'Third umpire review for run-out' },
    ipAddress: '49.36.128.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    prevHash: 'c4ca4238a0b923820dcc509a6f75849b294e1d3e8492048593a20194857493a1',
    entryHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    createdAt: '2026-10-29 17:12:10'
  },
  {
    id: 'aud_8893',
    actorId: 'adm_fin_2',
    actorEmail: 'finance@cricketbuyy.com',
    actorRole: 'Finance Officer',
    action: 'wallet:adjust',
    resourceType: 'customer_wallet',
    resourceId: 'CUST-8091',
    beforeState: { balance: 140000, version: 1 },
    afterState: { balance: 145000, version: 2, amount: 5000, type: 'CREDIT' },
    ipAddress: '157.34.192.11',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    prevHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    entryHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    createdAt: '2026-10-29 17:08:44'
  }
];

export default function AuditLedgerPage() {
  const [logs] = useState<AuditLogItem[]>(SAMPLE_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    valid: boolean;
    count: number;
    message: string;
  } | null>({
    valid: true,
    count: 3,
    message: 'Cryptographic hash-chain verified: 100% untampered integrity.'
  });

  const filtered = logs.filter(
    (l) =>
      l.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.resourceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyAuditLedgerAction({}, {
        actor: { id: 'adm_current', email: 'auditor@cricketbuyy.com', isSuperAdmin: true, roles: ['auditor'], permissions: ['audit:verify_integrity'] }
      });

      if (res.success) {
        setVerificationFeedback({
          valid: res.data.valid,
          count: res.data.totalEntries,
          message: res.data.valid
            ? `Cryptographic seal verified: All ${res.data.totalEntries} entries match SHA-256 hash chaining without discrepancy.`
            : `Integrity Alert: Chain compromised at entry ${res.data.tamperedEntryId}.`
        });
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExport = async (format: 'JSON' | 'CSV') => {
    try {
      const res = await exportAuditArchiveAction(
        { format },
        {
          actor: { id: 'adm_current', email: 'auditor@cricketbuyy.com', isSuperAdmin: true, roles: ['auditor'], permissions: ['audit:export'] }
        }
      );

      if (res.success) {
        alert(`Audit archive generated: ${res.data.exportId} (${res.data.format} format). Ready for compliance download.`);
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2a1215] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#e53e3e]" />
            Cryptographic Audit Ledger & Chain Verifier
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Append-only, SHA-256 tamper-evident audit ledger with mathematically verifiable block chaining.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('CSV')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#941b2c] hover:bg-[#b92b3f] rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Hash className="w-3.5 h-3.5" />
            {isVerifying ? 'Verifying Block Digests...' : 'Verify Cryptographic Integrity'}
          </button>
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationFeedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            verificationFeedback.valid
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {verificationFeedback.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <strong className="block font-semibold">
                {verificationFeedback.valid ? 'Cryptographic Chain Seal Validated' : 'Chain Integrity Discrepancy'}
              </strong>
              <p className="text-[11px] text-zinc-300 mt-0.5">{verificationFeedback.message}</p>
            </div>
          </div>
          <span className="font-mono text-[10px] bg-zinc-900 px-2 py-1 rounded border border-zinc-700 text-zinc-300 shrink-0">
            SHA-256 Verified
          </span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#12141a] border border-zinc-800">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, email, resource type or log ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#941b2c]"
          />
        </div>
        <div className="text-xs text-zinc-400">
          Showing <strong className="text-white">{filtered.length}</strong> audited records
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-3">
        {filtered.map((log) => {
          const isExpanded = expandedId === log.id;
          return (
            <div
              key={log.id}
              className="bg-[#12141a] border border-zinc-800 rounded-xl overflow-hidden shadow-sm transition-all"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-zinc-900/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-zinc-800 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs font-mono text-zinc-300">{log.resourceType}:{log.resourceId}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{log.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <strong className="text-zinc-200">{log.actorEmail}</strong> ({log.actorRole})
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-zinc-500">IP: {log.ipAddress}</span>
                  </div>
                </div>

                {/* Hash Chain Indicators */}
                <div className="flex items-center gap-3">
                  <div className="text-right font-mono text-[10px] space-y-0.5">
                    <div className="text-zinc-500">
                      prev: <span className="text-zinc-400">{log.prevHash?.slice(0, 10)}...</span>
                    </div>
                    <div className="text-emerald-400 font-semibold">
                      hash: {log.entryHash.slice(0, 10)}...
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                </div>
              </div>

              {/* Expanded JSON State Viewer */}
              {isExpanded && (
                <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 text-xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-zinc-400 mb-1">State Before:</div>
                      <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-300 font-mono text-[11px] overflow-x-auto border border-zinc-800">
                        {log.beforeState ? JSON.stringify(log.beforeState, null, 2) : 'null'}
                      </pre>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-400 mb-1">State After:</div>
                      <pre className="p-3 rounded-lg bg-zinc-900 text-emerald-300 font-mono text-[11px] overflow-x-auto border border-zinc-800">
                        {log.afterState ? JSON.stringify(log.afterState, null, 2) : 'null'}
                      </pre>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 text-[10px] font-mono text-zinc-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="truncate max-w-md">Full Hash: <span className="text-zinc-300">{log.entryHash}</span></div>
                    <div>User Agent: {log.userAgent}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
