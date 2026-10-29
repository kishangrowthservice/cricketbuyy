'use server';

import { z } from 'zod';
import { createSecureAction } from '../../core/actions/secure-action';
import { OutboxDispatcher } from '../../core/events/outbox';
import { SETTINGS_STATE, type PlatformSettings } from './state';

export type { PlatformSettings };


// 1. Update Platform Settings Action
export const updatePlatformSettingsAction = createSecureAction({
  actionName: 'setting.update',
  permission: 'setting:update',
  schema: z.object({
    siteName: z.string().min(2),
    brandMaroonColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    currency: z.string().default('INR'),
    supportEmail: z.string().email(),
    supportPhone: z.string().min(8),
    maxBetLimit: z.number().positive(),
    maxMarketExposure: z.number().positive()
  }),
  auditMetadata: (input) => ({
    resourceType: 'platform_settings',
    afterState: input
  }),
  handler: async (input) => {
    Object.assign(SETTINGS_STATE, input);

    await OutboxDispatcher.recordEvent('SETTINGS_UPDATED', {
      siteName: input.siteName,
      maxBetLimit: input.maxBetLimit,
      maxMarketExposure: input.maxMarketExposure
    });

    return { success: true, settings: SETTINGS_STATE };
  }
});

// 2. Toggle Site Maintenance Mode Action (Integration Contract with Main Site)
export const toggleMaintenanceModeAction = createSecureAction({
  actionName: 'setting.maintenance_toggle',
  permission: 'setting:maintenance_toggle',
  schema: z.object({
    maintenanceEnabled: z.boolean(),
    reason: z.string().min(5),
    estimatedDowntimeMinutes: z.number().int().min(0).max(1440).default(30)
  }),
  auditMetadata: (input) => ({
    resourceType: 'maintenance_mode',
    afterState: {
      maintenanceEnabled: input.maintenanceEnabled,
      reason: input.reason,
      estimatedDowntimeMinutes: input.estimatedDowntimeMinutes
    }
  }),
  handler: async (input, ctx) => {
    SETTINGS_STATE.maintenanceMode = input.maintenanceEnabled;
    SETTINGS_STATE.maintenanceReason = input.maintenanceEnabled ? input.reason : null;

    // Dispatch outbox event to notify main customer website
    await OutboxDispatcher.recordEvent('MAINTENANCE_MODE_CHANGED', {
      maintenanceEnabled: input.maintenanceEnabled,
      reason: input.reason,
      estimatedDowntimeMinutes: input.estimatedDowntimeMinutes,
      triggeredBy: ctx.actor.email,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      maintenanceMode: SETTINGS_STATE.maintenanceMode,
      reason: SETTINGS_STATE.maintenanceReason
    };
  }
});
