import { uuid, varchar, text, boolean, integer, jsonb, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { adminSchema, admins } from './admins';

export const roles = adminSchema.table('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  isSystem: boolean('is_system').default(false).notNull(), // true for super_admin, admin
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const permissions = adminSchema.table('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  action: varchar('action', { length: 100 }).notNull().unique(), // e.g. customer:read, market:settle
  resource: varchar('resource', { length: 100 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const rolePermissions = adminSchema.table('role_permissions', {
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id, { onDelete: 'cascade' }).notNull(),
  scope: varchar('scope', { length: 50 }).default('all').notNull(), // 'all', 'team', 'own'
  fieldMask: jsonb('field_mask').$type<string[]>(), // masked fields for this permission
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  primaryKey({ columns: [table.roleId, table.permissionId] })
]);

export const adminRoles = adminSchema.table('admin_roles', {
  adminId: uuid('admin_id').references(() => admins.id, { onDelete: 'cascade' }).notNull(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  assignedBy: uuid('assigned_by').references(() => admins.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  primaryKey({ columns: [table.adminId, table.roleId] })
]);

export const approvalRequests = adminSchema.table('approval_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  requesterId: uuid('requester_id').references(() => admins.id, { onDelete: 'cascade' }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  resourceId: text('resource_id'),
  payload: jsonb('payload').notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(), // PENDING, APPROVED, REJECTED, EXPIRED
  reviewerId: uuid('reviewer_id').references(() => admins.id),
  rejectionReason: text('rejection_reason'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true })
});

