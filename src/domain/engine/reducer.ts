/**
 * Game State Reducer
 *
 * Core engine logic for applying decisions and advancing rounds.
 * All state transitions happen through this module.
 */

import { createRNG } from './rng';
import { GAME_CONSTANTS, MARKET_REGIONS } from './config';
import { calculateScorecard, calculateRunway } from './scoring';
import { generateRoundEvents, applyEventEffects } from './events';
import { generateNarrative } from './narrative';
import { getDefaultDecision } from './validation';
import {
  clampCompanyState,
  clampMarketState,
  clampRiskProfile,
} from './init';
import type {
  GameState,
  RoundDecisions,
  CompanyState,
  MarketState,
  RiskProfile,
  Role,
  ROLES,
  StrategyDecision,
  MarketingDecision,
  SalesDecision,
  OperationsDecision,
  RnDDecision,
  LegalDecision,
  GMDecision,
  NarrativeEntry,
} from './types';

/**
 * Apply a single role's decision to the state
 */
export function applyRoleDecision(
  state: GameState,
  role: Role,
  decision: unknown
): GameState {
  const newState = { ...state };

  // Store the decision
  if (!newState.decisions[state.round - 1]) {
    newState.decisions[state.round - 1] = {};
  }
  (newState.decisions[state.round - 1] as Record<string, unknown>)[role] = decision;

  newState.updatedAt = new Date().toISOString();
  return newState;
}

/**
 * Lock decisions for the current round
 */
export function lockDecisions(state: GameState): GameState {
  return {
    ...state,
    phase: 'decisions_locked',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Advance the simulation by one round
 * This is the main engine tick that processes all decisions
 */
export function advanceRound(state: GameState): GameState {
  if (state.round >= state.maxRounds) {
    return state; // Game complete
  }

  // Get decisions for current round, fill in defaults for missing roles
  const roundDecisions = state.decisions[state.round - 1] || {};
  const fullDecisions = fillDefaultDecisions(roundDecisions);

  // Create RNG for this round
  const rng = createRNG(state.seed, state.round);

  // Start with current state
  let company = { ...state.company };
  let market = { ...state.market };
  let risk = { ...state.risk };
  const narratives: NarrativeEntry[] = [];

  // ===========================================================================
  // PHASE 1: Apply all role decisions
  // ===========================================================================

  // Strategy decisions
  if (fullDecisions.strategy) {
    const result = applyStrategyDecision(company, market, risk, fullDecisions.strategy);
    company = result.company;
    market = result.market;
    risk = result.risk;
  }

  // Marketing decisions
  if (fullDecisions.marketing) {
    const result = applyMarketingDecision(company, market, fullDecisions.marketing);
    company = result.company;
    market = result.market;
  }

  // Sales decisions
  if (fullDecisions.sales) {
    const result = applySalesDecision(company, market, fullDecisions.sales);
    company = result.company;
    market = result.market;
  }

  // Operations decisions
  if (fullDecisions.operations) {
    const result = applyOperationsDecision(company, market, risk, fullDecisions.operations);
    company = result.company;
    market = result.market;
    risk = result.risk;
  }

  // R&D decisions
  if (fullDecisions.rnd) {
    const result = applyRnDDecision(company, market, risk, fullDecisions.rnd);
    company = result.company;
    risk = result.risk;
  }

  // Legal decisions
  if (fullDecisions.legal) {
    const result = applyLegalDecision(company, risk, fullDecisions.legal);
    company = result.company;
    risk = result.risk;
  }

  // GM decisions
  if (fullDecisions.gm) {
    const result = applyGMDecision(company, fullDecisions.gm);
    company = result.company;
  }

  // ===========================================================================
  // PHASE 2: Calculate revenue and costs
  // ===========================================================================

  const revenueResult = calculateRevenue(company, market);
  company.revenue = revenueResult.revenue;
  company.costs = revenueResult.costs;
  company.profit = revenueResult.revenue - revenueResult.costs;

  // ===========================================================================
  // PHASE 3: Generate and apply events
  // ===========================================================================

  const newEvents = generateRoundEvents(
    { ...state, company, market, risk },
    rng
  );

  for (const event of newEvents) {
    const eventResult = applyEventEffects(company, market, risk, event);
    company = eventResult.company;
    market = eventResult.market;
    risk = eventResult.risk;
  }

  // ===========================================================================
  // PHASE 4: Apply decay and natural changes
  // ===========================================================================

  // Tech debt natural growth (systems degrade without maintenance)
  company.techDebt += 2;

  // Compliance decay without investment
  company.compliancePosture -= GAME_CONSTANTS.COMPLIANCE_DECAY_RATE * 100;

  // Trust slow recovery if no incidents
  if (risk.reputational < 30) {
    company.brandTrust += GAME_CONSTANTS.TRUST_RECOVERY_RATE * 100;
  }

  // Market sentiment drift toward neutral
  if (market.sentiment > 0) {
    market.sentiment -= 3;
  } else if (market.sentiment < 0) {
    market.sentiment += 3;
  }

  // ===========================================================================
  // PHASE 5: Update derived metrics
  // ===========================================================================

  company.runwayMonths = calculateRunway(company.cash, company.costs);

  // Clamp all values to valid ranges
  company = clampCompanyState(company);
  market = clampMarketState(market);
  risk = clampRiskProfile(risk);

  // Calculate new scorecard
  const scorecard = calculateScorecard(company, market, risk, state.round + 1);

  // ===========================================================================
  // PHASE 6: Generate narrative
  // ===========================================================================

  const roundNarratives = generateNarrative(
    state,
    { ...state, company, market, risk, scorecard },
    fullDecisions,
    newEvents,
    state.round
  );

  // ===========================================================================
  // PHASE 7: Advance round
  // ===========================================================================

  return {
    ...state,
    round: state.round + 1,
    phase: 'decisions_open',
    company,
    market,
    risk,
    scorecard,
    events: [...state.events, ...newEvents],
    narrative: [...state.narrative, ...roundNarratives],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fill in default decisions for any missing roles
 */
function fillDefaultDecisions(decisions: RoundDecisions): RoundDecisions {
  const roles: Role[] = ['strategy', 'marketing', 'sales', 'operations', 'rnd', 'legal', 'gm'];
  const filled: RoundDecisions = { ...decisions };

  for (const role of roles) {
    if (!filled[role]) {
      filled[role] = getDefaultDecision(role) as any;
    }
  }

  return filled;
}

// =============================================================================
// ROLE-SPECIFIC DECISION HANDLERS
// =============================================================================

function applyStrategyDecision(
  company: CompanyState,
  market: MarketState,
  risk: RiskProfile,
  decision: StrategyDecision
): { company: CompanyState; market: MarketState; risk: RiskProfile } {
  const newCompany = { ...company };
  const newMarket = { ...market };
  const newRisk = { ...risk };

  // Risk posture affects operational risk and opportunity
  switch (decision.riskPosture) {
    case 'aggressive':
      newRisk.operational += 8;       // More risk
      newMarket.demandIndex += 5;     // But more opportunity
      break;
    case 'conservative':
      newRisk.operational -= 5;       // Less risk
      newMarket.demandIndex -= 3;     // But slower growth
      break;
    // 'balanced' has no effect
  }

  // Market region affects regulation and demand
  const region = MARKET_REGIONS[decision.marketEntry];
  newMarket.regulationScrutiny += (region.regulationLevel - 0.5) * 20;
  newMarket.demandIndex *= region.demandMultiplier;
  newMarket.competitionIntensity += (region.competitionLevel - 0.5) * 15;

  // Capital allocation affects future potential (stored for cost calculation)
  // Higher R&D allocation improves quality over time
  // Higher marketing allocation improves demand
  // Higher ops allocation improves efficiency
  // Higher compliance allocation reduces regulatory risk

  return { company: newCompany, market: newMarket, risk: newRisk };
}

function applyMarketingDecision(
  company: CompanyState,
  market: MarketState,
  decision: MarketingDecision
): { company: CompanyState; market: MarketState } {
  const newCompany = { ...company };
  const newMarket = { ...market };

  // Campaign spend increases demand but costs money
  const campaignEffect = Math.log10(1 + decision.campaignSpend) * 8;
  newMarket.demandIndex += campaignEffect;
  newCompany.cash -= decision.campaignSpend;

  // Pricing change affects price index and demand (elasticity)
  const priceChange = decision.pricingChangePct / 100;
  newMarket.priceIndex *= (1 + priceChange);

  // Elasticity: price up -> demand down (and vice versa)
  const elasticity = -1.1; // slightly elastic
  newMarket.demandIndex *= (1 + priceChange * elasticity);

  // Positioning affects brand trust and sentiment
  switch (decision.positioning) {
    case 'trust-first':
      newCompany.brandTrust += 3;
      newMarket.sentiment += 5;
      break;
    case 'innovation-first':
      newMarket.demandIndex += 5;
      newCompany.techDebt += 2; // pushing new features
      break;
    case 'value-first':
      newMarket.priceIndex -= 5;
      newCompany.salesPipeline += 2;
      break;
  }

  // Channel mix affects reach and costs
  switch (decision.channelMix) {
    case 'paid':
      newMarket.demandIndex += 3;
      newCompany.cash -= 0.5; // additional media cost
      break;
    case 'partner':
      newCompany.salesPipeline += 3;
      break;
    case 'community':
      newCompany.brandTrust += 2;
      newMarket.sentiment += 3;
      break;
  }

  return { company: newCompany, market: newMarket };
}

function applySalesDecision(
  company: CompanyState,
  market: MarketState,
  decision: SalesDecision
): { company: CompanyState; market: MarketState } {
  const newCompany = { ...company };
  const newMarket = { ...market };

  // Enterprise vs SMB focus affects pipeline composition
  if (decision.enterpriseFocus > 70) {
    newCompany.salesPipeline += 5; // larger deals
    newMarket.channelFriction += 5; // longer sales cycles
  } else if (decision.enterpriseFocus < 30) {
    newCompany.salesPipeline += 2;
    newMarket.channelFriction -= 3; // faster sales
    newCompany.churn += 2; // SMB tends to churn more
  }

  // Discounting affects margins and volume
  if (decision.discountingPolicy > 20) {
    newMarket.demandIndex += 8;
    newMarket.priceIndex -= decision.discountingPolicy * 0.3;
    newCompany.brandTrust -= 3; // discounting can hurt brand
  }

  // Partner program investment
  newCompany.salesPipeline += decision.partnerProgramInvestment * 2;
  newCompany.cash -= decision.partnerProgramInvestment;

  // Pipeline hygiene reduces churn and improves conversion
  const hygieneEffect = (decision.pipelineHygiene - 50) / 50;
  newCompany.churn -= hygieneEffect * 3;
  newCompany.salesPipeline += hygieneEffect * 2;

  return { company: newCompany, market: newMarket };
}

function applyOperationsDecision(
  company: CompanyState,
  market: MarketState,
  risk: RiskProfile,
  decision: OperationsDecision
): { company: CompanyState; market: MarketState; risk: RiskProfile } {
  const newCompany = { ...company };
  const newMarket = { ...market };
  const newRisk = { ...risk };

  // Capacity investment
  newCompany.cash -= decision.capacityInvestment;
  // Capacity increases ability to serve demand (affects revenue calculation)

  // Supplier strategy affects risk and costs
  switch (decision.supplierStrategy) {
    case 'single-source':
      newRisk.operational += 10;
      // Lowest cost, but risky
      break;
    case 'diversified':
      newRisk.operational -= 5;
      newCompany.cash -= 1; // coordination costs
      break;
    // 'dual-source' is balanced
  }

  // QA investment improves quality and reduces incidents
  newCompany.cash -= decision.qaInvestment;
  newCompany.productQuality += decision.qaInvestment * 3;
  newCompany.techDebt -= decision.qaInvestment * 2;

  // Delivery speed affects quality and satisfaction
  switch (decision.deliverySpeed) {
    case 'fast':
      newMarket.channelFriction -= 5;
      newCompany.techDebt += 5;
      newRisk.operational += 5;
      break;
    case 'stable':
      newMarket.channelFriction += 3;
      newCompany.productQuality += 3;
      newRisk.operational -= 3;
      break;
  }

  return { company: newCompany, market: newMarket, risk: newRisk };
}

function applyRnDDecision(
  company: CompanyState,
  market: MarketState,
  risk: RiskProfile,
  decision: RnDDecision
): { company: CompanyState; risk: RiskProfile } {
  const newCompany = { ...company };
  const newRisk = { ...risk };

  // Roadmap focus
  switch (decision.roadmapFocus) {
    case 'features':
      newCompany.productQuality += 3;
      newCompany.techDebt += 3;
      break;
    case 'reliability':
      newCompany.techDebt -= 8;
      newRisk.operational -= 3;
      break;
    case 'privacy-security':
      newCompany.compliancePosture += 5;
      newRisk.regulatory -= 5;
      newCompany.brandTrust += 3;
      break;
  }

  // Release cadence
  switch (decision.releaseCadence) {
    case 'fast':
      newCompany.techDebt += 5;
      newRisk.operational += 3;
      break;
    case 'cautious':
      newCompany.techDebt -= 3;
      newRisk.operational -= 2;
      break;
  }

  // Model quality investment
  newCompany.cash -= decision.modelQualityInvestment;
  newCompany.productQuality += decision.modelQualityInvestment * 2;

  // Experimentation budget
  newCompany.cash -= decision.experimentationBudget;
  // Experimentation has uncertain payoff (handled by events)

  return { company: newCompany, risk: newRisk };
}

function applyLegalDecision(
  company: CompanyState,
  risk: RiskProfile,
  decision: LegalDecision
): { company: CompanyState; risk: RiskProfile } {
  const newCompany = { ...company };
  const newRisk = { ...risk };

  // Compliance spend
  newCompany.cash -= decision.complianceSpend;
  newCompany.compliancePosture += decision.complianceSpend * 5;
  newRisk.regulatory -= decision.complianceSpend * 3;

  // Policy strictness
  switch (decision.policyStrictness) {
    case 'tight':
      newCompany.compliancePosture += 5;
      newRisk.regulatory -= 5;
      // May slow down product development
      break;
    case 'loose':
      newRisk.regulatory += 10;
      newRisk.reputational += 5;
      // Faster but riskier
      break;
  }

  // Audit readiness
  const auditBonus = (decision.auditReadiness - 50) / 10;
  newCompany.compliancePosture += auditBonus;
  newRisk.regulatory -= auditBonus;

  // Data handling
  switch (decision.dataHandling) {
    case 'minimal':
      newCompany.compliancePosture += 5;
      newRisk.regulatory -= 5;
      newCompany.productQuality -= 2; // less data = less ML improvement
      break;
    case 'expansive':
      newRisk.regulatory += 8;
      newRisk.reputational += 5;
      newCompany.productQuality += 3; // more data = better ML
      break;
  }

  return { company: newCompany, risk: newRisk };
}

function applyGMDecision(
  company: CompanyState,
  decision: GMDecision
): { company: CompanyState } {
  const newCompany = { ...company };

  // Hiring plan
  switch (decision.hiringPlan) {
    case 'grow':
      const newHires = Math.round(company.headcount * 0.1);
      newCompany.headcount += newHires;
      newCompany.cash -= newHires * GAME_CONSTANTS.HIRING_COST;
      newCompany.morale -= 3; // growing pains
      break;
    case 'cut':
      const layoffs = Math.round(company.headcount * 0.1);
      newCompany.headcount -= layoffs;
      newCompany.cash -= layoffs * GAME_CONSTANTS.FIRING_COST;
      newCompany.morale -= 15; // morale hit from layoffs
      break;
  }

  // Org design
  switch (decision.orgDesign) {
    case 'centralized':
      newCompany.morale -= 2;
      // More control, less autonomy
      break;
    case 'decentralized':
      newCompany.morale += 3;
      // More autonomy, may increase tech debt
      newCompany.techDebt += 2;
      break;
  }

  // Culture investment
  newCompany.cash -= decision.cultureInvestment;
  newCompany.morale += decision.cultureInvestment * 5;

  // Crisis response (affects how events are handled)
  switch (decision.crisisResponse) {
    case 'transparent':
      newCompany.brandTrust += 2;
      break;
    case 'aggressive':
      newCompany.brandTrust -= 3;
      break;
  }

  return { company: newCompany };
}

// =============================================================================
// REVENUE CALCULATION
// =============================================================================

function calculateRevenue(
  company: CompanyState,
  market: MarketState
): { revenue: number; costs: number } {
  // Base revenue from pipeline conversion
  const pipelineConversion = 0.15; // 15% of pipeline converts per quarter
  const baseRevenue = company.salesPipeline * pipelineConversion;

  // Demand modifier
  const demandModifier = market.demandIndex / 100;

  // Price modifier
  const priceModifier = market.priceIndex / 100;

  // Quality modifier (affects retention and word of mouth)
  const qualityModifier = company.productQuality / 100;

  // Trust modifier
  const trustModifier = (company.brandTrust + 50) / 150;

  // Channel friction penalty
  const frictionPenalty = 1 - (market.channelFriction / 200);

  // Churn reduces recurring revenue
  const churnImpact = 1 - (company.churn / 100);

  // Calculate revenue
  const revenue = baseRevenue *
    demandModifier *
    priceModifier *
    qualityModifier *
    trustModifier *
    frictionPenalty *
    churnImpact;

  // Calculate costs
  const personnelCosts = company.headcount * 0.025; // $25K per head per quarter
  const infraCosts = 1 + (company.techDebt / 50); // tech debt increases infra costs
  const baseCosts = 2; // base operating costs

  const costs = personnelCosts + infraCosts + baseCosts;

  // Update cash from profit
  company.cash += revenue - costs;

  return {
    revenue: Math.max(0, revenue),
    costs: Math.max(0, costs),
  };
}
