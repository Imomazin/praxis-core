// Crisis Communications Simulation Configuration
// Managing corporate communications during a rapidly evolving reputational crisis

export const CONFIGURATIONS = {
  PRODUCT_RECALL: {
    id: 'PRODUCT_RECALL',
    name: 'Product Recall Crisis',
    description: 'A widely used consumer product has been found to cause safety issues. Manage the recall narrative while protecting brand reputation and customer safety.',
    initialState: {
      publicPerception: 40,
      mediaRelations: 35,
      stakeholderTrust: 42,
      messageConsistency: 50,
      socialMediaSentiment: 30,
      employeeConfidence: 55,
      regulatoryStanding: 38,
      brandEquity: 45
    },
    crisisContext: { crisisType: 'PRODUCT_SAFETY', severity: 'CRITICAL', timeframe: 'IMMEDIATE', publicExposure: 'VERY_HIGH' }
  },
  EXECUTIVE_SCANDAL: {
    id: 'EXECUTIVE_SCANDAL',
    name: 'Executive Scandal',
    description: 'A senior executive faces serious allegations of misconduct. The story is gaining traction and threatens to define the company brand.',
    initialState: {
      publicPerception: 35,
      mediaRelations: 30,
      stakeholderTrust: 38,
      messageConsistency: 45,
      socialMediaSentiment: 25,
      employeeConfidence: 40,
      regulatoryStanding: 55,
      brandEquity: 42
    },
    crisisContext: { crisisType: 'LEADERSHIP_MISCONDUCT', severity: 'SEVERE', timeframe: 'URGENT', publicExposure: 'HIGH' }
  },
  ENVIRONMENTAL_DISASTER: {
    id: 'ENVIRONMENTAL_DISASTER',
    name: 'Environmental Disaster',
    description: 'A facility incident has caused significant environmental damage. Communities are outraged, regulators are mobilizing, and media coverage is relentless.',
    initialState: {
      publicPerception: 28,
      mediaRelations: 32,
      stakeholderTrust: 35,
      messageConsistency: 48,
      socialMediaSentiment: 20,
      employeeConfidence: 50,
      regulatoryStanding: 30,
      brandEquity: 38
    },
    crisisContext: { crisisType: 'ENVIRONMENTAL', severity: 'CRITICAL', timeframe: 'IMMEDIATE', publicExposure: 'EXTREME' }
  },
  DATA_BREACH: {
    id: 'DATA_BREACH',
    name: 'Data Breach Fallout',
    description: 'A massive data breach has exposed millions of customer records. Trust is shattered, lawsuits are forming, and regulators demand answers.',
    initialState: {
      publicPerception: 32,
      mediaRelations: 38,
      stakeholderTrust: 30,
      messageConsistency: 52,
      socialMediaSentiment: 22,
      employeeConfidence: 48,
      regulatoryStanding: 35,
      brandEquity: 40
    },
    crisisContext: { crisisType: 'DATA_SECURITY', severity: 'CRITICAL', timeframe: 'IMMEDIATE', publicExposure: 'VERY_HIGH' }
  }
};

export const DIMENSION_WEIGHTS = {
  publicPerception: 0.18,
  mediaRelations: 0.14,
  stakeholderTrust: 0.16,
  messageConsistency: 0.10,
  socialMediaSentiment: 0.12,
  employeeConfidence: 0.10,
  regulatoryStanding: 0.12,
  brandEquity: 0.08
};

export const CRISIS_CONSTANTS = {
  SEVERITY_LEVELS: ['LOW', 'MODERATE', 'HIGH', 'SEVERE', 'CRITICAL'],
  RESPONSE_MODES: ['MONITOR', 'RESPOND', 'CONTAIN', 'RECOVER', 'REBUILD'],
  COMMUNICATION_CHANNELS: ['PRESS_CONFERENCE', 'SOCIAL_MEDIA', 'INTERNAL_MEMO', 'REGULATORY_FILING', 'STAKEHOLDER_LETTER', 'MEDIA_INTERVIEW'],
  NARRATIVE_FRAMES: ['ACCOUNTABILITY', 'VICTIM', 'PROGRESS', 'TRANSFORMATION', 'DEFIANCE', 'EMPATHY']
};

export const getConfigurationById = (id) => CONFIGURATIONS[id] || CONFIGURATIONS.PRODUCT_RECALL;
