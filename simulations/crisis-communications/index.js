// Crisis Communications Simulation
// Core simulation engine for managing corporate communications during a reputational crisis

import { CONFIGURATIONS, DIMENSION_WEIGHTS, CRISIS_CONSTANTS, getConfigurationById } from './config.js';
import { STAKEHOLDERS, RELATIONSHIP_DYNAMICS, getStakeholderById, getAllStakeholders } from './stakeholders.js';
import { ROUNDS, PHASE_DESCRIPTIONS, getRoundById, getRoundsByPhase } from './rounds.js';

export class CrisisCommunicationsSimulation {
  constructor(configurationId = 'PRODUCT_RECALL') {
    this.configuration = getConfigurationById(configurationId);
    this.currentRound = 1;
    this.decisions = [];
    this.events = [];
    this.state = {};
    this.stakeholderRelationships = {};
    this.crisisMetrics = {};
    this.initializeState();
    this.initializeRelationships();
    this.initializeCrisisMetrics();
  }

  initializeState() {
    this.state = { ...this.configuration.initialState };
    this.crisisContext = { ...this.configuration.crisisContext };
  }

  initializeRelationships() {
    const stakeholders = getAllStakeholders();
    stakeholders.forEach(stakeholder => {
      this.stakeholderRelationships[stakeholder.id] = {
        trust: stakeholder.initialTrust,
        alignment: stakeholder.initialAlignment,
        satisfaction: 60,
        influence: stakeholder.influence,
        engagementLevel: 50
      };
    });

    RELATIONSHIP_DYNAMICS.ALLIANCES.forEach(([s1, s2]) => {
      if (this.stakeholderRelationships[s1] && this.stakeholderRelationships[s2]) {
        this.stakeholderRelationships[s1].trust += 5;
        this.stakeholderRelationships[s2].trust += 5;
      }
    });

    RELATIONSHIP_DYNAMICS.TENSIONS.forEach(([s1, s2]) => {
      if (this.stakeholderRelationships[s1] && this.stakeholderRelationships[s2]) {
        this.stakeholderRelationships[s1].alignment -= 5;
        this.stakeholderRelationships[s2].alignment -= 5;
      }
    });
  }

  initializeCrisisMetrics() {
    this.crisisMetrics = {
      severityLevel: CRISIS_CONSTANTS.SEVERITY_LEVELS.indexOf(this.crisisContext.severity),
      responseEffectiveness: 50,
      narrativeControl: 0,
      reputationTrajectory: 0,
      stakeholderImpact: this.calculateStakeholderImpact()
    };
  }

  calculateStakeholderImpact() {
    const relationships = Object.values(this.stakeholderRelationships);
    return Math.round(relationships.reduce((sum, r) => sum + r.trust, 0) / relationships.length);
  }

  getCurrentRound() {
    return getRoundById(this.currentRound);
  }

  getCurrentPhase() {
    const round = this.getCurrentRound();
    return round ? PHASE_DESCRIPTIONS[round.phase] : null;
  }

  makeDecision(optionId) {
    const round = this.getCurrentRound();
    if (!round) return { success: false, error: 'No active round' };

    const option = round.options.find(o => o.id === optionId);
    if (!option) return { success: false, error: 'Invalid option' };

    this.applyImpact(option.impact);
    this.processStakeholderReactions(option.stakeholderReactions);
    const eventOccurred = this.checkForEvents(option, round);
    this.updateCrisisMetrics(option);

    const decision = {
      round: this.currentRound,
      phase: round.phase,
      optionId,
      optionText: option.text,
      impact: option.impact,
      timestamp: new Date().toISOString(),
      stateAfter: { ...this.state },
      metricsAfter: { ...this.crisisMetrics },
      eventOccurred
    };
    this.decisions.push(decision);

    this.currentRound++;

    return {
      success: true,
      decision,
      newState: this.state,
      crisisMetrics: this.crisisMetrics,
      nextRound: this.getCurrentRound(),
      isComplete: this.currentRound > 24
    };
  }

  applyImpact(impact) {
    Object.entries(impact).forEach(([dimension, value]) => {
      if (this.state[dimension] !== undefined) {
        this.state[dimension] = Math.max(0, Math.min(100, this.state[dimension] + value));
      }
    });
  }

  processStakeholderReactions(reactions) {
    Object.entries(reactions).forEach(([stakeholderId, change]) => {
      const relationship = this.stakeholderRelationships[stakeholderId];
      if (relationship) {
        relationship.trust = Math.max(0, Math.min(100, relationship.trust + change * 0.6));
        relationship.satisfaction = Math.max(0, Math.min(100, relationship.satisfaction + change * 0.4));
        if (change > 10) relationship.engagementLevel = Math.min(100, relationship.engagementLevel + 5);
        if (change < -10) relationship.engagementLevel = Math.max(0, relationship.engagementLevel - 5);
      }
    });
  }

  checkForEvents(option, round) {
    if (Math.random() < option.risk) {
      const eventTypes = [
        { type: 'VIRAL_BACKLASH', impact: { publicPerception: -8, socialMediaSentiment: -10 } },
        { type: 'MEDIA_LEAK', impact: { mediaRelations: -8, messageConsistency: -5 } },
        { type: 'STAKEHOLDER_DEFECTION', impact: { stakeholderTrust: -8, brandEquity: -5 } },
        { type: 'REGULATORY_ESCALATION', impact: { regulatoryStanding: -8, stakeholderTrust: -5 } },
        { type: 'EMPLOYEE_REVOLT', impact: { employeeConfidence: -10, messageConsistency: -5 } },
        { type: 'NARRATIVE_HIJACK', impact: { publicPerception: -5, mediaRelations: -5, socialMediaSentiment: -5 } }
      ];

      const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      this.applyImpact(event.impact);
      this.events.push({
        round: this.currentRound,
        type: event.type,
        impact: event.impact,
        triggeredBy: option.id
      });
      return event;
    }
    return null;
  }

  updateCrisisMetrics(option) {
    this.crisisMetrics.responseEffectiveness = Math.min(100, Math.max(0,
      this.crisisMetrics.responseEffectiveness + (this.state.publicPerception - 50) * 0.2));

    this.crisisMetrics.narrativeControl = Math.min(100, Math.max(0,
      (this.state.messageConsistency + this.state.mediaRelations) / 2));

    this.crisisMetrics.reputationTrajectory = Math.min(100, Math.max(0,
      (this.state.publicPerception + this.state.brandEquity + this.state.stakeholderTrust) / 3));

    this.crisisMetrics.stakeholderImpact = this.calculateStakeholderImpact();
  }

  getScore() {
    let totalScore = 0;
    let maxPossible = 0;

    Object.entries(DIMENSION_WEIGHTS).forEach(([dimension, weight]) => {
      const value = this.state[dimension] || 0;
      totalScore += value * weight;
      maxPossible += 100 * weight;
    });

    const avgTrust = Object.values(this.stakeholderRelationships)
      .reduce((sum, r) => sum + r.trust, 0) / Object.keys(this.stakeholderRelationships).length;
    const stakeholderFactor = avgTrust / 100;

    const narrativeFactor = this.crisisMetrics.narrativeControl / 100;

    return Math.round((totalScore / maxPossible) * 100 * stakeholderFactor * (0.6 + narrativeFactor * 0.4));
  }

  getRating() {
    const score = this.getScore();
    if (score >= 90) return { grade: 'A+', title: 'Communications Master', description: 'Exceptional crisis communications that transformed the narrative' };
    if (score >= 80) return { grade: 'A', title: 'Narrative Architect', description: 'Outstanding communications leadership and reputation management' };
    if (score >= 70) return { grade: 'B+', title: 'Crisis Communicator', description: 'Strong communications response with effective stakeholder management' };
    if (score >= 60) return { grade: 'B', title: 'Message Manager', description: 'Competent communications handling with room for improvement' };
    if (score >= 50) return { grade: 'C', title: 'Damage Limiter', description: 'Survived the communications crisis with significant reputation damage' };
    return { grade: 'D', title: 'Communications Casualty', description: 'Failed to manage the narrative effectively' };
  }

  getNarrativeStatus() {
    const control = this.crisisMetrics.narrativeControl;
    if (control >= 80) return 'DOMINANT';
    if (control >= 60) return 'FAVORABLE';
    if (control >= 40) return 'CONTESTED';
    if (control >= 20) return 'LOSING';
    return 'HIJACKED';
  }

  getSummary() {
    return {
      configuration: this.configuration.id,
      currentRound: this.currentRound,
      phase: this.getCurrentPhase()?.name,
      state: { ...this.state },
      crisisMetrics: { ...this.crisisMetrics },
      score: this.getScore(),
      rating: this.getRating(),
      narrativeStatus: this.getNarrativeStatus(),
      decisionsCount: this.decisions.length,
      eventsCount: this.events.length,
      stakeholderHealth: this.getStakeholderHealth()
    };
  }

  getStakeholderHealth() {
    const relationships = Object.entries(this.stakeholderRelationships);
    return {
      averageTrust: Math.round(relationships.reduce((s, [, r]) => s + r.trust, 0) / relationships.length),
      averageSatisfaction: Math.round(relationships.reduce((s, [, r]) => s + r.satisfaction, 0) / relationships.length),
      criticalRelationships: relationships.filter(([, r]) => r.trust < 40).map(([id]) => id),
      strongRelationships: relationships.filter(([, r]) => r.trust >= 75).map(([id]) => id)
    };
  }

  exportResults() {
    return {
      simulation: 'Crisis Communications',
      configuration: this.configuration,
      finalState: this.state,
      finalMetrics: this.crisisMetrics,
      finalScore: this.getScore(),
      finalRating: this.getRating(),
      narrativeStatus: this.getNarrativeStatus(),
      decisions: this.decisions,
      events: this.events,
      stakeholderRelationships: this.stakeholderRelationships,
      completedAt: new Date().toISOString()
    };
  }
}

export { CONFIGURATIONS, STAKEHOLDERS, ROUNDS, PHASE_DESCRIPTIONS };
