// POST /api/auth/register
// Creates a user (optionally with a new organisation), assigns a role, opens a
// persistent session, and returns the authenticated user.

import { sql } from '../../lib/db.js';
import { hashPassword, createSession } from '../../lib/auth.js';
import { handler, readJson, setSessionCookie, json, httpError } from '../../lib/http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugify(name) {
  const base = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'org';
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

export default handler('POST', async (req, res) => {
  const body = await readJson(req);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const fullName = body.fullName ? String(body.fullName).trim() : null;
  const organisationName = body.organisationName ? String(body.organisationName).trim() : null;

  if (!EMAIL_RE.test(email)) throw httpError(400, 'A valid email is required');
  if (password.length < 8) throw httpError(400, 'Password must be at least 8 characters');

  const passwordHash = await hashPassword(password);
  const orgSlug = organisationName ? slugify(organisationName) : null;
  // Org creators become admins; solo sign-ups are participants.
  const roleKey = organisationName ? 'admin' : 'participant';

  let rows;
  try {
    rows = await sql`
      with new_org as (
        insert into organisations (name, slug)
        select ${organisationName}, ${orgSlug}
        where ${organisationName}::text is not null
        returning id
      ),
      new_user as (
        insert into users (organisation_id, email, password_hash, full_name)
        values ((select id from new_org), ${email}, ${passwordHash}, ${fullName})
        returning id, email, full_name, organisation_id
      ),
      new_membership as (
        insert into memberships (user_id, organisation_id, role_id)
        select nu.id, nu.organisation_id, r.id
        from new_user nu
        join roles r on r.key = ${roleKey}
        returning id
      )
      select id, email, full_name, organisation_id from new_user
    `;
  } catch (err) {
    if (err.code === '23505') throw httpError(409, 'An account with that email already exists');
    throw err;
  }

  const user = rows[0];
  const token = await createSession(user.id, req);
  setSessionCookie(res, token);

  json(res, 201, {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      organisationId: user.organisation_id,
      role: roleKey,
    },
  });
});
