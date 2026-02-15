/**
 * Supabase Module Exports
 */

export {
  createBrowserClient,
  createServerClient,
  getServerClient,
  isSupabaseConfigured,
} from './client';

export {
  gameStateToJson,
  jsonToGameState,
  runToJson,
  jsonToRun,
} from './types';

export type {
  Database,
  Json,
  GameStateRow,
  GameStateInsert,
  GameStateUpdate,
  RunRow,
  RunInsert,
  RunUpdate,
  SimulationStatus,
  CheckpointType,
  Simulation,
  CheckpointMetrics,
  SimulationCheckpoint,
} from './types';
