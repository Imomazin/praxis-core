/**
 * H: Replayability Logic & J: Multiplayer Teams
 *
 * Run management for facilitator-driven simulations.
 * A "Run" is a single simulation session that can have multiple teams.
 * All teams in a run share the same seed for fair comparison.
 */

import { generateSeed } from './rng';
import type { GameState, EventType } from './types';

// =============================================================================
// RUN TYPES
// =============================================================================

export type RunStatus = 'setup' | 'active' | 'paused' | 'completed';

export interface RunConfig {
  scenarioKey: string;
  maxRounds: number;
  roundDurationMinutes: number;
  eventFrequency: 'low' | 'medium' | 'high';
  competitionMode: 'head-to-head' | 'market' | 'cooperative';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  autoAdvance: 'disabled' | 'after-submissions' | 'after-timeout';
}

export interface TeamInfo {
  teamId: string;
  name: string;
  members: TeamMember[];
  score: number;
  currentRound: number;
  decisionsSubmitted: boolean;
  status: 'active' | 'pending' | 'completed';
}

export interface TeamMember {
  name: string;
  role: string;
  email?: string;
}

export interface Run {
  runId: string;
  name: string;
  seed: number;
  status: RunStatus;
  config: RunConfig;
  currentRound: number;
  teams: TeamInfo[];
  injectedEvents: InjectedEvent[];
  activityLog: ActivityLogEntry[];
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface InjectedEvent {
  id: string;
  eventType: EventType;
  severity: 'low' | 'medium' | 'high';
  targetTeams: string[] | 'all';
  round: number;
  injectedAt: string;
  injectedBy: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  teamId?: string;
  teamName?: string;
  action: string;
  details?: string;
}

// =============================================================================
// RUN CREATION
// =============================================================================

/**
 * Generate a unique run ID
 */
export function generateNewRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `run_${timestamp}_${random}`;
}

/**
 * Create a new run with default configuration
 */
export function createRun(
  name: string,
  seed?: number,
  config?: Partial<RunConfig>
): Run {
  const now = new Date().toISOString();
  const runId = generateNewRunId();

  const defaultConfig: RunConfig = {
    scenarioKey: 'praxis-assist',
    maxRounds: 8,
    roundDurationMinutes: 30,
    eventFrequency: 'medium',
    competitionMode: 'market',
    difficulty: 'intermediate',
    autoAdvance: 'disabled',
  };

  return {
    runId,
    name,
    seed: seed ?? generateSeed(),
    status: 'setup',
    config: { ...defaultConfig, ...config },
    currentRound: 1,
    teams: [],
    injectedEvents: [],
    activityLog: [
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        action: 'Run created',
        details: `Simulation run "${name}" created`,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Add a team to a run
 */
export function addTeamToRun(run: Run, teamName: string, members?: TeamMember[]): Run {
  const teamId = `team_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const newTeam: TeamInfo = {
    teamId,
    name: teamName,
    members: members || [],
    score: 0,
    currentRound: 1,
    decisionsSubmitted: false,
    status: 'active',
  };

  return {
    ...run,
    teams: [...run.teams, newTeam],
    activityLog: [
      ...run.activityLog,
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        teamId,
        teamName,
        action: 'Team joined',
        details: `Team "${teamName}" joined the simulation`,
      },
    ],
    updatedAt: now,
  };
}

/**
 * Remove a team from a run
 */
export function removeTeamFromRun(run: Run, teamId: string): Run {
  const team = run.teams.find(t => t.teamId === teamId);
  const now = new Date().toISOString();

  return {
    ...run,
    teams: run.teams.filter(t => t.teamId !== teamId),
    activityLog: [
      ...run.activityLog,
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        teamId,
        teamName: team?.name,
        action: 'Team removed',
        details: `Team "${team?.name}" was removed from the simulation`,
      },
    ],
    updatedAt: now,
  };
}

/**
 * Start a run
 */
export function startRun(run: Run): Run {
  const now = new Date().toISOString();

  return {
    ...run,
    status: 'active',
    startedAt: now,
    activityLog: [
      ...run.activityLog,
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        action: 'Simulation started',
        details: `Round 1 has begun with ${run.teams.length} teams`,
      },
    ],
    updatedAt: now,
  };
}

/**
 * Pause a run
 */
export function pauseRun(run: Run): Run {
  const now = new Date().toISOString();

  return {
    ...run,
    status: 'paused',
    activityLog: [
      ...run.activityLog,
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        action: 'Simulation paused',
        details: `Paused at round ${run.currentRound}`,
      },
    ],
    updatedAt: now,
  };
}

/**
 * Resume a run
 */
export function resumeRun(run: Run): Run {
  const now = new Date().toISOString();

  return {
    ...run,
    status: 'active',
    activityLog: [
      ...run.activityLog,
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        action: 'Simulation resumed',
        details: `Resumed at round ${run.currentRound}`,
      },
    ],
    updatedAt: now,
  };
}

/**
 * Advance run to next round
 */
export function advanceRunRound(run: Run): Run {
  const now = new Date().toISOString();
  const newRound = run.currentRound + 1;
  const isComplete = newRound > run.config.maxRounds;

  return {
    ...run,
    currentRound: isComplete ? run.currentRound : newRound,
    status: isComplete ? 'completed' : run.status,
    completedAt: isComplete ? now : run.completedAt,
    teams: run.teams.map(team => ({
      ...team,
      currentRound: isComplete ? team.currentRound : newRound,
      decisionsSubmitted: false,
    })),
    activityLog: [
      ...run.activityLog,
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        action: isComplete ? 'Simulation completed' : 'Round advanced',
        details: isComplete
          ? `Simulation completed after ${run.currentRound} rounds`
          : `Advanced to round ${newRound}`,
      },
    ],
    updatedAt: now,
  };
}

/**
 * Record that a team submitted decisions
 */
export function recordTeamDecision(run: Run, teamId: string): Run {
  const team = run.teams.find(t => t.teamId === teamId);
  const now = new Date().toISOString();

  return {
    ...run,
    teams: run.teams.map(t =>
      t.teamId === teamId ? { ...t, decisionsSubmitted: true } : t
    ),
    activityLog: [
      ...run.activityLog,
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        teamId,
        teamName: team?.name,
        action: 'Decisions submitted',
        details: `Round ${run.currentRound} decisions submitted`,
      },
    ],
    updatedAt: now,
  };
}

/**
 * Update team score from game state
 */
export function updateTeamScore(run: Run, teamId: string, score: number): Run {
  return {
    ...run,
    teams: run.teams.map(t =>
      t.teamId === teamId ? { ...t, score } : t
    ),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add an injected event to the run
 */
export function addInjectedEvent(
  run: Run,
  eventType: EventType,
  severity: 'low' | 'medium' | 'high',
  targetTeams: string[] | 'all',
  injectedBy: string
): Run {
  const now = new Date().toISOString();
  const event: InjectedEvent = {
    id: `inj_${Date.now()}`,
    eventType,
    severity,
    targetTeams,
    round: run.currentRound,
    injectedAt: now,
    injectedBy,
  };

  return {
    ...run,
    injectedEvents: [...run.injectedEvents, event],
    activityLog: [
      ...run.activityLog,
      {
        id: `log_${Date.now()}`,
        timestamp: now,
        action: 'Event injected',
        details: `${eventType} (${severity}) injected for ${
          targetTeams === 'all' ? 'all teams' : `${targetTeams.length} teams`
        }`,
      },
    ],
    updatedAt: now,
  };
}

/**
 * Check if all teams have submitted decisions
 */
export function allTeamsSubmitted(run: Run): boolean {
  return run.teams.every(team => team.decisionsSubmitted);
}

/**
 * Get leaderboard sorted by score
 */
export function getLeaderboard(run: Run): TeamInfo[] {
  return [...run.teams].sort((a, b) => b.score - a.score);
}

/**
 * M: Seeded Replay - Export run for replay
 */
export interface RunReplayData {
  runId: string;
  name: string;
  seed: number;
  config: RunConfig;
  version: string;
  exportedAt: string;
}

export function exportRunForReplay(run: Run): RunReplayData {
  return {
    runId: run.runId,
    name: run.name,
    seed: run.seed,
    config: run.config,
    version: '1.0',
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Create a new run from replay data (M: Seeded Replay)
 */
export function createRunFromReplay(
  replayData: RunReplayData,
  newName?: string
): Run {
  return createRun(
    newName || `${replayData.name} (Replay)`,
    replayData.seed,
    replayData.config
  );
}
