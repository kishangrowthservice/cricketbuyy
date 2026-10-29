import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { createSecureAction } from '../src/core/actions/secure-action';
import { ErrorCode } from '../src/core/errors/codes';

describe('secureAction Mutation Pipeline Verification', () => {
  const testSchema = z.object({
    amount: z.number().positive(),
    reason: z.string().min(5)
  });

  const testAction = createSecureAction({
    actionName: 'test.adjust',
    schema: testSchema,
    permission: 'wallet:adjust',
    handler: async (input) => {
      return { adjusted: true, newBalance: input.amount + 100 };
    }
  });

  it('should reject inputs failing Zod validation', async () => {
    const ctx = {
      actor: { id: 'adm_1', email: 'adm@test.com', isSuperAdmin: false, roles: [], permissions: ['wallet:adjust'] }
    };

    const result = await testAction({ amount: -50, reason: 'hi' }, ctx);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCode.VALIDATION_FAILED);
    }
  });

  it('should reject unauthenticated requests', async () => {
    const ctx = {
      actor: { id: '', email: '', isSuperAdmin: false, roles: [], permissions: [] }
    };

    const result = await testAction({ amount: 50, reason: 'Valid reason' }, ctx);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCode.UNAUTHENTICATED);
    }
  });

  it('should deny unauthorized requests lacking permission', async () => {
    const ctx = {
      actor: { id: 'adm_2', email: 'staff@test.com', isSuperAdmin: false, roles: [], permissions: ['customer:read'] } // missing wallet:adjust
    };

    const result = await testAction({ amount: 50, reason: 'Valid reason' }, ctx);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCode.FORBIDDEN);
    }
  });

  it('should grant Super Admin wildcard access even without explicit permission', async () => {
    const ctx = {
      actor: { id: 'adm_root', email: 'root@test.com', isSuperAdmin: true, roles: ['super_admin'], permissions: [] }
    };

    const result = await testAction({ amount: 150, reason: 'Admin manual test' }, ctx);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.newBalance).toBe(250);
    }
  });

  it('should safely replay stored response on idempotent retry', async () => {
    const ctx = {
      actor: { id: 'adm_root', email: 'root@test.com', isSuperAdmin: true, roles: [], permissions: [] },
      idempotencyKey: 'idem_key_9999'
    };

    // First call
    const res1 = await testAction({ amount: 200, reason: 'Initial request' }, ctx);
    expect(res1.success).toBe(true);

    // Replay with identical idempotency key
    const res2 = await testAction({ amount: 200, reason: 'Initial request' }, ctx);
    expect(res2.success).toBe(true);
    if (res1.success && res2.success) {
      expect(res2.data).toEqual(res1.data);
    }
  });
});
