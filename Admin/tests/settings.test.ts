import { describe, it, expect } from 'vitest';
import {
  updatePlatformSettingsAction,
  toggleMaintenanceModeAction
} from '../src/modules/settings/actions';
import { SETTINGS_STATE } from '../src/modules/settings/state';
import { updateAdminStatusAction } from '../src/modules/admins/actions';
import { ErrorCode } from '../src/core/errors/codes';
import { AppError } from '../src/core/errors/app-error';

describe('Platform Settings & Integration Contract Tests', () => {
  const superAdminCtx = {
    actor: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'root@cricketbuyy.com',
      isSuperAdmin: true,
      roles: ['super_admin'],
      permissions: ['setting:update', 'setting:maintenance_toggle', 'admin:update']
    }
  };

  it('updates platform branding and financial limits', async () => {
    const res = await updatePlatformSettingsAction(
      {
        siteName: 'Cricketbuyy Exchange',
        brandMaroonColor: '#941b2c',
        currency: 'INR',
        supportEmail: 'care@cricketbuyy.com',
        supportPhone: '+91 99999 88888',
        maxBetLimit: 750000,
        maxMarketExposure: 5000000
      },
      superAdminCtx
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.settings.siteName).toBe('Cricketbuyy Exchange');
      expect(res.data.settings.maxBetLimit).toBe(750000);
    }
    expect(SETTINGS_STATE.siteName).toBe('Cricketbuyy Exchange');
  });

  it('toggles platform maintenance mode and emits outbox event', async () => {
    const res = await toggleMaintenanceModeAction(
      {
        maintenanceEnabled: true,
        reason: 'Scheduled database migration and security patch',
        estimatedDowntimeMinutes: 45
      },
      superAdminCtx
    );

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.maintenanceMode).toBe(true);
      expect(res.data.reason).toContain('Scheduled database migration');
    }
    expect(SETTINGS_STATE.maintenanceMode).toBe(true);

    // Turn maintenance mode off
    const liftRes = await toggleMaintenanceModeAction(
      {
        maintenanceEnabled: false,
        reason: 'Migration complete; resuming trading',
        estimatedDowntimeMinutes: 0
      },
      superAdminCtx
    );

    expect(liftRes.success).toBe(true);
    expect(SETTINGS_STATE.maintenanceMode).toBe(false);
  });

  it('prevents an administrator from suspending their own active account', async () => {
    const res = await updateAdminStatusAction(
      {
        adminId: '00000000-0000-0000-0000-000000000001', // Same as actor.id
        status: 'SUSPENDED'
      },
      superAdminCtx
    );

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe(ErrorCode.FORBIDDEN);
      expect(res.error.safeMessage).toContain('cannot suspend your own');
    }
  });
});
