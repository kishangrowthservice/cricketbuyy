import { text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { adminSchema, admins } from './admins';

export const sessions = adminSchema.table('sessions', {
  id: text('id').primaryKey(), // Session token / hash
  adminId: uuid('admin_id').references(() => admins.id, { onDelete: 'cascade' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  stepUpUntil: timestamp('step_up_until', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
