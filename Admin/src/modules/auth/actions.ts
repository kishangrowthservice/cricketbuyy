'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { createSecureAction } from '../../core/actions/secure-action';
import { db } from '../../core/db/client';
import { admins, sessions } from '../../core/db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../../core/errors/app-error';
import { ErrorCode } from '../../core/errors/codes';
import { verifyPassword } from '../../core/auth/hash';
import { generateTotpSecret, getTotpUri, verifyTotpToken } from '../../core/auth/totp';
import { SessionManager, SESSION_CONFIG } from '../../core/auth/session-manager';
import { ImpersonationEngine } from '../../core/auth/impersonation';

// 1. Admin Login Action
export async function loginAction(formData: {
  email: string;
  password: string;
  totpCode?: string;
}) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    totpCode: z.string().optional()
  });

  const parsed = schema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input format' };
  }

  const { email, password, totpCode } = parsed.data;

  // 1. Locate Admin
  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email.toLowerCase()))
    .limit(1);

  if (!admin) {
    return { success: false, error: 'Invalid email or password' };
  }

  // 2. Check Lockout
  if (admin.lockedUntil && new Date() < new Date(admin.lockedUntil)) {
    const minutesLeft = Math.ceil((new Date(admin.lockedUntil).getTime() - Date.now()) / 60000);
    return {
      success: false,
      error: `Account is temporarily locked due to repeated failed logins. Please retry in ${minutesLeft} minute(s).`
    };
  }

  // 3. Verify Password
  const isValidPass = await verifyPassword(password, admin.passwordHash);
  if (!isValidPass) {
    const attempts = admin.failedLoginAttempts + 1;
    const updates: { failedLoginAttempts: number; lockedUntil?: Date } = {
      failedLoginAttempts: attempts
    };
    if (attempts >= 5) {
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lockout
    }
    await db.update(admins).set(updates).where(eq(admins.id, admin.id));

    return {
      success: false,
      error: attempts >= 5 ? 'Account locked for 15 minutes due to 5 failed attempts' : 'Invalid email or password'
    };
  }

  // 4. Verify 2FA TOTP if enabled
  if (admin.twoFactorEnabled) {
    if (!totpCode) {
      return { success: false, requires2fa: true, message: 'TOTP 2FA code is required' };
    }
    if (!admin.twoFactorSecret) {
      return { success: false, error: '2FA misconfigured on admin account' };
    }
    const isTotpValid = verifyTotpToken(totpCode, admin.twoFactorSecret);
    if (!isTotpValid) {
      return { success: false, requires2fa: true, error: 'Invalid 6-digit TOTP code' };
    }
  }

  // 5. Reset failed attempts
  await db
    .update(admins)
    .set({ failedLoginAttempts: 0, lockedUntil: null })
    .where(eq(admins.id, admin.id));

  // 6. Create Session
  const session = await SessionManager.createSession(admin.id);

  // 7. Set Host-Only Secure Cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_CONFIG.COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_CONFIG.IDLE_TIMEOUT_MINUTES * 60
  });

  return {
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      isSuperAdmin: admin.isSuperAdmin
    }
  };
}

// 2. Admin Logout Action
export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_CONFIG.COOKIE_NAME)?.value;

  if (sessionId) {
    await SessionManager.revokeSession(sessionId);
    cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
  }

  return { success: true };
}

// 3. Verify Step-Up MFA Action (for high-risk mutations)
export const verifyStepUpAction = createSecureAction({
  actionName: 'auth.verify_step_up',
  schema: z.object({
    totpCode: z.string().length(6)
  }),
  auditMetadata: () => ({
    resourceType: 'admin_session',
    afterState: { stepUpVerified: true }
  }),
  handler: async (input, ctx) => {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, ctx.actor.id))
      .limit(1);

    if (!admin || !admin.twoFactorSecret) {
      throw new AppError({
        code: ErrorCode.VALIDATION_FAILED,
        safeMessage: '2FA is not configured for this administrator'
      });
    }

    const isValid = verifyTotpToken(input.totpCode, admin.twoFactorSecret);
    if (!isValid) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        safeMessage: 'Invalid Step-Up TOTP verification code'
      });
    }

    // Update active session step-up timestamp
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_CONFIG.COOKIE_NAME)?.value;
    if (sessionId) {
      await SessionManager.activateStepUp(sessionId);
    }

    return { stepUpActive: true, validForMinutes: SESSION_CONFIG.STEP_UP_VALIDITY_MINUTES };
  }
});

// 4. Setup 2FA Action (generates secret and QR code)
export const setup2faAction = createSecureAction({
  actionName: 'auth.setup_2fa',
  schema: z.object({}),
  handler: async (_input, ctx) => {
    const secret = generateTotpSecret();
    const qrUri = getTotpUri(ctx.actor.email, secret);
    return { secret, qrUri };
  }
});

// 5. Enable 2FA Action (verifies code and commits secret to admin record)
export const enable2faAction = createSecureAction({
  actionName: 'auth.enable_2fa',
  schema: z.object({
    secret: z.string().min(16),
    verificationCode: z.string().length(6)
  }),
  auditMetadata: () => ({
    resourceType: 'admin',
    afterState: { twoFactorEnabled: true }
  }),
  handler: async (input, ctx) => {
    const isValid = verifyTotpToken(input.verificationCode, input.secret);
    if (!isValid) {
      throw new AppError({
        code: ErrorCode.VALIDATION_FAILED,
        safeMessage: 'Invalid verification code. Please check your authenticator app.'
      });
    }

    await db
      .update(admins)
      .set({
        twoFactorSecret: input.secret,
        twoFactorEnabled: true
      })
      .where(eq(admins.id, ctx.actor.id));

    return { enabled: true };
  }
});

// 6. Impersonate Customer Action (audited and time-limited)
export const impersonateCustomerAction = createSecureAction({
  actionName: 'customer.impersonate',
  permission: 'customer:impersonate',
  schema: z.object({
    customerId: z.string().min(2),
    reason: z.string().min(8)
  }),
  auditMetadata: (input) => ({
    resourceType: 'customer',
    resourceId: input.customerId,
    afterState: { reason: input.reason }
  }),
  handler: async (input, ctx) => {
    const { token, expiresAt } = ImpersonationEngine.generateToken(
      input.customerId,
      ctx.actor.id,
      ctx.actor.email,
      input.reason
    );

    return {
      token,
      customerId: input.customerId,
      impersonatedBy: ctx.actor.email,
      expiresAt: expiresAt.toISOString()
    };
  }
});

