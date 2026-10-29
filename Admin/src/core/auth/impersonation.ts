import crypto from 'crypto';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/codes';

export interface ImpersonationClaims {
  targetCustomerId: string;
  impersonatorAdminId: string;
  impersonatorEmail: string;
  reason: string;
  iat: number;
  exp: number;
}

const IMPERSONATION_SECRET = process.env.ADMIN_SIGNING_SECRET || 'dev_cricketbuyy_impersonation_secret_2026_xyz';
const TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes strict TTL

export class ImpersonationEngine {
  /**
   * Generates a signed, time-limited customer impersonation token
   */
  public static generateToken(
    targetCustomerId: string,
    impersonatorAdminId: string,
    impersonatorEmail: string,
    reason: string
  ): { token: string; expiresAt: Date } {
    if (!reason || reason.trim().length < 8) {
      throw new AppError({
        code: ErrorCode.VALIDATION_FAILED,
        safeMessage: 'A valid, detailed justification reason is mandatory for customer impersonation (min 8 characters).'
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + TOKEN_TTL_SECONDS;

    const claims: ImpersonationClaims = {
      targetCustomerId,
      impersonatorAdminId,
      impersonatorEmail,
      reason: reason.trim(),
      iat: now,
      exp
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', IMPERSONATION_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return {
      token: `${header}.${payload}.${signature}`,
      expiresAt: new Date(exp * 1000)
    };
  }

  /**
   * Verifies and decodes an impersonation token
   */
  public static verifyToken(token: string): ImpersonationClaims {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new AppError({
        code: ErrorCode.VALIDATION_FAILED,
        safeMessage: 'Malformed impersonation token format'
      });
    }

    const [header, payload, signature] = parts;
    if (!header || !payload || !signature) {
      throw new AppError({
        code: ErrorCode.VALIDATION_FAILED,
        safeMessage: 'Invalid token structure'
      });
    }

    // Verify cryptographic signature
    const expectedSig = crypto
      .createHmac('sha256', IMPERSONATION_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new AppError({
        code: ErrorCode.UNAUTHENTICATED,
        safeMessage: 'Invalid token signature'
      });
    }

    // Decode and verify expiration
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as ImpersonationClaims;
    const now = Math.floor(Date.now() / 1000);

    if (now > claims.exp) {
      throw new AppError({
        code: ErrorCode.CONFLICT_STATE,
        safeMessage: 'Impersonation token has expired'
      });
    }

    return claims;
  }
}
