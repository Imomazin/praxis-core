-- Praxis Core schema (production baseline)
--
-- Idempotent: safe to run against a database that already contains the
-- original `simulations` and `simulation_runs` tables. New tables use
-- `create table if not exists`; existing tables are extended with
-- `alter table ... add column if not exists`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Organisations
-- ---------------------------------------------------------------------------
create table if not exists organisations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Roles (static lookup)
-- ---------------------------------------------------------------------------
create table if not exists roles (
  id          serial primary key,
  key         text unique not null,
  name        text not null,
  description text
);

insert into roles (key, name, description) values
  ('admin',       'Administrator', 'Full administrative access within an organisation'),
  ('facilitator', 'Facilitator',   'Creates and runs training sessions'),
  ('participant', 'Participant',   'Takes part in simulation sessions')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id) on delete set null,
  email           text unique not null,
  password_hash   text not null,
  full_name       text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_users_organisation on users(organisation_id);

-- ---------------------------------------------------------------------------
-- Memberships (a user's role inside an organisation)
-- ---------------------------------------------------------------------------
create table if not exists memberships (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  organisation_id uuid references organisations(id) on delete cascade,
  role_id         integer not null references roles(id),
  created_at      timestamptz not null default now(),
  unique (user_id, organisation_id, role_id)
);
create index if not exists idx_memberships_user on memberships(user_id);
create index if not exists idx_memberships_org on memberships(organisation_id);

-- ---------------------------------------------------------------------------
-- Auth sessions (persistent login; replaces in-memory / placeholder auth)
-- The cookie carries a random token; only its HMAC/hash is stored here.
-- ---------------------------------------------------------------------------
create table if not exists auth_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  token_hash text unique not null,
  user_agent text,
  ip         text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists idx_auth_sessions_user on auth_sessions(user_id);
create index if not exists idx_auth_sessions_expires on auth_sessions(expires_at);

-- ---------------------------------------------------------------------------
-- Facilitators (profile linking a user to an organisation as a facilitator)
-- ---------------------------------------------------------------------------
create table if not exists facilitators (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  organisation_id uuid references organisations(id) on delete cascade,
  title           text,
  created_at      timestamptz not null default now(),
  unique (user_id, organisation_id)
);

-- ---------------------------------------------------------------------------
-- Simulations catalog (extend the pre-existing table)
-- ---------------------------------------------------------------------------
create table if not exists simulations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz default now()
);
alter table simulations add column if not exists slug       text;
alter table simulations add column if not exists category   text;
alter table simulations add column if not exists updated_at timestamptz not null default now();
create unique index if not exists idx_simulations_slug on simulations(slug);

-- ---------------------------------------------------------------------------
-- Training sessions (a facilitated instance of a simulation)
-- ---------------------------------------------------------------------------
create table if not exists training_sessions (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id) on delete cascade,
  simulation_id   uuid references simulations(id) on delete set null,
  facilitator_id  uuid references facilitators(id) on delete set null,
  name            text not null,
  status          text not null default 'scheduled',
  scheduled_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_training_sessions_org on training_sessions(organisation_id);
create index if not exists idx_training_sessions_sim on training_sessions(simulation_id);

-- ---------------------------------------------------------------------------
-- Participants
-- ---------------------------------------------------------------------------
create table if not exists participants (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid references organisations(id) on delete cascade,
  user_id         uuid references users(id) on delete set null,
  display_name    text,
  email           text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_participants_org on participants(organisation_id);

-- ---------------------------------------------------------------------------
-- Session participants (join: training_sessions <-> participants)
-- ---------------------------------------------------------------------------
create table if not exists session_participants (
  id                  uuid primary key default gen_random_uuid(),
  training_session_id uuid not null references training_sessions(id) on delete cascade,
  participant_id      uuid not null references participants(id) on delete cascade,
  joined_at           timestamptz not null default now(),
  unique (training_session_id, participant_id)
);

-- ---------------------------------------------------------------------------
-- Simulation runs (extend the pre-existing table)
-- ---------------------------------------------------------------------------
create table if not exists simulation_runs (
  id            uuid primary key default gen_random_uuid(),
  simulation_id uuid references simulations(id) on delete cascade,
  state         jsonb not null,
  created_at    timestamptz default now()
);
alter table simulation_runs add column if not exists user_id             uuid references users(id) on delete set null;
alter table simulation_runs add column if not exists training_session_id uuid references training_sessions(id) on delete set null;
alter table simulation_runs add column if not exists participant_id      uuid references participants(id) on delete set null;
alter table simulation_runs add column if not exists status              text not null default 'in_progress';
alter table simulation_runs add column if not exists current_round       integer not null default 0;
alter table simulation_runs add column if not exists score               integer;
alter table simulation_runs add column if not exists updated_at          timestamptz not null default now();
create index if not exists idx_simulation_runs_user on simulation_runs(user_id);
create index if not exists idx_simulation_runs_session on simulation_runs(training_session_id);
