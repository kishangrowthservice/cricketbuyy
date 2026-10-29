import { computeAuditHash } from '../../core/audit/hash-chain';

export interface AuditLogItem {
  id: string;
  actorId: string | null;
  actorEmail: string;
  actorRole: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  prevHash: string | null;
  entryHash: string;
  createdAt: string;
}

export interface VerificationResult {
  valid: boolean;
  totalEntries: number;
  tamperedEntryId?: string;
  reason?: string;
}

/**
 * Pure cryptographic audit chain verification logic.
 * Proves tamper-evident integrity from genesis to latest entry.
 */
export function verifyAuditChain(entries: AuditLogItem[]): VerificationResult {
  if (entries.length === 0) {
    return { valid: true, totalEntries: 0 };
  }

  let expectedPrevHash: string | null = null;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;

    // 1. Verify prevHash matches previous entryHash
    if (entry.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        totalEntries: entries.length,
        tamperedEntryId: entry.id,
        reason: `Broken chain link at index ${i}: Expected prevHash '${expectedPrevHash}', but found '${entry.prevHash}'`
      };
    }

    // 2. Re-compute hash from row payload
    const computed = computeAuditHash({
      prevHash: entry.prevHash,
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      beforeState: entry.beforeState,
      afterState: entry.afterState,
      createdAt: new Date(entry.createdAt)
    });

    if (computed !== entry.entryHash) {
      return {
        valid: false,
        totalEntries: entries.length,
        tamperedEntryId: entry.id,
        reason: `Cryptographic digest mismatch at entry ${entry.id}: Row data has been tampered with or modified outside the hash chain.`
      };
    }

    expectedPrevHash = entry.entryHash;
  }

  return {
    valid: true,
    totalEntries: entries.length
  };
}

