/**
 * State Persistence Store
 *
 * Provides storage for game state. Uses Supabase when configured,
 * falls back to in-memory storage for development/demo.
 */

import type { GameState } from '@/domain/engine/types';
import { getServerClient, isSupabaseConfigured, gameStateToJson, jsonToGameState } from './supabase';

// =============================================================================
// IN-MEMORY FALLBACK
// =============================================================================

const memoryStore = new Map<string, GameState>();

function getKey(runId: string, teamId: string): string {
  return `${runId}:${teamId}`;
}

// =============================================================================
// SUPABASE OPERATIONS
// =============================================================================

async function saveToSupabase(state: GameState): Promise<void> {
  const supabase = getServerClient();
  const id = getKey(state.runId, state.teamId);

  const { error } = await supabase
    .from('game_states')
    .upsert(
      {
        id,
        run_id: state.runId,
        team_id: state.teamId,
        state: gameStateToJson(state),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Supabase save error:', error);
    throw new Error(`Failed to save game state: ${error.message}`);
  }
}

async function loadFromSupabase(
  runId: string,
  teamId: string
): Promise<GameState | null> {
  const supabase = getServerClient();
  const id = getKey(runId, teamId);

  const { data, error } = await supabase
    .from('game_states')
    .select('state')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - not an error, just no data
      return null;
    }
    console.error('Supabase load error:', error);
    throw new Error(`Failed to load game state: ${error.message}`);
  }

  return data?.state ? jsonToGameState(data.state) : null;
}

async function deleteFromSupabase(runId: string, teamId: string): Promise<void> {
  const supabase = getServerClient();
  const id = getKey(runId, teamId);

  const { error } = await supabase
    .from('game_states')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete game state: ${error.message}`);
  }
}

async function listFromSupabase(): Promise<GameState[]> {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from('game_states')
    .select('state')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Supabase list error:', error);
    throw new Error(`Failed to list game states: ${error.message}`);
  }

  return (data ?? []).map(row => jsonToGameState(row.state));
}

async function existsInSupabase(runId: string, teamId: string): Promise<boolean> {
  const supabase = getServerClient();
  const id = getKey(runId, teamId);

  const { count, error } = await supabase
    .from('game_states')
    .select('id', { count: 'exact', head: true })
    .eq('id', id);

  if (error) {
    console.error('Supabase exists error:', error);
    throw new Error(`Failed to check game state existence: ${error.message}`);
  }

  return (count ?? 0) > 0;
}

// =============================================================================
// IN-MEMORY OPERATIONS
// =============================================================================

async function saveToMemory(state: GameState): Promise<void> {
  const key = getKey(state.runId, state.teamId);
  memoryStore.set(key, JSON.parse(JSON.stringify(state)));
}

async function loadFromMemory(
  runId: string,
  teamId: string
): Promise<GameState | null> {
  const key = getKey(runId, teamId);
  const state = memoryStore.get(key);
  return state ? JSON.parse(JSON.stringify(state)) : null;
}

async function deleteFromMemory(runId: string, teamId: string): Promise<void> {
  const key = getKey(runId, teamId);
  memoryStore.delete(key);
}

async function listFromMemory(): Promise<GameState[]> {
  return Array.from(memoryStore.values()).map(s => JSON.parse(JSON.stringify(s)));
}

async function existsInMemory(runId: string, teamId: string): Promise<boolean> {
  const key = getKey(runId, teamId);
  return memoryStore.has(key);
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Save game state to storage
 */
export async function saveGameState(state: GameState): Promise<void> {
  if (isSupabaseConfigured()) {
    return saveToSupabase(state);
  }
  return saveToMemory(state);
}

/**
 * Load game state from storage
 */
export async function loadGameState(
  runId: string,
  teamId: string
): Promise<GameState | null> {
  if (isSupabaseConfigured()) {
    return loadFromSupabase(runId, teamId);
  }
  return loadFromMemory(runId, teamId);
}

/**
 * Delete game state from storage
 */
export async function deleteGameState(
  runId: string,
  teamId: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    return deleteFromSupabase(runId, teamId);
  }
  return deleteFromMemory(runId, teamId);
}

/**
 * List all game states (for facilitator view)
 */
export async function listGameStates(): Promise<GameState[]> {
  if (isSupabaseConfigured()) {
    return listFromSupabase();
  }
  return listFromMemory();
}

/**
 * Check if a game state exists
 */
export async function gameStateExists(
  runId: string,
  teamId: string
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    return existsInSupabase(runId, teamId);
  }
  return existsInMemory(runId, teamId);
}

/**
 * Get or create game state
 */
export async function getOrCreateGameState(
  runId: string,
  teamId: string,
  createFn: () => GameState
): Promise<GameState> {
  const existing = await loadGameState(runId, teamId);
  if (existing) {
    return existing;
  }

  const newState = createFn();
  await saveGameState(newState);
  return newState;
}

/**
 * Get the current storage mode
 */
export function getStorageMode(): 'supabase' | 'memory' {
  return isSupabaseConfigured() ? 'supabase' : 'memory';
}
