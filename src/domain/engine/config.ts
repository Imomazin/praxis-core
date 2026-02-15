/**
 * Scenario Configuration
 *
 * Defines the "Praxis Assist: Responsible AI product launch" scenario
 * and its parameters.
 */

import type { CompanyState, MarketState, RiskProfile } from './types';

export interface ScenarioConfig {
  key: string;
  name: string;
  description: string;
  maxRounds: number;
  initialCompany: CompanyState;
  initialMarket: MarketState;
  initialRisk: RiskProfile;
  eventProbabilities: Record<string, number>;
  difficultyMultiplier: number;
}

/**
 * Default scenario: Praxis Assist AI Product Launch
 */
export const PRAXIS_ASSIST_SCENARIO: ScenarioConfig = {
  key: 'praxis-assist',
  name: 'Praxis Assist: Responsible AI Product Launch',
  description: `
    Your company has developed Praxis Assist, an AI-powered productivity tool.
    Navigate 8 quarters of growth while balancing innovation, trust, and compliance.
    Compete in a dynamic market with evolving regulations and fierce competition.
  `.trim(),
  maxRounds: 8,

  initialCompany: {
    cash: 50,                   // $50M starting capital
    revenue: 5,                 // $5M quarterly revenue
    costs: 4,                   // $4M quarterly costs
    profit: 1,                  // $1M quarterly profit
    runwayMonths: 60,           // 5 years runway
    headcount: 150,             // 150 employees
    morale: 75,                 // decent morale
    techDebt: 20,               // low technical debt
    productQuality: 70,         // good quality
    brandTrust: 65,             // moderate trust
    compliancePosture: 60,      // baseline compliance
    salesPipeline: 15,          // $15M pipeline
    churn: 5,                   // 5% monthly churn
  },

  initialMarket: {
    demandIndex: 100,           // baseline demand
    priceIndex: 100,            // baseline pricing
    competitionIntensity: 50,   // moderate competition
    regulationScrutiny: 40,     // AI regulations emerging
    channelFriction: 30,        // some friction
    supplyShockRisk: 20,        // low supply risk
    sentiment: 20,              // slightly positive
  },

  initialRisk: {
    operational: 15,            // low operational risk
    regulatory: 25,             // moderate regulatory risk (AI)
    reputational: 10,           // low reputational risk
    financial: 10,              // low financial risk
  },

  // Base probabilities for events (modified by state)
  eventProbabilities: {
    regulator_inquiry: 0.15,
    competitor_price_war: 0.10,
    data_incident_rumor: 0.12,
    supply_disruption: 0.08,
    viral_positive_review: 0.15,
    enterprise_rfp: 0.20,
    macro_downturn: 0.08,
  },

  difficultyMultiplier: 1.0,
};

/**
 * Get scenario by key
 */
export function getScenario(key: string): ScenarioConfig {
  const scenarios: Record<string, ScenarioConfig> = {
    'praxis-assist': PRAXIS_ASSIST_SCENARIO,
  };
  return scenarios[key] || PRAXIS_ASSIST_SCENARIO;
}

/**
 * Constants for game mechanics
 */
export const GAME_CONSTANTS = {
  // Financial
  MIN_CASH: -20,                // can go $20M into debt
  DEBT_INTEREST_RATE: 0.02,     // 2% quarterly interest on debt
  MAX_DISCOUNT: 30,             // max 30% discount allowed

  // Capacity
  MAX_CAPACITY_GROWTH: 0.25,    // max 25% capacity growth per quarter
  CAPACITY_COST_PER_POINT: 0.5, // $0.5M per capacity point

  // Quality
  TECH_DEBT_THRESHOLD: 60,      // above this, quality degrades
  QUALITY_DECAY_RATE: 0.05,     // 5% decay if tech debt high

  // Trust
  TRUST_RECOVERY_RATE: 0.03,    // 3% natural recovery per quarter
  TRUST_DAMAGE_FROM_INCIDENT: 15,

  // Compliance
  COMPLIANCE_DECAY_RATE: 0.02,  // 2% decay without investment
  AUDIT_COST_MULTIPLIER: 2,     // unexpected audits cost 2x

  // People
  HIRING_COST: 0.05,            // $50K per new hire
  FIRING_COST: 0.1,             // $100K per layoff (severance)
  MORALE_RECOVERY_RATE: 0.05,   // 5% recovery with good culture

  // Scoring weights
  SCORE_WEIGHTS: {
    financialHealth: 1.2,
    growth: 1.0,
    trust: 1.1,
    resilience: 0.9,
    execution: 0.8,
  },
} as const;

/**
 * Market region characteristics
 */
export const MARKET_REGIONS = {
  regionA: {
    name: 'North America',
    demandMultiplier: 1.0,
    regulationLevel: 0.5,
    competitionLevel: 0.8,
    entryBarrier: 0.3,
  },
  regionB: {
    name: 'Europe',
    demandMultiplier: 0.8,
    regulationLevel: 0.9,    // GDPR, AI Act
    competitionLevel: 0.6,
    entryBarrier: 0.5,
  },
  regionC: {
    name: 'Asia Pacific',
    demandMultiplier: 1.2,
    regulationLevel: 0.4,
    competitionLevel: 0.9,
    entryBarrier: 0.4,
  },
} as const;
