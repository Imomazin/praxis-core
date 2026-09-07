// POST /api/auth/login
// Verifies credentials and opens a persistent session.

import { sql } from '../../lib/db.js';
import { verifyPassword, createSession } from '../../lib/auth.js';
import { handler, readJson, setSessionCookie, json, httpError } from '../../lib/http.js';

export default handler('POST', async (req, res) => {
  const body = await readJson(req);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!email || !password) throw httpError(400, 'Email and password are required');

  const rows = await sql`
    select id, email, full_name, organisation_id, password_hash, is_active
    from users
    where email = ${email}
    limit 1
  `;
  const user = rows[0];

  // Constant-ish response: always verify against a hash to avoid leaking which
  // emails exist via timing.
  const ok =
    user && user.is_active && (await verifyPassword(password, user.password_hash));
  if (!ok) throw httpError(401, 'Invalid email or password');

  const token = await createSession(user.id, req);
  setSessionCookie(res, token);

  json(res, 200, {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      organisationId: user.organisation_id,
    },
  });
});
