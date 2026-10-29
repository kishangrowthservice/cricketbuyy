import crypto from 'crypto';
import { db } from '../db/client';
import { sessions } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/codes';

export interface AdminSession {
  id: string;
  adminId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  stepUpUntil?: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

export const SESSION_CONFIG = {
  COOKIE_NAME: '__Host-admin-session',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/'
    // __Host- cookies must NOT specify domain
  },
  IDLE_TIMEOUT_MINUTES: 30,
  SUPER_ADMIN_IDLE_TIMEOUT_MINUTES: 15,
  ABSOLUTE_TIMEOUT_HOURS: 12,
  SUPER_ADMIN_ABSOLUTE_TIMEOUT_HOURS: 8,
  STEP_UP_VALIDITY_MINUTES: 10
};

export class SessionManager {
  /**
   * Generates a cryptographically secure 256-bit raw session token
   */
  public static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Computes SHA-256 digest of session token (§5.6)
   */
  public static hashSessionToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Gets idle timeout for a given role (Super Admin = 15m, Admin = 30m)
   */
  public static getIdleTimeoutMinutes(isSuperAdmin: boolean = false): number {
    return isSuperAdmin
      ? SESSION_CONFIG.SUPER_ADMIN_IDLE_TIMEOUT_MINUTES
      : SESSION_CONFIG.IDLE_TIMEOUT_MINUTES;
  }

  /**
   * Gets absolute session lifetime for a given role (Super Admin = 8h, Admin = 12h)
   */
  public static getAbsoluteTimeoutHours(isSuperAdmin: boolean = false): number {
    return isSuperAdmin
      ? SESSION_CONFIG.SUPER_ADMIN_ABSOLUTE_TIMEOUT_HOURS
      : SESSION_CONFIG.ABSOLUTE_TIMEOUT_HOURS;
  }

  /**
   * Creates a new hardened admin session
   */
  public static async createSession(
    adminId: string,
    ipAddress?: string,
    userAgent?: string,
    isSuperAdmin: boolean = false
  ): Promise<AdminSession> {
    const rawSessionToken = this.generateSessionId();
    const tokenHash = this.hashSessionToken(rawSessionToken);
    const idleMinutes = this.getIdleTimeoutMinutes(isSuperAdmin);
    const expiresAt = new Date(Date.now() + idleMinutes * 60 * 1000);

    const [session] = await db
      .insert(sessions)
      .values({
        id: tokenHash,
        adminId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        stepUpUntil: null,
        expiresAt
      })
      .returning();

    if (!session) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        safeMessage: 'Failed to create admin session record'
      });
    }

    return session;
  }

  /**
   * Validates session from database, enforcing idle timeouts and sliding window
   */
  public static async validateSession(
    sessionId: string,
    currentIp?: string
  ): Promise<{ valid: boolean; session?: AdminSession; reason?: string }> {
    if (!sessionId) {
      return { valid: false, reason: 'Missing session ID' };
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!session) {
      return { valid: false, reason: 'Session does not exist or has expired' };
    }

    // Slide idle window forward
    const newExpiresAt = new Date(Date.now() + SESSION_CONFIG.IDLE_TIMEOUT_MINUTES * 60 * 1000);
    await db
      .update(sessions)
      .set({ expiresAt: newExpiresAt })
      .where(eq(sessions.id, sessionId));

    return {
      valid: true,
      session: {
        ...session,
        expiresAt: newExpiresAt
      }
    };
  }

  /**
   * Sets Step-Up authentication timestamp valid for next 10 minutes
   */
  public static async activateStepUp(sessionId: string): Promise<Date> {
    const stepUpUntil = new Date(Date.now() + SESSION_CONFIG.STEP_UP_VALIDITY_MINUTES * 60 * 1000);

    await db
      .update(sessions)
      .set({ stepUpUntil })
      .where(eq(sessions.id, sessionId));

    return stepUpUntil;
  }

  /**
   * Checks if session holds an active, unexpired Step-Up authentication
   */
  public static isStepUpActive(stepUpUntil?: Date | null): boolean {
    if (!stepUpUntil) return false;
    return new Date() < new Date(stepUpUntil);
  }

  /**
   * Revokes a single session
   */
  public static async revokeSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  /**
   * Revokes all active sessions for an admin (e.g. on password reset or lockout)
   */
  public static async revokeAllAdminSessions(adminId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.adminId, adminId));
  }
}
