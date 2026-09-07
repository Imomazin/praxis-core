// lib/auth.js
// Authentication + persistent session management, backed by PostgreSQL.

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { sql } from './db.js';
import {
  SESSION_COOKIE,
  SESSION_TTL_DAYS,
  getCookies,
  httpError,
} from './http.js';

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Derive the value stored in the DB from the raw cookie token. If SESSION_SECRET
// is set we HMAC it (so a leaked DB row cannot be replayed as a cookie); we fall
// back to a plain SHA-256 for local dev where the secret may be unset.
function deriveTokenHash(rawToken) {
  const secret = process.env.SESSION_SECRET;
  if (secret) {
    return crypto.createHmac('sha256', secret).update(rawToken).digest('hex');
  }
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// Create a persistent session for a user and return the raw token for the cookie.
export async function createSession(userId, req) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = deriveTokenHash(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const userAgent = (req.headers?.['user-agent'] || '').slice(0, 500);
  const ip = (
    req.headers?.['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    ''
  ).slice(0, 100);

  await sql`
    insert into auth_sessions (user_id, token_hash, user_agent, ip, expires_at)
    values (${userId}, ${tokenHash}, ${userAgent}, ${ip}, ${expiresAt.toISOString()})
  `;
  return rawToken;
}

export async function destroySession(rawToken) {
  if (!rawToken) return;
  const tokenHash = deriveTokenHash(rawToken);
  await sql`delete from auth_sessions where token_hash = ${tokenHash}`;
}

// Resolve the current user from the session cookie, or null.
export async function getSessionUser(req) {
  const token = getCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const tokenHash = deriveTokenHash(token);
  const rows = await sql`
    select u.id, u.email, u.full_name, u.organisation_id, u.is_active
    from auth_sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${tokenHash}
      and s.expires_at > now()
      and u.is_active = true
    limit 1
  `;
  return rows[0] || null;
}

// Throw a 401 if there is no authenticated user.
export async function requireUser(req) {
  const user = await getSessionUser(req);
  if (!user) throw httpError(401, 'Authentication required');
  return user;
}
