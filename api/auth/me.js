// GET /api/auth/me
// Returns the currently authenticated user (with roles), or 401.

import { sql } from '../../lib/db.js';
import { requireUser } from '../../lib/auth.js';
import { handler, json } from '../../lib/http.js';

export default handler('GET', async (req, res) => {
  const user = await requireUser(req);

  const roleRows = await sql`
    select r.key
    from memberships m
    join roles r on r.id = m.role_id
    where m.user_id = ${user.id}
  `;

  json(res, 200, {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      organisationId: user.organisation_id,
      roles: roleRows.map((r) => r.key),
    },
  });
});
