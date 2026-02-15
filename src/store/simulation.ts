'use client';

/**
 * Client-side Zustand Store for Simulation State
 *
 * Manages local UI state and synchronizes with the server.
 */

import { create } from 'zustand';
import type { GameState, Role, RoundDecisions } from '@/domain/engine/types';

interface SimulationStore {
  // State
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  selectedRole: Role | null;
  pendingDecisions: RoundDecisions;
  demoMode: boolean;

  // Actions
  setGameState: (state: GameState) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedRole: (role: Role | null) => void;
  setDecision: (role: Role, decision: unknown) => void;
  clearDecisions: () => void;
  setDemoMode: (demo: boolean) => void;

  // API actions
  initializeGame: (runId?: string, teamId?: string, seed?: number) => Promise<void>;
  fetchState: (runId: string, teamId: string) => Promise<void>;
  submitDecision: (role: Role, decision: unknown) => Promise<void>;
  advanceRound: () => Promise<void>;
  resetGame: () => Promise<void>;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  gameState: null,
  isLoading: false,
  error: null,
  selectedRole: 'strategy',
  pendingDecisions: {},
  demoMode: true,

  // Setters
  setGameState: (state) => set({ gameState: state }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  setDecision: (role, decision) =>
    set((state) => ({
      pendingDecisions: {
        ...state.pendingDecisions,
        [role]: decision,
      },
    })),
  clearDecisions: () => set({ pendingDecisions: {} }),
  setDemoMode: (demo) => set({ demoMode: demo }),

  // API actions
  initializeGame: async (runId, teamId, seed) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (runId) params.set('runId', runId);
      if (teamId) params.set('teamId', teamId);
      if (seed !== undefined) params.set('seed', seed.toString());

      const res = await fetch(`/api/state?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to initialize game');

      const state = await res.json();
      set({ gameState: state, isLoading: false, pendingDecisions: {} });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchState: async (runId, teamId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/state?runId=${runId}&teamId=${teamId}`);
      if (!res.ok) throw new Error('Failed to fetch state');

      const state = await res.json();
      set({ gameState: state, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  submitDecision: async (role, decision) => {
    const { gameState } = get();
    if (!gameState) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: gameState.runId,
          teamId: gameState.teamId,
          round: gameState.round,
          role,
          decision,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit decision');
      }

      const updatedState = await res.json();
      set({
        gameState: updatedState,
        isLoading: false,
        pendingDecisions: {
          ...get().pendingDecisions,
          [role]: decision,
        },
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  advanceRound: async () => {
    const { gameState } = get();
    if (!gameState) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: gameState.runId,
          teamId: gameState.teamId,
        }),
      });

      if (!res.ok) throw new Error('Failed to advance round');

      const updatedState = await res.json();
      set({ gameState: updatedState, isLoading: false, pendingDecisions: {} });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  resetGame: async () => {
    const { gameState } = get();
    if (!gameState) return;

    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: gameState.runId,
          teamId: gameState.teamId,
        }),
      });

      if (!res.ok) throw new Error('Failed to reset game');

      const freshState = await res.json();
      set({ gameState: freshState, isLoading: false, pendingDecisions: {} });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));
