// scripts/seed.js
// Upserts the simulation catalog (lib/catalog.js) into the `simulations` table.
// Idempotent: matched on the unique `slug`.
//
//   npm run seed

import './env.js';
import { neon } from '@neondatabase/serverless';
import { CATALOG } from '../lib/catalog.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env or the environment.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function run() {
  for (const item of CATALOG) {
    await sql`
      insert into simulations (slug, name, description, category)
      values (${item.slug}, ${item.name}, ${item.description}, ${item.category})
      on conflict (slug) do update
        set name = excluded.name,
            description = excluded.description,
            category = excluded.category,
            updated_at = now()
    `;
    console.log(`  upserted ${item.slug}`);
  }
  console.log(`Seeded ${CATALOG.length} simulations.`);
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
