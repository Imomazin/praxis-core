/**
 * Supabase Database Types
 *
 * TypeScript types for the Supabase database schema.
 * These types are used by the Supabase client for type-safe queries.
 */

import type { GameState } from '@/domain/engine/types';
import type { Run } from '@/domain/engine/runs';

// =============================================================================
// JSON TYPE FOR SUPABASE
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =============================================================================
// DATABASE SCHEMA TYPES
// =============================================================================

export interface Database {
  public: {
    Tables: {
      game_states: {
        Row: {
          id: string;
          run_id: string;
          team_id: string;
          state: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          team_id: string;
          state: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          team_id?: string;
          state?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      runs: {
        Row: {
          id: string;
          run_id: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// =============================================================================
// HELPER TYPES
// =============================================================================

export type GameStateRow = Database['public']['Tables']['game_states']['Row'];
export type GameStateInsert = Database['public']['Tables']['game_states']['Insert'];
export type GameStateUpdate = Database['public']['Tables']['game_states']['Update'];

export type RunRow = Database['public']['Tables']['runs']['Row'];
export type RunInsert = Database['public']['Tables']['runs']['Insert'];
export type RunUpdate = Database['public']['Tables']['runs']['Update'];

// =============================================================================
// SIMULATION TRACKING TYPES
// =============================================================================

/**
 * Simulation status values
 */
export type SimulationStatus = 'setup' | 'active' | 'paused' | 'completed';

/**
 * Checkpoint types for simulation_runs
 */
export type CheckpointType =
  | 'simulation_created'
  | 'simulation_started'
  | 'round_complete'
  | 'simulation_paused'
  | 'simulation_resumed'
  | 'simulation_completed'
  | 'team_joined'
  | 'decision_submitted';

/**
 * Simulation record (registry of all simulations)
 */
export interface Simulation {
  id: string;
  name: string;
  scenarioKey: string;
  seed: number;
  status: SimulationStatus;
  config: Record<string, unknown>;
  teamCount: number;
  maxRounds: number;
  currentRound: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Metrics snapshot for checkpoints (lightweight)
 */
export interface CheckpointMetrics {
  // Financial
  cash?: number;
  revenue?: number;
  costs?: number;
  profit?: number;

  // Performance
  totalScore?: number;
  brandTrust?: number;
  compliancePosture?: number;
  productQuality?: number;

  // Risk
  operationalRisk?: number;
  regulatoryRisk?: number;
  reputationalRisk?: number;

  // Progress
  decisionsSubmitted?: number;
  teamsActive?: number;
}

/**
 * Simulation run checkpoint record
 */
export interface SimulationCheckpoint {
  id: string;
  simulationId: string;
  runId: string;
  teamId?: string;
  round: number;
  checkpointType: CheckpointType;
  metrics: CheckpointMetrics;
  stateSnapshot?: Record<string, unknown>;
  triggeredBy?: string;
  notes?: string;
  createdAt: string;
}

// =============================================================================
// TYPE CASTING HELPERS
// =============================================================================

/**
 * Cast a GameState to Json for storage
 */
export function gameStateToJson(state: GameState): Json {
  return state as unknown as Json;
}

/**
 * Cast Json to GameState for retrieval
 */
export function jsonToGameState(json: Json): GameState {
  return json as unknown as GameState;
}

/**
 * Cast a Run to Json for storage
 */
export function runToJson(run: Run): Json {
  return run as unknown as Json;
}

/**
 * Cast Json to Run for retrieval
 */
export function jsonToRun(json: Json): Run {
  return json as unknown as Run;
}
