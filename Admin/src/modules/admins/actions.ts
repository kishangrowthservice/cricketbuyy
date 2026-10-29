'use server';

import { z } from 'zod';
import { createSecureAction } from '../../core/actions/secure-action';
import { db } from '../../core/db/client';
import { admins, adminRoles, roles } from '../../core/db/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../../core/errors/app-error';
import { ErrorCode } from '../../core/errors/codes';
import { hashPassword } from '../../core/auth/hash';
import { SessionManager } from '../../core/auth/session-manager';
import { OutboxDispatcher } from '../../core/events/outbox';

// 1. Create Admin Account Action
export const createAdminAccountAction = createSecureAction({
  actionName: 'admin.create',
  permission: 'admin:create',
  schema: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(8),
    roleId: z.string().uuid()
  }),
  auditMetadata: (input, result) => ({
    resourceType: 'admin_account',
    resourceId: result.adminId,
    afterState: { email: input.email, name: input.name, roleId: input.roleId }
  }),
  handler: async (input, ctx) => {
    const existing = await db
      .select()
      .from(admins)
      .where(eq(admins.email, input.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new AppError({
        code: ErrorCode.CONFLICT_STATE,
        safeMessage: `Administrator with email '${input.email}' already exists`
      });
    }

    const passwordHash = await hashPassword(input.password);

    const [newAdmin] = await db
      .insert(admins)
      .values({
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash,
        status: 'ACTIVE',
        isSuperAdmin: false
      })
      .returning();

    if (!newAdmin) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        safeMessage: 'Failed to create administrator record'
      });
    }

    // Assign role
    await db.insert(adminRoles).values({
      adminId: newAdmin.id,
      roleId: input.roleId,
      assignedBy: ctx.actor.id
    });

    await OutboxDispatcher.recordEvent('ADMIN_CREATED', {
      adminId: newAdmin.id,
      email: newAdmin.email,
      assignedBy: ctx.actor.id
    });

    return { success: true, adminId: newAdmin.id, email: newAdmin.email };
  }
});

// 2. Update Admin Status Action (e.g. Suspend/Active)
export const updateAdminStatusAction = createSecureAction({
  actionName: 'admin.update_status',
  permission: 'admin:update',
  schema: z.object({
    adminId: z.string().uuid(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  }),
  auditMetadata: (input) => ({
    resourceType: 'admin_account',
    resourceId: input.adminId,
    afterState: { status: input.status }
  }),
  handler: async (input, ctx) => {
    // Prevent self-suspension
    if (input.adminId === ctx.actor.id && input.status === 'SUSPENDED') {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        safeMessage: 'You cannot suspend your own administrative account'
      });
    }

    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, input.adminId))
      .limit(1);

    if (!admin) {
      throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Admin not found' });
    }

    if (admin.isSuperAdmin && !ctx.actor.isSuperAdmin) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        safeMessage: 'Only root Super Admins can alter status of other Super Admins'
      });
    }

    await db
      .update(admins)
      .set({ status: input.status, updatedAt: new Date() })
      .where(eq(admins.id, input.adminId));

    // If suspended, immediately revoke all active sessions
    if (input.status === 'SUSPENDED') {
      await SessionManager.revokeAllAdminSessions(input.adminId);
    }

    return { success: true, adminId: input.adminId, status: input.status };
  }
});

// 3. Reset Admin 2FA Action (Lockout recovery)
export const resetAdmin2faAction = createSecureAction({
  actionName: 'admin.reset_2fa',
  permission: 'admin:update',
  schema: z.object({
    adminId: z.string().uuid()
  }),
  auditMetadata: (input) => ({
    resourceType: 'admin_account',
    resourceId: input.adminId,
    afterState: { twoFactorEnabled: false }
  }),
  handler: async (input, ctx) => {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, input.adminId))
      .limit(1);

    if (!admin) {
      throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Admin not found' });
    }

    if (admin.isSuperAdmin && !ctx.actor.isSuperAdmin) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        safeMessage: 'Only Super Admins can reset credentials for other Super Admins'
      });
    }

    await db
      .update(admins)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        updatedAt: new Date()
      })
      .where(eq(admins.id, input.adminId));

    await SessionManager.revokeAllAdminSessions(input.adminId);

    return { success: true, adminId: input.adminId };
  }
});

