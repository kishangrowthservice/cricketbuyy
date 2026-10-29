'use server';

import { z } from 'zod';
import { createSecureAction } from '../../core/actions/secure-action';
import { db } from '../../core/db/client';
import { roles, rolePermissions, adminRoles, permissions } from '../../core/db/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../../core/errors/app-error';
import { ErrorCode } from '../../core/errors/codes';

// 1. Create Custom Role Action
export const createRoleAction = createSecureAction({
  actionName: 'role.create',
  permission: 'role:create',
  schema: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9_-]+$/),
    description: z.string().optional(),
    permissions: z.array(
      z.object({
        action: z.string(),
        scope: z.enum(['all', 'team', 'own']).default('all'),
        fieldMask: z.array(z.string()).optional()
      })
    )
  }),
  auditMetadata: (input, result) => ({
    resourceType: 'role',
    resourceId: result.id,
    afterState: { name: input.name, slug: input.slug, permissionsCount: input.permissions.length }
  }),
  handler: async (input) => {
    // Check if slug already exists
    const [existing] = await db.select().from(roles).where(eq(roles.slug, input.slug)).limit(1);
    if (existing) {
      throw new AppError({
        code: ErrorCode.CONFLICT_STATE,
        safeMessage: `A role with slug '${input.slug}' already exists`
      });
    }

    // Insert Role
    const [newRole] = await db
      .insert(roles)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        isSystem: false,
        version: 1
      })
      .returning();

    if (!newRole) {
      throw new AppError({
        code: ErrorCode.INTERNAL_ERROR,
        safeMessage: 'Failed to create role record'
      });
    }

    // Assign Permissions
    for (const p of input.permissions) {
      const [permRecord] = await db
        .select()
        .from(permissions)
        .where(eq(permissions.action, p.action))
        .limit(1);

      if (permRecord) {
        await db.insert(rolePermissions).values({
          roleId: newRole.id,
          permissionId: permRecord.id,
          scope: p.scope,
          fieldMask: p.fieldMask || null
        });
      }
    }

    return { id: newRole.id, name: newRole.name, slug: newRole.slug };
  }
});

// 2. Update Custom Role Action (with Optimistic Locking)
export const updateRoleAction = createSecureAction({
  actionName: 'role.update',
  permission: 'role:update',
  schema: z.object({
    roleId: z.string().uuid(),
    expectedVersion: z.number().int().positive(),
    name: z.string().min(2).max(100),
    description: z.string().optional(),
    permissions: z.array(
      z.object({
        action: z.string(),
        scope: z.enum(['all', 'team', 'own']).default('all'),
        fieldMask: z.array(z.string()).optional()
      })
    )
  }),
  auditMetadata: (input) => ({
    resourceType: 'role',
    resourceId: input.roleId,
    afterState: { name: input.name, expectedVersion: input.expectedVersion }
  }),
  handler: async (input) => {
    const [currentRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, input.roleId))
      .limit(1);

    if (!currentRole) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        safeMessage: 'Role not found'
      });
    }

    // Optimistic Concurrency Check
    if (currentRole.version !== input.expectedVersion) {
      throw new AppError({
        code: ErrorCode.CONFLICT_VERSION,
        safeMessage: `Role update conflict: data was modified by another administrator (current: v${currentRole.version}, expected: v${input.expectedVersion})`
      });
    }

    // Update Role Record
    const [updatedRole] = await db
      .update(roles)
      .set({
        name: input.name,
        description: input.description,
        version: currentRole.version + 1,
        updatedAt: new Date()
      })
      .where(and(eq(roles.id, input.roleId), eq(roles.version, input.expectedVersion)))
      .returning();

    if (!updatedRole) {
      throw new AppError({
        code: ErrorCode.CONFLICT_VERSION,
        safeMessage: 'Concurrent role modification detected during save'
      });
    }

    // Replace permissions
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, input.roleId));

    for (const p of input.permissions) {
      const [permRecord] = await db
        .select()
        .from(permissions)
        .where(eq(permissions.action, p.action))
        .limit(1);

      if (permRecord) {
        await db.insert(rolePermissions).values({
          roleId: input.roleId,
          permissionId: permRecord.id,
          scope: p.scope,
          fieldMask: p.fieldMask || null
        });
      }
    }

    return { id: updatedRole.id, newVersion: updatedRole.version };
  }
});

// 3. Delete Custom Role Action
export const deleteRoleAction = createSecureAction({
  actionName: 'role.delete',
  permission: 'role:delete',
  schema: z.object({
    roleId: z.string().uuid()
  }),
  auditMetadata: (input) => ({
    resourceType: 'role',
    resourceId: input.roleId
  }),
  handler: async (input) => {
    const [role] = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1);
    if (!role) {
      throw new AppError({ code: ErrorCode.NOT_FOUND, safeMessage: 'Role not found' });
    }

    if (role.isSystem) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        safeMessage: 'System-protected roles cannot be deleted'
      });
    }

    await db.delete(roles).where(eq(roles.id, input.roleId));
    return { deleted: true, roleId: input.roleId };
  }
});

// 4. Assign Role to Admin Action
export const assignAdminRoleAction = createSecureAction({
  actionName: 'role.assign',
  permission: 'role:assign',
  schema: z.object({
    adminId: z.string().uuid(),
    roleId: z.string().uuid(),
    expiresAt: z.string().datetime().optional()
  }),
  auditMetadata: (input) => ({
    resourceType: 'admin_role',
    resourceId: `${input.adminId}:${input.roleId}`,
    afterState: { adminId: input.adminId, roleId: input.roleId, expiresAt: input.expiresAt }
  }),
  handler: async (input, ctx) => {
    await db
      .insert(adminRoles)
      .values({
        adminId: input.adminId,
        roleId: input.roleId,
        assignedBy: ctx.actor.id,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null
      })
      .onConflictDoNothing();

    return { assigned: true, adminId: input.adminId, roleId: input.roleId };
  }
});

