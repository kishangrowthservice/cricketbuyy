import { uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { adminSchema, admins } from './admins';

export const auditLogs = adminSchema.table('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id').references(() => admins.id),
  actorEmail: varchar('actor_email', { length: 255 }).notNull(),
  actorRole: varchar('actor_role', { length: 100 }),
  action: varchar('action', { length: 100 }).notNull(), // e.g. customer.balance_adjust
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  resourceId: text('resource_id'),
  beforeState: jsonb('before_state'),
  afterState: jsonb('after_state'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  prevHash: text('prev_hash'), // SHA-256 of the previous audit log entry
  entryHash: text('entry_hash').notNull(), // SHA-256 of this entry + prevHash
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

