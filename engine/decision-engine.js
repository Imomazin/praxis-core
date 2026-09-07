// engine/decision-engine.js
// Applies a round's decisions to the simulation state. This is the module that
// api/decide previously imported but which never existed. Decisions are a set
// of leadership "levers"; each nudges the underlying state within safe bounds.

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * @param {object} state     Simulation state (see engine/state.js)
 * @param {object} decisions Lever values, each roughly in [-1, 1]
 * @returns {object} the mutated state
 */
export function applyDecisions(state, decisions = {}) {
  const {
    pricing = 0, // raise (+) or cut (-) prices
    operationsInvestment = 0, // invest in capacity/quality/supply
    compliance = 0, // strengthen (+) or relax (-) compliance posture
    marketing = 0, // invest in demand generation
  } = decisions;

  // Pricing: higher prices lift the price index but soften demand.
  state.market.priceIndex = clamp(state.market.priceIndex + pricing * 0.1, 0.5, 2.0);
  state.market.demand = clamp(state.market.demand + marketing * 0.08 - pricing * 0.05, 0.1, 2.0);

  // Operations investment improves capacity, quality and supply stability but
  // costs cash up front.
  state.operations.capacity = clamp(state.operations.capacity + operationsInvestment * 0.05, 0.1, 2.0);
  state.operations.qualityLevel = clamp(state.operations.qualityLevel + operationsInvestment * 0.05, 0.1, 2.0);
  state.operations.supplyStability = clamp(state.operations.supplyStability + operationsInvestment * 0.04, 0.1, 2.0);
  state.finance.cash -= operationsInvestment * 100000;

  // Compliance posture vs regulatory scrutiny.
  state.regulation.compliancePosture = clamp(state.regulation.compliancePosture + compliance * 0.08, 0.1, 2.0);
  state.regulation.scrutinyLevel = clamp(state.regulation.scrutinyLevel - compliance * 0.05, 0.05, 1.0);

  // Marketing spend costs cash.
  state.finance.cash -= marketing * 50000;

  if (!Array.isArray(state.decisions)) state.decisions = [];
  state.decisions.push({ round: state.round, decisions, at: new Date().toISOString() });

  return state;
}
