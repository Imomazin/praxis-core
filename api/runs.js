// /api/runs
//   GET  -> list the current user's simulation runs
//   POST -> create a new run for a simulation ({ simulationSlug } or { simulationId })

import { sql } from '../lib/db.js';
import { requireUser } from '../lib/auth.js';
import { handler, readJson, json, httpError } from '../lib/http.js';
import { createInitialState, computeScore } from '../engine/state.js';

export default handler(['GET', 'POST'], async (req, res) => {
  const user = await requireUser(req);

  if (req.method === 'GET') {
    const rows = await sql`
      select r.id, r.simulation_id, r.status, r.current_round, r.score,
             r.created_at, r.updated_at,
             s.slug as simulation_slug, s.name as simulation_name
      from simulation_runs r
      join simulations s on s.id = r.simulation_id
      where r.user_id = ${user.id}
      order by r.updated_at desc
      limit 100
    `;
    return json(res, 200, { runs: rows });
  }

  // POST -> create
  const body = await readJson(req);
  const slug = body.simulationSlug ? String(body.simulationSlug) : null;
  const simulationId = body.simulationId ? String(body.simulationId) : null;
  if (!slug && !simulationId) throw httpError(400, 'simulationSlug or simulationId is required');

  const sims = slug
    ? await sql`select id, slug, name from simulations where slug = ${slug} limit 1`
    : await sql`select id, slug, name from simulations where id = ${simulationId} limit 1`;
  const sim = sims[0];
  if (!sim) throw httpError(404, 'Simulation not found');

  const state = createInitialState();
  const score = computeScore(state);

  const rows = await sql`
    insert into simulation_runs (simulation_id, user_id, state, status, current_round, score)
    values (${sim.id}, ${user.id}, ${JSON.stringify(state)}, 'in_progress', ${state.round}, ${score})
    returning id, simulation_id, status, current_round, score, created_at, updated_at
  `;

  json(res, 201, {
    run: { ...rows[0], simulation_slug: sim.slug, simulation_name: sim.name, state },
  });
});
