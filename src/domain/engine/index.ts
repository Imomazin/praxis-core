/**
 * Praxis Simulation Engine
 *
 * Pure TypeScript game engine for the cross-functional business simulation.
 * No React dependencies - can be used server-side or client-side.
 */

// Types
export * from './types';

// Configuration
export { getScenario, PRAXIS_ASSIST_SCENARIO, GAME_CONSTANTS, MARKET_REGIONS } from './config';

// RNG
export { SeededRNG, createRNG, generateSeed } from './rng';

// Initialization
export {
  createInitialGameState,
  generateRunId,
  generateTeamId,
  cloneGameState,
  resetGameState,
  clamp,
  clampCompanyState,
  clampMarketState,
  clampRiskProfile,
} from './init';

// Validation
export {
  validateDecisionForRole,
  getDefaultDecision,
  DecideRequestSchema,
  AdvanceRequestSchema,
  ResetRequestSchema,
  SeedRequestSchema,
  ExportQuerySchema,
  RoundDecisionsSchema,
  StrategyDecisionSchema,
  MarketingDecisionSchema,
  SalesDecisionSchema,
  OperationsDecisionSchema,
  RnDDecisionSchema,
  LegalDecisionSchema,
  GMDecisionSchema,
} from './validation';

// Scoring
export {
  calculateScorecard,
  calculateRunway,
  checkGameEnd,
  generateEndGameSummary,
} from './scoring';

// Events
export {
  generateRoundEvents,
  createEvent,
  applyEventEffects,
  injectEvent,
} from './events';

// Reducer (main engine logic)
export {
  applyRoleDecision,
  lockDecisions,
  advanceRound,
} from './reducer';

// Narrative
export {
  generateNarrative,
  generateBoardMemo,
  generateLessonsLearned,
} from './narrative';

// Runs (H: Replayability, J: Multiplayer, M: Replay)
export {
  // Types
  type Run,
  type RunConfig,
  type RunStatus,
  type TeamInfo,
  type TeamMember,
  type InjectedEvent,
  type ActivityLogEntry,
  type RunReplayData,
  // Creation
  generateNewRunId,
  createRun,
  addTeamToRun,
  removeTeamFromRun,
  // Run lifecycle
  startRun,
  pauseRun,
  resumeRun,
  advanceRunRound,
  // Team management
  recordTeamDecision,
  updateTeamScore,
  // Events
  addInjectedEvent,
  // Queries
  allTeamsSubmitted,
  getLeaderboard,
  // Replay
  exportRunForReplay,
  createRunFromReplay,
} from './runs';
