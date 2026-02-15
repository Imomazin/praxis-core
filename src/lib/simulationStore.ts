/**
 * Simulation Persistence Store
 *
 * Tracks simulations and checkpoints for analytics and recovery.
 * Uses Supabase when configured, falls back to in-memory storage.
 *
 * Design principles:
 * - Supabase is OPTIONAL: code works if supabase === null
 * - Writes are deliberate: not every tick, only key lifecycle points
 * - Lightweight: checkpoints store metrics, not full state
 */

import type { GameState } from '@/domain/engine/types';
import type { Run } from '@/domain/engine/runs';
import {
  getServerClient,
  isSupabaseConfigured,
  type Simulation,
  type SimulationCheckpoint,
  type CheckpointType,
  type CheckpointMetrics,
  type SimulationStatus,
  type Json,
} from './supabase';

// =============================================================================
// IN-MEMORY FALLBACK STORES
// =============================================================================

const simulationStore = new Map<string, Simulation>();
const checkpointStore = new Map<string, SimulationCheckpoint>();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a unique checkpoint ID
 */
function generateCheckpointId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `chk_${timestamp}_${random}`;
}

/**
 * Extract lightweight metrics from a game state
 */
export function extractMetrics(state: GameState): CheckpointMetrics {
  return {
    cash: state.company.cash,
    revenue: state.company.revenue,
    costs: state.company.costs,
    profit: state.company.profit,
    totalScore: state.scorecard.totalScore,
    brandTrust: state.company.brandTrust,
    compliancePosture: state.company.compliancePosture,
    productQuality: state.company.productQuality,
    operationalRisk: state.risk.operational,
    regulatoryRisk: state.risk.regulatory,
    reputationalRisk: state.risk.reputational,
  };
}

/**
 * Extract metrics from a run (aggregate across teams)
 */
export function extractRunMetrics(run: Run): CheckpointMetrics {
  const scores = run.teams.map(t => t.score).filter(s => s > 0);
  return {
    totalScore: scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0,
    teamsActive: run.teams.filter(t => t.status === 'active').length,
    decisionsSubmitted: run.teams.filter(t => t.decisionsSubmitted).length,
  };
}

/**
 * Create a simulation record from a run
 */
export function runToSimulation(run: Run): Simulation {
  return {
    id: run.runId,
    name: run.name,
    scenarioKey: run.config.scenarioKey,
    seed: run.seed,
    status: run.status as SimulationStatus,
    config: run.config as unknown as Record<string, unknown>,
    teamCount: run.teams.length,
    maxRounds: run.config.maxRounds,
    currentRound: run.currentRound,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
  };
}

// =============================================================================
// SUPABASE OPERATIONS - SIMULATIONS
// =============================================================================

async function saveSimulationToSupabase(simulation: Simulation): Promise<void> {
  const supabase = getServerClient();

  const { error } = await supabase
    .from('simulations')
    .upsert(
      {
        id: simulation.id,
        name: simulation.name,
        scenario_key: simulation.scenarioKey,
        seed: simulation.seed,
        status: simulation.status,
        config: simulation.config as Json,
        team_count: simulation.teamCount,
        max_rounds: simulation.maxRounds,
        current_round: simulation.currentRound,
        updated_at: new Date().toISOString(),
        started_at: simulation.startedAt,
        completed_at: simulation.completedAt,
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Supabase save simulation error:', error);
    throw new Error(`Failed to save simulation: ${error.message}`);
  }
}

async function loadSimulationFromSupabase(id: string): Promise<Simulation | null> {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Supabase load simulation error:', error);
    throw new Error(`Failed to load simulation: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    scenarioKey: data.scenario_key,
    seed: data.seed,
    status: data.status as SimulationStatus,
    config: data.config as Record<string, unknown>,
    teamCount: data.team_count,
    maxRounds: data.max_rounds,
    currentRound: data.current_round,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    startedAt: data.started_at ?? undefined,
    completedAt: data.completed_at ?? undefined,
  };
}

async function listSimulationsFromSupabase(status?: SimulationStatus): Promise<Simulation[]> {
  const supabase = getServerClient();

  let query = supabase
    .from('simulations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase list simulations error:', error);
    throw new Error(`Failed to list simulations: ${error.message}`);
  }

  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    scenarioKey: row.scenario_key,
    seed: row.seed,
    status: row.status as SimulationStatus,
    config: row.config as Record<string, unknown>,
    teamCount: row.team_count,
    maxRounds: row.max_rounds,
    currentRound: row.current_round,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  }));
}

async function deleteSimulationFromSupabase(id: string): Promise<void> {
  const supabase = getServerClient();

  // Checkpoints are deleted via CASCADE
  const { error } = await supabase
    .from('simulations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete simulation error:', error);
    throw new Error(`Failed to delete simulation: ${error.message}`);
  }
}

// =============================================================================
// SUPABASE OPERATIONS - CHECKPOINTS
// =============================================================================

async function saveCheckpointToSupabase(checkpoint: SimulationCheckpoint): Promise<void> {
  const supabase = getServerClient();

  const { error } = await supabase
    .from('simulation_runs')
    .insert({
      id: checkpoint.id,
      simulation_id: checkpoint.simulationId,
      run_id: checkpoint.runId,
      team_id: checkpoint.teamId,
      round: checkpoint.round,
      checkpoint_type: checkpoint.checkpointType,
      metrics: checkpoint.metrics as Json,
      state_snapshot: checkpoint.stateSnapshot as Json,
      triggered_by: checkpoint.triggeredBy,
      notes: checkpoint.notes,
    });

  if (error) {
    console.error('Supabase save checkpoint error:', error);
    throw new Error(`Failed to save checkpoint: ${error.message}`);
  }
}

async function getCheckpointsFromSupabase(
  simulationId: string,
  options?: { teamId?: string; checkpointType?: CheckpointType; limit?: number }
): Promise<SimulationCheckpoint[]> {
  const supabase = getServerClient();

  let query = supabase
    .from('simulation_runs')
    .select('*')
    .eq('simulation_id', simulationId)
    .order('created_at', { ascending: false });

  if (options?.teamId) {
    query = query.eq('team_id', options.teamId);
  }
  if (options?.checkpointType) {
    query = query.eq('checkpoint_type', options.checkpointType);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase get checkpoints error:', error);
    throw new Error(`Failed to get checkpoints: ${error.message}`);
  }

  return (data ?? []).map(row => ({
    id: row.id,
    simulationId: row.simulation_id,
    runId: row.run_id,
    teamId: row.team_id ?? undefined,
    round: row.round,
    checkpointType: row.checkpoint_type as CheckpointType,
    metrics: row.metrics as CheckpointMetrics,
    stateSnapshot: row.state_snapshot as Record<string, unknown> | undefined,
    triggeredBy: row.triggered_by ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  }));
}

async function getLatestCheckpointFromSupabase(
  simulationId: string,
  teamId?: string
): Promise<SimulationCheckpoint | null> {
  const checkpoints = await getCheckpointsFromSupabase(simulationId, { teamId, limit: 1 });
  return checkpoints[0] ?? null;
}

// =============================================================================
// IN-MEMORY OPERATIONS
// =============================================================================

async function saveSimulationToMemory(simulation: Simulation): Promise<void> {
  simulationStore.set(simulation.id, JSON.parse(JSON.stringify(simulation)));
}

async function loadSimulationFromMemory(id: string): Promise<Simulation | null> {
  const sim = simulationStore.get(id);
  return sim ? JSON.parse(JSON.stringify(sim)) : null;
}

async function listSimulationsFromMemory(status?: SimulationStatus): Promise<Simulation[]> {
  let results = Array.from(simulationStore.values());
  if (status) {
    results = results.filter(s => s.status === status);
  }
  return results
    .map(s => JSON.parse(JSON.stringify(s)))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

async function deleteSimulationFromMemory(id: string): Promise<void> {
  simulationStore.delete(id);
  // Also delete related checkpoints
  const keysToDelete: string[] = [];
  checkpointStore.forEach((checkpoint, key) => {
    if (checkpoint.simulationId === id) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => checkpointStore.delete(key));
}

async function saveCheckpointToMemory(checkpoint: SimulationCheckpoint): Promise<void> {
  checkpointStore.set(checkpoint.id, JSON.parse(JSON.stringify(checkpoint)));
}

async function getCheckpointsFromMemory(
  simulationId: string,
  options?: { teamId?: string; checkpointType?: CheckpointType; limit?: number }
): Promise<SimulationCheckpoint[]> {
  let results = Array.from(checkpointStore.values())
    .filter(c => c.simulationId === simulationId);

  if (options?.teamId) {
    results = results.filter(c => c.teamId === options.teamId);
  }
  if (options?.checkpointType) {
    results = results.filter(c => c.checkpointType === options.checkpointType);
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (options?.limit) {
    results = results.slice(0, options.limit);
  }

  return results.map(c => JSON.parse(JSON.stringify(c)));
}

async function getLatestCheckpointFromMemory(
  simulationId: string,
  teamId?: string
): Promise<SimulationCheckpoint | null> {
  const checkpoints = await getCheckpointsFromMemory(simulationId, { teamId, limit: 1 });
  return checkpoints[0] ?? null;
}

// =============================================================================
// PUBLIC API - SIMULATION REGISTRY
// =============================================================================

/**
 * Save or update a simulation record
 */
export async function saveSimulation(simulation: Simulation): Promise<void> {
  if (isSupabaseConfigured()) {
    return saveSimulationToSupabase(simulation);
  }
  return saveSimulationToMemory(simulation);
}

/**
 * Load a simulation by ID
 */
export async function loadSimulation(id: string): Promise<Simulation | null> {
  if (isSupabaseConfigured()) {
    return loadSimulationFromSupabase(id);
  }
  return loadSimulationFromMemory(id);
}

/**
 * List all simulations, optionally filtered by status
 */
export async function listSimulations(status?: SimulationStatus): Promise<Simulation[]> {
  if (isSupabaseConfigured()) {
    return listSimulationsFromSupabase(status);
  }
  return listSimulationsFromMemory(status);
}

/**
 * Delete a simulation and all its checkpoints
 */
export async function deleteSimulation(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    return deleteSimulationFromSupabase(id);
  }
  return deleteSimulationFromMemory(id);
}

// =============================================================================
// PUBLIC API - CHECKPOINTS
// =============================================================================

/**
 * Create a checkpoint for a simulation
 */
export async function createCheckpoint(
  simulationId: string,
  runId: string,
  checkpointType: CheckpointType,
  options: {
    teamId?: string;
    round: number;
    metrics: CheckpointMetrics;
    stateSnapshot?: Record<string, unknown>;
    triggeredBy?: string;
    notes?: string;
  }
): Promise<SimulationCheckpoint> {
  const checkpoint: SimulationCheckpoint = {
    id: generateCheckpointId(),
    simulationId,
    runId,
    teamId: options.teamId,
    round: options.round,
    checkpointType,
    metrics: options.metrics,
    stateSnapshot: options.stateSnapshot,
    triggeredBy: options.triggeredBy,
    notes: options.notes,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    await saveCheckpointToSupabase(checkpoint);
  } else {
    await saveCheckpointToMemory(checkpoint);
  }

  return checkpoint;
}

/**
 * Get checkpoints for a simulation
 */
export async function getCheckpoints(
  simulationId: string,
  options?: { teamId?: string; checkpointType?: CheckpointType; limit?: number }
): Promise<SimulationCheckpoint[]> {
  if (isSupabaseConfigured()) {
    return getCheckpointsFromSupabase(simulationId, options);
  }
  return getCheckpointsFromMemory(simulationId, options);
}

/**
 * Get the latest checkpoint for a simulation (or team)
 */
export async function getLatestCheckpoint(
  simulationId: string,
  teamId?: string
): Promise<SimulationCheckpoint | null> {
  if (isSupabaseConfigured()) {
    return getLatestCheckpointFromSupabase(simulationId, teamId);
  }
  return getLatestCheckpointFromMemory(simulationId, teamId);
}

// =============================================================================
// HIGH-LEVEL PERSISTENCE HELPERS
// =============================================================================

/**
 * Record simulation creation
 * Call when a new run is created
 */
export async function recordSimulationCreated(run: Run): Promise<void> {
  const simulation = runToSimulation(run);
  await saveSimulation(simulation);

  await createCheckpoint(run.runId, run.runId, 'simulation_created', {
    round: run.currentRound,
    metrics: extractRunMetrics(run),
    triggeredBy: 'system',
  });
}

/**
 * Record simulation started
 * Call when run transitions to 'active'
 */
export async function recordSimulationStarted(run: Run): Promise<void> {
  const simulation = runToSimulation(run);
  await saveSimulation(simulation);

  await createCheckpoint(run.runId, run.runId, 'simulation_started', {
    round: run.currentRound,
    metrics: extractRunMetrics(run),
    triggeredBy: 'facilitator',
  });
}

/**
 * Record round completion
 * Call after advanceRound() for a team
 */
export async function recordRoundComplete(
  run: Run,
  teamId: string,
  gameState: GameState
): Promise<void> {
  // Update simulation with latest round
  const simulation = runToSimulation(run);
  await saveSimulation(simulation);

  await createCheckpoint(run.runId, run.runId, 'round_complete', {
    teamId,
    round: gameState.round,
    metrics: extractMetrics(gameState),
    triggeredBy: 'engine',
  });
}

/**
 * Record simulation paused
 */
export async function recordSimulationPaused(run: Run): Promise<void> {
  const simulation = runToSimulation(run);
  await saveSimulation(simulation);

  await createCheckpoint(run.runId, run.runId, 'simulation_paused', {
    round: run.currentRound,
    metrics: extractRunMetrics(run),
    triggeredBy: 'facilitator',
  });
}

/**
 * Record simulation resumed
 */
export async function recordSimulationResumed(run: Run): Promise<void> {
  const simulation = runToSimulation(run);
  await saveSimulation(simulation);

  await createCheckpoint(run.runId, run.runId, 'simulation_resumed', {
    round: run.currentRound,
    metrics: extractRunMetrics(run),
    triggeredBy: 'facilitator',
  });
}

/**
 * Record simulation completed
 */
export async function recordSimulationCompleted(run: Run): Promise<void> {
  const simulation = runToSimulation(run);
  await saveSimulation(simulation);

  await createCheckpoint(run.runId, run.runId, 'simulation_completed', {
    round: run.currentRound,
    metrics: extractRunMetrics(run),
    triggeredBy: 'engine',
  });
}

/**
 * Record team joined
 */
export async function recordTeamJoined(run: Run, teamId: string, teamName: string): Promise<void> {
  const simulation = runToSimulation(run);
  await saveSimulation(simulation);

  await createCheckpoint(run.runId, run.runId, 'team_joined', {
    teamId,
    round: run.currentRound,
    metrics: { teamsActive: run.teams.length },
    triggeredBy: teamName,
  });
}

/**
 * Get storage mode for debugging
 */
export function getSimulationStorageMode(): 'supabase' | 'memory' {
  return isSupabaseConfigured() ? 'supabase' : 'memory';
}
