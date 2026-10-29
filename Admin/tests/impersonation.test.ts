import { describe, it, expect } from 'vitest';
import { ImpersonationEngine } from '../src/core/auth/impersonation';
import { AppError } from '../src/core/errors/app-error';
import { ErrorCode } from '../src/core/errors/codes';

describe('Audited Customer Impersonation Engine Tests', () => {
  const customerId = 'cust_9941';
  const adminId = 'adm_root_1';
  const adminEmail = 'root@cricketbuyy.com';
  const validReason = 'Investigating stuck balance on withdrawal ticket #4812';

  it('generates a valid, signed 3-part impersonation token', () => {
    const { token, expiresAt } = ImpersonationEngine.generateToken(
      customerId,
      adminId,
      adminEmail,
      validReason
    );

    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(3);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('successfully verifies and decodes valid token claims', () => {
    const { token } = ImpersonationEngine.generateToken(
      customerId,
      adminId,
      adminEmail,
      validReason
    );

    const claims = ImpersonationEngine.verifyToken(token);
    expect(claims.targetCustomerId).toBe(customerId);
    expect(claims.impersonatorAdminId).toBe(adminId);
    expect(claims.impersonatorEmail).toBe(adminEmail);
    expect(claims.reason).toBe(validReason);
    expect(claims.exp).toBeGreaterThan(claims.iat);
  });

  it('strictly rejects token generation when mandatory reason is missing or short', () => {
    expect(() => {
      ImpersonationEngine.generateToken(customerId, adminId, adminEmail, '');
    }).toThrowError();

    try {
      ImpersonationEngine.generateToken(customerId, adminId, adminEmail, 'short');
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe(ErrorCode.VALIDATION_FAILED);
      expect((err as AppError).safeMessage).toContain('justification reason is mandatory');
    }
  });

  it('rejects tampered tokens with mismatched signatures', () => {
    const { token } = ImpersonationEngine.generateToken(
      customerId,
      adminId,
      adminEmail,
      validReason
    );

    const [header, payload, signature] = token.split('.');
    // Tamper with payload (substituting a different customer ID)
    const tamperedPayload = Buffer.from(
      JSON.stringify({ targetCustomerId: 'cust_ATTACKER_999' })
    ).toString('base64url');

    const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

    expect(() => {
      ImpersonationEngine.verifyToken(tamperedToken);
    }).toThrowError();

    try {
      ImpersonationEngine.verifyToken(tamperedToken);
    } catch (err) {
      expect((err as AppError).code).toBe(ErrorCode.UNAUTHENTICATED);
      expect((err as AppError).safeMessage).toContain('Invalid token signature');
    }
  });
});

