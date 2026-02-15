-- Praxis Simulation Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- =============================================================================
-- GAME STATES TABLE
-- Stores individual team game states within simulation runs
-- =============================================================================

CREATE TABLE IF NOT EXISTS game_states (
  id TEXT PRIMARY KEY,                    -- Format: "{runId}:{teamId}"
  run_id TEXT NOT NULL,                   -- Reference to parent run
  team_id TEXT NOT NULL,                  -- Team identifier
  state JSONB NOT NULL,                   -- Full GameState object
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by run
CREATE INDEX IF NOT EXISTS idx_game_states_run_id ON game_states(run_id);

-- Index for querying by team within a run
CREATE INDEX IF NOT EXISTS idx_game_states_run_team ON game_states(run_id, team_id);

-- Index for sorting by update time
CREATE INDEX IF NOT EXISTS idx_game_states_updated ON game_states(updated_at DESC);

-- =============================================================================
-- RUNS TABLE
-- Stores simulation run configurations and metadata
-- =============================================================================

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,                    -- Same as run_id for simplicity
  run_id TEXT NOT NULL UNIQUE,            -- Unique run identifier
  data JSONB NOT NULL,                    -- Full Run object
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sorting by creation time
CREATE INDEX IF NOT EXISTS idx_runs_created ON runs(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (Optional - enable after adding auth)
-- =============================================================================

-- Enable RLS (commented out until auth is implemented)
-- ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

-- Example policies (uncomment and modify after adding auth):
--
-- -- Allow authenticated users to read all data
-- CREATE POLICY "Allow authenticated read" ON game_states
--   FOR SELECT TO authenticated USING (true);
--
-- CREATE POLICY "Allow authenticated read" ON runs
--   FOR SELECT TO authenticated USING (true);
--
-- -- Allow facilitators to modify data (requires a facilitators table or role check)
-- CREATE POLICY "Allow facilitators to modify" ON game_states
--   FOR ALL TO authenticated
--   USING (auth.jwt() ->> 'role' = 'facilitator')
--   WITH CHECK (auth.jwt() ->> 'role' = 'facilitator');

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to game_states
DROP TRIGGER IF EXISTS update_game_states_updated_at ON game_states;
CREATE TRIGGER update_game_states_updated_at
  BEFORE UPDATE ON game_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply the trigger to runs
DROP TRIGGER IF EXISTS update_runs_updated_at ON runs;
CREATE TRIGGER update_runs_updated_at
  BEFORE UPDATE ON runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- USEFUL VIEWS (Optional)
-- =============================================================================

-- View for active runs with team counts
CREATE OR REPLACE VIEW active_runs_summary AS
SELECT
  r.run_id,
  r.data->>'name' as name,
  r.data->>'status' as status,
  r.data->'config'->>'scenarioKey' as scenario,
  (r.data->>'currentRound')::int as current_round,
  jsonb_array_length(r.data->'teams') as team_count,
  r.created_at,
  r.updated_at
FROM runs r
WHERE r.data->>'status' IN ('setup', 'active', 'paused')
ORDER BY r.updated_at DESC;

-- View for leaderboard data
CREATE OR REPLACE VIEW run_leaderboards AS
SELECT
  gs.run_id,
  gs.team_id,
  gs.state->>'teamId' as team_name,
  (gs.state->'scorecard'->>'totalScore')::int as score,
  (gs.state->'company'->>'cash')::numeric as cash,
  (gs.state->'company'->>'revenue')::numeric as revenue,
  (gs.state->'company'->>'brandTrust')::int as brand_trust,
  gs.updated_at
FROM game_states gs
ORDER BY gs.run_id, (gs.state->'scorecard'->>'totalScore')::int DESC;
