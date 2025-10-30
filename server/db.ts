// server/db.ts
import 'dotenv/config';
import { Pool } from 'pg';
import { sql } from "drizzle-orm";
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

//check postgres version
export const db = drizzle({ client: pool, schema });

async function main() {
  const r = await db.execute(sql`SELECT version();`);
  console.log(r.rows[0].version);
  await pool.end();
}

main().catch((e) => (console.error(e), process.exit(1)));