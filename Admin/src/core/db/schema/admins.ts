import { pgSchema, uuid, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const adminSchema = pgSchema('admin');

export const admins = adminSchema.table('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  twoFactorSecret: text('two_factor_secret'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(), // ACTIVE, SUSPENDED, LOCKED
  failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  version: integer('version').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;

