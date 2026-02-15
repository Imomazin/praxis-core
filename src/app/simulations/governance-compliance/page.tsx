'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface GameState {
  phase: 'intro' | 'briefing' | 'investigation' | 'decision' | 'consequence' | 'round-end' | 'game-over';
  round: number;
  totalRounds: number;
  complianceMetrics: ComplianceMetrics;
  stakeholders: StakeholderState[];
  currentDilemma: ComplianceDilemma | null;
  selectedOption: DilemmaOption | null;
  narrativeHistory: string[];
  finalScore: number | null;
}

interface ComplianceMetrics {
  regulatoryStanding: number; // 0-100
  ethicalCulture: number; // 0-100
  operationalIntegrity: number; // 0-100
  stakeholderTrust: number; // 0-100
  legalExposure: number; // 0-100 (lower is better)
  investigationBudget: number; // in millions
}

interface StakeholderState {
  id: string;
  name: string;
  role: string;
  trust: number; // 0-100
  influence: number; // 0-100
  stance: 'supportive' | 'neutral' | 'concerned' | 'hostile';
}

interface ComplianceDilemma {
  id: string;
  title: string;
  description: string;
  category: 'regulatory' | 'ethical' | 'whistleblower' | 'investigation' | 'disclosure';
  severity: 'routine' | 'significant' | 'critical' | 'existential';
  evidence: Evidence[];
  options: DilemmaOption[];
  timeframe: string;
}

interface Evidence {
  id: string;
  type: 'document' | 'testimony' | 'data' | 'external';
  title: string;
  summary: string;
  reliability: 'confirmed' | 'probable' | 'uncertain';
}

interface DilemmaOption {
  id: string;
  title: string;
  description: string;
  approach: 'aggressive' | 'measured' | 'cautious' | 'defensive';
  resourceCost: number;
  consequences: Consequence[];
  ethicalImplications: string;
}

interface Consequence {
  type: 'regulatory' | 'ethical' | 'operational' | 'trust' | 'legal' | 'budget';
  impact: number;
  description: string;
  delayed?: boolean;
}

// Initial game state
const initialMetrics: ComplianceMetrics = {
  regulatoryStanding: 75,
  ethicalCulture: 70,
  operationalIntegrity: 80,
  stakeholderTrust: 72,
  legalExposure: 25,
  investigationBudget: 8,
};

const initialStakeholders: StakeholderState[] = [
  { id: 'board', name: 'Board Audit Committee', role: 'Oversight Body', trust: 75, influence: 95, stance: 'neutral' },
  { id: 'ceo', name: 'CEO', role: 'Chief Executive', trust: 70, influence: 90, stance: 'neutral' },
  { id: 'regulators', name: 'Financial Regulators', role: 'External Authority', trust: 68, influence: 100, stance: 'neutral' },
  { id: 'legal', name: 'General Counsel', role: 'Legal Affairs', trust: 80, influence: 75, stance: 'supportive' },
  { id: 'employees', name: 'Employee Body', role: 'Workforce', trust: 65, influence: 50, stance: 'neutral' },
  { id: 'whistleblower', name: 'Ethics Hotline', role: 'Internal Channel', trust: 70, influence: 40, stance: 'neutral' },
];

// Round scenarios
const ROUND_SCENARIOS: Record<number, { briefing: string; dilemma: ComplianceDilemma }> = {
  1: {
    briefing: `CONFIDENTIAL COMPLIANCE BRIEFING - Q1

As Chief Compliance Officer, you've received an anonymous tip through the ethics hotline alleging improper revenue recognition in the Asia-Pacific division. Initial review suggests the allegations may have merit. The company is 6 weeks from quarterly earnings release.

Key considerations:
- Potential securities law implications if material
- Board notification requirements unclear at this stage
- Whistleblower protection obligations
- Ongoing SEC examination in unrelated area`,
    dilemma: {
      id: 'dilemma-1-revenue',
      title: 'Revenue Recognition Allegations',
      description: 'Anonymous whistleblower alleges APAC leadership has been pulling forward revenue from future quarters to meet targets. Preliminary document review shows unusual patterns in contract modifications near quarter-end. The whistleblower claims to have additional evidence but wants assurance of anonymity protection.',
      category: 'whistleblower',
      severity: 'critical',
      evidence: [
        { id: 'e1', type: 'testimony', title: 'Whistleblower Statement', summary: 'Detailed allegations with specific contract numbers and dates', reliability: 'probable' },
        { id: 'e2', type: 'data', title: 'Contract Modification Analysis', summary: 'Statistical anomaly in Q4 contract amendments in APAC', reliability: 'confirmed' },
        { id: 'e3', type: 'document', title: 'Email Fragments', summary: 'Partially recovered emails discussing "acceleration" strategies', reliability: 'uncertain' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'Full Independent Investigation',
          description: 'Engage outside forensic accountants and law firm, notify Audit Committee immediately, preserve all documents, consider voluntary SEC disclosure.',
          approach: 'aggressive',
          resourceCost: 2.5,
          consequences: [
            { type: 'regulatory', impact: 15, description: 'Regulators view proactive stance favorably' },
            { type: 'trust', impact: -10, description: 'CEO concerned about premature escalation' },
            { type: 'ethical', impact: 20, description: 'Strong message on compliance culture' },
            { type: 'legal', impact: -15, description: 'Better legal position if issues confirmed' },
          ],
          ethicalImplications: 'Prioritizes transparency and accountability over short-term business concerns',
        },
        {
          id: 'opt2',
          title: 'Internal Preliminary Review',
          description: 'Conduct quiet internal investigation with trusted internal audit staff before deciding on escalation. Brief General Counsel only.',
          approach: 'measured',
          resourceCost: 0.8,
          consequences: [
            { type: 'regulatory', impact: -5, description: 'Potential concerns about delayed reporting if issues found' },
            { type: 'trust', impact: 5, description: 'CEO appreciates measured approach' },
            { type: 'ethical', impact: -5, description: 'Some risk to whistleblower confidence' },
            { type: 'operational', impact: 5, description: 'Less business disruption initially' },
          ],
          ethicalImplications: 'Balances thoroughness with avoiding unnecessary alarm, but risks delayed action',
        },
        {
          id: 'opt3',
          title: 'Regional Management Inquiry',
          description: 'Ask APAC leadership for explanation of contract patterns. Give them opportunity to self-report any issues before formal investigation.',
          approach: 'cautious',
          resourceCost: 0.2,
          consequences: [
            { type: 'regulatory', impact: -20, description: 'Serious concerns if seen as tipping off subjects' },
            { type: 'trust', impact: -15, description: 'Audit Committee may question independence' },
            { type: 'ethical', impact: -25, description: 'Undermines investigation integrity' },
            { type: 'legal', impact: 20, description: 'Significantly worse legal position' },
          ],
          ethicalImplications: 'Risk of evidence destruction and whistleblower retaliation',
        },
        {
          id: 'opt4',
          title: 'Enhanced Monitoring Only',
          description: 'Implement additional controls for current quarter while continuing to gather information. Defer formal investigation pending more evidence.',
          approach: 'defensive',
          resourceCost: 0.3,
          consequences: [
            { type: 'regulatory', impact: -15, description: 'May be seen as willful blindness' },
            { type: 'trust', impact: 10, description: 'Minimal immediate disruption' },
            { type: 'ethical', impact: -20, description: 'Fails whistleblower who came forward' },
            { type: 'legal', impact: 15, description: 'Worse legal exposure if issues later surface' },
          ],
          ethicalImplications: 'Prioritizes business continuity over compliance obligations',
        },
      ],
      timeframe: '72 hours to determine initial response',
    },
  },
  2: {
    briefing: `COMPLIANCE ALERT - REGULATORY EXAMINATION

The SEC has expanded its routine examination into a formal investigation. They've issued document preservation notices and requested interviews with senior finance personnel. This appears related to but broader than the APAC matter.

Parallel developments:
- Class action law firm has issued litigation hold letter
- Business journalist asking questions about "accounting irregularities"
- Two APAC finance employees have retained personal counsel`,
    dilemma: {
      id: 'dilemma-2-sec',
      title: 'SEC Investigation Escalation',
      description: 'The SEC investigation is intensifying. They\'re requesting documents that may reveal executive communications about revenue targets. The General Counsel recommends asserting privilege over certain documents, but some may not qualify. Meanwhile, the Board is demanding a full briefing.',
      category: 'regulatory',
      severity: 'existential',
      evidence: [
        { id: 'e1', type: 'document', title: 'SEC Document Request', summary: 'Broad request covering 3 years of executive communications', reliability: 'confirmed' },
        { id: 'e2', type: 'data', title: 'Privilege Log Analysis', summary: 'Approximately 40% of flagged documents have questionable privilege claims', reliability: 'probable' },
        { id: 'e3', type: 'external', title: 'Defense Counsel Assessment', summary: 'Risk of adverse inference if privilege claims are overreached', reliability: 'confirmed' },
        { id: 'e4', type: 'testimony', title: 'Employee Interview Notes', summary: 'Some employees recall pressure to "find revenue" near quarter-end', reliability: 'probable' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'Full Cooperation Protocol',
          description: 'Provide all requested documents with narrow privilege assertions. Offer to make executives available for interviews. Proactively share internal investigation findings.',
          approach: 'aggressive',
          resourceCost: 1.5,
          consequences: [
            { type: 'regulatory', impact: 25, description: 'Regulators strongly value cooperation' },
            { type: 'legal', impact: -20, description: 'Better position for any resolution' },
            { type: 'trust', impact: -15, description: 'Some executives feel exposed' },
            { type: 'ethical', impact: 15, description: 'Demonstrates commitment to transparency' },
          ],
          ethicalImplications: 'Maximizes regulatory goodwill but may expose individuals',
        },
        {
          id: 'opt2',
          title: 'Standard Legal Defense',
          description: 'Assert all colorable privileges, respond within technical requirements, prepare executives with counsel for any interviews.',
          approach: 'measured',
          resourceCost: 2.0,
          consequences: [
            { type: 'regulatory', impact: -5, description: 'Normal adversarial posture' },
            { type: 'legal', impact: 5, description: 'Standard legal protections maintained' },
            { type: 'trust', impact: 5, description: 'Executives feel protected' },
            { type: 'budget', impact: -1.5, description: 'Significant legal fees' },
          ],
          ethicalImplications: 'Legitimate legal strategy but may slow resolution',
        },
        {
          id: 'opt3',
          title: 'Aggressive Privilege Strategy',
          description: 'Assert broad privilege claims, challenge document requests, file motions to limit investigation scope. Prepare for protracted legal battle.',
          approach: 'defensive',
          resourceCost: 3.0,
          consequences: [
            { type: 'regulatory', impact: -30, description: 'Regulators view as obstruction' },
            { type: 'legal', impact: 15, description: 'Short-term legal protection, long-term risk' },
            { type: 'trust', impact: -20, description: 'Board questions strategy' },
            { type: 'ethical', impact: -25, description: 'Perceived as hiding something' },
          ],
          ethicalImplications: 'May be seen as obstruction if claims are overreached',
        },
        {
          id: 'opt4',
          title: 'Proactive Settlement Exploration',
          description: 'Approach SEC about potential early resolution. Offer enhanced compliance commitments and potential individual accountability in exchange for reduced corporate penalties.',
          approach: 'cautious',
          resourceCost: 1.0,
          consequences: [
            { type: 'regulatory', impact: 10, description: 'SEC may welcome early resolution' },
            { type: 'legal', impact: -10, description: 'Faster resolution, certain outcome' },
            { type: 'trust', impact: -25, description: 'Some executives feel scapegoated' },
            { type: 'operational', impact: 10, description: 'Removes uncertainty faster' },
          ],
          ethicalImplications: 'Trading individual exposure for corporate protection raises fairness questions',
        },
      ],
      timeframe: 'Document response due in 14 days',
    },
  },
  3: {
    briefing: `ETHICS CRISIS - EXECUTIVE MISCONDUCT ALLEGATIONS

During the investigation, evidence has emerged suggesting the CFO may have been aware of and possibly directed the improper revenue practices. Additionally, separate allegations have surfaced about undisclosed related-party transactions benefiting a Board member.

The situation is becoming public:
- Financial press running "sources say" stories
- Stock down 15% on investigation news
- Institutional investors requesting meetings`,
    dilemma: {
      id: 'dilemma-3-executive',
      title: 'Executive Accountability Crisis',
      description: 'Evidence increasingly points to CFO involvement in revenue manipulation. Separately, you\'ve discovered the Board Chair has an undisclosed financial interest in a major vendor. The investigations are converging, and you must decide how to handle potential C-suite and Board misconduct.',
      category: 'ethical',
      severity: 'existential',
      evidence: [
        { id: 'e1', type: 'document', title: 'CFO Email Chain', summary: 'Direct instructions to "find ways to accelerate Q4 recognition"', reliability: 'confirmed' },
        { id: 'e2', type: 'data', title: 'Related-Party Analysis', summary: 'Board Chair holds 8% stake in vendor through family trust', reliability: 'confirmed' },
        { id: 'e3', type: 'testimony', title: 'Controller Statement', summary: 'Claims CFO overrode accounting objections', reliability: 'probable' },
        { id: 'e4', type: 'external', title: 'Independent Director Concerns', summary: 'Several directors worried about personal liability', reliability: 'confirmed' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'Immediate Executive Action',
          description: 'Recommend CFO suspension pending investigation completion. Insist Board Chair recuse from all oversight. Brief independent directors separately. Prepare 8-K disclosure.',
          approach: 'aggressive',
          resourceCost: 1.0,
          consequences: [
            { type: 'regulatory', impact: 20, description: 'Demonstrates serious accountability' },
            { type: 'ethical', impact: 30, description: 'Strong tone at the top message' },
            { type: 'trust', impact: -30, description: 'Executive team in turmoil' },
            { type: 'operational', impact: -20, description: 'Leadership vacuum creates uncertainty' },
          ],
          ethicalImplications: 'Upholds principle that no one is above accountability',
        },
        {
          id: 'opt2',
          title: 'Controlled Transition',
          description: 'Work with CEO to arrange quiet CFO departure with face-saving narrative. Address Board Chair conflict through governance process. Manage disclosure timing.',
          approach: 'measured',
          resourceCost: 0.5,
          consequences: [
            { type: 'regulatory', impact: -10, description: 'May be seen as cover-up if discovered' },
            { type: 'ethical', impact: -15, description: 'Compromises on accountability' },
            { type: 'trust', impact: 10, description: 'Less organizational trauma' },
            { type: 'legal', impact: 10, description: 'Potential obstruction concerns' },
          ],
          ethicalImplications: 'Prioritizes stability over full accountability',
        },
        {
          id: 'opt3',
          title: 'Independent Committee Control',
          description: 'Cede investigation control to special committee of independent directors with separate counsel. Remove yourself from decisions affecting executives.',
          approach: 'cautious',
          resourceCost: 2.0,
          consequences: [
            { type: 'regulatory', impact: 15, description: 'Independence valued by regulators' },
            { type: 'ethical', impact: 10, description: 'Proper governance process' },
            { type: 'trust', impact: -5, description: 'Process takes longer' },
            { type: 'budget', impact: -2.0, description: 'Significant additional costs' },
          ],
          ethicalImplications: 'Ensures independence but may slow accountability',
        },
        {
          id: 'opt4',
          title: 'Evidence Quality Challenge',
          description: 'Question reliability of evidence against CFO. Argue Board Chair conflict is immaterial. Recommend waiting for investigation completion before any personnel actions.',
          approach: 'defensive',
          resourceCost: 0.3,
          consequences: [
            { type: 'regulatory', impact: -25, description: 'Appears to be protecting executives' },
            { type: 'ethical', impact: -35, description: 'Severely damages compliance credibility' },
            { type: 'trust', impact: 20, description: 'Executive loyalty preserved short-term' },
            { type: 'legal', impact: 20, description: 'Much worse if evidence holds up' },
          ],
          ethicalImplications: 'Choosing loyalty to leadership over compliance obligations',
        },
      ],
      timeframe: 'Board meeting in 48 hours',
    },
  },
  4: {
    briefing: `CRISIS MANAGEMENT - RESTATEMENT AND REMEDIATION

The investigation has concluded. Material misstatements confirmed over 3 years. The company must restate financials, report material weaknesses in internal controls, and implement comprehensive remediation.

Current status:
- CFO terminated, under SEC investigation
- Board Chair resigned
- New CFO hired externally
- Stock down 40% from pre-crisis levels
- Multiple shareholder derivative suits filed`,
    dilemma: {
      id: 'dilemma-4-remediation',
      title: 'Remediation Program Design',
      description: 'You must design and oversee the remediation program to restore compliance and rebuild trust. The Board wants aggressive action to satisfy regulators, but business leaders worry about operational paralysis from over-correction. Several managers implicated in the scheme remain employed.',
      category: 'investigation',
      severity: 'critical',
      evidence: [
        { id: 'e1', type: 'document', title: 'Investigation Final Report', summary: '$180M in revenue misstatements over 3 years', reliability: 'confirmed' },
        { id: 'e2', type: 'data', title: 'Control Deficiency Matrix', summary: '27 material weaknesses identified', reliability: 'confirmed' },
        { id: 'e3', type: 'external', title: 'SEC Cooperation Credit Assessment', summary: 'Moderate credit for cooperation, criticism for delayed escalation', reliability: 'confirmed' },
        { id: 'e4', type: 'testimony', title: 'Manager Involvement Analysis', summary: '14 managers had some knowledge or involvement', reliability: 'probable' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'Zero Tolerance Remediation',
          description: 'Terminate all implicated managers regardless of role severity. Implement maximum controls. Require CCO sign-off on all significant transactions. Triple compliance staff.',
          approach: 'aggressive',
          resourceCost: 4.0,
          consequences: [
            { type: 'regulatory', impact: 20, description: 'Regulators approve strong response' },
            { type: 'ethical', impact: 25, description: 'Clear accountability message' },
            { type: 'operational', impact: -30, description: 'Severe operational slowdown' },
            { type: 'trust', impact: -15, description: 'Remaining employees fear excessive punishment' },
          ],
          ethicalImplications: 'Maximum accountability but potential for disproportionate impact on minor participants',
        },
        {
          id: 'opt2',
          title: 'Proportional Response Program',
          description: 'Discipline based on involvement level - termination for directors, demotion/probation for passive participants. Implement targeted controls at failure points. Hire key compliance positions.',
          approach: 'measured',
          resourceCost: 2.0,
          consequences: [
            { type: 'regulatory', impact: 10, description: 'Generally acceptable approach' },
            { type: 'ethical', impact: 15, description: 'Proportionate accountability' },
            { type: 'operational', impact: -10, description: 'Manageable business impact' },
            { type: 'trust', impact: 10, description: 'Fair process perception' },
          ],
          ethicalImplications: 'Balances accountability with fairness and operational needs',
        },
        {
          id: 'opt3',
          title: 'Process-Focused Remediation',
          description: 'Focus primarily on systems and controls rather than individual punishment. Retain institutional knowledge. Emphasize training and culture change over terminations.',
          approach: 'cautious',
          resourceCost: 1.5,
          consequences: [
            { type: 'regulatory', impact: -15, description: 'May be seen as insufficient accountability' },
            { type: 'ethical', impact: -10, description: 'Weak individual consequences' },
            { type: 'operational', impact: 15, description: 'Minimal business disruption' },
            { type: 'trust', impact: -10, description: 'External stakeholders question seriousness' },
          ],
          ethicalImplications: 'Risks appearing to excuse misconduct',
        },
        {
          id: 'opt4',
          title: 'Minimum Viable Compliance',
          description: 'Implement only controls specifically required by regulators. Retain all but directly implicated executives. Minimize compliance investment to protect margins.',
          approach: 'defensive',
          resourceCost: 0.5,
          consequences: [
            { type: 'regulatory', impact: -30, description: 'Likely to face enhanced oversight' },
            { type: 'ethical', impact: -30, description: 'Message that compliance is cost center' },
            { type: 'operational', impact: 20, description: 'Business continues normally' },
            { type: 'legal', impact: 30, description: 'High recurrence risk' },
          ],
          ethicalImplications: 'Treating compliance as checkbox exercise',
        },
      ],
      timeframe: '90-day remediation plan required',
    },
  },
  5: {
    briefing: `GOVERNANCE TRANSFORMATION - ONE YEAR LATER

One year after the crisis peak, the company has made significant progress. Restatement complete, new leadership in place, enhanced controls operational. The SEC is considering settlement terms, and the Board is asking about transitioning from crisis mode to sustainable compliance.

A new challenge emerges:
- Competitor has made acquisition approach
- Due diligence would expose all investigation details
- Some Board members favor deal as exit from ongoing scrutiny
- Employees worried about job security`,
    dilemma: {
      id: 'dilemma-5-transformation',
      title: 'Strategic Crossroads',
      description: 'A larger competitor has proposed acquisition at 30% premium to current (depressed) stock price. The deal would require full disclosure of investigation findings and ongoing regulatory matters. Some see this as opportunity to escape regulatory burden; others worry about burying accountability.',
      category: 'disclosure',
      severity: 'significant',
      evidence: [
        { id: 'e1', type: 'document', title: 'Acquisition Term Sheet', summary: '30% premium, due diligence requires full investigation disclosure', reliability: 'confirmed' },
        { id: 'e2', type: 'external', title: 'SEC Settlement Framework', summary: 'Expected resolution in 6 months with cooperation credit', reliability: 'probable' },
        { id: 'e3', type: 'data', title: 'Compliance Program Assessment', summary: 'All 27 material weaknesses remediated, culture scores improving', reliability: 'confirmed' },
        { id: 'e4', type: 'testimony', title: 'Employee Sentiment Survey', summary: '60% prefer independence, 40% see acquisition as fresh start', reliability: 'confirmed' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'Recommend Against Transaction',
          description: 'Advise Board that company should complete transformation independently. Settlement, remediation success, and cultural change are creating real value. Acquisition would disrupt progress.',
          approach: 'aggressive',
          resourceCost: 0.5,
          consequences: [
            { type: 'regulatory', impact: 10, description: 'Demonstrates commitment to resolution' },
            { type: 'ethical', impact: 20, description: 'Completing what we started' },
            { type: 'trust', impact: 15, description: 'Employees value continuity' },
            { type: 'operational', impact: 10, description: 'Transformation momentum maintained' },
          ],
          ethicalImplications: 'Honoring commitment to stakeholders who stayed through crisis',
        },
        {
          id: 'opt2',
          title: 'Neutral Compliance Assessment',
          description: 'Provide Board with objective analysis of compliance implications of both paths. Note that acquisition doesn\'t eliminate individual liability. Let Board make business decision.',
          approach: 'measured',
          resourceCost: 0.3,
          consequences: [
            { type: 'regulatory', impact: 0, description: 'No direct regulatory impact' },
            { type: 'ethical', impact: 5, description: 'Professional objectivity' },
            { type: 'trust', impact: 0, description: 'Neutral stance accepted' },
            { type: 'operational', impact: 0, description: 'Business decision proceeds normally' },
          ],
          ethicalImplications: 'Appropriate scope of compliance officer role',
        },
        {
          id: 'opt3',
          title: 'Support Transaction Path',
          description: 'Advise that acquisition could accelerate resolution. Larger company may have resources for faster remediation. Fresh governance structure could aid cultural reset.',
          approach: 'cautious',
          resourceCost: 0.2,
          consequences: [
            { type: 'regulatory', impact: -10, description: 'May appear to be seeking escape' },
            { type: 'ethical', impact: -15, description: 'Questions about following through' },
            { type: 'trust', impact: -10, description: 'Some see as abandonment' },
            { type: 'operational', impact: -5, description: 'Integration uncertainty' },
          ],
          ethicalImplications: 'Risk of appearing to abandon accountability',
        },
        {
          id: 'opt4',
          title: 'Raise Disclosure Concerns',
          description: 'Warn Board that full disclosure to acquirer creates additional legal exposure. Recommend limiting due diligence access to protect against future claims.',
          approach: 'defensive',
          resourceCost: 0.2,
          consequences: [
            { type: 'regulatory', impact: -20, description: 'Further concealment concerns' },
            { type: 'ethical', impact: -25, description: 'Contradicts transparency values' },
            { type: 'trust', impact: -20, description: 'Board questions judgment' },
            { type: 'legal', impact: 15, description: 'Creates new disclosure issues' },
          ],
          ethicalImplications: 'Prioritizing self-protection over honest dealing',
        },
      ],
      timeframe: 'Board strategy meeting next week',
    },
  },
};

// Helper functions
const calculateOverallScore = (metrics: ComplianceMetrics): number => {
  return Math.round(
    (metrics.regulatoryStanding * 0.25 +
     metrics.ethicalCulture * 0.25 +
     metrics.operationalIntegrity * 0.15 +
     metrics.stakeholderTrust * 0.20 +
     (100 - metrics.legalExposure) * 0.15)
  );
};

const getStanceColor = (stance: StakeholderState['stance']): string => {
  switch (stance) {
    case 'supportive': return 'text-emerald-400';
    case 'neutral': return 'text-slate-400';
    case 'concerned': return 'text-amber-400';
    case 'hostile': return 'text-red-400';
  }
};

const getSeverityColor = (severity: ComplianceDilemma['severity']): string => {
  switch (severity) {
    case 'routine': return 'bg-slate-600';
    case 'significant': return 'bg-amber-600';
    case 'critical': return 'bg-orange-600';
    case 'existential': return 'bg-red-600';
  }
};

const getApproachColor = (approach: DilemmaOption['approach']): string => {
  switch (approach) {
    case 'aggressive': return 'border-indigo-500 hover:bg-indigo-950/50';
    case 'measured': return 'border-emerald-500 hover:bg-emerald-950/50';
    case 'cautious': return 'border-amber-500 hover:bg-amber-950/50';
    case 'defensive': return 'border-red-500 hover:bg-red-950/50';
  }
};

const getReliabilityBadge = (reliability: Evidence['reliability']): string => {
  switch (reliability) {
    case 'confirmed': return 'bg-emerald-900/50 text-emerald-300 border-emerald-700';
    case 'probable': return 'bg-amber-900/50 text-amber-300 border-amber-700';
    case 'uncertain': return 'bg-slate-700/50 text-slate-300 border-slate-600';
  }
};

// Components
const ComplianceDashboard: React.FC<{ metrics: ComplianceMetrics }> = ({ metrics }) => {
  const overallScore = calculateOverallScore(metrics);

  return (
    <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-4">
      <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Compliance Dashboard
      </h3>

      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg text-center">
        <div className="text-3xl font-bold text-indigo-400">{overallScore}</div>
        <div className="text-xs text-slate-400">Overall Compliance Score</div>
      </div>

      <div className="space-y-3">
        <MetricBar label="Regulatory Standing" value={metrics.regulatoryStanding} color="indigo" />
        <MetricBar label="Ethical Culture" value={metrics.ethicalCulture} color="violet" />
        <MetricBar label="Operational Integrity" value={metrics.operationalIntegrity} color="blue" />
        <MetricBar label="Stakeholder Trust" value={metrics.stakeholderTrust} color="emerald" />
        <MetricBar label="Legal Exposure" value={metrics.legalExposure} color="red" inverted />
      </div>

      <div className="mt-4 p-2 bg-indigo-900/30 rounded text-center">
        <span className="text-slate-400 text-sm">Investigation Budget: </span>
        <span className="text-indigo-300 font-semibold">${metrics.investigationBudget.toFixed(1)}M</span>
      </div>
    </div>
  );
};

const MetricBar: React.FC<{ label: string; value: number; color: string; inverted?: boolean }> = ({
  label, value, color, inverted
}) => {
  const displayValue = inverted ? value : value;
  const barColor = inverted
    ? (value > 50 ? 'bg-red-500' : value > 25 ? 'bg-amber-500' : 'bg-emerald-500')
    : `bg-${color}-500`;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={`text-${color}-400`}>{displayValue}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={barColor}
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
};

const StakeholderPanel: React.FC<{ stakeholders: StakeholderState[] }> = ({ stakeholders }) => {
  return (
    <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-4">
      <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Key Stakeholders
      </h3>

      <div className="space-y-2">
        {stakeholders.map((stakeholder) => (
          <div key={stakeholder.id} className="p-2 bg-slate-900/50 rounded">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-slate-200">{stakeholder.name}</div>
                <div className="text-xs text-slate-500">{stakeholder.role}</div>
              </div>
              <span className={`text-xs capitalize ${getStanceColor(stakeholder.stance)}`}>
                {stakeholder.stance}
              </span>
            </div>
            <div className="mt-1 flex gap-4 text-xs">
              <span className="text-slate-500">Trust: <span className="text-indigo-400">{stakeholder.trust}%</span></span>
              <span className="text-slate-500">Influence: <span className="text-violet-400">{stakeholder.influence}%</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EvidencePanel: React.FC<{ evidence: Evidence[] }> = ({ evidence }) => {
  return (
    <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-4">
      <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Evidence File
      </h3>

      <div className="space-y-2">
        {evidence.map((item) => (
          <div key={item.id} className="p-2 bg-slate-900/50 rounded">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="text-sm text-slate-200">{item.title}</div>
                <div className="text-xs text-slate-400 mt-1">{item.summary}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded border ${getReliabilityBadge(item.reliability)}`}>
                {item.reliability}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-500 capitalize">Type: {item.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DilemmaPanel: React.FC<{
  dilemma: ComplianceDilemma;
  onSelectOption: (option: DilemmaOption) => void;
  budget: number;
}> = ({ dilemma, onSelectOption, budget }) => {
  return (
    <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-indigo-400 font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Compliance Dilemma
        </h3>
        <span className={`px-2 py-1 rounded text-xs text-white ${getSeverityColor(dilemma.severity)}`}>
          {dilemma.severity.toUpperCase()}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-lg text-slate-100 font-medium mb-2">{dilemma.title}</h4>
        <p className="text-sm text-slate-300 mb-2">{dilemma.description}</p>
        <div className="flex gap-4 text-xs">
          <span className="text-slate-500">Category: <span className="text-indigo-400 capitalize">{dilemma.category}</span></span>
          <span className="text-slate-500">Timeframe: <span className="text-amber-400">{dilemma.timeframe}</span></span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm text-slate-400 font-medium">Response Options:</h4>
        {dilemma.options.map((option) => {
          const canAfford = budget >= option.resourceCost;
          return (
            <motion.button
              key={option.id}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${getApproachColor(option.approach)} ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => canAfford && onSelectOption(option)}
              whileHover={canAfford ? { scale: 1.01 } : {}}
              whileTap={canAfford ? { scale: 0.99 } : {}}
              disabled={!canAfford}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-slate-100 font-medium">{option.title}</span>
                <span className="text-xs text-indigo-400">${option.resourceCost}M</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{option.description}</p>
              <div className="text-xs text-slate-500 italic">{option.ethicalImplications}</div>
              {!canAfford && (
                <div className="mt-1 text-xs text-red-400">Insufficient investigation budget</div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const NarrativePanel: React.FC<{ history: string[] }> = ({ history }) => {
  return (
    <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-4 max-h-64 overflow-y-auto">
      <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Investigation Log
      </h3>

      <div className="space-y-2">
        {history.map((entry, index) => (
          <motion.div
            key={index}
            className="text-xs text-slate-400 p-2 bg-slate-900/50 rounded"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {entry}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main component
export default function GovernanceComplianceSimulation() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'intro',
    round: 1,
    totalRounds: 5,
    complianceMetrics: { ...initialMetrics },
    stakeholders: initialStakeholders.map(s => ({ ...s })),
    currentDilemma: null,
    selectedOption: null,
    narrativeHistory: [],
    finalScore: null,
  });

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect
  const typeText = (text: string, callback?: () => void) => {
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        callback?.();
      }
    }, 15);
  };

  // Start game
  const startGame = () => {
    setGameState(prev => ({ ...prev, phase: 'briefing' }));
  };

  // Begin round briefing
  useEffect(() => {
    if (gameState.phase === 'briefing') {
      const scenario = ROUND_SCENARIOS[gameState.round];
      if (scenario) {
        typeText(scenario.briefing, () => {
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              phase: 'investigation',
              currentDilemma: scenario.dilemma,
              narrativeHistory: [...prev.narrativeHistory, `Round ${prev.round}: ${scenario.dilemma.title} identified`]
            }));
          }, 1000);
        });
      }
    }
  }, [gameState.phase, gameState.round]);

  // Handle option selection
  const handleOptionSelect = (option: DilemmaOption) => {
    setGameState(prev => ({
      ...prev,
      selectedOption: option,
      phase: 'decision'
    }));
  };

  // Confirm decision
  const confirmDecision = () => {
    if (!gameState.selectedOption) return;

    const option = gameState.selectedOption;
    const newMetrics = { ...gameState.complianceMetrics };
    const newStakeholders = gameState.stakeholders.map(s => ({ ...s }));
    const narrativeUpdates: string[] = [];

    // Apply consequences
    option.consequences.forEach(consequence => {
      switch (consequence.type) {
        case 'regulatory':
          newMetrics.regulatoryStanding = Math.max(0, Math.min(100, newMetrics.regulatoryStanding + consequence.impact));
          break;
        case 'ethical':
          newMetrics.ethicalCulture = Math.max(0, Math.min(100, newMetrics.ethicalCulture + consequence.impact));
          break;
        case 'operational':
          newMetrics.operationalIntegrity = Math.max(0, Math.min(100, newMetrics.operationalIntegrity + consequence.impact));
          break;
        case 'trust':
          newMetrics.stakeholderTrust = Math.max(0, Math.min(100, newMetrics.stakeholderTrust + consequence.impact));
          // Also affect individual stakeholder trust
          newStakeholders.forEach(s => {
            s.trust = Math.max(0, Math.min(100, s.trust + Math.round(consequence.impact * 0.5)));
            // Update stance based on trust
            if (s.trust >= 70) s.stance = 'supportive';
            else if (s.trust >= 50) s.stance = 'neutral';
            else if (s.trust >= 30) s.stance = 'concerned';
            else s.stance = 'hostile';
          });
          break;
        case 'legal':
          newMetrics.legalExposure = Math.max(0, Math.min(100, newMetrics.legalExposure - consequence.impact));
          break;
        case 'budget':
          newMetrics.investigationBudget = Math.max(0, newMetrics.investigationBudget + consequence.impact);
          break;
      }
      narrativeUpdates.push(consequence.description);
    });

    // Deduct resource cost
    newMetrics.investigationBudget = Math.max(0, newMetrics.investigationBudget - option.resourceCost);

    setGameState(prev => ({
      ...prev,
      complianceMetrics: newMetrics,
      stakeholders: newStakeholders,
      narrativeHistory: [...prev.narrativeHistory, `Decision: ${option.title}`, ...narrativeUpdates],
      phase: 'consequence'
    }));

    // Show consequences then move to round end
    setTimeout(() => {
      setGameState(prev => ({ ...prev, phase: 'round-end' }));
    }, 2000);
  };

  // Advance to next round or end game
  const advanceRound = () => {
    if (gameState.round >= gameState.totalRounds) {
      const finalScore = calculateOverallScore(gameState.complianceMetrics);
      setGameState(prev => ({
        ...prev,
        phase: 'game-over',
        finalScore
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        round: prev.round + 1,
        phase: 'briefing',
        currentDilemma: null,
        selectedOption: null
      }));
    }
  };

  // Restart game
  const restartGame = () => {
    setGameState({
      phase: 'intro',
      round: 1,
      totalRounds: 5,
      complianceMetrics: { ...initialMetrics },
      stakeholders: initialStakeholders.map(s => ({ ...s })),
      currentDilemma: null,
      selectedOption: null,
      narrativeHistory: [],
      finalScore: null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-indigo-900/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back to Simulations</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-slate-500">Round </span>
              <span className="text-indigo-400 font-semibold">{gameState.round}</span>
              <span className="text-slate-500"> of </span>
              <span className="text-indigo-400 font-semibold">{gameState.totalRounds}</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="text-sm">
              <span className="text-slate-500">Compliance Score: </span>
              <span className="text-indigo-400 font-semibold">{calculateOverallScore(gameState.complianceMetrics)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Intro Phase */}
          {gameState.phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-900/50 flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              <h1 className="text-4xl font-bold text-slate-100 mb-4">Governance & Compliance</h1>
              <p className="text-xl text-indigo-400 mb-8">Navigate Ethics, Regulations, and Corporate Accountability</p>

              <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-6 mb-8 text-left">
                <h2 className="text-lg text-slate-200 font-semibold mb-4">Your Role: Chief Compliance Officer</h2>
                <p className="text-slate-400 mb-4">
                  You are the CCO of a Fortune 500 corporation facing a multi-year compliance crisis. An anonymous
                  whistleblower has triggered an investigation that will test your ethical judgment, regulatory
                  expertise, and leadership under pressure.
                </p>

                <h3 className="text-md text-slate-300 font-medium mb-2">Your Responsibilities:</h3>
                <ul className="text-slate-400 space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Protect the company while upholding ethical standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Navigate SEC investigations and regulatory examinations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Balance accountability with organizational stability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>Build and maintain a culture of integrity</span>
                  </li>
                </ul>

                <div className="p-3 bg-indigo-900/30 rounded-lg">
                  <p className="text-sm text-indigo-300 italic">
                    "The true test of corporate governance is not how we act when compliance is easy,
                    but how we respond when doing the right thing is costly."
                  </p>
                </div>
              </div>

              <motion.button
                onClick={startGame}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Begin Investigation
              </motion.button>
            </motion.div>
          )}

          {/* Briefing Phase */}
          {gameState.phase === 'briefing' && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg text-slate-200 font-semibold">Compliance Briefing</h2>
                    <p className="text-xs text-slate-500">Round {gameState.round} Intelligence Report</p>
                  </div>
                </div>

                <div className="font-mono text-sm text-indigo-300 whitespace-pre-wrap leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">▋</span>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Investigation & Decision Phases */}
          {(gameState.phase === 'investigation' || gameState.phase === 'decision') && gameState.currentDilemma && (
            <motion.div
              key="investigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left column - Metrics & Stakeholders */}
              <div className="space-y-6">
                <ComplianceDashboard metrics={gameState.complianceMetrics} />
                <StakeholderPanel stakeholders={gameState.stakeholders} />
              </div>

              {/* Center column - Dilemma */}
              <div className="lg:col-span-1">
                {gameState.phase === 'investigation' && (
                  <DilemmaPanel
                    dilemma={gameState.currentDilemma}
                    onSelectOption={handleOptionSelect}
                    budget={gameState.complianceMetrics.investigationBudget}
                  />
                )}

                {gameState.phase === 'decision' && gameState.selectedOption && (
                  <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-4">
                    <h3 className="text-indigo-400 font-semibold mb-3">Confirm Decision</h3>
                    <div className="p-4 bg-slate-900/50 rounded-lg mb-4">
                      <h4 className="text-lg text-slate-100 font-medium mb-2">{gameState.selectedOption.title}</h4>
                      <p className="text-sm text-slate-400 mb-3">{gameState.selectedOption.description}</p>
                      <div className="text-xs text-slate-500">
                        Resource cost: <span className="text-indigo-400">${gameState.selectedOption.resourceCost}M</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm text-slate-400 mb-2">Expected Outcomes:</h4>
                      <ul className="space-y-1">
                        {gameState.selectedOption.consequences.map((c, i) => (
                          <li key={i} className={`text-xs ${c.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {c.impact >= 0 ? '+' : ''}{c.impact}% {c.type}: {c.description}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setGameState(prev => ({ ...prev, phase: 'investigation', selectedOption: null }))}
                        className="flex-1 py-2 border border-slate-600 text-slate-400 rounded hover:bg-slate-700 transition-colors"
                      >
                        Reconsider
                      </button>
                      <button
                        onClick={confirmDecision}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Evidence & Narrative */}
              <div className="space-y-6">
                <EvidencePanel evidence={gameState.currentDilemma.evidence} />
                <NarrativePanel history={gameState.narrativeHistory} />
              </div>
            </motion.div>
          )}

          {/* Consequence Phase */}
          {gameState.phase === 'consequence' && (
            <motion.div
              key="consequence"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center py-12"
            >
              <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-900/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h2 className="text-xl text-slate-200 font-semibold mb-2">Processing Compliance Decision...</h2>
                <p className="text-slate-400">Regulatory responses and stakeholder reactions developing</p>
              </div>
            </motion.div>
          )}

          {/* Round End Phase */}
          {gameState.phase === 'round-end' && (
            <motion.div
              key="round-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto py-12"
            >
              <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-8 text-center">
                <h2 className="text-2xl text-slate-200 font-semibold mb-4">Round {gameState.round} Complete</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="text-3xl font-bold text-indigo-400">{calculateOverallScore(gameState.complianceMetrics)}</div>
                    <div className="text-xs text-slate-500">Compliance Score</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="text-3xl font-bold text-emerald-400">${gameState.complianceMetrics.investigationBudget.toFixed(1)}M</div>
                    <div className="text-xs text-slate-500">Remaining Budget</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm text-slate-400 mb-2">Metrics Summary:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-left">
                      <span className="text-slate-500">Regulatory Standing:</span>
                      <span className="text-indigo-400 ml-2">{gameState.complianceMetrics.regulatoryStanding}%</span>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500">Ethical Culture:</span>
                      <span className="text-violet-400 ml-2">{gameState.complianceMetrics.ethicalCulture}%</span>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500">Legal Exposure:</span>
                      <span className="text-red-400 ml-2">{gameState.complianceMetrics.legalExposure}%</span>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500">Stakeholder Trust:</span>
                      <span className="text-emerald-400 ml-2">{gameState.complianceMetrics.stakeholderTrust}%</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={advanceRound}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {gameState.round >= gameState.totalRounds ? 'View Final Assessment' : 'Continue to Next Round'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Game Over Phase */}
          {gameState.phase === 'game-over' && (
            <motion.div
              key="game-over"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto py-12"
            >
              <div className="bg-slate-800/80 rounded-lg border border-indigo-900/50 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl text-slate-200 font-bold mb-2">Compliance Assessment Complete</h2>
                  <p className="text-slate-400">Your leadership through the governance crisis has been evaluated</p>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">{gameState.finalScore}</div>
                      <div className="text-xs text-indigo-200">Final Score</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-indigo-400">{gameState.complianceMetrics.regulatoryStanding}%</div>
                    <div className="text-xs text-slate-500">Regulatory Standing</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-violet-400">{gameState.complianceMetrics.ethicalCulture}%</div>
                    <div className="text-xs text-slate-500">Ethical Culture</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{gameState.complianceMetrics.operationalIntegrity}%</div>
                    <div className="text-xs text-slate-500">Operational Integrity</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-emerald-400">{gameState.complianceMetrics.stakeholderTrust}%</div>
                    <div className="text-xs text-slate-500">Stakeholder Trust</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-400">{gameState.complianceMetrics.legalExposure}%</div>
                    <div className="text-xs text-slate-500">Legal Exposure</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-amber-400">${gameState.complianceMetrics.investigationBudget.toFixed(1)}M</div>
                    <div className="text-xs text-slate-500">Budget Remaining</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 rounded-lg mb-6">
                  <h3 className="text-sm text-indigo-400 font-semibold mb-2">Performance Assessment:</h3>
                  <p className="text-sm text-slate-300">
                    {gameState.finalScore !== null && gameState.finalScore >= 80
                      ? "Exemplary governance leadership. Your commitment to ethics and transparency while protecting legitimate business interests demonstrates the highest standards of corporate compliance. The organization has emerged stronger with a culture of integrity."
                      : gameState.finalScore !== null && gameState.finalScore >= 60
                      ? "Competent crisis management with room for improvement. You balanced competing demands reasonably well, though some decisions may have prioritized short-term stability over long-term trust-building. The compliance program remains viable."
                      : gameState.finalScore !== null && gameState.finalScore >= 40
                      ? "Concerning pattern of compromise on ethical standards. While the organization survived, the compliance culture has been weakened. Rebuilding stakeholder trust will require sustained effort and demonstrated commitment to change."
                      : "Significant governance failures. The choices made have exposed the organization to ongoing regulatory risk and damaged its ethical foundation. A fundamental reset of compliance values and leadership may be needed."}
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={restartGame}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Try Different Approach
                  </motion.button>
                  <Link href="/">
                    <motion.button
                      className="px-6 py-3 border border-indigo-600 text-indigo-400 hover:bg-indigo-950 font-semibold rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Return to Simulations
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
