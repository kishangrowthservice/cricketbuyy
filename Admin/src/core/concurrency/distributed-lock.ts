import crypto from 'crypto';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/codes';

interface LockLease {
  resourceKey: string;
  fenceToken: string;
  ownerId: string;
  expiresAt: number;
}

export class DistributedLockManager {
  // In-memory lease table (acts as local or fallback when Redis is offline/during testing)
  private static leases = new Map<string, LockLease>();

  /**
   * Attempts to acquire an exclusive lock on a resource key.
   */
  public static async acquireLock(
    resourceKey: string,
    ttlMs: number = 10000,
    ownerId: string = 'system'
  ): Promise<{ acquired: boolean; fenceToken?: string; reason?: string }> {
    const now = Date.now();
    const existing = this.leases.get(resourceKey);

    // If lock exists and has not expired
    if (existing && existing.expiresAt > now) {
      return {
        acquired: false,
        reason: `Resource '${resourceKey}' is currently locked by owner '${existing.ownerId}' until ${new Date(
          existing.expiresAt
        ).toISOString()}`
      };
    }

    // Acquire new lease with cryptographic fence token
    const fenceToken = crypto.randomBytes(16).toString('hex');
    const lease: LockLease = {
      resourceKey,
      fenceToken,
      ownerId,
      expiresAt: now + ttlMs
    };

    this.leases.set(resourceKey, lease);

    return {
      acquired: true,
      fenceToken
    };
  }

  /**
   * Releases lock strictly matching the fence token.
   * If fenceToken does not match, refuses to release (prevents stale release after TTL expiry).
   */
  public static async releaseLock(resourceKey: string, fenceToken: string): Promise<boolean> {
    const existing = this.leases.get(resourceKey);
    if (!existing) {
      return false;
    }

    if (existing.fenceToken !== fenceToken) {
      console.warn(`Distributed lock release rejected: Fence token mismatch on '${resourceKey}'`);
      return false;
    }

    this.leases.delete(resourceKey);
    return true;
  }

  /**
   * High-level helper: Executes critical section with exclusive distributed lock
   */
  public static async withLock<T>(
    resourceKey: string,
    ttlMs: number,
    ownerId: string,
    task: (fenceToken: string) => Promise<T>
  ): Promise<T> {
    const lock = await this.acquireLock(resourceKey, ttlMs, ownerId);
    if (!lock.acquired || !lock.fenceToken) {
      throw new AppError({
        code: ErrorCode.CONFLICT_STATE,
        safeMessage: `Failed to acquire exclusive lock on ${resourceKey}: ${lock.reason}`
      });
    }

    try {
      return await task(lock.fenceToken);
    } finally {
      await this.releaseLock(resourceKey, lock.fenceToken);
    }
  }

  /**
   * Resets all leases (used in unit tests)
   */
  public static resetAll(): void {
    this.leases.clear();
  }
}
