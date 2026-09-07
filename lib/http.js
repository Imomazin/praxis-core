// lib/http.js
// Small helpers for the serverless handlers: JSON bodies, cookies, responses.

import cookie from 'cookie';

export const SESSION_COOKIE = 'praxis_session';
export const SESSION_TTL_DAYS = 30;

// Parse a JSON request body. @vercel/node usually pre-parses req.body, but we
// handle both the parsed-object and raw-stream cases so this also works under
// plain Node.
export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

export function getCookies(req) {
  return cookie.parse(req.headers?.cookie || '');
}

export function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    })
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(SESSION_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  );
}

export function json(res, status, payload) {
  res.status(status).json(payload);
}

// Wrap a handler so thrown errors become clean JSON responses and the method
// is validated up front.
export function handler(methods, fn) {
  const allowed = Array.isArray(methods) ? methods : [methods];
  return async (req, res) => {
    if (!allowed.includes(req.method)) {
      res.setHeader('Allow', allowed.join(', '));
      return json(res, 405, { error: `Method ${req.method} not allowed` });
    }
    try {
      await fn(req, res);
    } catch (err) {
      const status = err.statusCode || 500;
      if (status >= 500) console.error(err);
      json(res, status, { error: err.publicMessage || 'Internal server error' });
    }
  };
}

export function httpError(statusCode, publicMessage) {
  const err = new Error(publicMessage);
  err.statusCode = statusCode;
  err.publicMessage = publicMessage;
  return err;
}
