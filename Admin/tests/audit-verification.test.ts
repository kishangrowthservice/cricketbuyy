import { describe, it, expect } from 'vitest';
import { verifyAuditChain, AuditLogItem } from '../src/modules/audit/verifier';
import { computeAuditHash } from '../src/core/audit/hash-chain';

describe('Cryptographic Audit Chain Integrity Verifier Tests', () => {
  // Helper to build a valid cryptographic hash chain
  function buildValidChain(length: number = 5): AuditLogItem[] {
    const chain: AuditLogItem[] = [];
    let prevHash: string | null = null;

    for (let i = 0; i < length; i++) {
      const id = `aud_row_${i + 1}`;
      const actorEmail = `staff_${i}@cricketbuyy.com`;
      const action = i === 0 ? 'admin:login' : 'market:update';
      const resourceType = 'market';
      const date = new Date(1761700000000 + i * 60000);

      const entryHash = computeAuditHash({
        prevHash,
        actorId: `adm_${i}`,
        actorEmail,
        action,
        resourceType,
        resourceId: `res_${i}`,
        beforeState: null,
        afterState: null,
        createdAt: date
      });

      chain.push({
        id,
        actorId: `adm_${i}`,
        actorEmail,
        actorRole: 'admin',
        action,
        resourceType,
        resourceId: `res_${i}`,
        beforeState: null,
        afterState: null,
        ipAddress: '127.0.0.1',
        userAgent: 'TestRunner',
        prevHash,
        entryHash,
        createdAt: date.toISOString()
      });

      prevHash = entryHash;
    }

    return chain;
  }

  it('verifies a valid, untampered cryptographic hash chain successfully', () => {
    const chain = buildValidChain(6);
    const result = verifyAuditChain(chain);

    expect(result.valid).toBe(true);
    expect(result.totalEntries).toBe(6);
    expect(result.tamperedEntryId).toBeUndefined();
  });

  it('detects row data tampering and identifies the exact compromised record', () => {
    const chain = buildValidChain(5);

    // Tamper with record #3 (index 2) by modifying action
    const tampered = chain[2]!;
    tampered.action = 'wallet:fraudulent_credit';

    const result = verifyAuditChain(chain);

    expect(result.valid).toBe(false);
    expect(result.tamperedEntryId).toBe(tampered.id);
    expect(result.reason).toContain('Cryptographic digest mismatch');
  });

  it('detects a broken hash-chain link if an intermediate record was deleted', () => {
    const chain = buildValidChain(5);

    // Remove entry at index 2 (breaking prevHash on entry 3)
    const brokenChain = [chain[0]!, chain[1]!, chain[3]!, chain[4]!];

    const result = verifyAuditChain(brokenChain);

    expect(result.valid).toBe(false);
    expect(result.tamperedEntryId).toBe(brokenChain[2]?.id);
    expect(result.reason).toContain('Broken chain link');
  });
});
