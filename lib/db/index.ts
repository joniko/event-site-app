import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use direct connection (port 5432) instead of pooler (port 6543) for better performance in development
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;

// Create postgres client
const client = postgres(connectionString, {
  prepare: false,
  max: 1, // Supabase pooler requires max: 1 for serverless
  ssl: 'require', // Supabase requires SSL
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;
export * from './schema';
