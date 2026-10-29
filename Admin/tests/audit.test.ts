import { describe, it, expect } from 'vitest';
import { computeAuditHash } from '../src/core/audit/hash-chain';

describe('Audit Log Hash-Chaining & Tamper-Evidence', () => {
  it('should compute consistent SHA-256 hash for identical audit entries', () => {
    const now = new Date('2026-10-29T10:00:00.000Z');
    const entry = {
      prevHash: 'GENESIS_HASH_00000000000000000000000000000000',
      actorId: 'usr_01',
      actorEmail: 'admin@cricketbuyy.com',
      action: 'customer.balance_adjust',
      resourceType: 'customer',
      resourceId: 'cust_99',
      beforeState: { balance: 1000 },
      afterState: { balance: 1500 },
      createdAt: now
    };

    const hash1 = computeAuditHash(entry);
    const hash2 = computeAuditHash(entry);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex length
  });

  it('should detect state modifications in audit chain', () => {
    const now = new Date('2026-10-29T10:00:00.000Z');
    const original = {
      prevHash: 'HASH_A',
      actorId: 'usr_01',
      actorEmail: 'admin@cricketbuyy.com',
      action: 'customer.balance_adjust',
      resourceType: 'customer',
      resourceId: 'cust_99',
      beforeState: { balance: 1000 },
      afterState: { balance: 1500 },
      createdAt: now
    };

    const tampered = {
      ...original,
      afterState: { balance: 999999 } // Tampered state
    };

    const hashOriginal = computeAuditHash(original);
    const hashTampered = computeAuditHash(tampered);

    expect(hashOriginal).not.toBe(hashTampered);
  });
});
