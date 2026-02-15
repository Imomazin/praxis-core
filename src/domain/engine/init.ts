/**
 * Game State Initialization
 *
 * Creates new game states for runs and teams.
 */

import { getScenario, type ScenarioConfig } from './config';
import { generateSeed } from './rng';
import { calculateScorecard } from './scoring';
import type {
  GameState,
  CompanyState,
  MarketState,
  RiskProfile,
  Scorecard,
} from './types';

/**
 * Generate a unique run ID
 */
export function generateRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `run_${timestamp}_${random}`;
}

/**
 * Generate a unique team ID
 */
export function generateTeamId(): string {
  const random = Math.random().toString(36).substring(2, 8);
  return `team_${random}`;
}

/**
 * Create initial game state for a new run
 */
export function createInitialGameState(
  runId: string,
  teamId: string,
  scenarioKey: string = 'praxis-assist',
  seed?: number
): GameState {
  const scenario = getScenario(scenarioKey);
  const actualSeed = seed ?? generateSeed();

  const company = { ...scenario.initialCompany };
  const market = { ...scenario.initialMarket };
  const risk = { ...scenario.initialRisk };

  // Calculate initial scorecard
  const scorecard = calculateScorecard(company, market, risk, 1);

  const now = new Date().toISOString();

  return {
    runId,
    teamId,
    scenarioKey,
    seed: actualSeed,

    round: 1,
    maxRounds: scenario.maxRounds,
    phase: 'decisions_open',

    company,
    market,
    risk,
    scorecard,

    decisions: [],
    events: [],
    narrative: [
      {
        id: 'init_1',
        round: 1,
        category: 'outcome',
        title: 'Welcome to Praxis',
        description: `Quarter 1 begins. You're leading Praxis Assist through a critical growth phase.
          Your AI productivity tool has early traction, but the market is evolving fast.
          Make strategic decisions across all functions to build a sustainable, trusted business.`,
        impact: 'neutral',
      }
    ],

    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Clone a game state for creating snapshots
 */
export function cloneGameState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Create a fresh state from an existing one (preserving identity)
 */
export function resetGameState(state: GameState): GameState {
  return createInitialGameState(
    state.runId,
    state.teamId,
    state.scenarioKey,
    state.seed
  );
}

/**
 * Merge partial company state updates
 */
export function mergeCompanyState(
  current: CompanyState,
  updates: Partial<CompanyState>
): CompanyState {
  return {
    ...current,
    ...updates,
    // Ensure profit is recalculated
    profit: (updates.revenue ?? current.revenue) - (updates.costs ?? current.costs),
  };
}

/**
 * Merge partial market state updates
 */
export function mergeMarketState(
  current: MarketState,
  updates: Partial<MarketState>
): MarketState {
  return {
    ...current,
    ...updates,
  };
}

/**
 * Merge partial risk profile updates
 */
export function mergeRiskProfile(
  current: RiskProfile,
  updates: Partial<RiskProfile>
): RiskProfile {
  return {
    ...current,
    ...updates,
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp all values in an object to their valid ranges
 */
export function clampCompanyState(company: CompanyState): CompanyState {
  return {
    ...company,
    cash: Math.max(company.cash, -20), // Allow debt up to $20M
    revenue: Math.max(company.revenue, 0),
    costs: Math.max(company.costs, 0),
    profit: company.revenue - company.costs,
    runwayMonths: Math.max(company.runwayMonths, 0),
    headcount: Math.max(company.headcount, 10), // Minimum viable team
    morale: clamp(company.morale, 0, 100),
    techDebt: clamp(company.techDebt, 0, 100),
    productQuality: clamp(company.productQuality, 0, 100),
    brandTrust: clamp(company.brandTrust, 0, 100),
    compliancePosture: clamp(company.compliancePosture, 0, 100),
    salesPipeline: Math.max(company.salesPipeline, 0),
    churn: clamp(company.churn, 0, 50), // Max 50% churn
  };
}

export function clampMarketState(market: MarketState): MarketState {
  return {
    ...market,
    demandIndex: clamp(market.demandIndex, 20, 200),
    priceIndex: clamp(market.priceIndex, 50, 200),
    competitionIntensity: clamp(market.competitionIntensity, 0, 100),
    regulationScrutiny: clamp(market.regulationScrutiny, 0, 100),
    channelFriction: clamp(market.channelFriction, 0, 100),
    supplyShockRisk: clamp(market.supplyShockRisk, 0, 100),
    sentiment: clamp(market.sentiment, -100, 100),
  };
}

export function clampRiskProfile(risk: RiskProfile): RiskProfile {
  return {
    operational: clamp(risk.operational, 0, 100),
    regulatory: clamp(risk.regulatory, 0, 100),
    reputational: clamp(risk.reputational, 0, 100),
    financial: clamp(risk.financial, 0, 100),
  };
}
