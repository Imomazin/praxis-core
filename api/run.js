// GET /api/run?id=<runId>
// Returns a single run (with full state) owned by the current user.

import { sql } from '../lib/db.js';
import { requireUser } from '../lib/auth.js';
import { handler, json, httpError } from '../lib/http.js';

export default handler('GET', async (req, res) => {
  const user = await requireUser(req);
  const id = req.query?.id;
  if (!id) throw httpError(400, 'id query parameter is required');

  const rows = await sql`
    select r.id, r.simulation_id, r.state, r.status, r.current_round, r.score,
           r.created_at, r.updated_at,
           s.slug as simulation_slug, s.name as simulation_name
    from simulation_runs r
    join simulations s on s.id = r.simulation_id
    where r.id = ${id} and r.user_id = ${user.id}
    limit 1
  `;
  if (!rows[0]) throw httpError(404, 'Run not found');

  json(res, 200, { run: rows[0] });
});
