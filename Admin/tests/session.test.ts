import { describe, it, expect } from 'vitest';
import { SessionManager, SESSION_CONFIG } from '../src/core/auth/session-manager';

describe('Admin Hardened Session Engine Tests', () => {
  it('enforces host-only cookie naming convention', () => {
    expect(SESSION_CONFIG.COOKIE_NAME).toBe('__Host-admin-session');
  });

  it('generates 256-bit cryptographic session tokens', () => {
    const id1 = SessionManager.generateSessionId();
    const id2 = SessionManager.generateSessionId();

    expect(id1).toBeDefined();
    expect(id1.length).toBe(64); // 32 bytes hex
    expect(id2.length).toBe(64);
    expect(id1).not.toBe(id2);
  });

  it('evaluates step-up authentication validity correctly', () => {
    // Unset or null
    expect(SessionManager.isStepUpActive(null)).toBe(false);
    expect(SessionManager.isStepUpActive(undefined)).toBe(false);

    // Active in future
    const futureDate = new Date(Date.now() + 5 * 60 * 1000);
    expect(SessionManager.isStepUpActive(futureDate)).toBe(true);

    // Expired in past
    const pastDate = new Date(Date.now() - 1000);
    expect(SessionManager.isStepUpActive(pastDate)).toBe(false);
  });
});
