import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Disable prefetch as it's not supported for "Transaction" pool mode
const connectionString = process.env.DATABASE_URL!;

// Create postgres client
const client = postgres(connectionString, { prepare: false });

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export types
export type Database = typeof db;
export * from './schema';
