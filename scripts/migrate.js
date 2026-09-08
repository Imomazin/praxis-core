// scripts/migrate.js
// Applies every db/migrations/*.sql file (in filename order) against the Neon
// database in DATABASE_URL, tracking applied files in a `_migrations` table.
//
// Migrations are idempotent (create table if not exists / add column if not
// exists), so re-running is safe. Each file runs as a single transaction using
// the Neon WebSocket pool, which supports multi-statement SQL natively.
//
//   npm run migrate

import './env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '..', 'db', 'migrations');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env or the environment.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query(
    'create table if not exists _migrations (filename text primary key, applied_at timestamptz not null default now())'
  );

  const appliedRes = await pool.query('select filename from _migrations');
  const applied = new Set(appliedRes.rows.map((r) => r.filename));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`- skip ${file} (already applied)`);
      continue;
    }
    console.log(`> applying ${file}`);
    const text = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query(text); // multi-statement file, one transaction
      await client.query('insert into _migrations (filename) values ($1)', [file]);
      await client.query('commit');
      console.log('  done');
    } catch (err) {
      await client.query('rollback').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  console.log('Migrations complete.');
}

run()
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
