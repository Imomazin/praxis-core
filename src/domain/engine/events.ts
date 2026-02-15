/**
 * Events System
 *
 * Handles random market events, shocks, and opportunities.
 * Events are triggered based on state + RNG.
 */

import { SeededRNG } from './rng';
import { PRAXIS_ASSIST_SCENARIO } from './config';
import type {
  GameState,
  GameEvent,
  EventType,
  CompanyState,
  MarketState,
  RiskProfile,
  EVENT_DEFINITIONS,
} from './types';

/**
 * Calculate event trigger probability based on state
 */
function getEventProbability(
  eventType: EventType,
  state: GameState
): number {
  const baseProbability = PRAXIS_ASSIST_SCENARIO.eventProbabilities[eventType] || 0.1;

  let modifier = 1.0;

  switch (eventType) {
    case 'regulator_inquiry':
      // Higher risk of inquiry if compliance is low or regulatory risk is high
      if (state.company.compliancePosture < 50) modifier *= 1.5;
      if (state.risk.regulatory > 50) modifier *= 1.3;
      if (state.market.regulationScrutiny > 60) modifier *= 1.2;
      break;

    case 'competitor_price_war':
      // More likely in highly competitive markets
      if (state.market.competitionIntensity > 70) modifier *= 1.5;
      if (state.market.priceIndex > 110) modifier *= 1.3; // premium pricing attracts competition
      break;

    case 'data_incident_rumor':
      // More likely with poor tech debt or low compliance
      if (state.company.techDebt > 50) modifier *= 1.4;
      if (state.company.compliancePosture < 40) modifier *= 1.3;
      break;

    case 'supply_disruption':
      // Based on supply shock risk
      modifier *= (state.market.supplyShockRisk / 50);
      break;

    case 'viral_positive_review':
      // More likely with high quality and trust
      if (state.company.productQuality > 75) modifier *= 1.4;
      if (state.company.brandTrust > 70) modifier *= 1.3;
      if (state.market.sentiment > 30) modifier *= 1.2;
      break;

    case 'enterprise_rfp':
      // More likely with strong pipeline and quality
      if (state.company.salesPipeline > 15) modifier *= 1.3;
      if (state.company.productQuality > 65) modifier *= 1.2;
      break;

    case 'macro_downturn':
      // Semi-random, slight increase later in game
      if (state.round > 4) modifier *= 1.2;
      break;
  }

  return Math.min(0.5, baseProbability * modifier); // cap at 50%
}

/**
 * Generate events for the current round
 */
export function generateRoundEvents(
  state: GameState,
  rng: SeededRNG
): GameEvent[] {
  const events: GameEvent[] = [];
  const eventTypes: EventType[] = [
    'regulator_inquiry',
    'competitor_price_war',
    'data_incident_rumor',
    'supply_disruption',
    'viral_positive_review',
    'enterprise_rfp',
    'macro_downturn',
  ];

  // Shuffle to randomize order of checking
  const shuffledTypes = rng.shuffle(eventTypes);

  // Check each event type
  for (const eventType of shuffledTypes) {
    // Max 2 events per round
    if (events.length >= 2) break;

    const probability = getEventProbability(eventType, state);
    if (rng.chance(probability)) {
      const event = createEvent(eventType, state.round, rng);
      events.push(event);
    }
  }

  return events;
}

/**
 * Create a specific event
 */
export function createEvent(
  type: EventType,
  round: number,
  rng: SeededRNG
): GameEvent {
  const severity = rng.chance(0.2) ? 'high' : rng.chance(0.5) ? 'medium' : 'low';
  const severityMultiplier = severity === 'high' ? 1.5 : severity === 'medium' ? 1.0 : 0.6;

  const id = `event_${round}_${type}_${rng.nextInt(1000, 9999)}`;

  const definitions: Record<EventType, { name: string; description: string }> = {
    regulator_inquiry: {
      name: 'Regulatory Inquiry',
      description: 'Regulators have opened an inquiry into your AI practices.',
    },
    competitor_price_war: {
      name: 'Competitor Price War',
      description: 'A major competitor has slashed prices by 30%.',
    },
    data_incident_rumor: {
      name: 'Data Incident Rumor',
      description: 'Social media is buzzing about a potential data breach.',
    },
    supply_disruption: {
      name: 'Supply Chain Disruption',
      description: 'Key infrastructure provider experiencing outages.',
    },
    viral_positive_review: {
      name: 'Viral Positive Review',
      description: 'An influential analyst published a glowing review.',
    },
    enterprise_rfp: {
      name: 'Enterprise RFP Opportunity',
      description: 'Fortune 500 company seeking AI solutions partner.',
    },
    macro_downturn: {
      name: 'Market Downturn',
      description: 'Economic indicators signal reduced enterprise spending.',
    },
  };

  const effects = getEventEffects(type, severityMultiplier);

  return {
    id,
    type,
    name: definitions[type].name,
    description: definitions[type].description,
    severity,
    round,
    effects,
    resolved: false,
  };
}

/**
 * Get the effects of an event on game state
 */
function getEventEffects(
  type: EventType,
  severityMultiplier: number
): GameEvent['effects'] {
  const effects: GameEvent['effects'] = {};

  switch (type) {
    case 'regulator_inquiry':
      effects.company = {
        compliancePosture: -5 * severityMultiplier,
      };
      effects.risk = {
        regulatory: 15 * severityMultiplier,
        reputational: 5 * severityMultiplier,
      };
      effects.market = {
        regulationScrutiny: 10 * severityMultiplier,
      };
      break;

    case 'competitor_price_war':
      effects.market = {
        priceIndex: -15 * severityMultiplier,
        competitionIntensity: 10 * severityMultiplier,
      };
      effects.company = {
        salesPipeline: -3 * severityMultiplier,
      };
      break;

    case 'data_incident_rumor':
      effects.company = {
        brandTrust: -10 * severityMultiplier,
      };
      effects.risk = {
        reputational: 20 * severityMultiplier,
        regulatory: 5 * severityMultiplier,
      };
      effects.market = {
        sentiment: -15 * severityMultiplier,
      };
      break;

    case 'supply_disruption':
      effects.company = {
        productQuality: -5 * severityMultiplier,
        costs: 1 * severityMultiplier,
      };
      effects.risk = {
        operational: 15 * severityMultiplier,
      };
      effects.market = {
        channelFriction: 10 * severityMultiplier,
      };
      break;

    case 'viral_positive_review':
      effects.company = {
        brandTrust: 8 * severityMultiplier,
        salesPipeline: 5 * severityMultiplier,
      };
      effects.market = {
        demandIndex: 10 * severityMultiplier,
        sentiment: 15 * severityMultiplier,
      };
      break;

    case 'enterprise_rfp':
      effects.company = {
        salesPipeline: 8 * severityMultiplier,
      };
      effects.market = {
        demandIndex: 5 * severityMultiplier,
      };
      break;

    case 'macro_downturn':
      effects.market = {
        demandIndex: -15 * severityMultiplier,
        sentiment: -10 * severityMultiplier,
      };
      effects.company = {
        salesPipeline: -5 * severityMultiplier,
      };
      effects.risk = {
        financial: 10 * severityMultiplier,
      };
      break;
  }

  return effects;
}

/**
 * Apply event effects to game state
 */
export function applyEventEffects(
  company: CompanyState,
  market: MarketState,
  risk: RiskProfile,
  event: GameEvent
): { company: CompanyState; market: MarketState; risk: RiskProfile } {
  const newCompany = { ...company };
  const newMarket = { ...market };
  const newRisk = { ...risk };

  if (event.effects.company) {
    for (const [key, value] of Object.entries(event.effects.company)) {
      if (key in newCompany && typeof value === 'number') {
        (newCompany as Record<string, number>)[key] += value;
      }
    }
  }

  if (event.effects.market) {
    for (const [key, value] of Object.entries(event.effects.market)) {
      if (key in newMarket && typeof value === 'number') {
        (newMarket as Record<string, number>)[key] += value;
      }
    }
  }

  if (event.effects.risk) {
    for (const [key, value] of Object.entries(event.effects.risk)) {
      if (key in newRisk && typeof value === 'number') {
        (newRisk as Record<string, number>)[key] += value;
      }
    }
  }

  return { company: newCompany, market: newMarket, risk: newRisk };
}

/**
 * Manually inject an event (for facilitator use)
 */
export function injectEvent(
  eventType: EventType,
  round: number,
  severity: 'low' | 'medium' | 'high' = 'medium'
): GameEvent {
  const severityMultiplier = severity === 'high' ? 1.5 : severity === 'medium' ? 1.0 : 0.6;
  const id = `injected_${round}_${eventType}_${Date.now()}`;

  const definitions: Record<EventType, { name: string; description: string }> = {
    regulator_inquiry: {
      name: 'Regulatory Inquiry',
      description: 'Regulators have opened an inquiry into your AI practices.',
    },
    competitor_price_war: {
      name: 'Competitor Price War',
      description: 'A major competitor has slashed prices by 30%.',
    },
    data_incident_rumor: {
      name: 'Data Incident Rumor',
      description: 'Social media is buzzing about a potential data breach.',
    },
    supply_disruption: {
      name: 'Supply Chain Disruption',
      description: 'Key infrastructure provider experiencing outages.',
    },
    viral_positive_review: {
      name: 'Viral Positive Review',
      description: 'An influential analyst published a glowing review.',
    },
    enterprise_rfp: {
      name: 'Enterprise RFP Opportunity',
      description: 'Fortune 500 company seeking AI solutions partner.',
    },
    macro_downturn: {
      name: 'Market Downturn',
      description: 'Economic indicators signal reduced enterprise spending.',
    },
  };

  const effects = getEventEffects(eventType, severityMultiplier);

  return {
    id,
    type: eventType,
    name: definitions[eventType].name,
    description: `[Injected] ${definitions[eventType].description}`,
    severity,
    round,
    effects,
    resolved: false,
  };
}
