/**
 * Scoring System
 *
 * Calculates KPIs, scorecard, and determines victory conditions.
 */

import { GAME_CONSTANTS } from './config';
import type { CompanyState, MarketState, RiskProfile, Scorecard } from './types';

/**
 * Calculate the complete scorecard from current state
 */
export function calculateScorecard(
  company: CompanyState,
  market: MarketState,
  risk: RiskProfile,
  round: number
): Scorecard {
  const financialHealth = calculateFinancialHealth(company);
  const growth = calculateGrowth(company, market);
  const trust = calculateTrust(company);
  const resilience = calculateResilience(risk, company);
  const execution = calculateExecution(company);

  const weights = GAME_CONSTANTS.SCORE_WEIGHTS;
  const totalScore = Math.round(
    financialHealth * weights.financialHealth +
    growth * weights.growth +
    trust * weights.trust +
    resilience * weights.resilience +
    execution * weights.execution
  );

  const boardConfidence = getBoardConfidenceNarrative(totalScore, round);
  const regulatoryHeat = getRegulatoryHeatNarrative(risk.regulatory, company.compliancePosture);

  return {
    financialHealth,
    growth,
    trust,
    resilience,
    execution,
    totalScore,
    boardConfidence,
    regulatoryHeat,
  };
}

/**
 * Financial Health Score (0-100)
 * Based on: profitability trend, cash runway, debt level
 */
function calculateFinancialHealth(company: CompanyState): number {
  let score = 50; // baseline

  // Profitability bonus/penalty
  if (company.profit > 0) {
    score += Math.min(company.profit * 3, 20); // up to +20 for profit
  } else {
    score += Math.max(company.profit * 5, -30); // penalty for losses
  }

  // Cash runway bonus
  if (company.runwayMonths > 24) {
    score += 15;
  } else if (company.runwayMonths > 12) {
    score += 10;
  } else if (company.runwayMonths > 6) {
    score += 5;
  } else if (company.runwayMonths < 3) {
    score -= 20; // danger zone
  }

  // Debt penalty
  if (company.cash < 0) {
    score -= 15;
  }

  // Revenue growth implied
  score += Math.min(company.revenue * 0.5, 10);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Growth Score (0-100)
 * Based on: market share, demand capture, pipeline health
 */
function calculateGrowth(company: CompanyState, market: MarketState): number {
  let score = 40; // baseline

  // Demand capture
  const demandBonus = (market.demandIndex - 100) * 0.2;
  score += demandBonus;

  // Pipeline health
  if (company.salesPipeline > 20) {
    score += 15;
  } else if (company.salesPipeline > 10) {
    score += 8;
  }

  // Churn penalty
  score -= company.churn * 0.5;

  // Sentiment bonus
  score += market.sentiment * 0.15;

  // Revenue milestone bonus
  if (company.revenue > 15) score += 10;
  else if (company.revenue > 10) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Trust Score (0-100)
 * Based on: brand trust, compliance posture
 */
function calculateTrust(company: CompanyState): number {
  // Weighted average of trust and compliance
  const trustWeight = 0.6;
  const complianceWeight = 0.4;

  const score =
    company.brandTrust * trustWeight +
    company.compliancePosture * complianceWeight;

  return Math.round(score);
}

/**
 * Resilience Score (0-100)
 * Based on: low risk profile, supply stability, morale
 */
function calculateResilience(risk: RiskProfile, company: CompanyState): number {
  // Start with 100 and subtract risk
  const avgRisk =
    (risk.operational + risk.regulatory + risk.reputational + risk.financial) / 4;

  let score = 100 - avgRisk;

  // Morale bonus
  if (company.morale > 80) {
    score += 10;
  } else if (company.morale < 40) {
    score -= 15;
  }

  // Tech debt penalty
  if (company.techDebt > 60) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Execution Score (0-100)
 * Based on: product quality, delivery, morale alignment
 */
function calculateExecution(company: CompanyState): number {
  let score = 0;

  // Product quality is primary driver
  score += company.productQuality * 0.5;

  // Morale contributes to execution
  score += company.morale * 0.3;

  // Tech debt hurts execution
  score -= company.techDebt * 0.2;

  // Headcount sweet spot bonus
  if (company.headcount >= 100 && company.headcount <= 300) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate board confidence narrative
 */
function getBoardConfidenceNarrative(totalScore: number, round: number): string {
  const avgScore = totalScore / 5; // Convert to 0-100 scale

  if (avgScore >= 80) {
    return 'The board is highly confident. Investors are excited about the trajectory.';
  } else if (avgScore >= 65) {
    return 'The board is cautiously optimistic. Key metrics trending in the right direction.';
  } else if (avgScore >= 50) {
    return 'The board is neutral. Some concerns, but still supportive of the strategy.';
  } else if (avgScore >= 35) {
    return 'The board is concerned. Pressure mounting for improved performance.';
  } else {
    return 'The board is alarmed. Leadership changes may be discussed if trends continue.';
  }
}

/**
 * Generate regulatory heat narrative
 */
function getRegulatoryHeatNarrative(regulatoryRisk: number, compliancePosture: number): string {
  const netExposure = regulatoryRisk - (compliancePosture * 0.5);

  if (netExposure < 10) {
    return 'Regulatory relations are excellent. You\'re seen as an industry leader in responsible AI.';
  } else if (netExposure < 25) {
    return 'Regulatory stance is stable. No immediate concerns, but vigilance required.';
  } else if (netExposure < 40) {
    return 'Regulators are watching closely. Consider strengthening compliance programs.';
  } else if (netExposure < 60) {
    return 'Regulatory pressure is building. Expect inquiries and prepare documentation.';
  } else {
    return 'Regulatory risk is critical. Enforcement action is possible if not addressed urgently.';
  }
}

/**
 * Calculate runway months based on cash and burn rate
 */
export function calculateRunway(cash: number, costs: number): number {
  if (costs <= 0) return 999;
  const monthlyBurn = costs / 3; // quarterly to monthly
  if (monthlyBurn <= 0) return 999;
  return Math.max(0, Math.round(cash / monthlyBurn));
}

/**
 * Determine if game is over (bankruptcy or success)
 */
export function checkGameEnd(company: CompanyState, round: number, maxRounds: number): {
  ended: boolean;
  reason?: string;
  success?: boolean;
} {
  // Bankruptcy check
  if (company.cash < -20 && company.runwayMonths < 1) {
    return {
      ended: true,
      reason: 'Company has run out of cash and entered bankruptcy.',
      success: false,
    };
  }

  // Complete collapse
  if (company.morale < 10 && company.headcount < 20) {
    return {
      ended: true,
      reason: 'Critical talent exodus - company cannot continue operations.',
      success: false,
    };
  }

  // Reached final round
  if (round >= maxRounds) {
    return {
      ended: true,
      reason: 'Simulation complete. Review your performance in the debrief.',
      success: company.profit > 0 && company.brandTrust > 50,
    };
  }

  return { ended: false };
}

/**
 * Generate end-game summary
 */
export function generateEndGameSummary(
  scorecard: Scorecard,
  company: CompanyState,
  round: number
): string {
  const avgScore = scorecard.totalScore / 5;

  let summary = `After ${round} quarters:\n\n`;

  if (avgScore >= 75) {
    summary += '🏆 EXCEPTIONAL PERFORMANCE\n';
    summary += 'Praxis Assist has become a market leader in responsible AI.';
  } else if (avgScore >= 60) {
    summary += '✅ STRONG PERFORMANCE\n';
    summary += 'The company is well-positioned for continued growth.';
  } else if (avgScore >= 45) {
    summary += '⚠️ MIXED RESULTS\n';
    summary += 'Some progress made, but significant challenges remain.';
  } else {
    summary += '❌ STRUGGLING\n';
    summary += 'The company faces serious headwinds and needs strategic realignment.';
  }

  summary += `\n\nFinal Revenue: $${company.revenue.toFixed(1)}M/quarter`;
  summary += `\nFinal Cash: $${company.cash.toFixed(1)}M`;
  summary += `\nBrand Trust: ${company.brandTrust}%`;
  summary += `\nTotal Score: ${scorecard.totalScore}/500`;

  return summary;
}
