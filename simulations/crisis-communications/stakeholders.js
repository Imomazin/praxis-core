// Crisis Communications Stakeholders
// 7 key roles in the crisis communications war room

export const STAKEHOLDERS = {
  CEO: {
    id: 'CEO',
    name: 'Chief Executive Officer',
    role: 'Ultimate Decision Maker',
    archetype: 'COMMANDER',
    influence: 0.95,
    initialTrust: 62,
    initialAlignment: 65,
    priorities: ['publicPerception', 'stakeholderTrust', 'brandEquity'],
    riskTolerance: 0.55,
    position: 'Wants to protect company legacy while doing the right thing. Torn between transparency and protecting shareholder value.',
    communicationStyle: 'Measured and authoritative'
  },
  CCO: {
    id: 'CCO',
    name: 'Chief Communications Officer',
    role: 'Narrative Architect',
    archetype: 'STRATEGIST',
    influence: 0.90,
    initialTrust: 70,
    initialAlignment: 72,
    priorities: ['mediaRelations', 'messageConsistency', 'publicPerception'],
    riskTolerance: 0.60,
    position: 'Advocates for proactive messaging and controlling the narrative before others define it. Believes silence is never golden.',
    communicationStyle: 'Strategic and media-savvy'
  },
  LEGAL: {
    id: 'LEGAL',
    name: 'General Counsel',
    role: 'Legal Shield',
    archetype: 'PROTECTOR',
    influence: 0.82,
    initialTrust: 58,
    initialAlignment: 55,
    priorities: ['regulatoryStanding', 'stakeholderTrust', 'messageConsistency'],
    riskTolerance: 0.25,
    position: 'Urges extreme caution in all external communications. Every word is potential evidence. Prefers silence and controlled disclosure.',
    communicationStyle: 'Cautious and precise'
  },
  SOCIAL_DIRECTOR: {
    id: 'SOCIAL_DIRECTOR',
    name: 'Social Media Director',
    role: 'Digital Pulse Monitor',
    archetype: 'SENTINEL',
    influence: 0.72,
    initialTrust: 68,
    initialAlignment: 70,
    priorities: ['socialMediaSentiment', 'publicPerception', 'mediaRelations'],
    riskTolerance: 0.65,
    position: 'Insists on rapid social media response. Believes every minute of silence amplifies the crisis. Wants authentic, human communication.',
    communicationStyle: 'Fast-paced and authentic'
  },
  GOV_AFFAIRS: {
    id: 'GOV_AFFAIRS',
    name: 'VP Government Affairs',
    role: 'Regulatory Navigator',
    archetype: 'DIPLOMAT',
    influence: 0.75,
    initialTrust: 60,
    initialAlignment: 58,
    priorities: ['regulatoryStanding', 'stakeholderTrust', 'publicPerception'],
    riskTolerance: 0.35,
    position: 'Focused on maintaining regulatory relationships and preventing government intervention. Wants to be ahead of regulatory inquiries.',
    communicationStyle: 'Diplomatic and formal'
  },
  CRISIS_CONSULTANT: {
    id: 'CRISIS_CONSULTANT',
    name: 'External Crisis Consultant',
    role: 'Crisis Strategist',
    archetype: 'ADVISOR',
    influence: 0.68,
    initialTrust: 55,
    initialAlignment: 62,
    priorities: ['publicPerception', 'mediaRelations', 'brandEquity'],
    riskTolerance: 0.70,
    position: 'Brings outside perspective and playbook experience. Pushes for bold action and frame-breaking strategies. May conflict with legal.',
    communicationStyle: 'Bold and unconventional'
  },
  INTERNAL_COMMS: {
    id: 'INTERNAL_COMMS',
    name: 'Internal Communications Director',
    role: 'Employee Voice',
    archetype: 'ADVOCATE',
    influence: 0.65,
    initialTrust: 72,
    initialAlignment: 68,
    priorities: ['employeeConfidence', 'messageConsistency', 'stakeholderTrust'],
    riskTolerance: 0.45,
    position: 'Champions employee communication as foundation for all external messaging. Believes employees are the best brand ambassadors or worst critics.',
    communicationStyle: 'Empathetic and transparent'
  }
};

export const STAKEHOLDER_COMMITTEES = {
  CRISIS_WAR_ROOM: ['CEO', 'CCO', 'LEGAL', 'CRISIS_CONSULTANT'],
  MEDIA_RESPONSE_TEAM: ['CCO', 'SOCIAL_DIRECTOR', 'CRISIS_CONSULTANT'],
  REGULATORY_TASK_FORCE: ['LEGAL', 'GOV_AFFAIRS', 'CEO'],
  INTERNAL_ALIGNMENT: ['INTERNAL_COMMS', 'CEO', 'CCO']
};

export const RELATIONSHIP_DYNAMICS = {
  ALLIANCES: [
    ['CCO', 'SOCIAL_DIRECTOR'],
    ['CCO', 'CRISIS_CONSULTANT'],
    ['INTERNAL_COMMS', 'CEO'],
    ['GOV_AFFAIRS', 'LEGAL']
  ],
  TENSIONS: [
    ['LEGAL', 'CCO'],
    ['LEGAL', 'SOCIAL_DIRECTOR'],
    ['CRISIS_CONSULTANT', 'LEGAL'],
    ['SOCIAL_DIRECTOR', 'GOV_AFFAIRS']
  ]
};

export const getStakeholderById = (id) => STAKEHOLDERS[id];
export const getAllStakeholders = () => Object.values(STAKEHOLDERS);
