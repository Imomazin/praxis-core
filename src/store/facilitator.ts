'use client';

/**
 * Facilitator Store
 *
 * Client-side Zustand store for facilitator console state.
 */

import { create } from 'zustand';
import type { Run, TeamInfo, RunConfig, EventType } from '@/domain/engine';

interface FacilitatorStore {
  // State
  runs: Run[];
  activeRun: Run | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setRuns: (runs: Run[]) => void;
  setActiveRun: (run: Run | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchRuns: () => Promise<void>;
  fetchRun: (runId: string) => Promise<void>;
  createRun: (name: string, seed?: number, config?: Partial<RunConfig>) => Promise<Run | null>;
  deleteRun: (runId: string) => Promise<void>;

  // Run lifecycle
  startRun: (runId: string) => Promise<void>;
  pauseRun: (runId: string) => Promise<void>;
  resumeRun: (runId: string) => Promise<void>;
  advanceRun: (runId: string) => Promise<void>;

  // Team management
  addTeam: (runId: string, name: string) => Promise<void>;
  removeTeam: (runId: string, teamId: string) => Promise<void>;

  // Events
  injectEvent: (
    runId: string,
    eventType: EventType,
    severity: 'low' | 'medium' | 'high',
    targetTeams: string[] | 'all'
  ) => Promise<void>;
}

export const useFacilitatorStore = create<FacilitatorStore>((set, get) => ({
  // Initial state
  runs: [],
  activeRun: null,
  isLoading: false,
  error: null,

  // Setters
  setRuns: (runs) => set({ runs }),
  setActiveRun: (run) => set({ activeRun: run }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // API Actions
  fetchRuns: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/runs');
      if (!res.ok) throw new Error('Failed to fetch runs');
      const data = await res.json();
      set({ runs: data.runs, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchRun: async (runId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/runs/${runId}`);
      if (!res.ok) throw new Error('Failed to fetch run');
      const data = await res.json();
      set({ activeRun: data.run, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createRun: async (name: string, seed?: number, config?: Partial<RunConfig>) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, seed, config }),
      });
      if (!res.ok) throw new Error('Failed to create run');
      const run = await res.json();
      set({
        runs: [run, ...get().runs],
        activeRun: run,
        isLoading: false,
      });
      return run;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      return null;
    }
  },

  deleteRun: async (runId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/runs/${runId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete run');
      set({
        runs: get().runs.filter(r => r.runId !== runId),
        activeRun: get().activeRun?.runId === runId ? null : get().activeRun,
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  startRun: async (runId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/runs/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start run');
      }
      const run = await res.json();
      set({
        activeRun: run,
        runs: get().runs.map(r => r.runId === runId ? run : r),
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  pauseRun: async (runId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/runs/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' }),
      });
      if (!res.ok) throw new Error('Failed to pause run');
      const run = await res.json();
      set({
        activeRun: run,
        runs: get().runs.map(r => r.runId === runId ? run : r),
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  resumeRun: async (runId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/runs/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' }),
      });
      if (!res.ok) throw new Error('Failed to resume run');
      const run = await res.json();
      set({
        activeRun: run,
        runs: get().runs.map(r => r.runId === runId ? run : r),
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  advanceRun: async (runId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/runs/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance' }),
      });
      if (!res.ok) throw new Error('Failed to advance run');
      const run = await res.json();
      set({
        activeRun: run,
        runs: get().runs.map(r => r.runId === runId ? run : r),
        isLoading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  addTeam: async (runId: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/runs/${runId}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to add team');
      // Refresh the run to get updated team list
      await get().fetchRun(runId);
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  removeTeam: async (runId: string, teamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/runs/${runId}/teams/${teamId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove team');
      // Refresh the run to get updated team list
      await get().fetchRun(runId);
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  injectEvent: async (
    runId: string,
    eventType: EventType,
    severity: 'low' | 'medium' | 'high',
    targetTeams: string[] | 'all'
  ) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/runs/${runId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          severity,
          targetTeams,
          injectedBy: 'facilitator',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to inject event');
      }
      // Refresh the run
      await get().fetchRun(runId);
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
}));
