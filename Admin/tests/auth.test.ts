import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../src/core/auth/hash';

describe('Authentication & Password Hashing Engine', () => {
  it('should hash a password and generate valid salt + key', async () => {
    const password = 'SecureAdminPassword123!';
    const hash = await hashPassword(password);

    expect(hash).toContain(':');
    const [salt, key] = hash.split(':');
    expect(salt).toBeDefined();
    expect(key).toBeDefined();
    expect(salt?.length).toBe(32); // 16 bytes hex
  });

  it('should verify correct password successfully', async () => {
    const password = 'CorrectPassword999';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);

    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'CorrectPassword999';
    const wrongPassword = 'WrongPassword000';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(wrongPassword, hash);

    expect(isValid).toBe(false);
  });
});
