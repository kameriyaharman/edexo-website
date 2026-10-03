// Applies SQL migrations in ./drizzle to DATABASE_URL. Runs on every container start.
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[migrate] DATABASE_URL is not set');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });
try {
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' });
  console.log('[migrate] database is up to date');
} finally {
  await pool.end();
}
