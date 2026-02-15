-- Simulation Tracking Schema
-- Adds tables for tracking simulations and run checkpoints
-- Run this after 001_initial_schema.sql

-- =============================================================================
-- SIMULATIONS TABLE
-- Registry of all simulations created (lightweight metadata)
-- =============================================================================

CREATE TABLE IF NOT EXISTS simulations (
  id TEXT PRIMARY KEY,                    -- Unique simulation ID
  name TEXT NOT NULL,                     -- Human-readable name
  scenario_key TEXT NOT NULL DEFAULT 'praxis-assist',
  seed INTEGER NOT NULL,                  -- RNG seed for reproducibility
  status TEXT NOT NULL DEFAULT 'setup',   -- setup | active | paused | completed
  config JSONB NOT NULL DEFAULT '{}',     -- RunConfig object
  team_count INTEGER NOT NULL DEFAULT 0,  -- Number of teams
  max_rounds INTEGER NOT NULL DEFAULT 8,
  current_round INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,                 -- When status changed to 'active'
  completed_at TIMESTAMPTZ                -- When status changed to 'completed'
);

-- Index for listing active simulations
CREATE INDEX IF NOT EXISTS idx_simulations_status ON simulations(status);

-- Index for sorting by creation/update time
CREATE INDEX IF NOT EXISTS idx_simulations_created ON simulations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulations_updated ON simulations(updated_at DESC);

-- =============================================================================
-- SIMULATION_RUNS TABLE
-- Checkpoints/snapshots at key lifecycle points (not every tick)
-- =============================================================================

CREATE TABLE IF NOT EXISTS simulation_runs (
  id TEXT PRIMARY KEY,                    -- Unique checkpoint ID
  simulation_id TEXT NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL,                   -- Facilitator run ID
  team_id TEXT,                           -- Team ID (null for run-level checkpoints)
  round INTEGER NOT NULL,                 -- Round number at checkpoint
  checkpoint_type TEXT NOT NULL,          -- Type of checkpoint (see below)

  -- Metrics snapshot (lightweight, not full state)
  metrics JSONB NOT NULL DEFAULT '{}',    -- Key metrics at this point

  -- Optional detailed snapshot
  state_snapshot JSONB,                   -- Condensed state if needed

  -- Metadata
  triggered_by TEXT,                      -- What triggered this checkpoint
  notes TEXT,                             -- Optional facilitator notes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkpoint types:
-- 'simulation_created' - Initial creation
-- 'simulation_started' - Transitioned to active
-- 'round_complete'     - A round was completed
-- 'simulation_paused'  - Paused by facilitator
-- 'simulation_resumed' - Resumed from pause
-- 'simulation_completed' - Final completion
-- 'team_joined'        - Team joined the simulation
-- 'decision_submitted' - Team submitted decisions (optional, can be noisy)

-- Index for querying by simulation
CREATE INDEX IF NOT EXISTS idx_simulation_runs_sim_id ON simulation_runs(simulation_id);

-- Index for querying by run and team
CREATE INDEX IF NOT EXISTS idx_simulation_runs_run_team ON simulation_runs(run_id, team_id);

-- Index for querying by checkpoint type
CREATE INDEX IF NOT EXISTS idx_simulation_runs_type ON simulation_runs(checkpoint_type);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_simulation_runs_created ON simulation_runs(created_at DESC);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_simulation_runs_sim_round ON simulation_runs(simulation_id, round);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Apply the updated_at trigger to simulations
DROP TRIGGER IF EXISTS update_simulations_updated_at ON simulations;
CREATE TRIGGER update_simulations_updated_at
  BEFORE UPDATE ON simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- USEFUL VIEWS
-- =============================================================================

-- View for simulation dashboard
CREATE OR REPLACE VIEW simulation_overview AS
SELECT
  s.id,
  s.name,
  s.scenario_key,
  s.status,
  s.team_count,
  s.current_round,
  s.max_rounds,
  s.created_at,
  s.started_at,
  s.completed_at,
  (
    SELECT COUNT(*)
    FROM simulation_runs sr
    WHERE sr.simulation_id = s.id
  ) as checkpoint_count,
  (
    SELECT sr.created_at
    FROM simulation_runs sr
    WHERE sr.simulation_id = s.id
    ORDER BY sr.created_at DESC
    LIMIT 1
  ) as last_checkpoint_at
FROM simulations s
ORDER BY s.updated_at DESC;

-- View for checkpoint history
CREATE OR REPLACE VIEW checkpoint_history AS
SELECT
  sr.id,
  sr.simulation_id,
  s.name as simulation_name,
  sr.run_id,
  sr.team_id,
  sr.round,
  sr.checkpoint_type,
  sr.metrics,
  sr.triggered_by,
  sr.created_at
FROM simulation_runs sr
JOIN simulations s ON s.id = sr.simulation_id
ORDER BY sr.created_at DESC;
