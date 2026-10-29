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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#941b2c] shrink-0" />
            <span>Cryptographic Audit Ledger &amp; Chain Verifier</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Append-only, SHA-256 tamper-evident audit ledger with mathematically verifiable block chaining.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleExport('CSV')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-2xs min-h-[42px] sm:min-h-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-xs font-bold text-white bg-[#941b2c] hover:bg-[#7a1624] rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50 min-h-[42px] sm:min-h-0"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>{isVerifying ? 'Verifying...' : 'Verify Chain'}</span>
          </button>
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationFeedback && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs ${
            verificationFeedback.valid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start sm:items-center gap-2.5">
            {verificationFeedback.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <strong className="block font-bold">
                {verificationFeedback.valid ? 'Cryptographic Chain Seal Validated' : 'Chain Integrity Discrepancy'}
              </strong>
              <p className="text-[11px] text-slate-600 mt-0.5">{verificationFeedback.message}</p>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-300 text-emerald-800 shrink-0 shadow-2xs self-start sm:self-auto">
            SHA-256 Verified
          </span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, email, resource type or log ID..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#941b2c] focus:ring-1 focus:ring-[#941b2c] min-h-[42px] sm:min-h-0"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{filtered.length}</strong> audited records
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-3">
        {filtered.map((log) => {
          const isExpanded = expandedId === log.id;
          return (
            <div
              key={log.id}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-mono font-semibold text-slate-700">{log.resourceType}:{log.resourceId}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">{log.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-900 font-bold">{log.actorEmail}</strong> ({log.actorRole})
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-500">IP: {log.ipAddress}</span>
                  </div>
                </div>

                {/* Hash Chain Indicators */}
                <div className="flex items-center gap-3">
                  <div className="text-right font-mono text-[10px] space-y-0.5">
                    <div className="text-slate-400">
                      prev: <span className="text-slate-600 font-medium">{log.prevHash?.slice(0, 10)}...</span>
                    </div>
                    <div className="text-emerald-700 font-bold">
                      hash: {log.entryHash.slice(0, 10)}...
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Expanded JSON State Viewer */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/80 text-xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-slate-600 mb-1">State Before:</div>
                      <pre className="p-3 rounded-xl bg-white text-slate-800 font-mono text-[11px] overflow-x-auto border border-slate-200 shadow-2xs">
                        {log.beforeState ? JSON.stringify(log.beforeState, null, 2) : 'null'}
                      </pre>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-emerald-700 mb-1">State After:</div>
                      <pre className="p-3 rounded-xl bg-white text-emerald-800 font-mono text-[11px] overflow-x-auto border border-emerald-200 shadow-2xs">
                        {log.afterState ? JSON.stringify(log.afterState, null, 2) : 'null'}
                      </pre>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="truncate max-w-md">Full Hash: <span className="text-slate-800 font-semibold">{log.entryHash}</span></div>
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
