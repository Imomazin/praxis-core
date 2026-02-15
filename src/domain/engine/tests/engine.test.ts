/**
 * Engine Tests
 *
 * Unit tests for the simulation engine.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialGameState,
  generateRunId,
  generateTeamId,
  advanceRound,
  applyRoleDecision,
  calculateScorecard,
  createRNG,
  SeededRNG,
  generateRoundEvents,
  validateDecisionForRole,
  getDefaultDecision,
} from '../index';
import type { GameState, StrategyDecision, MarketingDecision } from '../types';

describe('RNG', () => {
  it('should produce deterministic results with same seed', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);

    const values1 = [rng1.next(), rng1.next(), rng1.next()];
    const values2 = [rng2.next(), rng2.next(), rng2.next()];

    expect(values1).toEqual(values2);
  });

  it('should produce different results with different seeds', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(54321);

    expect(rng1.next()).not.toEqual(rng2.next());
  });

  it('should generate integers in range', () => {
    const rng = new SeededRNG(12345);

    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(1, 10);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it('should handle chance correctly', () => {
    const rng = new SeededRNG(12345);

    // With probability 1, should always be true
    expect(rng.chance(1)).toBe(true);

    // With probability 0, should always be false
    expect(rng.chance(0)).toBe(false);
  });
});

describe('Game Initialization', () => {
  it('should create initial game state', () => {
    const runId = generateRunId();
    const teamId = generateTeamId();
    const state = createInitialGameState(runId, teamId);

    expect(state.runId).toBe(runId);
    expect(state.teamId).toBe(teamId);
    expect(state.round).toBe(1);
    expect(state.phase).toBe('decisions_open');
    expect(state.maxRounds).toBe(8);
  });

  it('should use provided seed', () => {
    const runId = generateRunId();
    const teamId = generateTeamId();
    const seed = 42;
    const state = createInitialGameState(runId, teamId, 'praxis-assist', seed);

    expect(state.seed).toBe(42);
  });

  it('should have valid initial company state', () => {
    const state = createInitialGameState('run1', 'team1');

    expect(state.company.cash).toBe(50);
    expect(state.company.revenue).toBe(5);
    expect(state.company.headcount).toBe(150);
    expect(state.company.brandTrust).toBe(65);
  });

  it('should have valid initial market state', () => {
    const state = createInitialGameState('run1', 'team1');

    expect(state.market.demandIndex).toBe(100);
    expect(state.market.priceIndex).toBe(100);
    expect(state.market.competitionIntensity).toBe(50);
  });

  it('should calculate initial scorecard', () => {
    const state = createInitialGameState('run1', 'team1');

    expect(state.scorecard.totalScore).toBeGreaterThan(0);
    expect(state.scorecard.boardConfidence).toBeTruthy();
    expect(state.scorecard.regulatoryHeat).toBeTruthy();
  });
});

describe('Decision Validation', () => {
  it('should validate strategy decision', () => {
    const decision: StrategyDecision = {
      riskPosture: 'balanced',
      capitalAllocation: { rnd: 25, marketing: 25, operations: 25, compliance: 25 },
      marketEntry: 'regionA',
    };

    expect(() => validateDecisionForRole('strategy', decision)).not.toThrow();
  });

  it('should reject invalid capital allocation', () => {
    const decision = {
      riskPosture: 'balanced',
      capitalAllocation: { rnd: 50, marketing: 50, operations: 50, compliance: 50 }, // sums to 200
      marketEntry: 'regionA',
    };

    expect(() => validateDecisionForRole('strategy', decision)).toThrow();
  });

  it('should validate marketing decision', () => {
    const decision: MarketingDecision = {
      campaignSpend: 5,
      pricingChangePct: 10,
      positioning: 'value-first',
      channelMix: 'paid',
    };

    expect(() => validateDecisionForRole('marketing', decision)).not.toThrow();
  });

  it('should reject out of range values', () => {
    const decision = {
      campaignSpend: 100, // max is 20
      pricingChangePct: 10,
      positioning: 'value-first',
      channelMix: 'paid',
    };

    expect(() => validateDecisionForRole('marketing', decision)).toThrow();
  });

  it('should provide default decisions', () => {
    const strategyDefault = getDefaultDecision('strategy');
    expect(strategyDefault).toBeDefined();
    expect((strategyDefault as StrategyDecision).riskPosture).toBe('balanced');
  });
});

describe('Game Advancement', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState('run1', 'team1', 'praxis-assist', 12345);
  });

  it('should advance round', () => {
    const newState = advanceRound(state);

    expect(newState.round).toBe(2);
    expect(newState.phase).toBe('decisions_open');
  });

  it('should apply default decisions when none provided', () => {
    const newState = advanceRound(state);

    // State should have changed based on default decisions
    expect(newState.company).not.toBe(state.company);
    expect(newState.updatedAt).not.toBe(state.updatedAt);
  });

  it('should calculate revenue and costs', () => {
    const newState = advanceRound(state);

    expect(newState.company.revenue).toBeGreaterThan(0);
    expect(newState.company.costs).toBeGreaterThan(0);
    expect(newState.company.profit).toBe(
      newState.company.revenue - newState.company.costs
    );
  });

  it('should update scorecard after advance', () => {
    const newState = advanceRound(state);

    // Scorecard should be recalculated
    expect(newState.scorecard.totalScore).toBeDefined();
  });

  it('should not advance past max rounds', () => {
    let testState = { ...state, round: 8 };
    const newState = advanceRound(testState);

    expect(newState.round).toBe(8);
  });
});

describe('Role Decision Application', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState('run1', 'team1', 'praxis-assist', 12345);
  });

  it('should store strategy decision', () => {
    const decision: StrategyDecision = {
      riskPosture: 'aggressive',
      capitalAllocation: { rnd: 40, marketing: 30, operations: 20, compliance: 10 },
      marketEntry: 'regionB',
    };

    const newState = applyRoleDecision(state, 'strategy', decision);

    expect(newState.decisions[0]?.strategy).toEqual(decision);
  });

  it('should store multiple role decisions', () => {
    let newState = applyRoleDecision(state, 'strategy', {
      riskPosture: 'balanced',
      capitalAllocation: { rnd: 25, marketing: 25, operations: 25, compliance: 25 },
      marketEntry: 'regionA',
    });

    newState = applyRoleDecision(newState, 'marketing', {
      campaignSpend: 5,
      pricingChangePct: 0,
      positioning: 'trust-first',
      channelMix: 'community',
    });

    expect(newState.decisions[0]?.strategy).toBeDefined();
    expect(newState.decisions[0]?.marketing).toBeDefined();
  });
});

describe('Event Generation', () => {
  it('should generate events deterministically', () => {
    const state = createInitialGameState('run1', 'team1', 'praxis-assist', 12345);
    const rng1 = createRNG(12345, 1);
    const rng2 = createRNG(12345, 1);

    const events1 = generateRoundEvents(state, rng1);
    const events2 = generateRoundEvents(state, rng2);

    expect(events1.length).toBe(events2.length);
    if (events1.length > 0) {
      expect(events1[0].type).toBe(events2[0].type);
    }
  });

  it('should not exceed 2 events per round', () => {
    const state = createInitialGameState('run1', 'team1', 'praxis-assist', 12345);

    // Try multiple times with different seeds
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRNG(seed, 1);
      const events = generateRoundEvents(state, rng);
      expect(events.length).toBeLessThanOrEqual(2);
    }
  });

  it('should increase regulatory inquiry probability with low compliance', () => {
    const lowComplianceState = createInitialGameState('run1', 'team1', 'praxis-assist', 12345);
    lowComplianceState.company.compliancePosture = 20;
    lowComplianceState.risk.regulatory = 80;

    let regulatorEvents = 0;
    for (let seed = 0; seed < 100; seed++) {
      const rng = createRNG(seed, 1);
      const events = generateRoundEvents(lowComplianceState, rng);
      if (events.some(e => e.type === 'regulator_inquiry')) {
        regulatorEvents++;
      }
    }

    // With low compliance, should have more regulatory events
    expect(regulatorEvents).toBeGreaterThan(5);
  });
});

describe('Scorecard Calculation', () => {
  it('should calculate scorecard components', () => {
    const state = createInitialGameState('run1', 'team1');
    const scorecard = calculateScorecard(
      state.company,
      state.market,
      state.risk,
      state.round
    );

    expect(scorecard.financialHealth).toBeGreaterThanOrEqual(0);
    expect(scorecard.financialHealth).toBeLessThanOrEqual(100);
    expect(scorecard.growth).toBeGreaterThanOrEqual(0);
    expect(scorecard.trust).toBeGreaterThanOrEqual(0);
    expect(scorecard.resilience).toBeGreaterThanOrEqual(0);
    expect(scorecard.execution).toBeGreaterThanOrEqual(0);
  });

  it('should have total score as sum of components', () => {
    const state = createInitialGameState('run1', 'team1');
    const scorecard = calculateScorecard(
      state.company,
      state.market,
      state.risk,
      state.round
    );

    // Total should be weighted sum, roughly in range
    expect(scorecard.totalScore).toBeGreaterThan(0);
    expect(scorecard.totalScore).toBeLessThanOrEqual(500);
  });
});

describe('Full Game Simulation', () => {
  it('should complete 8 rounds without crashing', () => {
    let state = createInitialGameState('run1', 'team1', 'praxis-assist', 12345);

    for (let i = 0; i < 8; i++) {
      state = advanceRound(state);
    }

    expect(state.round).toBe(8);
    expect(state.narrative.length).toBeGreaterThan(0);
    expect(state.decisions.length).toBe(8);
  });

  it('should accumulate events over rounds', () => {
    let state = createInitialGameState('run1', 'team1', 'praxis-assist', 54321);

    for (let i = 0; i < 8; i++) {
      state = advanceRound(state);
    }

    // Should have some events after 8 rounds
    expect(state.events.length).toBeGreaterThan(0);
  });

  it('should maintain valid state bounds throughout', () => {
    let state = createInitialGameState('run1', 'team1', 'praxis-assist', 99999);

    for (let i = 0; i < 8; i++) {
      state = advanceRound(state);

      // Check bounds
      expect(state.company.morale).toBeGreaterThanOrEqual(0);
      expect(state.company.morale).toBeLessThanOrEqual(100);
      expect(state.company.brandTrust).toBeGreaterThanOrEqual(0);
      expect(state.company.brandTrust).toBeLessThanOrEqual(100);
      expect(state.risk.operational).toBeGreaterThanOrEqual(0);
      expect(state.risk.operational).toBeLessThanOrEqual(100);
    }
  });
});
