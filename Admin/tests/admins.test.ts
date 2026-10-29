import { describe, it, expect, vi } from 'vitest';
import {
  createAdminAccountAction,
  updateAdminStatusAction,
  resetAdmin2faAction
} from '../src/modules/admins/actions';
import { ErrorCode } from '../src/core/errors/codes';

describe('Staff Administration & Account Security Tests', () => {
  const superAdminCtx = {
    actor: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'root@cricketbuyy.com',
      isSuperAdmin: true,
      roles: ['super_admin'],
      permissions: ['admin:create', 'admin:update', 'admin:read', 'admin:delete']
    }
  };

  const restrictedStaffCtx = {
    actor: {
      id: '00000000-0000-0000-0000-000000000099',
      email: 'viewer@cricketbuyy.com',
      isSuperAdmin: false,
      roles: ['support_agent'],
      permissions: ['customer:read']
    }
  };

  it('rejects admin account creation if actor lacks admin:create permission', async () => {
    const res = await createAdminAccountAction(
      {
        name: 'New Officer',
        email: 'officer@cricketbuyy.com',
        password: 'Password123!',
        roleId: '00000000-0000-0000-0000-000000000010'
      },
      restrictedStaffCtx
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe(ErrorCode.FORBIDDEN);
    }
  });

  it('rejects invalid password format during admin provisioning', async () => {
    const res = await createAdminAccountAction(
      {
        name: 'Short Password Admin',
        email: 'short@cricketbuyy.com',
        password: '123', // less than 8 chars
        roleId: '00000000-0000-0000-0000-000000000010'
      },
      superAdminCtx
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe(ErrorCode.VALIDATION_FAILED);
    }
  });

  it('prohibits self-suspension by any active administrator', async () => {
    const res = await updateAdminStatusAction(
      {
        adminId: '00000000-0000-0000-0000-000000000001', // self
        status: 'SUSPENDED'
      },
      superAdminCtx
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe(ErrorCode.FORBIDDEN);
      expect(res.error.safeMessage).toMatch(/cannot suspend your own/i);
    }
  });

  it('rejects 2FA reset attempt by unauthorized staff', async () => {
    const res = await resetAdmin2faAction(
      {
        adminId: '00000000-0000-0000-0000-000000000002'
      },
      restrictedStaffCtx
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe(ErrorCode.FORBIDDEN);
    }
  });
});
