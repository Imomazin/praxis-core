// Crisis Communications Simulation Rounds
// 24 rounds across 4 phases with 6 options each
// Phases: INITIAL_RESPONSE, NARRATIVE_CONTROL, REPUTATION_RECOVERY, BRAND_RENEWAL

export const ROUNDS = [
  // Phase 1: Initial Response (Rounds 1-6)
  {
    id: 1,
    phase: 'INITIAL_RESPONSE',
    title: 'Breaking News',
    scenario: 'The story just broke. Your phones are ringing off the hook. Journalists, employees, and board members all want answers. Your first public statement will set the tone for everything that follows.',
    stakeholderFocus: ['CEO', 'CCO', 'LEGAL'],
    options: [
      { id: 'A', text: 'Issue immediate holding statement acknowledging the situation', impact: { publicPerception: 10, mediaRelations: 12, messageConsistency: 8, socialMediaSentiment: 5 }, risk: 0.20, stakeholderReactions: { CCO: 18, SOCIAL_DIRECTOR: 12, LEGAL: -5, CEO: 10 } },
      { id: 'B', text: 'Full transparency press conference within the hour', impact: { publicPerception: 15, mediaRelations: 10, stakeholderTrust: 8, messageConsistency: -5 }, risk: 0.35, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 12, LEGAL: -15, GOV_AFFAIRS: -5 } },
      { id: 'C', text: 'Legal review of all facts before any public comment', impact: { regulatoryStanding: 12, messageConsistency: 10, publicPerception: -8, socialMediaSentiment: -10 }, risk: 0.30, stakeholderReactions: { LEGAL: 20, GOV_AFFAIRS: 12, CCO: -12, SOCIAL_DIRECTOR: -15 } },
      { id: 'D', text: 'Internal communication first, then external messaging', impact: { employeeConfidence: 15, messageConsistency: 12, publicPerception: -5, mediaRelations: -3 }, risk: 0.25, stakeholderReactions: { INTERNAL_COMMS: 20, CEO: 12, SOCIAL_DIRECTOR: -8, CCO: -3 } },
      { id: 'E', text: 'Social media acknowledgment with promise of full update', impact: { socialMediaSentiment: 12, publicPerception: 8, mediaRelations: -3, regulatoryStanding: -3 }, risk: 0.25, stakeholderReactions: { SOCIAL_DIRECTOR: 20, CCO: 10, LEGAL: -10, GOV_AFFAIRS: -5 } },
      { id: 'F', text: 'Activate crisis communications war room before responding', impact: { messageConsistency: 15, stakeholderTrust: 8, publicPerception: -5, socialMediaSentiment: -8 }, risk: 0.20, stakeholderReactions: { CEO: 15, CRISIS_CONSULTANT: 15, SOCIAL_DIRECTOR: -10, CCO: 5 } }
    ]
  },
  {
    id: 2,
    phase: 'INITIAL_RESPONSE',
    title: 'Social Media Firestorm',
    scenario: 'The story is trending. Hashtags are forming. Misinformation is spreading faster than facts. Your social channels are being flooded with angry comments and demands for accountability.',
    stakeholderFocus: ['SOCIAL_DIRECTOR', 'CCO', 'CRISIS_CONSULTANT'],
    options: [
      { id: 'A', text: 'Deploy rapid social media response team with approved messaging', impact: { socialMediaSentiment: 15, publicPerception: 8, messageConsistency: 5, mediaRelations: 3 }, risk: 0.25, stakeholderReactions: { SOCIAL_DIRECTOR: 18, CCO: 15, LEGAL: -5, INTERNAL_COMMS: 5 } },
      { id: 'B', text: 'Go dark on social media until official statement is ready', impact: { messageConsistency: 10, regulatoryStanding: 5, socialMediaSentiment: -15, publicPerception: -10 }, risk: 0.35, stakeholderReactions: { LEGAL: 15, GOV_AFFAIRS: 10, SOCIAL_DIRECTOR: -18, CRISIS_CONSULTANT: -10 } },
      { id: 'C', text: 'CEO personal video message posted to all platforms', impact: { publicPerception: 12, socialMediaSentiment: 10, stakeholderTrust: 8, messageConsistency: -3 }, risk: 0.30, stakeholderReactions: { CRISIS_CONSULTANT: 18, CEO: 12, LEGAL: -10, CCO: 8 } },
      { id: 'D', text: 'Fact-checking and correction campaign against misinformation', impact: { mediaRelations: 12, messageConsistency: 10, socialMediaSentiment: 5, publicPerception: 3 }, risk: 0.25, stakeholderReactions: { CCO: 18, SOCIAL_DIRECTOR: 12, CRISIS_CONSULTANT: 8, LEGAL: 5 } },
      { id: 'E', text: 'Engage sympathetic influencers and third-party voices', impact: { socialMediaSentiment: 12, publicPerception: 10, brandEquity: 5, stakeholderTrust: -3 }, risk: 0.35, stakeholderReactions: { CRISIS_CONSULTANT: 15, SOCIAL_DIRECTOR: 15, LEGAL: -8, GOV_AFFAIRS: -5 } },
      { id: 'F', text: 'Monitor and document everything but limit direct engagement', impact: { messageConsistency: 12, regulatoryStanding: 8, socialMediaSentiment: -8, publicPerception: -5 }, risk: 0.25, stakeholderReactions: { LEGAL: 18, GOV_AFFAIRS: 12, SOCIAL_DIRECTOR: -12, CRISIS_CONSULTANT: -5 } }
    ]
  },
  {
    id: 3,
    phase: 'INITIAL_RESPONSE',
    title: 'Media Siege',
    scenario: 'Major outlets are camped outside headquarters. Interview requests are piling up. A leaked internal document is making rounds. You need a media strategy now.',
    stakeholderFocus: ['CCO', 'LEGAL', 'CEO'],
    options: [
      { id: 'A', text: 'Schedule exclusive interview with most influential outlet', impact: { mediaRelations: 15, publicPerception: 10, stakeholderTrust: 5, messageConsistency: -5 }, risk: 0.30, stakeholderReactions: { CCO: 18, CRISIS_CONSULTANT: 12, LEGAL: -8, SOCIAL_DIRECTOR: -5 } },
      { id: 'B', text: 'Formal press conference with prepared statement and limited Q&A', impact: { mediaRelations: 12, messageConsistency: 12, publicPerception: 8, regulatoryStanding: 5 }, risk: 0.25, stakeholderReactions: { CCO: 15, CEO: 15, LEGAL: 8, GOV_AFFAIRS: 10 } },
      { id: 'C', text: 'Written statement only with no live media engagement', impact: { messageConsistency: 15, regulatoryStanding: 10, mediaRelations: -8, publicPerception: -5 }, risk: 0.25, stakeholderReactions: { LEGAL: 18, GOV_AFFAIRS: 12, CCO: -10, CRISIS_CONSULTANT: -8 } },
      { id: 'D', text: 'Proactive leak investigation and legal action threats', impact: { regulatoryStanding: 10, employeeConfidence: -8, mediaRelations: -10, publicPerception: -5 }, risk: 0.40, stakeholderReactions: { LEGAL: 18, CEO: 5, CCO: -15, SOCIAL_DIRECTOR: -12 } },
      { id: 'E', text: 'Media briefing with technical experts to provide context', impact: { mediaRelations: 12, publicPerception: 10, stakeholderTrust: 8, brandEquity: 5 }, risk: 0.25, stakeholderReactions: { CCO: 18, CRISIS_CONSULTANT: 12, GOV_AFFAIRS: 8, LEGAL: 3 } },
      { id: 'F', text: 'Redirect narrative by announcing corrective actions', impact: { publicPerception: 12, stakeholderTrust: 10, brandEquity: 5, mediaRelations: 5 }, risk: 0.30, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 15, LEGAL: -5, INTERNAL_COMMS: 10 } }
    ]
  },
  {
    id: 4,
    phase: 'INITIAL_RESPONSE',
    title: 'Employee Anxiety',
    scenario: 'Employees are panicking. Social media posts from staff are contradicting official messaging. Morale is plummeting. Your people need to hear from leadership before they hear it from the media.',
    stakeholderFocus: ['INTERNAL_COMMS', 'CEO', 'CCO'],
    options: [
      { id: 'A', text: 'All-hands town hall with CEO directly addressing concerns', impact: { employeeConfidence: 18, messageConsistency: 10, stakeholderTrust: 8, publicPerception: 3 }, risk: 0.25, stakeholderReactions: { INTERNAL_COMMS: 20, CEO: 15, CCO: 10, LEGAL: -5 } },
      { id: 'B', text: 'Manager cascade briefing with approved talking points', impact: { employeeConfidence: 12, messageConsistency: 15, stakeholderTrust: 5, socialMediaSentiment: 3 }, risk: 0.20, stakeholderReactions: { INTERNAL_COMMS: 18, CCO: 15, CEO: 8, LEGAL: 10 } },
      { id: 'C', text: 'Formal internal memo with facts and next steps', impact: { messageConsistency: 15, employeeConfidence: 8, regulatoryStanding: 5, stakeholderTrust: 3 }, risk: 0.20, stakeholderReactions: { LEGAL: 15, INTERNAL_COMMS: 10, CCO: 8, GOV_AFFAIRS: 8 } },
      { id: 'D', text: 'Social media policy enforcement with immediate guidelines', impact: { messageConsistency: 12, regulatoryStanding: 8, employeeConfidence: -8, socialMediaSentiment: -3 }, risk: 0.35, stakeholderReactions: { LEGAL: 18, GOV_AFFAIRS: 12, INTERNAL_COMMS: -12, SOCIAL_DIRECTOR: -8 } },
      { id: 'E', text: 'Anonymous employee Q&A channel for candid concerns', impact: { employeeConfidence: 12, stakeholderTrust: 10, messageConsistency: -5, publicPerception: 3 }, risk: 0.25, stakeholderReactions: { INTERNAL_COMMS: 18, CRISIS_CONSULTANT: 10, LEGAL: -10, CCO: 5 } },
      { id: 'F', text: 'Department-level briefings with tailored messaging', impact: { employeeConfidence: 15, messageConsistency: 8, stakeholderTrust: 8, brandEquity: 3 }, risk: 0.25, stakeholderReactions: { INTERNAL_COMMS: 18, CCO: 12, CEO: 10, LEGAL: 5 } }
    ]
  },
  {
    id: 5,
    phase: 'INITIAL_RESPONSE',
    title: 'Regulatory Inquiry',
    scenario: 'Regulators have formally requested information. Government officials are making public statements about the situation. Your regulatory response will shape legal and reputational outcomes.',
    stakeholderFocus: ['GOV_AFFAIRS', 'LEGAL', 'CEO'],
    options: [
      { id: 'A', text: 'Proactive full cooperation with regulatory bodies', impact: { regulatoryStanding: 15, stakeholderTrust: 10, publicPerception: 8, mediaRelations: 5 }, risk: 0.25, stakeholderReactions: { GOV_AFFAIRS: 20, CEO: 12, LEGAL: 5, CCO: 10 } },
      { id: 'B', text: 'Legal-led response with carefully scoped disclosure', impact: { regulatoryStanding: 10, messageConsistency: 12, stakeholderTrust: -3, publicPerception: -5 }, risk: 0.30, stakeholderReactions: { LEGAL: 20, GOV_AFFAIRS: 10, CCO: -8, CRISIS_CONSULTANT: -5 } },
      { id: 'C', text: 'Pre-emptive regulatory briefing before formal deadline', impact: { regulatoryStanding: 12, stakeholderTrust: 12, publicPerception: 5, brandEquity: 5 }, risk: 0.25, stakeholderReactions: { GOV_AFFAIRS: 18, CEO: 15, LEGAL: 5, CCO: 8 } },
      { id: 'D', text: 'Public commitment to regulatory remediation plan', impact: { publicPerception: 12, regulatoryStanding: 10, brandEquity: 8, messageConsistency: 5 }, risk: 0.30, stakeholderReactions: { CCO: 15, CRISIS_CONSULTANT: 12, GOV_AFFAIRS: 10, LEGAL: -8 } },
      { id: 'E', text: 'Engage third-party compliance auditor for credibility', impact: { regulatoryStanding: 12, stakeholderTrust: 10, brandEquity: 5, employeeConfidence: 3 }, risk: 0.25, stakeholderReactions: { GOV_AFFAIRS: 15, LEGAL: 12, CEO: 8, CRISIS_CONSULTANT: 10 } },
      { id: 'F', text: 'Delay response pending internal investigation completion', impact: { messageConsistency: 10, regulatoryStanding: -8, publicPerception: -8, socialMediaSentiment: -5 }, risk: 0.40, stakeholderReactions: { LEGAL: 15, GOV_AFFAIRS: -12, CCO: -10, SOCIAL_DIRECTOR: -8 } }
    ]
  },
  {
    id: 6,
    phase: 'INITIAL_RESPONSE',
    title: 'Stakeholder Panic',
    scenario: 'Board members are calling emergency sessions. Key partners are reconsidering relationships. Investors are demanding a call. Everyone wants assurance that the situation is under control.',
    stakeholderFocus: ['CEO', 'CCO', 'CRISIS_CONSULTANT'],
    options: [
      { id: 'A', text: 'Emergency board briefing with crisis response plan', impact: { stakeholderTrust: 15, messageConsistency: 10, employeeConfidence: 5, regulatoryStanding: 3 }, risk: 0.25, stakeholderReactions: { CEO: 18, LEGAL: 12, GOV_AFFAIRS: 8, CCO: 10 } },
      { id: 'B', text: 'Investor call with CEO and CFO presenting unified response', impact: { stakeholderTrust: 12, publicPerception: 8, brandEquity: 8, messageConsistency: 5 }, risk: 0.25, stakeholderReactions: { CEO: 18, CCO: 12, CRISIS_CONSULTANT: 10, INTERNAL_COMMS: -3 } },
      { id: 'C', text: 'Partner-by-partner outreach with customized assurances', impact: { stakeholderTrust: 12, brandEquity: 10, employeeConfidence: 3, messageConsistency: -5 }, risk: 0.30, stakeholderReactions: { CCO: 15, CEO: 12, CRISIS_CONSULTANT: 10, LEGAL: -5 } },
      { id: 'D', text: 'Published crisis response framework demonstrating control', impact: { publicPerception: 10, stakeholderTrust: 10, mediaRelations: 8, messageConsistency: 8 }, risk: 0.25, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 15, CEO: 10, GOV_AFFAIRS: 8 } },
      { id: 'E', text: 'Appoint visible crisis leader to demonstrate seriousness', impact: { stakeholderTrust: 12, publicPerception: 10, employeeConfidence: 8, mediaRelations: 5 }, risk: 0.30, stakeholderReactions: { CRISIS_CONSULTANT: 15, CEO: 10, CCO: 12, INTERNAL_COMMS: 8 } },
      { id: 'F', text: 'Minimize contact until situation stabilizes further', impact: { messageConsistency: 10, regulatoryStanding: 5, stakeholderTrust: -10, publicPerception: -8 }, risk: 0.35, stakeholderReactions: { LEGAL: 12, GOV_AFFAIRS: 5, CEO: -12, CCO: -15 } }
    ]
  },

  // Phase 2: Narrative Control (Rounds 7-12)
  {
    id: 7,
    phase: 'NARRATIVE_CONTROL',
    title: 'Framing the Story',
    scenario: 'The initial shock has passed. The narrative is forming. Whoever frames this story will control public perception. You must define what this crisis means before others do it for you.',
    stakeholderFocus: ['CCO', 'CRISIS_CONSULTANT', 'CEO'],
    options: [
      { id: 'A', text: 'Accountability narrative: own the problem and lead the fix', impact: { publicPerception: 15, stakeholderTrust: 12, brandEquity: 8, mediaRelations: 5 }, risk: 0.25, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 15, CEO: 12, LEGAL: -8 } },
      { id: 'B', text: 'Progress narrative: focus on actions taken and improvements', impact: { publicPerception: 12, mediaRelations: 10, brandEquity: 8, socialMediaSentiment: 5 }, risk: 0.25, stakeholderReactions: { CCO: 18, CEO: 12, SOCIAL_DIRECTOR: 10, LEGAL: 5 } },
      { id: 'C', text: 'Empathy narrative: center affected people and their stories', impact: { publicPerception: 12, socialMediaSentiment: 12, stakeholderTrust: 8, brandEquity: 5 }, risk: 0.30, stakeholderReactions: { CRISIS_CONSULTANT: 15, INTERNAL_COMMS: 15, CCO: 10, LEGAL: -5 } },
      { id: 'D', text: 'Transformation narrative: crisis as catalyst for change', impact: { brandEquity: 12, stakeholderTrust: 10, publicPerception: 8, employeeConfidence: 8 }, risk: 0.30, stakeholderReactions: { CEO: 18, CRISIS_CONSULTANT: 15, CCO: 10, GOV_AFFAIRS: 5 } },
      { id: 'E', text: 'Technical/factual narrative: let the data tell the story', impact: { mediaRelations: 12, regulatoryStanding: 10, messageConsistency: 10, socialMediaSentiment: -3 }, risk: 0.25, stakeholderReactions: { LEGAL: 15, GOV_AFFAIRS: 15, CCO: 8, SOCIAL_DIRECTOR: -8 } },
      { id: 'F', text: 'Defiance narrative: challenge the crisis framing directly', impact: { employeeConfidence: 10, brandEquity: 5, publicPerception: -8, mediaRelations: -10 }, risk: 0.40, stakeholderReactions: { CEO: 10, LEGAL: 8, CCO: -15, CRISIS_CONSULTANT: -12 } }
    ]
  },
  {
    id: 8,
    phase: 'NARRATIVE_CONTROL',
    title: 'Message Discipline',
    scenario: 'Mixed messages are undermining credibility. Different departments are saying different things. Media is highlighting contradictions. You need unified communications now.',
    stakeholderFocus: ['CCO', 'INTERNAL_COMMS', 'LEGAL'],
    options: [
      { id: 'A', text: 'Centralized message approval process with CCO as gatekeeper', impact: { messageConsistency: 18, mediaRelations: 10, employeeConfidence: -5, socialMediaSentiment: -3 }, risk: 0.25, stakeholderReactions: { CCO: 20, LEGAL: 12, SOCIAL_DIRECTOR: -10, INTERNAL_COMMS: -5 } },
      { id: 'B', text: 'Comprehensive messaging guide distributed to all spokespeople', impact: { messageConsistency: 15, employeeConfidence: 10, mediaRelations: 8, stakeholderTrust: 5 }, risk: 0.20, stakeholderReactions: { CCO: 18, INTERNAL_COMMS: 15, LEGAL: 10, CEO: 8 } },
      { id: 'C', text: 'Media training sessions for all public-facing leaders', impact: { messageConsistency: 12, mediaRelations: 12, publicPerception: 8, brandEquity: 5 }, risk: 0.25, stakeholderReactions: { CCO: 18, CRISIS_CONSULTANT: 15, CEO: 10, GOV_AFFAIRS: 8 } },
      { id: 'D', text: 'Single spokesperson model with CEO as sole voice', impact: { messageConsistency: 15, publicPerception: 10, stakeholderTrust: 8, socialMediaSentiment: -5 }, risk: 0.30, stakeholderReactions: { CEO: 15, LEGAL: 12, CCO: -5, SOCIAL_DIRECTOR: -10 } },
      { id: 'E', text: 'Real-time message coordination through crisis communications hub', impact: { messageConsistency: 12, socialMediaSentiment: 10, mediaRelations: 8, employeeConfidence: 5 }, risk: 0.25, stakeholderReactions: { SOCIAL_DIRECTOR: 15, CCO: 15, INTERNAL_COMMS: 10, CRISIS_CONSULTANT: 8 } },
      { id: 'F', text: 'Acknowledge contradictions publicly and commit to clarity', impact: { publicPerception: 12, stakeholderTrust: 10, messageConsistency: 5, mediaRelations: 8 }, risk: 0.30, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 12, LEGAL: -10, CEO: 5 } }
    ]
  },
  {
    id: 9,
    phase: 'NARRATIVE_CONTROL',
    title: 'Counter-Narrative War',
    scenario: 'Critics are organizing. Opposition groups are pushing an alternative narrative that damages your credibility. Social media amplifies their message. You must respond without escalating.',
    stakeholderFocus: ['SOCIAL_DIRECTOR', 'CRISIS_CONSULTANT', 'CCO'],
    options: [
      { id: 'A', text: 'Amplify third-party validators and supportive voices', impact: { publicPerception: 12, socialMediaSentiment: 10, brandEquity: 8, mediaRelations: 5 }, risk: 0.25, stakeholderReactions: { CRISIS_CONSULTANT: 18, SOCIAL_DIRECTOR: 15, CCO: 12, LEGAL: 3 } },
      { id: 'B', text: 'Direct point-by-point rebuttal with evidence', impact: { mediaRelations: 12, messageConsistency: 10, publicPerception: 5, socialMediaSentiment: -5 }, risk: 0.35, stakeholderReactions: { CCO: 15, LEGAL: 12, SOCIAL_DIRECTOR: -5, CRISIS_CONSULTANT: -8 } },
      { id: 'C', text: 'Ignore critics and focus exclusively on positive actions', impact: { brandEquity: 10, employeeConfidence: 8, publicPerception: -3, socialMediaSentiment: -8 }, risk: 0.30, stakeholderReactions: { CEO: 12, INTERNAL_COMMS: 10, SOCIAL_DIRECTOR: -12, CRISIS_CONSULTANT: -5 } },
      { id: 'D', text: 'Engage critics directly in constructive dialogue', impact: { publicPerception: 10, socialMediaSentiment: 12, stakeholderTrust: 8, messageConsistency: -5 }, risk: 0.35, stakeholderReactions: { CRISIS_CONSULTANT: 15, SOCIAL_DIRECTOR: 15, LEGAL: -12, CCO: 5 } },
      { id: 'E', text: 'Redirect narrative with major announcement or commitment', impact: { publicPerception: 15, mediaRelations: 10, brandEquity: 8, socialMediaSentiment: 8 }, risk: 0.30, stakeholderReactions: { CCO: 18, CEO: 15, CRISIS_CONSULTANT: 12, LEGAL: -5 } },
      { id: 'F', text: 'Grassroots employee advocacy to counter negative voices', impact: { socialMediaSentiment: 10, employeeConfidence: 8, publicPerception: 5, brandEquity: 3 }, risk: 0.30, stakeholderReactions: { INTERNAL_COMMS: 18, SOCIAL_DIRECTOR: 12, LEGAL: -8, CCO: 5 } }
    ]
  },
  {
    id: 10,
    phase: 'NARRATIVE_CONTROL',
    title: 'Media Relationship Management',
    scenario: 'Some reporters are sympathetic, others are hostile. Editorial boards are writing opinion pieces. You need to cultivate media relationships that serve your narrative.',
    stakeholderFocus: ['CCO', 'CEO', 'CRISIS_CONSULTANT'],
    options: [
      { id: 'A', text: 'Background briefings with key journalists to build understanding', impact: { mediaRelations: 15, publicPerception: 10, stakeholderTrust: 5, messageConsistency: 3 }, risk: 0.25, stakeholderReactions: { CCO: 18, CRISIS_CONSULTANT: 12, LEGAL: -5, CEO: 8 } },
      { id: 'B', text: 'Op-ed placement from CEO in major publications', impact: { publicPerception: 12, mediaRelations: 10, brandEquity: 10, stakeholderTrust: 5 }, risk: 0.30, stakeholderReactions: { CEO: 15, CCO: 18, CRISIS_CONSULTANT: 10, LEGAL: -3 } },
      { id: 'C', text: 'Exclusive access to recovery efforts for select outlets', impact: { mediaRelations: 15, publicPerception: 12, socialMediaSentiment: 5, brandEquity: 5 }, risk: 0.30, stakeholderReactions: { CCO: 18, CRISIS_CONSULTANT: 15, LEGAL: -8, SOCIAL_DIRECTOR: 5 } },
      { id: 'D', text: 'Data-driven media package with comprehensive facts', impact: { mediaRelations: 12, messageConsistency: 12, regulatoryStanding: 8, publicPerception: 5 }, risk: 0.20, stakeholderReactions: { CCO: 15, LEGAL: 12, GOV_AFFAIRS: 10, CRISIS_CONSULTANT: 8 } },
      { id: 'E', text: 'Community media tour highlighting local impact and response', impact: { publicPerception: 12, socialMediaSentiment: 10, brandEquity: 8, employeeConfidence: 5 }, risk: 0.25, stakeholderReactions: { CCO: 15, INTERNAL_COMMS: 12, SOCIAL_DIRECTOR: 10, CEO: 8 } },
      { id: 'F', text: 'Limit media access and control information flow tightly', impact: { messageConsistency: 12, regulatoryStanding: 8, mediaRelations: -10, publicPerception: -8 }, risk: 0.35, stakeholderReactions: { LEGAL: 15, GOV_AFFAIRS: 10, CCO: -12, CRISIS_CONSULTANT: -10 } }
    ]
  },
  {
    id: 11,
    phase: 'NARRATIVE_CONTROL',
    title: 'Digital Battleground',
    scenario: 'The online conversation is evolving. Memes are going viral. Parody accounts are emerging. Your digital strategy needs to evolve beyond defense to shape the conversation.',
    stakeholderFocus: ['SOCIAL_DIRECTOR', 'CCO', 'CRISIS_CONSULTANT'],
    options: [
      { id: 'A', text: 'Launch content series showing behind-the-scenes response efforts', impact: { socialMediaSentiment: 15, publicPerception: 12, brandEquity: 8, employeeConfidence: 5 }, risk: 0.25, stakeholderReactions: { SOCIAL_DIRECTOR: 20, CCO: 15, CRISIS_CONSULTANT: 10, LEGAL: -5 } },
      { id: 'B', text: 'Targeted digital advertising to reach key audiences with facts', impact: { socialMediaSentiment: 10, publicPerception: 10, mediaRelations: 5, brandEquity: 5 }, risk: 0.25, stakeholderReactions: { SOCIAL_DIRECTOR: 15, CCO: 12, CRISIS_CONSULTANT: 8, GOV_AFFAIRS: 5 } },
      { id: 'C', text: 'Partner with credible digital voices for authenticity', impact: { socialMediaSentiment: 12, publicPerception: 10, brandEquity: 8, stakeholderTrust: 3 }, risk: 0.30, stakeholderReactions: { CRISIS_CONSULTANT: 18, SOCIAL_DIRECTOR: 15, CCO: 10, LEGAL: -5 } },
      { id: 'D', text: 'Interactive FAQ and transparency portal launch', impact: { socialMediaSentiment: 10, publicPerception: 8, messageConsistency: 12, stakeholderTrust: 8 }, risk: 0.20, stakeholderReactions: { SOCIAL_DIRECTOR: 15, CCO: 12, INTERNAL_COMMS: 10, LEGAL: 8 } },
      { id: 'E', text: 'Employee social ambassador program with approved content', impact: { socialMediaSentiment: 10, employeeConfidence: 12, brandEquity: 8, publicPerception: 5 }, risk: 0.30, stakeholderReactions: { INTERNAL_COMMS: 18, SOCIAL_DIRECTOR: 15, CCO: 10, LEGAL: -8 } },
      { id: 'F', text: 'Aggressive monitoring and takedown of false content', impact: { messageConsistency: 10, regulatoryStanding: 8, socialMediaSentiment: -5, publicPerception: -5 }, risk: 0.35, stakeholderReactions: { LEGAL: 15, GOV_AFFAIRS: 10, SOCIAL_DIRECTOR: -10, CRISIS_CONSULTANT: -8 } }
    ]
  },
  {
    id: 12,
    phase: 'NARRATIVE_CONTROL',
    title: 'Narrative Assessment',
    scenario: 'Time to evaluate your communications effectiveness. What is the public understanding of the crisis? Where are the gaps between your narrative and public perception?',
    stakeholderFocus: ['CCO', 'CRISIS_CONSULTANT', 'SOCIAL_DIRECTOR'],
    options: [
      { id: 'A', text: 'Commission comprehensive public perception audit', impact: { messageConsistency: 12, publicPerception: 8, mediaRelations: 8, brandEquity: 5 }, risk: 0.20, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 15, CEO: 10, SOCIAL_DIRECTOR: 8 } },
      { id: 'B', text: 'Stakeholder sentiment survey across all groups', impact: { stakeholderTrust: 12, employeeConfidence: 10, messageConsistency: 8, publicPerception: 5 }, risk: 0.20, stakeholderReactions: { INTERNAL_COMMS: 15, CCO: 12, CEO: 10, CRISIS_CONSULTANT: 10 } },
      { id: 'C', text: 'Media coverage analysis and strategy adjustment', impact: { mediaRelations: 15, messageConsistency: 10, publicPerception: 8, socialMediaSentiment: 5 }, risk: 0.25, stakeholderReactions: { CCO: 18, CRISIS_CONSULTANT: 15, SOCIAL_DIRECTOR: 10, CEO: 8 } },
      { id: 'D', text: 'Social media sentiment deep-dive with course correction', impact: { socialMediaSentiment: 15, publicPerception: 10, brandEquity: 8, mediaRelations: 3 }, risk: 0.25, stakeholderReactions: { SOCIAL_DIRECTOR: 18, CCO: 12, CRISIS_CONSULTANT: 10, INTERNAL_COMMS: 5 } },
      { id: 'E', text: 'War-game next phase scenarios with communications team', impact: { messageConsistency: 15, stakeholderTrust: 10, regulatoryStanding: 5, employeeConfidence: 5 }, risk: 0.20, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 15, CEO: 12, LEGAL: 8 } },
      { id: 'F', text: 'Declare narrative victory and pivot to positive messaging', impact: { brandEquity: 10, publicPerception: 5, socialMediaSentiment: -5, stakeholderTrust: -5 }, risk: 0.35, stakeholderReactions: { CEO: 12, CCO: 5, CRISIS_CONSULTANT: -12, LEGAL: -5 } }
    ]
  },

  // Phase 3: Reputation Recovery (Rounds 13-18)
  {
    id: 13,
    phase: 'REPUTATION_RECOVERY',
    title: 'Recovery Communications Launch',
    scenario: 'The acute crisis is stabilizing. Public attention is shifting. Now is the time to move from defense to offense with a recovery-focused communications strategy.',
    stakeholderFocus: ['CCO', 'CEO', 'CRISIS_CONSULTANT'],
    options: [
      { id: 'A', text: 'Launch comprehensive recovery communications campaign', impact: { publicPerception: 15, brandEquity: 12, mediaRelations: 10, socialMediaSentiment: 8 }, risk: 0.25, stakeholderReactions: { CCO: 18, CRISIS_CONSULTANT: 15, CEO: 12, SOCIAL_DIRECTOR: 10 } },
      { id: 'B', text: 'Phased messaging shift from crisis response to future vision', impact: { brandEquity: 12, stakeholderTrust: 10, publicPerception: 8, employeeConfidence: 8 }, risk: 0.25, stakeholderReactions: { CCO: 15, CEO: 15, CRISIS_CONSULTANT: 12, INTERNAL_COMMS: 10 } },
      { id: 'C', text: 'Customer-centric recovery story with testimonials', impact: { publicPerception: 12, socialMediaSentiment: 12, brandEquity: 10, stakeholderTrust: 5 }, risk: 0.25, stakeholderReactions: { CCO: 18, SOCIAL_DIRECTOR: 15, CRISIS_CONSULTANT: 10, CEO: 8 } },
      { id: 'D', text: 'Industry thought leadership positioning on crisis response', impact: { brandEquity: 15, mediaRelations: 12, regulatoryStanding: 8, stakeholderTrust: 5 }, risk: 0.30, stakeholderReactions: { CEO: 18, CCO: 15, GOV_AFFAIRS: 10, CRISIS_CONSULTANT: 8 } },
      { id: 'E', text: 'Quiet recovery focusing on actions over announcements', impact: { stakeholderTrust: 12, regulatoryStanding: 10, employeeConfidence: 8, brandEquity: 5 }, risk: 0.20, stakeholderReactions: { LEGAL: 15, GOV_AFFAIRS: 12, INTERNAL_COMMS: 10, CCO: -5 } },
      { id: 'F', text: 'Joint recovery narrative with affected communities', impact: { publicPerception: 12, socialMediaSentiment: 10, stakeholderTrust: 10, brandEquity: 8 }, risk: 0.30, stakeholderReactions: { CRISIS_CONSULTANT: 18, INTERNAL_COMMS: 12, CCO: 10, LEGAL: -5 } }
    ]
  },
  {
    id: 14,
    phase: 'REPUTATION_RECOVERY',
    title: 'Trust Rebuilding',
    scenario: 'Trust has been damaged. Customers, partners, and the public need more than words. Your trust-rebuilding strategy must be authentic and backed by real action.',
    stakeholderFocus: ['CEO', 'CCO', 'INTERNAL_COMMS'],
    options: [
      { id: 'A', text: 'Public commitment charter with measurable accountability', impact: { stakeholderTrust: 15, publicPerception: 12, brandEquity: 10, regulatoryStanding: 5 }, risk: 0.25, stakeholderReactions: { CEO: 18, CCO: 15, CRISIS_CONSULTANT: 12, LEGAL: -3 } },
      { id: 'B', text: 'Customer remediation program with generous terms', impact: { stakeholderTrust: 12, publicPerception: 10, socialMediaSentiment: 10, brandEquity: 8 }, risk: 0.25, stakeholderReactions: { CCO: 15, SOCIAL_DIRECTOR: 12, CEO: 10, LEGAL: 5 } },
      { id: 'C', text: 'Third-party trust verification and certification', impact: { stakeholderTrust: 12, regulatoryStanding: 12, brandEquity: 8, mediaRelations: 8 }, risk: 0.25, stakeholderReactions: { GOV_AFFAIRS: 18, LEGAL: 15, CEO: 10, CRISIS_CONSULTANT: 8 } },
      { id: 'D', text: 'Transparency dashboard showing real-time progress metrics', impact: { stakeholderTrust: 10, publicPerception: 12, socialMediaSentiment: 10, messageConsistency: 8 }, risk: 0.25, stakeholderReactions: { SOCIAL_DIRECTOR: 18, CCO: 15, CRISIS_CONSULTANT: 10, LEGAL: 3 } },
      { id: 'E', text: 'Executive listening tour with key stakeholder groups', impact: { stakeholderTrust: 15, employeeConfidence: 10, brandEquity: 5, publicPerception: 5 }, risk: 0.25, stakeholderReactions: { CEO: 18, INTERNAL_COMMS: 15, CCO: 10, CRISIS_CONSULTANT: 8 } },
      { id: 'F', text: 'Let time and consistent behavior rebuild trust naturally', impact: { messageConsistency: 10, employeeConfidence: 8, stakeholderTrust: 3, publicPerception: -3 }, risk: 0.30, stakeholderReactions: { LEGAL: 12, INTERNAL_COMMS: 8, CCO: -10, CRISIS_CONSULTANT: -8 } }
    ]
  },
  {
    id: 15,
    phase: 'REPUTATION_RECOVERY',
    title: 'Employee Brand Ambassadors',
    scenario: 'Your employees can be your strongest advocates or your most damaging critics. Turning the internal culture around is essential for external reputation recovery.',
    stakeholderFocus: ['INTERNAL_COMMS', 'CEO', 'CCO'],
    options: [
      { id: 'A', text: 'Employee advocacy program with shared pride narrative', impact: { employeeConfidence: 15, socialMediaSentiment: 10, brandEquity: 8, publicPerception: 5 }, risk: 0.25, stakeholderReactions: { INTERNAL_COMMS: 20, SOCIAL_DIRECTOR: 15, CCO: 12, CEO: 10 } },
      { id: 'B', text: 'Recognition program celebrating crisis response heroes', impact: { employeeConfidence: 15, stakeholderTrust: 8, brandEquity: 5, publicPerception: 5 }, risk: 0.20, stakeholderReactions: { INTERNAL_COMMS: 18, CEO: 15, CCO: 10, SOCIAL_DIRECTOR: 8 } },
      { id: 'C', text: 'Town hall series: CEO candid conversations about lessons learned', impact: { employeeConfidence: 12, stakeholderTrust: 10, messageConsistency: 8, publicPerception: 5 }, risk: 0.25, stakeholderReactions: { CEO: 15, INTERNAL_COMMS: 18, CCO: 10, CRISIS_CONSULTANT: 8 } },
      { id: 'D', text: 'Employee wellbeing initiative to rebuild morale', impact: { employeeConfidence: 18, stakeholderTrust: 5, brandEquity: 3, socialMediaSentiment: 3 }, risk: 0.20, stakeholderReactions: { INTERNAL_COMMS: 18, CEO: 12, LEGAL: 5, GOV_AFFAIRS: 5 } },
      { id: 'E', text: 'Cross-functional crisis debrief workshops', impact: { employeeConfidence: 12, messageConsistency: 10, stakeholderTrust: 8, regulatoryStanding: 5 }, risk: 0.20, stakeholderReactions: { INTERNAL_COMMS: 15, CRISIS_CONSULTANT: 15, CCO: 10, CEO: 8 } },
      { id: 'F', text: 'Strict internal messaging control with compliance monitoring', impact: { messageConsistency: 12, regulatoryStanding: 8, employeeConfidence: -10, socialMediaSentiment: -3 }, risk: 0.35, stakeholderReactions: { LEGAL: 15, GOV_AFFAIRS: 10, INTERNAL_COMMS: -15, SOCIAL_DIRECTOR: -8 } }
    ]
  },
  {
    id: 16,
    phase: 'REPUTATION_RECOVERY',
    title: 'Regulatory Redemption',
    scenario: 'Regulatory scrutiny continues. Your compliance posture and communications with regulators will determine whether this becomes a footnote or a lasting regulatory burden.',
    stakeholderFocus: ['GOV_AFFAIRS', 'LEGAL', 'CEO'],
    options: [
      { id: 'A', text: 'Voluntary enhanced compliance program exceeding requirements', impact: { regulatoryStanding: 15, stakeholderTrust: 10, brandEquity: 8, publicPerception: 5 }, risk: 0.25, stakeholderReactions: { GOV_AFFAIRS: 20, LEGAL: 15, CEO: 10, CCO: 8 } },
      { id: 'B', text: 'Proactive regulatory update communications on progress', impact: { regulatoryStanding: 12, mediaRelations: 8, stakeholderTrust: 8, messageConsistency: 8 }, risk: 0.20, stakeholderReactions: { GOV_AFFAIRS: 18, LEGAL: 12, CCO: 10, CEO: 8 } },
      { id: 'C', text: 'Industry coalition for improved standards', impact: { regulatoryStanding: 10, brandEquity: 12, publicPerception: 10, stakeholderTrust: 5 }, risk: 0.30, stakeholderReactions: { GOV_AFFAIRS: 15, CEO: 15, CCO: 12, CRISIS_CONSULTANT: 10 } },
      { id: 'D', text: 'Appoint independent compliance monitor for credibility', impact: { regulatoryStanding: 12, stakeholderTrust: 12, brandEquity: 5, employeeConfidence: -3 }, risk: 0.25, stakeholderReactions: { GOV_AFFAIRS: 18, LEGAL: 12, CEO: 5, INTERNAL_COMMS: -5 } },
      { id: 'E', text: 'Public regulatory partnership for industry improvement', impact: { regulatoryStanding: 12, publicPerception: 10, brandEquity: 10, mediaRelations: 8 }, risk: 0.30, stakeholderReactions: { GOV_AFFAIRS: 18, CCO: 15, CEO: 12, LEGAL: 5 } },
      { id: 'F', text: 'Minimum compliance approach to conserve resources', impact: { regulatoryStanding: 3, messageConsistency: 5, publicPerception: -8, stakeholderTrust: -8 }, risk: 0.40, stakeholderReactions: { LEGAL: 10, GOV_AFFAIRS: -12, CCO: -10, CRISIS_CONSULTANT: -10 } }
    ]
  },
  {
    id: 17,
    phase: 'REPUTATION_RECOVERY',
    title: 'Media Rehabilitation',
    scenario: 'Coverage is shifting from crisis to recovery. Positive stories are possible but need cultivation. Your media strategy must evolve from defense to proactive storytelling.',
    stakeholderFocus: ['CCO', 'SOCIAL_DIRECTOR', 'CRISIS_CONSULTANT'],
    options: [
      { id: 'A', text: 'Feature story placement: the recovery journey narrative', impact: { mediaRelations: 15, publicPerception: 12, brandEquity: 10, socialMediaSentiment: 8 }, risk: 0.25, stakeholderReactions: { CCO: 20, CRISIS_CONSULTANT: 15, SOCIAL_DIRECTOR: 12, CEO: 10 } },
      { id: 'B', text: 'CEO media tour with forward-looking vision', impact: { mediaRelations: 12, publicPerception: 12, brandEquity: 10, stakeholderTrust: 8 }, risk: 0.30, stakeholderReactions: { CEO: 15, CCO: 18, CRISIS_CONSULTANT: 10, LEGAL: -3 } },
      { id: 'C', text: 'Customer success stories as social proof of recovery', impact: { publicPerception: 12, socialMediaSentiment: 12, brandEquity: 10, stakeholderTrust: 8 }, risk: 0.25, stakeholderReactions: { CCO: 15, SOCIAL_DIRECTOR: 18, INTERNAL_COMMS: 10, CRISIS_CONSULTANT: 8 } },
      { id: 'D', text: 'Industry conference presence to reclaim thought leadership', impact: { brandEquity: 15, mediaRelations: 10, stakeholderTrust: 8, publicPerception: 5 }, risk: 0.30, stakeholderReactions: { CEO: 18, CCO: 15, GOV_AFFAIRS: 10, CRISIS_CONSULTANT: 8 } },
      { id: 'E', text: 'Documentary-style content about organizational transformation', impact: { publicPerception: 12, socialMediaSentiment: 10, brandEquity: 12, employeeConfidence: 8 }, risk: 0.30, stakeholderReactions: { CRISIS_CONSULTANT: 18, SOCIAL_DIRECTOR: 15, CCO: 12, INTERNAL_COMMS: 10 } },
      { id: 'F', text: 'Maintain low media profile and avoid spotlight', impact: { messageConsistency: 10, regulatoryStanding: 5, mediaRelations: -5, publicPerception: -5 }, risk: 0.25, stakeholderReactions: { LEGAL: 12, GOV_AFFAIRS: 8, CCO: -12, CRISIS_CONSULTANT: -10 } }
    ]
  },
  {
    id: 18,
    phase: 'REPUTATION_RECOVERY',
    title: 'Recovery Checkpoint',
    scenario: 'Recovery is underway. It is time to assess what is working, where gaps remain, and how to sustain momentum. The next phase will define your lasting reputation.',
    stakeholderFocus: ['CRISIS_CONSULTANT', 'CCO', 'CEO'],
    options: [
      { id: 'A', text: 'Comprehensive reputation audit with external benchmarks', impact: { messageConsistency: 12, publicPerception: 10, brandEquity: 8, stakeholderTrust: 8 }, risk: 0.20, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 15, CEO: 12, GOV_AFFAIRS: 8 } },
      { id: 'B', text: 'Stakeholder feedback integration into recovery strategy', impact: { stakeholderTrust: 15, publicPerception: 10, employeeConfidence: 8, brandEquity: 5 }, risk: 0.20, stakeholderReactions: { CEO: 15, INTERNAL_COMMS: 15, CCO: 12, CRISIS_CONSULTANT: 10 } },
      { id: 'C', text: 'Communications team restructuring for post-crisis era', impact: { messageConsistency: 12, mediaRelations: 10, brandEquity: 8, employeeConfidence: -3 }, risk: 0.30, stakeholderReactions: { CCO: 15, CEO: 12, CRISIS_CONSULTANT: 10, INTERNAL_COMMS: -8 } },
      { id: 'D', text: 'Celebrate recovery milestones publicly', impact: { publicPerception: 12, socialMediaSentiment: 10, brandEquity: 8, employeeConfidence: 10 }, risk: 0.25, stakeholderReactions: { CCO: 18, SOCIAL_DIRECTOR: 15, INTERNAL_COMMS: 12, CEO: 10 } },
      { id: 'E', text: 'Scenario planning for potential crisis recurrence', impact: { regulatoryStanding: 10, stakeholderTrust: 10, messageConsistency: 10, employeeConfidence: 5 }, risk: 0.20, stakeholderReactions: { CRISIS_CONSULTANT: 18, LEGAL: 15, GOV_AFFAIRS: 12, CEO: 8 } },
      { id: 'F', text: 'Declare full recovery and end crisis communications mode', impact: { brandEquity: 8, employeeConfidence: 5, publicPerception: -5, stakeholderTrust: -8 }, risk: 0.35, stakeholderReactions: { CEO: 10, CCO: -5, CRISIS_CONSULTANT: -15, LEGAL: -5 } }
    ]
  },

  // Phase 4: Brand Renewal (Rounds 19-24)
  {
    id: 19,
    phase: 'BRAND_RENEWAL',
    title: 'Brand Identity Evolution',
    scenario: 'The crisis has changed how people see your brand. You cannot return to the old identity. Define what the brand stands for now and how it communicates its evolved values.',
    stakeholderFocus: ['CCO', 'CEO', 'CRISIS_CONSULTANT'],
    options: [
      { id: 'A', text: 'Brand refresh incorporating crisis lessons into identity', impact: { brandEquity: 18, publicPerception: 12, socialMediaSentiment: 8, stakeholderTrust: 5 }, risk: 0.30, stakeholderReactions: { CCO: 18, CRISIS_CONSULTANT: 15, CEO: 12, SOCIAL_DIRECTOR: 10 } },
      { id: 'B', text: 'Values-led rebrand emphasizing accountability and resilience', impact: { brandEquity: 15, stakeholderTrust: 12, publicPerception: 10, employeeConfidence: 8 }, risk: 0.25, stakeholderReactions: { CEO: 18, CCO: 15, INTERNAL_COMMS: 12, CRISIS_CONSULTANT: 10 } },
      { id: 'C', text: 'Stakeholder co-created brand positioning', impact: { stakeholderTrust: 15, brandEquity: 12, publicPerception: 8, socialMediaSentiment: 8 }, risk: 0.25, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 15, SOCIAL_DIRECTOR: 12, CEO: 8 } },
      { id: 'D', text: 'Purpose-driven positioning connecting crisis to mission', impact: { brandEquity: 15, publicPerception: 12, employeeConfidence: 10, mediaRelations: 5 }, risk: 0.30, stakeholderReactions: { CEO: 18, CCO: 15, INTERNAL_COMMS: 12, CRISIS_CONSULTANT: 10 } },
      { id: 'E', text: 'Subtle evolution maintaining brand continuity', impact: { brandEquity: 10, messageConsistency: 12, stakeholderTrust: 8, employeeConfidence: 8 }, risk: 0.20, stakeholderReactions: { CCO: 15, LEGAL: 12, CEO: 10, INTERNAL_COMMS: 8 } },
      { id: 'F', text: 'Return to pre-crisis brand identity and messaging', impact: { messageConsistency: 8, employeeConfidence: 5, brandEquity: -5, publicPerception: -8 }, risk: 0.35, stakeholderReactions: { CEO: 5, LEGAL: 8, CCO: -12, CRISIS_CONSULTANT: -15 } }
    ]
  },
  {
    id: 20,
    phase: 'BRAND_RENEWAL',
    title: 'Communications Infrastructure',
    scenario: 'The crisis exposed weaknesses in your communications capabilities. Building durable communications infrastructure ensures future resilience and sustained brand health.',
    stakeholderFocus: ['CCO', 'INTERNAL_COMMS', 'SOCIAL_DIRECTOR'],
    options: [
      { id: 'A', text: 'Invest in crisis communications playbook and training', impact: { messageConsistency: 15, regulatoryStanding: 10, employeeConfidence: 8, stakeholderTrust: 5 }, risk: 0.25, stakeholderReactions: { CCO: 18, CRISIS_CONSULTANT: 18, INTERNAL_COMMS: 12, LEGAL: 10 } },
      { id: 'B', text: 'Build real-time reputation monitoring and response system', impact: { socialMediaSentiment: 12, mediaRelations: 10, publicPerception: 8, messageConsistency: 8 }, risk: 0.25, stakeholderReactions: { SOCIAL_DIRECTOR: 18, CCO: 15, CRISIS_CONSULTANT: 12, CEO: 8 } },
      { id: 'C', text: 'Establish stakeholder communications council', impact: { stakeholderTrust: 15, messageConsistency: 10, employeeConfidence: 8, regulatoryStanding: 5 }, risk: 0.20, stakeholderReactions: { CCO: 15, INTERNAL_COMMS: 15, CEO: 12, GOV_AFFAIRS: 10 } },
      { id: 'D', text: 'Create integrated digital and traditional media hub', impact: { mediaRelations: 12, socialMediaSentiment: 12, publicPerception: 8, brandEquity: 5 }, risk: 0.25, stakeholderReactions: { SOCIAL_DIRECTOR: 18, CCO: 15, CRISIS_CONSULTANT: 10, INTERNAL_COMMS: 8 } },
      { id: 'E', text: 'Simulation and tabletop exercise program for future crises', impact: { messageConsistency: 12, regulatoryStanding: 10, employeeConfidence: 10, stakeholderTrust: 8 }, risk: 0.20, stakeholderReactions: { CRISIS_CONSULTANT: 18, CCO: 12, LEGAL: 12, GOV_AFFAIRS: 10 } },
      { id: 'F', text: 'Scale back communications investment to pre-crisis levels', impact: { messageConsistency: 3, brandEquity: -3, socialMediaSentiment: -5, publicPerception: -5 }, risk: 0.35, stakeholderReactions: { LEGAL: 8, CCO: -15, CRISIS_CONSULTANT: -12, SOCIAL_DIRECTOR: -10 } }
    ]
  },
  {
    id: 21,
    phase: 'BRAND_RENEWAL',
    title: 'Thought Leadership Reclamation',
    scenario: 'Before the crisis, you were an industry voice. That credibility was damaged. Reclaiming thought leadership requires demonstrating genuine expertise and commitment to improvement.',
    stakeholderFocus: ['CEO', 'CCO', 'GOV_AFFAIRS'],
    options: [
      { id: 'A', text: 'Industry-leading crisis response case study publication', impact: { brandEquity: 15, mediaRelations: 12, publicPerception: 10, regulatoryStanding: 5 }, risk: 0.25, stakeholderReactions: { CEO: 18, CCO: 18, CRISIS_CONSULTANT: 15, GOV_AFFAIRS: 8 } },
      { id: 'B', text: 'Launch industry working group on crisis preparedness', impact: { brandEquity: 12, regulatoryStanding: 12, stakeholderTrust: 10, mediaRelations: 8 }, risk: 0.25, stakeholderReactions: { GOV_AFFAIRS: 18, CEO: 15, CCO: 12, LEGAL: 10 } },
      { id: 'C', text: 'Executive speaking program at major conferences', impact: { brandEquity: 12, mediaRelations: 12, publicPerception: 10, stakeholderTrust: 5 }, risk: 0.30, stakeholderReactions: { CEO: 18, CCO: 15, CRISIS_CONSULTANT: 10, GOV_AFFAIRS: 8 } },
      { id: 'D', text: 'Research partnership with academic institutions', impact: { brandEquity: 10, regulatoryStanding: 10, stakeholderTrust: 10, publicPerception: 8 }, risk: 0.20, stakeholderReactions: { GOV_AFFAIRS: 15, CEO: 12, CCO: 10, CRISIS_CONSULTANT: 12 } },
      { id: 'E', text: 'Stakeholder education series on lessons learned', impact: { stakeholderTrust: 15, employeeConfidence: 10, brandEquity: 8, publicPerception: 8 }, risk: 0.25, stakeholderReactions: { INTERNAL_COMMS: 18, CEO: 15, CCO: 12, CRISIS_CONSULTANT: 10 } },
      { id: 'F', text: 'Maintain low profile and avoid public leadership positioning', impact: { regulatoryStanding: 5, messageConsistency: 5, brandEquity: -5, mediaRelations: -5 }, risk: 0.25, stakeholderReactions: { LEGAL: 10, GOV_AFFAIRS: 5, CCO: -12, CEO: -8 } }
    ]
  },
  {
    id: 22,
    phase: 'BRAND_RENEWAL',
    title: 'Community and Stakeholder Bonds',
    scenario: 'Lasting reputation is built on genuine relationships. Strengthening your bonds with communities, partners, and stakeholders creates the foundation for sustained brand health.',
    stakeholderFocus: ['CEO', 'CCO', 'INTERNAL_COMMS'],
    options: [
      { id: 'A', text: 'Community impact initiative tied to crisis response lessons', impact: { publicPerception: 15, brandEquity: 12, socialMediaSentiment: 10, stakeholderTrust: 8 }, risk: 0.25, stakeholderReactions: { CEO: 18, CCO: 15, SOCIAL_DIRECTOR: 12, INTERNAL_COMMS: 10 } },
      { id: 'B', text: 'Strategic partnership program with aligned organizations', impact: { brandEquity: 12, stakeholderTrust: 12, regulatoryStanding: 8, publicPerception: 8 }, risk: 0.25, stakeholderReactions: { CEO: 15, GOV_AFFAIRS: 15, CCO: 12, CRISIS_CONSULTANT: 10 } },
      { id: 'C', text: 'Transparent annual crisis preparedness report', impact: { stakeholderTrust: 12, regulatoryStanding: 12, publicPerception: 8, mediaRelations: 8 }, risk: 0.20, stakeholderReactions: { GOV_AFFAIRS: 18, LEGAL: 15, CCO: 12, CEO: 10 } },
      { id: 'D', text: 'Stakeholder advisory board for ongoing dialogue', impact: { stakeholderTrust: 15, brandEquity: 10, employeeConfidence: 5, publicPerception: 5 }, risk: 0.25, stakeholderReactions: { CEO: 18, CCO: 12, INTERNAL_COMMS: 12, CRISIS_CONSULTANT: 10 } },
      { id: 'E', text: 'Employee volunteerism program connected to brand values', impact: { employeeConfidence: 15, publicPerception: 10, brandEquity: 10, socialMediaSentiment: 8 }, risk: 0.20, stakeholderReactions: { INTERNAL_COMMS: 18, SOCIAL_DIRECTOR: 15, CEO: 12, CCO: 10 } },
      { id: 'F', text: 'Transactional stakeholder management focused on key accounts', impact: { stakeholderTrust: 5, brandEquity: 3, publicPerception: -3, employeeConfidence: -3 }, risk: 0.30, stakeholderReactions: { LEGAL: 10, CEO: 5, CCO: -10, INTERNAL_COMMS: -8 } }
    ]
  },
  {
    id: 23,
    phase: 'BRAND_RENEWAL',
    title: 'Sustained Excellence',
    scenario: 'Long-term reputation requires consistent excellence. Embedding communications discipline and brand stewardship into organizational DNA ensures lasting resilience.',
    stakeholderFocus: ['CCO', 'CEO', 'CRISIS_CONSULTANT'],
    options: [
      { id: 'A', text: 'Communications excellence framework integrated across organization', impact: { messageConsistency: 15, brandEquity: 12, employeeConfidence: 10, mediaRelations: 8 }, risk: 0.25, stakeholderReactions: { CCO: 18, CEO: 15, INTERNAL_COMMS: 12, CRISIS_CONSULTANT: 10 } },
      { id: 'B', text: 'Brand health metrics embedded in executive performance', impact: { brandEquity: 15, stakeholderTrust: 10, messageConsistency: 8, publicPerception: 8 }, risk: 0.25, stakeholderReactions: { CEO: 15, CCO: 18, CRISIS_CONSULTANT: 12, LEGAL: 5 } },
      { id: 'C', text: 'Innovation in stakeholder engagement and communications', impact: { socialMediaSentiment: 12, publicPerception: 12, brandEquity: 10, mediaRelations: 8 }, risk: 0.30, stakeholderReactions: { SOCIAL_DIRECTOR: 18, CCO: 15, CRISIS_CONSULTANT: 12, CEO: 8 } },
      { id: 'D', text: 'Annual crisis preparedness certification program', impact: { regulatoryStanding: 12, messageConsistency: 12, stakeholderTrust: 10, employeeConfidence: 8 }, risk: 0.20, stakeholderReactions: { CRISIS_CONSULTANT: 18, GOV_AFFAIRS: 15, LEGAL: 12, CCO: 10 } },
      { id: 'E', text: 'Cross-functional communications champions network', impact: { messageConsistency: 12, employeeConfidence: 12, stakeholderTrust: 8, brandEquity: 8 }, risk: 0.20, stakeholderReactions: { INTERNAL_COMMS: 18, CCO: 15, CEO: 10, SOCIAL_DIRECTOR: 10 } },
      { id: 'F', text: 'Return to business-as-usual communications approach', impact: { messageConsistency: 5, employeeConfidence: 3, brandEquity: -5, stakeholderTrust: -5 }, risk: 0.30, stakeholderReactions: { LEGAL: 8, CEO: 3, CCO: -12, CRISIS_CONSULTANT: -12 } }
    ]
  },
  {
    id: 24,
    phase: 'BRAND_RENEWAL',
    title: 'Legacy and Future',
    scenario: 'Your final communications decisions will define the legacy of this crisis. How you close this chapter determines whether the crisis becomes a cautionary tale or a transformation story.',
    stakeholderFocus: ['CEO', 'CCO', 'CRISIS_CONSULTANT'],
    options: [
      { id: 'A', text: 'Transformation narrative: crisis as the catalyst for a better company', impact: { brandEquity: 18, publicPerception: 15, stakeholderTrust: 10, employeeConfidence: 10 }, risk: 0.25, stakeholderReactions: { CEO: 18, CCO: 18, CRISIS_CONSULTANT: 15, INTERNAL_COMMS: 12 } },
      { id: 'B', text: 'Industry leadership commitment with measurable pledges', impact: { brandEquity: 15, regulatoryStanding: 12, stakeholderTrust: 10, mediaRelations: 10 }, risk: 0.25, stakeholderReactions: { CEO: 18, GOV_AFFAIRS: 15, CCO: 12, LEGAL: 10 } },
      { id: 'C', text: 'People-first legacy: investing in culture and community', impact: { employeeConfidence: 15, publicPerception: 12, brandEquity: 10, socialMediaSentiment: 10 }, risk: 0.25, stakeholderReactions: { INTERNAL_COMMS: 18, CEO: 15, SOCIAL_DIRECTOR: 12, CCO: 10 } },
      { id: 'D', text: 'Accountability legacy: permanent transparency and oversight', impact: { stakeholderTrust: 15, regulatoryStanding: 15, brandEquity: 10, publicPerception: 8 }, risk: 0.25, stakeholderReactions: { GOV_AFFAIRS: 18, LEGAL: 15, CEO: 12, CCO: 10 } },
      { id: 'E', text: 'Balanced excellence across all reputation dimensions', impact: { brandEquity: 12, stakeholderTrust: 10, publicPerception: 10, messageConsistency: 10 }, risk: 0.20, stakeholderReactions: { CEO: 15, CCO: 15, CRISIS_CONSULTANT: 12, GOV_AFFAIRS: 10 } },
      { id: 'F', text: 'Quiet conclusion with focus on operational performance', impact: { regulatoryStanding: 8, employeeConfidence: 5, brandEquity: -3, publicPerception: -3 }, risk: 0.25, stakeholderReactions: { LEGAL: 12, GOV_AFFAIRS: 8, CCO: -10, CRISIS_CONSULTANT: -10 } }
    ]
  }
];

export const PHASE_DESCRIPTIONS = {
  INITIAL_RESPONSE: {
    name: 'Initial Response',
    description: 'Navigate the crisis outbreak with first communications and stakeholder management',
    rounds: [1, 2, 3, 4, 5, 6]
  },
  NARRATIVE_CONTROL: {
    name: 'Narrative Control',
    description: 'Shape the public narrative and establish message discipline across all channels',
    rounds: [7, 8, 9, 10, 11, 12]
  },
  REPUTATION_RECOVERY: {
    name: 'Reputation Recovery',
    description: 'Rebuild trust and reputation through authentic engagement and demonstrated action',
    rounds: [13, 14, 15, 16, 17, 18]
  },
  BRAND_RENEWAL: {
    name: 'Brand Renewal',
    description: 'Transform the crisis into lasting brand strength and communications resilience',
    rounds: [19, 20, 21, 22, 23, 24]
  }
};

export const getRoundById = (id) => ROUNDS.find(r => r.id === id);
export const getRoundsByPhase = (phase) => ROUNDS.filter(r => r.phase === phase);
export const getAllRounds = () => ROUNDS;
