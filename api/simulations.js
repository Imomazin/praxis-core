// GET /api/simulations
// Lists the simulation catalog from the database (requires auth).

import { sql } from '../lib/db.js';
import { requireUser } from '../lib/auth.js';
import { handler, json } from '../lib/http.js';

export default handler('GET', async (req, res) => {
  await requireUser(req);

  const rows = await sql`
    select id, slug, name, description, category
    from simulations
    where slug is not null
    order by name asc
  `;

  json(res, 200, { simulations: rows });
});
