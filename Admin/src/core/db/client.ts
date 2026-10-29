import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

// Use single instance connection pool
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === 'production' ? 10 : 2,
  idle_timeout: 20,
  connect_timeout: 10
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
