// server/db.ts
import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema'; // adjust path if needed

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // extra safety for local:
  ssl: false,
});

export const db = drizzle({ client: pool, schema });
