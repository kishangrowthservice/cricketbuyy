import { uuid, varchar, text, jsonb, integer, timestamp } from 'drizzle-orm/pg-core';
import { adminSchema } from './admins';

export const outboxEvents = adminSchema.table('outbox_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: varchar('event_type', { length: 100 }).notNull(), // e.g. customer.suspended
  payload: jsonb('payload').notNull(),
  status: varchar('status', { length: 50 }).default('PENDING').notNull(), // PENDING, DISPATCHED, FAILED
  attempts: integer('attempts').default(0).notNull(),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true })
});

export type OutboxEvent = typeof outboxEvents.$inferSelect;
export type NewOutboxEvent = typeof outboxEvents.$inferInsert;

