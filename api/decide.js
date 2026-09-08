// POST /api/decide
// Applies a round of decisions to a run, advances time, and persists the new
// state to the database. Body: { runId, decisions }.

import { sql } from '../lib/db.js';
import { requireUser } from '../lib/auth.js';
import { handler, readJson, json, httpError } from '../lib/http.js';
import { advanceTime, computeScore } from '../engine/state.js';
import { applyDecisions } from '../engine/decision-engine.js';

export default handler('POST', async (req, res) => {
  const user = await requireUser(req);
  const body = await readJson(req);
  const runId = body.runId ? String(body.runId) : null;
  const decisions = body.decisions || {};
  if (!runId) throw httpError(400, 'runId is required');
  if (!decisions || typeof decisions !== 'object' || Array.isArray(decisions)) {
    throw httpError(400, 'decisions must be an object');
  }

  const rows = await sql`
    select id, state, status from simulation_runs
    where id = ${runId} and user_id = ${user.id}
    limit 1
  `;
  const run = rows[0];
  if (!run) throw httpError(404, 'Run not found');
  if (run.status !== 'in_progress') throw httpError(409, 'Run is not in progress');

  const state = typeof run.state === 'string' ? JSON.parse(run.state) : run.state;
  applyDecisions(state, decisions);
  advanceTime(state);
  const score = computeScore(state);

  const updated = await sql`
    update simulation_runs
    set state = ${JSON.stringify(state)},
        current_round = ${state.round},
        score = ${score},
        updated_at = now()
    where id = ${runId}
    returning id, simulation_id, status, current_round, score, updated_at
  `;

  json(res, 200, { run: { ...updated[0], state } });
});
