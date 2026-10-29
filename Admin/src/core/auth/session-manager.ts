import crypto from 'crypto';
import { db } from '../db/client';
import { sessions, admins } from '../db/schema';
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
  IDLE_TIMEOUT_MINUTES: 30,
  ABSOLUTE_TIMEOUT_HOURS: 12,
  STEP_UP_VALIDITY_MINUTES: 10
};

export class SessionManager {
  /**
   * Generates a cryptographically secure 256-bit session token
   */
  public static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Creates a new hardened admin session
   */
  public static async createSession(
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AdminSession> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_CONFIG.IDLE_TIMEOUT_MINUTES * 60 * 1000);

    const [session] = await db
      .insert(sessions)
      .values({
        id: sessionId,
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

