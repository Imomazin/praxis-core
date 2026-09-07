// POST /api/auth/logout
// Destroys the current session and clears the cookie.

import { destroySession } from '../../lib/auth.js';
import {
  handler,
  getCookies,
  clearSessionCookie,
  SESSION_COOKIE,
  json,
} from '../../lib/http.js';

export default handler('POST', async (req, res) => {
  const token = getCookies(req)[SESSION_COOKIE];
  await destroySession(token);
  clearSessionCookie(res);
  json(res, 200, { ok: true });
});
