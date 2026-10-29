import { describe, it, expect, beforeEach } from 'vitest';
import { OptimisticLockEngine } from '../src/core/concurrency/optimistic-lock';
import { DistributedLockManager } from '../src/core/concurrency/distributed-lock';
import { DalScopingEngine } from '../src/core/dal/scoped-query';
import { adjustWalletBalanceAction } from '../src/modules/financial/actions';
import { ErrorCode } from '../src/core/errors/codes';
import { AppError } from '../src/core/errors/app-error';

describe('Optimistic Concurrency Engine Tests', () => {
  it('allows version progression when current matches expected', () => {
    expect(() => {
      OptimisticLockEngine.assertVersion(3, 3, 'MarketOdds');
    }).not.toThrow();

    expect(OptimisticLockEngine.nextVersion(3)).toBe(4);
  });

  it('throws CONFLICT_VERSION when mid-air collision is detected', () => {
    try {
      OptimisticLockEngine.assertVersion(4, 3, 'CustomerWallet');
      expect.fail('Should have thrown CONFLICT_VERSION');
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.CONFLICT_VERSION);
      expect((err as AppError).safeMessage).toContain('Concurrency collision');
      expect((err as AppError).details?.currentVersion).toBe(4);
      expect((err as AppError).details?.expectedVersion).toBe(3);
    }
  });
});

describe('Distributed Mutex & Lock Lease Tests', () => {
  beforeEach(() => {
    DistributedLockManager.resetAll();
  });

  it('acquires lock and produces a cryptographic fence token', async () => {
    const lock = await DistributedLockManager.acquireLock('market:IND_v_PAK', 5000, 'worker_1');
    expect(lock.acquired).toBe(true);
    expect(lock.fenceToken).toBeDefined();
    expect(lock.fenceToken?.length).toBe(32);
  });

  it('denies concurrent lock acquisition on the same resource key', async () => {
    const lock1 = await DistributedLockManager.acquireLock('wallet:CUST_101', 5000, 'worker_1');
    expect(lock1.acquired).toBe(true);

    const lock2 = await DistributedLockManager.acquireLock('wallet:CUST_101', 5000, 'worker_2');
    expect(lock2.acquired).toBe(false);
    expect(lock2.reason).toContain('currently locked by owner');
  });

  it('refuses to release lock if fence token does not match', async () => {
    const lock = await DistributedLockManager.acquireLock('wallet:CUST_101', 5000, 'worker_1');
    expect(lock.acquired).toBe(true);

    const released = await DistributedLockManager.releaseLock('wallet:CUST_101', 'fake_token_abc');
    expect(released).toBe(false);

    // Verify still locked
    const retryLock = await DistributedLockManager.acquireLock('wallet:CUST_101', 5000, 'worker_2');
    expect(retryLock.acquired).toBe(false);

    // Release with correct fence token
    const correctRelease = await DistributedLockManager.releaseLock('wallet:CUST_101', lock.fenceToken!);
    expect(correctRelease).toBe(true);
  });

  it('withLock helper executes critical task and guarantees cleanup', async () => {
    let executed = false;
    const result = await DistributedLockManager.withLock('lock:settlement', 5000, 'worker_1', async (token) => {
      expect(token).toBeDefined();
      executed = true;
      return 42;
    });

    expect(executed).toBe(true);
    expect(result).toBe(42);

    // Lock must be released
    const nextLock = await DistributedLockManager.acquireLock('lock:settlement', 5000, 'worker_2');
    expect(nextLock.acquired).toBe(true);
  });
});

describe('DAL Scoping Engine Tests', () => {
  const records = [
    { id: '1', name: 'Order 1', agentId: 'agent_alpha' },
    { id: '2', name: 'Order 2', agentId: 'agent_beta' },
    { id: '3', name: 'Order 3', agentId: 'agent_gamma' }
  ];

  it('returns all records when scope is "all"', () => {
    const res = DalScopingEngine.filterRecordsByScope(records, 'agentId', {
      scope: 'all',
      actorId: 'agent_alpha'
    });
    expect(res.length).toBe(3);
  });

  it('filters records to assigned team members when scope is "team"', () => {
    const res = DalScopingEngine.filterRecordsByScope(records, 'agentId', {
      scope: 'team',
      actorId: 'agent_alpha',
      teamIds: ['agent_beta']
    });
    expect(res.length).toBe(2);
    expect(res.map((r) => r.agentId)).toContain('agent_alpha');
    expect(res.map((r) => r.agentId)).toContain('agent_beta');
    expect(res.map((r) => r.agentId)).not.toContain('agent_gamma');
  });

  it('restricts strictly to actor records when scope is "own"', () => {
    const res = DalScopingEngine.filterRecordsByScope(records, 'agentId', {
      scope: 'own',
      actorId: 'agent_alpha',
      teamIds: ['agent_beta']
    });
    expect(res.length).toBe(1);
    expect(res[0]?.agentId).toBe('agent_alpha');
  });
});

describe('Financial Mutation Concurrency & Guardrail Tests', () => {
  const ctx = {
    actor: {
      id: 'adm_fin_1',
      email: 'finance@cricketbuyy.com',
      isSuperAdmin: false,
      roles: ['finance_officer'],
      permissions: ['wallet:adjust']
    }
  };

  it('enforces step-up authentication when adjustment exceeds ₹50,000', async () => {
    const res = await adjustWalletBalanceAction(
      {
        customerId: 'CUST-8091',
        amount: 75000,
        type: 'CREDIT',
        reason: 'Missing deposit reconciliation',
        expectedBalanceVersion: 1
      },
      ctx
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe(ErrorCode.STEP_UP_REQUIRED);
      expect(res.error.safeMessage).toContain('require Step-Up TOTP');
    }
  });

  it('routes ultra high-value adjustments (> ₹1,00,000) to Dual-Custody Approval Queue', async () => {
    const res = await adjustWalletBalanceAction(
      {
        customerId: 'CUST-8091',
        amount: 150000,
        type: 'CREDIT',
        reason: 'Large VIP deposit manual override',
        expectedBalanceVersion: 1,
        stepUpTotpCode: '123456'
      },
      ctx
    );

    expect(res.success).toBe(true);
    if (res.success && 'requiresDualCustody' in res.data) {
      expect(res.data.requiresDualCustody).toBe(true);
      expect(res.data.approvalRequestId).toBeDefined();
    }
  });

  it('detects optimistic concurrency conflict on simultaneous parallel balance updates', async () => {
    const initialCall = await adjustWalletBalanceAction(
      {
        customerId: 'CUST-8092',
        amount: 5000,
        type: 'CREDIT',
        reason: 'Promotional cashback credit',
        expectedBalanceVersion: 3 // current is 3
      },
      ctx
    );

    expect(initialCall.success).toBe(true);
    if (initialCall.success && 'newVersion' in initialCall.data) {
      expect(initialCall.data.newVersion).toBe(4);
    }

    // Second call arrives with stale expectedBalanceVersion 3
    const staleCollisionCall = await adjustWalletBalanceAction(
      {
        customerId: 'CUST-8092',
        amount: 10000,
        type: 'DEBIT',
        reason: 'Manual deduction',
        expectedBalanceVersion: 3 // Stale version! (Now it's v4)
      },
      ctx
    );

    expect(staleCollisionCall.success).toBe(false);
    if (!staleCollisionCall.success) {
      expect(staleCollisionCall.error.code).toBe(ErrorCode.CONFLICT_VERSION);
      expect(staleCollisionCall.error.safeMessage).toContain('Concurrency collision');
    }
  });
});
