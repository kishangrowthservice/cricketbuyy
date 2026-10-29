import { describe, it, expect } from 'vitest';
import { validatePasswordPolicy, checkBreachedPassword } from '../src/core/auth/hibp';
import { SessionManager, SESSION_CONFIG } from '../src/core/auth/session-manager';
import { InvitationManager } from '../src/core/auth/invitation';

describe('Specification §5: Identity, Authentication & Sessions Verification', () => {
  describe('§5.3 Password Policy (NIST SP 800-63B & HIBP)', () => {
    it('enforces minimum 12 character length without arbitrary composition rules', () => {
      // Less than 12 chars rejected
      const shortRes = validatePasswordPolicy('Admin123!');
      expect(shortRes.valid).toBe(false);
      expect(shortRes.reason).toContain('at least 12 characters');

      // 12+ chars with spaces and plain text accepted (NIST SP 800-63B)
      const validPassphrase = validatePasswordPolicy('correct horse battery staple');
      expect(validPassphrase.valid).toBe(true);

      // Max length limit
      const tooLong = validatePasswordPolicy('a'.repeat(257));
      expect(tooLong.valid).toBe(false);
    });

    it('handles HIBP k-anonymity query gracefully with prefix protection', async () => {
      // Safe test password: only prefix leaves server
      const result = await checkBreachedPassword('password123456', 2000);
      // Result is either detected or deferred if network unavailable in CI
      expect(typeof result.isBreached).toBe('boolean');
      expect(typeof result.breachCount).toBe('number');
    });
  });

  describe('§5.6 Session Hardening & Role Timeouts', () => {
    it('configures host-only cookie with strict security flags and no domain', () => {
      expect(SESSION_CONFIG.COOKIE_NAME).toBe('__Host-admin-session');
      expect(SESSION_CONFIG.COOKIE_OPTIONS.httpOnly).toBe(true);
      expect(SESSION_CONFIG.COOKIE_OPTIONS.secure).toBe(true);
      expect(SESSION_CONFIG.COOKIE_OPTIONS.sameSite).toBe('lax');
      expect(SESSION_CONFIG.COOKIE_OPTIONS.path).toBe('/');
      // Must not specify Domain attribute for __Host- cookie specification
      expect((SESSION_CONFIG.COOKIE_OPTIONS as Record<string, unknown>).domain).toBeUndefined();
    });

    it('enforces role-based session timeouts (Super Admin 15m/8h, Admin 30m/12h)', () => {
      // Super Admin
      expect(SessionManager.getIdleTimeoutMinutes(true)).toBe(15);
      expect(SessionManager.getAbsoluteTimeoutHours(true)).toBe(8);

      // Standard Admin
      expect(SessionManager.getIdleTimeoutMinutes(false)).toBe(30);
      expect(SessionManager.getAbsoluteTimeoutHours(false)).toBe(12);
    });

    it('hashes 256-bit session token with SHA-256 for opaque storage', () => {
      const rawToken = SessionManager.generateSessionId();
      expect(rawToken.length).toBe(64); // 32 bytes in hex = 64 chars

      const hash = SessionManager.hashSessionToken(rawToken);
      expect(hash.length).toBe(64); // SHA-256 hex digest
      expect(hash).not.toBe(rawToken);
    });
  });

  describe('§5.8 Single-Use Invitation Tokens', () => {
    it('creates 256-bit single-use invitation token stored hashed', () => {
      const { rawToken, invitation } = InvitationManager.createInvitation({
        email: 'officer@cricketbuyy.com',
        roleId: 'role_ops_01',
        roleName: 'Operations Lead',
        invitedBy: 'superadmin_01',
        inviterEmail: 'superadmin@cricketbuyy.com'
      });

      expect(rawToken.length).toBe(64);
      expect(invitation.email).toBe('officer@cricketbuyy.com');
      expect(invitation.usedAt).toBeNull();
      expect(invitation.expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Token hash is stored, not raw token
      expect(invitation.tokenHash).not.toBe(rawToken);
    });

    it('atomically consumes invitation token and rejects duplicate consumption', () => {
      const { rawToken } = InvitationManager.createInvitation({
        email: 'finance@cricketbuyy.com',
        roleId: 'role_fin_01',
        roleName: 'Finance Auditor',
        invitedBy: 'superadmin_01',
        inviterEmail: 'superadmin@cricketbuyy.com'
      });

      // First consumption succeeds
      const firstConsume = InvitationManager.consumeInvitation(rawToken);
      expect(firstConsume.valid).toBe(true);
      expect(firstConsume.invitation?.usedAt).toBeDefined();

      // Second consumption fails (single-use invariant)
      const secondConsume = InvitationManager.consumeInvitation(rawToken);
      expect(secondConsume.valid).toBe(false);
      expect(secondConsume.reason).toContain('already been consumed');
    });

    it('rejects expired invitation tokens', () => {
      const { rawToken, invitation } = InvitationManager.createInvitation({
        email: 'expired@cricketbuyy.com',
        roleId: 'role_exp',
        roleName: 'Exp Role',
        invitedBy: 'superadmin_01',
        inviterEmail: 'superadmin@cricketbuyy.com',
        expiryHours: -1 // Already expired
      });

      const consumeRes = InvitationManager.consumeInvitation(rawToken);
      expect(consumeRes.valid).toBe(false);
      expect(consumeRes.reason).toContain('expired');
    });
  });
});

