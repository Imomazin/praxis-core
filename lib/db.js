// lib/db.js
// Server-side Neon PostgreSQL client.
//
// Uses @neondatabase/serverless, the HTTP driver purpose-built for
// serverless/edge runtimes (no long-lived TCP pool to exhaust). This module
// is imported ONLY by files under /api and /scripts. DATABASE_URL is never
// exposed to the browser.

import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Add it to your .env file locally and to the ' +
      'Vercel project environment variables in production.'
  );
}

// `sql` is a tagged-template function: sql`select * from users where id = ${id}`
// Values are always sent as bound parameters, so this is injection-safe.
export const sql = neon(connectionString);
