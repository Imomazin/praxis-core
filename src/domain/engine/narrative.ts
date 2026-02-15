/**
 * Narrative Generation
 *
 * Creates human-readable explanations of what happened and why.
 * Helps learners understand cause and effect.
 */

import type {
  GameState,
  RoundDecisions,
  GameEvent,
  NarrativeEntry,
} from './types';

/**
 * Generate narrative entries for a round
 */
export function generateNarrative(
  previousState: GameState,
  newState: GameState,
  decisions: RoundDecisions,
  events: GameEvent[],
  round: number
): NarrativeEntry[] {
  const narratives: NarrativeEntry[] = [];
  const idPrefix = `r${round}_`;
  let idCounter = 0;

  const getId = () => `${idPrefix}${++idCounter}`;

  // Decision narratives
  narratives.push(...generateDecisionNarratives(decisions, round, getId));

  // Event narratives
  narratives.push(...generateEventNarratives(events, round, getId));

  // Outcome narratives (comparing before/after)
  narratives.push(...generateOutcomeNarratives(previousState, newState, round, getId));

  // Warning narratives
  narratives.push(...generateWarningNarratives(newState, round, getId));

  // Achievement narratives
  narratives.push(...generateAchievementNarratives(previousState, newState, round, getId));

  return narratives;
}

/**
 * Generate narratives for decisions made
 */
function generateDecisionNarratives(
  decisions: RoundDecisions,
  round: number,
  getId: () => string
): NarrativeEntry[] {
  const narratives: NarrativeEntry[] = [];

  if (decisions.strategy) {
    const d = decisions.strategy;
    narratives.push({
      id: getId(),
      round,
      category: 'decision',
      title: 'Strategic Direction Set',
      description: `Leadership adopted a ${d.riskPosture} risk posture and prioritized expansion into ${
        d.marketEntry === 'regionA' ? 'North America' :
        d.marketEntry === 'regionB' ? 'Europe' : 'Asia Pacific'
      }. Capital allocation: R&D ${d.capitalAllocation.rnd}%, Marketing ${d.capitalAllocation.marketing}%, Operations ${d.capitalAllocation.operations}%, Compliance ${d.capitalAllocation.compliance}%.`,
      impact: d.riskPosture === 'aggressive' ? 'positive' : 'neutral',
      metrics: ['risk', 'market'],
    });
  }

  if (decisions.marketing) {
    const d = decisions.marketing;
    if (d.campaignSpend > 5) {
      narratives.push({
        id: getId(),
        round,
        category: 'decision',
        title: 'Major Marketing Push',
        description: `Marketing launched a $${d.campaignSpend}M campaign with ${d.positioning} positioning through ${d.channelMix} channels. ${
          d.pricingChangePct !== 0
            ? `Pricing adjusted by ${d.pricingChangePct > 0 ? '+' : ''}${d.pricingChangePct}%.`
            : 'Pricing held steady.'
        }`,
        impact: 'positive',
        metrics: ['demand', 'brand'],
      });
    }
  }

  if (decisions.operations) {
    const d = decisions.operations;
    if (d.capacityInvestment > 5 || d.supplierStrategy === 'diversified') {
      narratives.push({
        id: getId(),
        round,
        category: 'decision',
        title: 'Operations Strengthened',
        description: `Operations invested $${d.capacityInvestment}M in capacity with a ${d.supplierStrategy} supplier strategy. Delivery target set to ${d.deliverySpeed}. QA received $${d.qaInvestment}M.`,
        impact: 'positive',
        metrics: ['operations', 'risk'],
      });
    }
  }

  if (decisions.rnd) {
    const d = decisions.rnd;
    narratives.push({
      id: getId(),
      round,
      category: 'decision',
      title: 'R&D Focus Defined',
      description: `R&D focused on ${d.roadmapFocus} with ${d.releaseCadence} releases. Model quality investment: $${d.modelQualityInvestment}M. Experimentation budget: $${d.experimentationBudget}M.`,
      impact: 'neutral',
      metrics: ['quality', 'techDebt'],
    });
  }

  if (decisions.legal) {
    const d = decisions.legal;
    if (d.complianceSpend > 2 || d.policyStrictness === 'tight') {
      narratives.push({
        id: getId(),
        round,
        category: 'decision',
        title: 'Compliance Prioritized',
        description: `Legal invested $${d.complianceSpend}M in compliance with ${d.policyStrictness} policy strictness. Audit readiness at ${d.auditReadiness}%. Data handling: ${d.dataHandling}.`,
        impact: 'positive',
        metrics: ['compliance', 'regulatory'],
      });
    }
  }

  if (decisions.gm) {
    const d = decisions.gm;
    if (d.hiringPlan !== 'maintain') {
      narratives.push({
        id: getId(),
        round,
        category: 'decision',
        title: d.hiringPlan === 'grow' ? 'Expansion Mode' : 'Restructuring',
        description: d.hiringPlan === 'grow'
          ? `GM initiated hiring to grow the team with a ${d.orgDesign} structure. Culture investment: $${d.cultureInvestment}M.`
          : `GM announced workforce reduction. Crisis response stance: ${d.crisisResponse}. Culture investment: $${d.cultureInvestment}M.`,
        impact: d.hiringPlan === 'grow' ? 'positive' : 'negative',
        metrics: ['headcount', 'morale'],
      });
    }
  }

  return narratives;
}

/**
 * Generate narratives for events that occurred
 */
function generateEventNarratives(
  events: GameEvent[],
  round: number,
  getId: () => string
): NarrativeEntry[] {
  return events.map(event => ({
    id: getId(),
    round,
    category: 'event' as const,
    title: event.name,
    description: `${event.description} Severity: ${event.severity}.`,
    impact: ['viral_positive_review', 'enterprise_rfp'].includes(event.type)
      ? 'positive' as const
      : 'negative' as const,
    metrics: Object.keys(event.effects.company || {}).concat(
      Object.keys(event.effects.market || {}),
      Object.keys(event.effects.risk || {})
    ),
  }));
}

/**
 * Generate narratives comparing before/after state
 */
function generateOutcomeNarratives(
  prev: GameState,
  next: GameState,
  round: number,
  getId: () => string
): NarrativeEntry[] {
  const narratives: NarrativeEntry[] = [];

  // Revenue change
  const revenueDelta = next.company.revenue - prev.company.revenue;
  if (Math.abs(revenueDelta) > 1) {
    narratives.push({
      id: getId(),
      round,
      category: 'outcome',
      title: revenueDelta > 0 ? 'Revenue Growth' : 'Revenue Decline',
      description: revenueDelta > 0
        ? `Revenue increased by $${revenueDelta.toFixed(1)}M to $${next.company.revenue.toFixed(1)}M this quarter. ${
            next.market.demandIndex > prev.market.demandIndex
              ? 'Market demand is up, driving sales.'
              : 'Pricing and sales efforts are paying off.'
          }`
        : `Revenue decreased by $${Math.abs(revenueDelta).toFixed(1)}M to $${next.company.revenue.toFixed(1)}M. ${
            next.company.churn > prev.company.churn
              ? 'Customer churn increased this quarter.'
              : 'Market conditions softened.'
          }`,
      impact: revenueDelta > 0 ? 'positive' : 'negative',
      metrics: ['revenue'],
    });
  }

  // Trust change
  const trustDelta = next.company.brandTrust - prev.company.brandTrust;
  if (Math.abs(trustDelta) > 5) {
    narratives.push({
      id: getId(),
      round,
      category: 'outcome',
      title: trustDelta > 0 ? 'Trust Building' : 'Trust Erosion',
      description: trustDelta > 0
        ? `Brand trust improved by ${trustDelta.toFixed(0)} points to ${next.company.brandTrust}%. Your responsible approach is resonating.`
        : `Brand trust fell by ${Math.abs(trustDelta).toFixed(0)} points to ${next.company.brandTrust}%. Market perception needs attention.`,
      impact: trustDelta > 0 ? 'positive' : 'negative',
      metrics: ['brandTrust'],
    });
  }

  // Quality change
  const qualityDelta = next.company.productQuality - prev.company.productQuality;
  if (Math.abs(qualityDelta) > 5) {
    narratives.push({
      id: getId(),
      round,
      category: 'outcome',
      title: qualityDelta > 0 ? 'Quality Improvement' : 'Quality Issues',
      description: qualityDelta > 0
        ? `Product quality score rose to ${next.company.productQuality}%. R&D and QA investments are showing results.`
        : `Product quality dropped to ${next.company.productQuality}%. Technical debt or rushed releases may be factors.`,
      impact: qualityDelta > 0 ? 'positive' : 'negative',
      metrics: ['productQuality'],
    });
  }

  // Score change
  const scoreDelta = next.scorecard.totalScore - prev.scorecard.totalScore;
  if (Math.abs(scoreDelta) > 20) {
    narratives.push({
      id: getId(),
      round,
      category: 'outcome',
      title: 'Quarterly Performance',
      description: `Overall score ${scoreDelta > 0 ? 'improved' : 'declined'} by ${Math.abs(scoreDelta).toFixed(0)} points to ${next.scorecard.totalScore}/500. ${next.scorecard.boardConfidence}`,
      impact: scoreDelta > 0 ? 'positive' : 'negative',
      metrics: ['totalScore'],
    });
  }

  return narratives;
}

/**
 * Generate warning narratives for concerning metrics
 */
function generateWarningNarratives(
  state: GameState,
  round: number,
  getId: () => string
): NarrativeEntry[] {
  const narratives: NarrativeEntry[] = [];

  // Cash warning
  if (state.company.cash < 10) {
    narratives.push({
      id: getId(),
      round,
      category: 'warning',
      title: 'Cash Runway Alert',
      description: `Cash reserves are critically low at $${state.company.cash.toFixed(1)}M. Only ${state.company.runwayMonths} months of runway remaining. Consider cost reduction or funding.`,
      impact: 'negative',
      metrics: ['cash', 'runwayMonths'],
    });
  }

  // Tech debt warning
  if (state.company.techDebt > 60) {
    narratives.push({
      id: getId(),
      round,
      category: 'warning',
      title: 'Technical Debt Critical',
      description: `Technical debt has reached ${state.company.techDebt}%. System reliability and development velocity are severely impacted. Consider dedicating R&D to reliability.`,
      impact: 'negative',
      metrics: ['techDebt'],
    });
  }

  // Morale warning
  if (state.company.morale < 40) {
    narratives.push({
      id: getId(),
      round,
      category: 'warning',
      title: 'Team Morale Concerning',
      description: `Employee morale is at ${state.company.morale}%. Talent retention risk is elevated. Consider culture investment and communication.`,
      impact: 'negative',
      metrics: ['morale'],
    });
  }

  // Regulatory warning
  if (state.risk.regulatory > 60) {
    narratives.push({
      id: getId(),
      round,
      category: 'warning',
      title: 'Regulatory Exposure High',
      description: `Regulatory risk is elevated at ${state.risk.regulatory}%. ${state.scorecard.regulatoryHeat}`,
      impact: 'negative',
      metrics: ['regulatory'],
    });
  }

  // Churn warning
  if (state.company.churn > 15) {
    narratives.push({
      id: getId(),
      round,
      category: 'warning',
      title: 'Customer Churn Elevated',
      description: `Customer churn has reached ${state.company.churn.toFixed(1)}%. Focus on quality, support, and customer success to retain users.`,
      impact: 'negative',
      metrics: ['churn'],
    });
  }

  return narratives;
}

/**
 * Generate achievement narratives for milestones
 */
function generateAchievementNarratives(
  prev: GameState,
  next: GameState,
  round: number,
  getId: () => string
): NarrativeEntry[] {
  const narratives: NarrativeEntry[] = [];

  // Revenue milestone
  if (prev.company.revenue < 10 && next.company.revenue >= 10) {
    narratives.push({
      id: getId(),
      round,
      category: 'achievement',
      title: '$10M Quarterly Revenue',
      description: 'Praxis Assist has crossed the $10M quarterly revenue milestone. The business is gaining significant traction.',
      impact: 'positive',
      metrics: ['revenue'],
    });
  }

  // Profitability milestone
  if (prev.company.profit <= 0 && next.company.profit > 0) {
    narratives.push({
      id: getId(),
      round,
      category: 'achievement',
      title: 'Profitability Achieved',
      description: `The company is now profitable with $${next.company.profit.toFixed(1)}M in quarterly profit. A significant milestone for sustainable growth.`,
      impact: 'positive',
      metrics: ['profit'],
    });
  }

  // Trust milestone
  if (prev.company.brandTrust < 80 && next.company.brandTrust >= 80) {
    narratives.push({
      id: getId(),
      round,
      category: 'achievement',
      title: 'Trust Leader',
      description: 'Brand trust has reached 80%+. Praxis is becoming recognized as a leader in responsible AI.',
      impact: 'positive',
      metrics: ['brandTrust'],
    });
  }

  // Quality milestone
  if (prev.company.productQuality < 90 && next.company.productQuality >= 90) {
    narratives.push({
      id: getId(),
      round,
      category: 'achievement',
      title: 'Product Excellence',
      description: 'Product quality has reached 90%+. Your investment in R&D and QA has resulted in a best-in-class product.',
      impact: 'positive',
      metrics: ['productQuality'],
    });
  }

  return narratives;
}

/**
 * Generate a "Board Memo" summary of the round
 */
export function generateBoardMemo(state: GameState): string {
  const s = state.scorecard;
  const c = state.company;
  const round = state.round;

  let memo = `# PRAXIS ASSIST - BOARD MEMO\n`;
  memo += `## Q${round} Performance Summary\n\n`;

  memo += `### Financial Overview\n`;
  memo += `- **Revenue:** $${c.revenue.toFixed(1)}M/quarter\n`;
  memo += `- **Profit:** $${c.profit.toFixed(1)}M/quarter\n`;
  memo += `- **Cash Position:** $${c.cash.toFixed(1)}M\n`;
  memo += `- **Runway:** ${c.runwayMonths} months\n\n`;

  memo += `### Scorecard\n`;
  memo += `| Metric | Score |\n`;
  memo += `|--------|-------|\n`;
  memo += `| Financial Health | ${s.financialHealth}/100 |\n`;
  memo += `| Growth | ${s.growth}/100 |\n`;
  memo += `| Trust | ${s.trust}/100 |\n`;
  memo += `| Resilience | ${s.resilience}/100 |\n`;
  memo += `| Execution | ${s.execution}/100 |\n`;
  memo += `| **Total** | **${s.totalScore}/500** |\n\n`;

  memo += `### Board Confidence\n`;
  memo += `${s.boardConfidence}\n\n`;

  memo += `### Regulatory Status\n`;
  memo += `${s.regulatoryHeat}\n\n`;

  memo += `### Key Metrics\n`;
  memo += `- Brand Trust: ${c.brandTrust}%\n`;
  memo += `- Product Quality: ${c.productQuality}%\n`;
  memo += `- Team Morale: ${c.morale}%\n`;
  memo += `- Technical Debt: ${c.techDebt}%\n`;
  memo += `- Customer Churn: ${c.churn.toFixed(1)}%\n\n`;

  // Recent events
  const recentEvents = state.events.filter(e => e.round === round);
  if (recentEvents.length > 0) {
    memo += `### Notable Events This Quarter\n`;
    for (const event of recentEvents) {
      memo += `- **${event.name}** (${event.severity}): ${event.description}\n`;
    }
    memo += '\n';
  }

  // Recent narratives
  const recentNarratives = state.narrative.filter(
    n => n.round === round && ['warning', 'achievement'].includes(n.category)
  );
  if (recentNarratives.length > 0) {
    memo += `### Highlights & Concerns\n`;
    for (const n of recentNarratives) {
      const icon = n.category === 'achievement' ? '✅' : '⚠️';
      memo += `${icon} **${n.title}**: ${n.description}\n`;
    }
  }

  return memo;
}

/**
 * Generate lessons learned from scoring deltas
 */
export function generateLessonsLearned(
  history: { round: number; scorecard: GameState['scorecard'] }[]
): string[] {
  const lessons: string[] = [];

  if (history.length < 2) return lessons;

  // Analyze trends
  const firstHalf = history.slice(0, Math.floor(history.length / 2));
  const secondHalf = history.slice(Math.floor(history.length / 2));

  const avgFirst = (arr: typeof history) =>
    arr.reduce((sum, h) => sum + h.scorecard.totalScore, 0) / arr.length;

  const firstScore = avgFirst(firstHalf);
  const secondScore = avgFirst(secondHalf);

  if (secondScore > firstScore + 50) {
    lessons.push('Strong improvement in the second half shows adaptability and learning from early challenges.');
  } else if (secondScore < firstScore - 50) {
    lessons.push('Performance declined over time. Consider whether aggressive early growth created unsustainable debt.');
  }

  // Trust analysis
  const lastState = history[history.length - 1];
  if (lastState.scorecard.trust < 50) {
    lessons.push('Trust scores remained low. In AI businesses, trust is foundational—consider prioritizing compliance and transparency earlier.');
  } else if (lastState.scorecard.trust > 80) {
    lessons.push('High trust scores demonstrate the value of responsible AI practices for long-term success.');
  }

  // Resilience analysis
  if (lastState.scorecard.resilience < 50) {
    lessons.push('Low resilience indicates vulnerability to shocks. Diversifying suppliers and reducing technical debt builds organizational durability.');
  }

  // Financial analysis
  if (lastState.scorecard.financialHealth < 40) {
    lessons.push('Financial struggles suggest the need for better balance between growth investment and sustainable unit economics.');
  }

  return lessons;
}
