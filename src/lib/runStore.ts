/**
 * Run Persistence Store
 *
 * Storage for simulation runs (facilitator-managed sessions).
 * Uses Supabase when configured, falls back to in-memory storage for development.
 */

import type { Run } from '@/domain/engine/runs';
import type { GameState } from '@/domain/engine/types';
import {
  getServerClient,
  isSupabaseConfigured,
  runToJson,
  jsonToRun,
  gameStateToJson,
  jsonToGameState,
} from './supabase';

// =============================================================================
// IN-MEMORY FALLBACK
// =============================================================================

const runStore = new Map<string, Run>();
const teamGameStates = new Map<string, GameState>();

function getTeamStateKey(runId: string, teamId: string): string {
  return `${runId}:${teamId}`;
}

// =============================================================================
// SUPABASE OPERATIONS - RUNS
// =============================================================================

async function saveRunToSupabase(run: Run): Promise<void> {
  const supabase = getServerClient();

  const { error } = await supabase
    .from('runs')
    .upsert(
      {
        id: run.runId,
        run_id: run.runId,
        data: runToJson(run),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Supabase save run error:', error);
    throw new Error(`Failed to save run: ${error.message}`);
  }
}

async function loadRunFromSupabase(runId: string): Promise<Run | null> {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from('runs')
    .select('data')
    .eq('run_id', runId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Supabase load run error:', error);
    throw new Error(`Failed to load run: ${error.message}`);
  }

  return data?.data ? jsonToRun(data.data) : null;
}

async function deleteRunFromSupabase(runId: string): Promise<void> {
  const supabase = getServerClient();

  // Delete all team game states for this run first
  const { error: statesError } = await supabase
    .from('game_states')
    .delete()
    .eq('run_id', runId);

  if (statesError) {
    console.error('Supabase delete team states error:', statesError);
    throw new Error(`Failed to delete team states: ${statesError.message}`);
  }

  // Then delete the run
  const { error } = await supabase
    .from('runs')
    .delete()
    .eq('run_id', runId);

  if (error) {
    console.error('Supabase delete run error:', error);
    throw new Error(`Failed to delete run: ${error.message}`);
  }
}

async function listRunsFromSupabase(): Promise<Run[]> {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from('runs')
    .select('data')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase list runs error:', error);
    throw new Error(`Failed to list runs: ${error.message}`);
  }

  return (data ?? []).map(row => jsonToRun(row.data));
}

async function runExistsInSupabase(runId: string): Promise<boolean> {
  const supabase = getServerClient();

  const { count, error } = await supabase
    .from('runs')
    .select('id', { count: 'exact', head: true })
    .eq('run_id', runId);

  if (error) {
    console.error('Supabase run exists error:', error);
    throw new Error(`Failed to check run existence: ${error.message}`);
  }

  return (count ?? 0) > 0;
}

// =============================================================================
// SUPABASE OPERATIONS - TEAM GAME STATES
// =============================================================================

async function saveTeamGameStateToSupabase(
  runId: string,
  teamId: string,
  state: GameState
): Promise<void> {
  const supabase = getServerClient();
  const id = getTeamStateKey(runId, teamId);

  const { error } = await supabase
    .from('game_states')
    .upsert(
      {
        id,
        run_id: runId,
        team_id: teamId,
        state: gameStateToJson(state),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Supabase save team state error:', error);
    throw new Error(`Failed to save team game state: ${error.message}`);
  }
}

async function loadTeamGameStateFromSupabase(
  runId: string,
  teamId: string
): Promise<GameState | null> {
  const supabase = getServerClient();
  const id = getTeamStateKey(runId, teamId);

  const { data, error } = await supabase
    .from('game_states')
    .select('state')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Supabase load team state error:', error);
    throw new Error(`Failed to load team game state: ${error.message}`);
  }

  return data?.state ? jsonToGameState(data.state) : null;
}

async function deleteTeamGameStateFromSupabase(
  runId: string,
  teamId: string
): Promise<void> {
  const supabase = getServerClient();
  const id = getTeamStateKey(runId, teamId);

  const { error } = await supabase
    .from('game_states')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete team state error:', error);
    throw new Error(`Failed to delete team game state: ${error.message}`);
  }
}

async function getRunTeamStatesFromSupabase(runId: string): Promise<GameState[]> {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from('game_states')
    .select('state')
    .eq('run_id', runId);

  if (error) {
    console.error('Supabase get team states error:', error);
    throw new Error(`Failed to get run team states: ${error.message}`);
  }

  return (data ?? []).map(row => jsonToGameState(row.state));
}

// =============================================================================
// IN-MEMORY OPERATIONS - RUNS
// =============================================================================

async function saveRunToMemory(run: Run): Promise<void> {
  runStore.set(run.runId, JSON.parse(JSON.stringify(run)));
}

async function loadRunFromMemory(runId: string): Promise<Run | null> {
  const run = runStore.get(runId);
  return run ? JSON.parse(JSON.stringify(run)) : null;
}

async function deleteRunFromMemory(runId: string): Promise<void> {
  runStore.delete(runId);
  // Also delete all team game states for this run
  const keysToDelete: string[] = [];
  teamGameStates.forEach((_, key) => {
    if (key.startsWith(`${runId}:`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => teamGameStates.delete(key));
}

async function listRunsFromMemory(): Promise<Run[]> {
  return Array.from(runStore.values())
    .map(r => JSON.parse(JSON.stringify(r)))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function runExistsInMemory(runId: string): Promise<boolean> {
  return runStore.has(runId);
}

// =============================================================================
// IN-MEMORY OPERATIONS - TEAM GAME STATES
// =============================================================================

async function saveTeamGameStateToMemory(
  runId: string,
  teamId: string,
  state: GameState
): Promise<void> {
  const key = getTeamStateKey(runId, teamId);
  teamGameStates.set(key, JSON.parse(JSON.stringify(state)));
}

async function loadTeamGameStateFromMemory(
  runId: string,
  teamId: string
): Promise<GameState | null> {
  const key = getTeamStateKey(runId, teamId);
  const state = teamGameStates.get(key);
  return state ? JSON.parse(JSON.stringify(state)) : null;
}

async function deleteTeamGameStateFromMemory(
  runId: string,
  teamId: string
): Promise<void> {
  const key = getTeamStateKey(runId, teamId);
  teamGameStates.delete(key);
}

async function getRunTeamStatesFromMemory(runId: string): Promise<GameState[]> {
  const states: GameState[] = [];
  teamGameStates.forEach((state, key) => {
    if (key.startsWith(`${runId}:`)) {
      states.push(JSON.parse(JSON.stringify(state)));
    }
  });
  return states;
}

// =============================================================================
// PUBLIC API - RUN STORAGE
// =============================================================================

/**
 * Save a run to storage
 */
export async function saveRun(run: Run): Promise<void> {
  if (isSupabaseConfigured()) {
    return saveRunToSupabase(run);
  }
  return saveRunToMemory(run);
}

/**
 * Load a run from storage
 */
export async function loadRun(runId: string): Promise<Run | null> {
  if (isSupabaseConfigured()) {
    return loadRunFromSupabase(runId);
  }
  return loadRunFromMemory(runId);
}

/**
 * Delete a run from storage
 */
export async function deleteRun(runId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    return deleteRunFromSupabase(runId);
  }
  return deleteRunFromMemory(runId);
}

/**
 * List all runs
 */
export async function listRuns(): Promise<Run[]> {
  if (isSupabaseConfigured()) {
    return listRunsFromSupabase();
  }
  return listRunsFromMemory();
}

/**
 * Check if a run exists
 */
export async function runExists(runId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return runExistsInSupabase(runId);
  }
  return runExistsInMemory(runId);
}

// =============================================================================
// PUBLIC API - TEAM GAME STATE STORAGE
// =============================================================================

/**
 * Save a team's game state
 */
export async function saveTeamGameState(
  runId: string,
  teamId: string,
  state: GameState
): Promise<void> {
  if (isSupabaseConfigured()) {
    return saveTeamGameStateToSupabase(runId, teamId, state);
  }
  return saveTeamGameStateToMemory(runId, teamId, state);
}

/**
 * Load a team's game state
 */
export async function loadTeamGameState(
  runId: string,
  teamId: string
): Promise<GameState | null> {
  if (isSupabaseConfigured()) {
    return loadTeamGameStateFromSupabase(runId, teamId);
  }
  return loadTeamGameStateFromMemory(runId, teamId);
}

/**
 * Delete a team's game state
 */
export async function deleteTeamGameState(
  runId: string,
  teamId: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    return deleteTeamGameStateFromSupabase(runId, teamId);
  }
  return deleteTeamGameStateFromMemory(runId, teamId);
}

/**
 * Get all team game states for a run
 */
export async function getRunTeamStates(runId: string): Promise<GameState[]> {
  if (isSupabaseConfigured()) {
    return getRunTeamStatesFromSupabase(runId);
  }
  return getRunTeamStatesFromMemory(runId);
}

/**
 * Get team state with run context
 */
export async function getTeamStateWithRun(
  runId: string,
  teamId: string
): Promise<{ run: Run | null; gameState: GameState | null }> {
  const run = await loadRun(runId);
  const gameState = await loadTeamGameState(runId, teamId);
  return { run, gameState };
}

// =============================================================================
// PUBLIC API - AGGREGATE QUERIES
// =============================================================================

/**
 * Get run statistics
 */
export async function getRunStats(runId: string): Promise<{
  teamsCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  decisionsSubmitted: number;
  currentRound: number;
} | null> {
  const run = await loadRun(runId);
  if (!run) return null;

  const scores = run.teams.map(t => t.score).filter(s => s > 0);
  const submitted = run.teams.filter(t => t.decisionsSubmitted).length;

  return {
    teamsCount: run.teams.length,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    highestScore: scores.length > 0 ? Math.max(...scores) : 0,
    lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    decisionsSubmitted: submitted,
    currentRound: run.currentRound,
  };
}

/**
 * Get comparative data for all teams in a run
 */
export async function getRunComparison(runId: string): Promise<{
  teams: Array<{
    teamId: string;
    teamName: string;
    score: number;
    revenue: number;
    brandTrust: number;
    cash: number;
    rank: number;
  }>;
} | null> {
  const run = await loadRun(runId);
  if (!run) return null;

  const teamData: Array<{
    teamId: string;
    teamName: string;
    score: number;
    revenue: number;
    brandTrust: number;
    cash: number;
    rank: number;
  }> = [];

  for (const team of run.teams) {
    const state = await loadTeamGameState(runId, team.teamId);
    if (state) {
      teamData.push({
        teamId: team.teamId,
        teamName: team.name,
        score: state.scorecard.totalScore,
        revenue: state.company.revenue,
        brandTrust: state.company.brandTrust,
        cash: state.company.cash,
        rank: 0,
      });
    }
  }

  // Calculate ranks
  teamData.sort((a, b) => b.score - a.score);
  teamData.forEach((t, i) => (t.rank = i + 1));

  return { teams: teamData };
}
