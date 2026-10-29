import { describe, it, expect } from 'vitest';
import {
  generateTotpSecret,
  generateTotpToken,
  verifyTotpToken,
  getTotpUri,
  base32ToBuffer
} from '../src/core/auth/totp';

describe('TOTP Two-Factor Authentication Engine (RFC 6238)', () => {
  it('generates a valid Base32 secret', () => {
    const secret = generateTotpSecret(20);
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThanOrEqual(32);
    // Should decode without error
    const buf = base32ToBuffer(secret);
    expect(buf.length).toBe(20);
  });

  it('generates and verifies valid 6-digit TOTP token', () => {
    const secret = generateTotpSecret();
    const token = generateTotpToken(secret);

    expect(token).toMatch(/^\d{6}$/);
    const isValid = verifyTotpToken(token, secret);
    expect(isValid).toBe(true);
  });

  it('tolerates ±30s clock drift window', () => {
    const secret = generateTotpSecret();
    const now = Date.now();

    // Token generated 25 seconds ago (within 1 step)
    const tokenPast = generateTotpToken(secret, now - 25000);
    expect(verifyTotpToken(tokenPast, secret, now, 30, 1)).toBe(true);

    // Token generated 25 seconds in future
    const tokenFuture = generateTotpToken(secret, now + 25000);
    expect(verifyTotpToken(tokenFuture, secret, now, 30, 1)).toBe(true);
  });

  it('rejects tokens from outside time window (e.g. 90 seconds ago)', () => {
    const secret = generateTotpSecret();
    const now = Date.now();

    const oldToken = generateTotpToken(secret, now - 90000);
    expect(verifyTotpToken(oldToken, secret, now, 30, 1)).toBe(false);
  });

  it('rejects malformed or invalid tokens', () => {
    const secret = generateTotpSecret();
    expect(verifyTotpToken('123', secret)).toBe(false);
    expect(verifyTotpToken('abcdef', secret)).toBe(false);
    expect(verifyTotpToken('999999', secret)).toBe(false);
  });

  it('generates standard otpauth:// URI for authenticator QR codes', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const uri = getTotpUri('admin@cricketbuyy.com', secret);

    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(uri).toContain('issuer=Cricketbuyy%20Admin');
  });
});

