# Praxis Core

Leadership simulation platform.

- **Frontend:** static site in [`public/`](public/) (no bundler — plain HTML/CSS/JS).
- **Backend:** Vercel serverless functions in [`api/`](api/).
- **Database:** Neon PostgreSQL, accessed only from the server via
  [`@neondatabase/serverless`](https://github.com/neondatabase/serverless).
- **Simulation engines:** [`simulations/`](simulations/) and [`engine/`](engine/).

## Architecture

```
public/            Static frontend (served as the web root)
api/               Serverless functions
  auth/            register, login, logout, me
  simulations.js   list the catalog
  runs.js          list / create runs
  run.js           run detail
  decide.js        apply a round's decisions + advance (DB-backed)
  advance.js       advance a run one round (DB-backed)
lib/               Server-only helpers (db, http, auth, catalog)
engine/            Generic simulation state + decision engine
db/migrations/     SQL migrations (idempotent)
scripts/           migrate / seed / build helpers
```

Persistence is database-backed: simulation runs (state, round, score) live in
`simulation_runs`, and login uses persistent, database-backed sessions
(`auth_sessions`) rather than in-memory state.

## Environment variables

Server-side only — never exposed to the browser. Set locally in `.env`
(git-ignored; copy from [`.env.example`](.env.example)) and in the Vercel
project settings for deployment.

| Variable         | Required | Purpose                                                      |
| ---------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_URL`   | yes      | Neon PostgreSQL connection string (use the `-pooler` host).  |
| `SESSION_SECRET` | yes      | Secret used to derive/verify session tokens. 32+ random bytes. |

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Setup

```bash
npm install

# Copy env template and fill in DATABASE_URL + SESSION_SECRET
cp .env.example .env

# Create/upgrade schema, then seed the simulation catalog
npm run migrate
npm run seed

# Local build check
npm run build
```

Migrations are idempotent and safe to run against the existing database (which
already contains `simulations` and `simulation_runs`). Run them from an
environment that can reach Neon (your machine or CI) — the connection uses TLS
on port 5432 / the Neon HTTPS SQL endpoint.

## Deploying to Vercel

1. Add `DATABASE_URL` and `SESSION_SECRET` to the Vercel project
   (Settings → Environment Variables, all environments).
2. Deploy. Vercel installs dependencies, serves `public/` statically, and
   compiles `api/**` to serverless functions.
3. Run `npm run migrate && npm run seed` once against the production database
   (locally with the production `DATABASE_URL`, or from CI).
