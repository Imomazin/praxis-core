'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Users, DollarSign, Building2, ChevronRight, Target, Scale, Play,
  RotateCcw, Eye, Home, Shield, Heart, Newspaper, Phone, FileWarning, Activity,
  Clock, AlertOctagon, MessageSquare, Radio, Siren, HeartPulse, Stethoscope,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// TYPES
// =============================================================================

type Configuration = 'ambiguous-signal' | 'clear-danger' | 'manufacturing-issue' | 'competitor-disinformation';
type Role = 'gm' | 'legal' | 'medical' | 'comms' | 'operations' | 'hr' | 'finance';
type Phase = 'intro' | 'sensemaking' | 'decisions' | 'resolution' | 'feedback' | 'fork' | 'event' | 'game-over';

interface RoleInfo {
  id: Role;
  name: string;
  title: string;
  icon: any;
  color: string;
  privateInfo: string[];
  metrics: string[];
  conflicts: string[];
}

interface GameMetrics {
  patientTrust: number;
  regulatoryStanding: number;
  stockPrice: number;
  mediaPerception: number;
  litigationExposure: number;
  employeeMorale: number;
  operationalContinuity: number;
  investigationProgress: number;
}

interface StakeholderTrust {
  patients: number;
  regulators: number;
  investors: number;
  employees: number;
  media: number;
  physicians: number;
}

interface Decision {
  id: string;
  title: string;
  description: string;
  role: Role;
  options: DecisionOption[];
}

interface DecisionOption {
  id: string;
  label: string;
  shortLabel: string;
  consequences: Partial<GameMetrics>;
  trustImpact: Partial<StakeholderTrust>;
  narrative: string;
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: 'media' | 'regulatory' | 'legal' | 'medical' | 'internal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  conditions?: (state: GameState) => boolean;
  consequences: Partial<GameMetrics>;
  trustImpact: Partial<StakeholderTrust>;
}

interface StrategicFork {
  id: string;
  title: string;
  description: string;
  round: number;
  paths: ForkPath[];
}

interface ForkPath {
  id: string;
  name: string;
  description: string;
  consequences: string[];
  metricsImpact: Partial<GameMetrics>;
  lockedPaths: string[];
}

interface GameState {
  configuration: Configuration;
  currentRole: Role;
  round: number;
  phase: Phase;
  metrics: GameMetrics;
  trust: StakeholderTrust;
  decisionHistory: { round: number; decision: string; option: string }[];
  activeForks: string[];
  lockedPaths: string[];
  triggeredEvents: string[];
  currentEvent: GameEvent | null;
  currentFork: StrategicFork | null;
  narrativeLog: string[];
  gameOver: boolean;
  endState: string | null;
}

// =============================================================================
// GAME DATA
// =============================================================================

const CONFIGURATIONS: Record<Configuration, { name: string; description: string; initialMetrics: GameMetrics; initialTrust: StakeholderTrust }> = {
  'ambiguous-signal': {
    name: 'Ambiguous Signal',
    description: 'Safety data is genuinely ambiguous. Expert opinions differ. The right answer is not knowable with current information. Every path carries risk.',
    initialMetrics: { patientTrust: 75, regulatoryStanding: 70, stockPrice: 85, mediaPerception: 70, litigationExposure: 20, employeeMorale: 80, operationalContinuity: 90, investigationProgress: 10 },
    initialTrust: { patients: 75, regulators: 70, investors: 80, employees: 85, media: 65, physicians: 75 },
  },
  'clear-danger': {
    name: 'Clear Danger',
    description: 'Additional analysis reveals signal is likely real. Scope and severity remain uncertain. Recall may be appropriate but timing and scope are critical.',
    initialMetrics: { patientTrust: 65, regulatoryStanding: 60, stockPrice: 70, mediaPerception: 55, litigationExposure: 45, employeeMorale: 70, operationalContinuity: 85, investigationProgress: 35 },
    initialTrust: { patients: 60, regulators: 55, investors: 65, employees: 75, media: 45, physicians: 55 },
  },
  'manufacturing-issue': {
    name: 'Manufacturing Quality Issue',
    description: 'Investigation reveals potential manufacturing quality variation that may explain safety signal. Specific lots may be affected while others are safe.',
    initialMetrics: { patientTrust: 72, regulatoryStanding: 65, stockPrice: 78, mediaPerception: 60, litigationExposure: 30, employeeMorale: 75, operationalContinuity: 70, investigationProgress: 25 },
    initialTrust: { patients: 70, regulators: 60, investors: 72, employees: 70, media: 55, physicians: 65 },
  },
  'competitor-disinformation': {
    name: 'Competitor Disinformation',
    description: 'Evidence emerges suggesting competitor may be amplifying safety concerns through planted stories and manipulated data. Truth is unclear.',
    initialMetrics: { patientTrust: 68, regulatoryStanding: 72, stockPrice: 75, mediaPerception: 45, litigationExposure: 25, employeeMorale: 78, operationalContinuity: 88, investigationProgress: 15 },
    initialTrust: { patients: 65, regulators: 70, investors: 70, employees: 80, media: 35, physicians: 68 },
  },
};

const ROLES: RoleInfo[] = [
  { id: 'gm', name: 'CEO', title: 'Chief Executive Officer', icon: Building2, color: 'slate',
    privateInfo: ['Board divided on response strategy', 'Major shareholder demanding information', 'Potential acquirer watching situation closely'],
    metrics: ['Overall crisis management', 'Stakeholder confidence', 'Strategic positioning'], conflicts: ['All functions want different approaches'] },
  { id: 'legal', name: 'Legal', title: 'General Counsel', icon: Scale, color: 'rose',
    privateInfo: ['Litigation exposure could reach $2B in worst case', 'Regulatory precedents suggest enforcement likely', 'Whistleblower has retained counsel'],
    metrics: ['Litigation exposure', 'Regulatory compliance', 'Document preservation'], conflicts: ['Communications (disclosure timing)', 'Medical (information sharing)'] },
  { id: 'medical', name: 'Medical', title: 'Chief Medical Officer', icon: Stethoscope, color: 'emerald',
    privateInfo: ['Internal analysis suggests signal may be real', 'Key opinion leaders privately concerned', 'FDA contact has indicated informal concerns'],
    metrics: ['Patient safety', 'Scientific integrity', 'Physician relationships'], conflicts: ['Legal (disclosure)', 'Operations (recall scope)'] },
  { id: 'comms', name: 'Communications', title: 'Chief Communications Officer', icon: MessageSquare, color: 'blue',
    privateInfo: ['Major media outlet preparing investigative piece', 'Social media sentiment deteriorating rapidly', 'Former employee speaking to reporters'],
    metrics: ['Media relations', 'Public perception', 'Message consistency'], conflicts: ['Legal (what to say)', 'Medical (how to say it)'] },
  { id: 'operations', name: 'Operations', title: 'Chief Operating Officer', icon: Activity, color: 'amber',
    privateInfo: ['Manufacturing capacity strained', 'Supply chain disruption if recall expands', 'Quality control gaps identified in internal audit'],
    metrics: ['Operational continuity', 'Supply chain stability', 'Quality systems'], conflicts: ['Medical (recall scope)', 'Finance (cost management)'] },
  { id: 'hr', name: 'HR', title: 'Chief Human Resources Officer', icon: Users, color: 'violet',
    privateInfo: ['Employee morale declining rapidly', 'Key scientists considering departure', 'Whistleblower protection concerns'],
    metrics: ['Employee morale', 'Talent retention', 'Internal communications'], conflicts: ['Legal (employee communications)', 'Operations (workforce planning)'] },
  { id: 'finance', name: 'Finance', title: 'Chief Financial Officer', icon: DollarSign, color: 'cyan',
    privateInfo: ['Cash reserves adequate for 18-month crisis', 'Insurance coverage dispute likely', 'Credit rating review triggered'],
    metrics: ['Financial stability', 'Cost management', 'Investor relations'], conflicts: ['Medical (investigation costs)', 'Operations (recall costs)'] },
];

const ROUND_DECISIONS: Decision[][] = [
  // Round 1: Initial Response (Week 1)
  [
    { id: 'r1-disclosure', title: 'Initial Disclosure Strategy', description: 'Safety signal identified. How do you approach initial disclosure?', role: 'gm',
      options: [
        { id: 'full-immediate', label: 'Immediate Full Disclosure', shortLabel: 'Full', consequences: { mediaPerception: 15, litigationExposure: -10, stockPrice: -20 }, trustImpact: { patients: 20, regulators: 25, media: 20, investors: -15 }, narrative: 'You release all known information publicly within 24 hours.' },
        { id: 'regulatory-first', label: 'Regulatory-First Disclosure', shortLabel: 'Reg First', consequences: { regulatoryStanding: 15, mediaPerception: -10, litigationExposure: 5 }, trustImpact: { regulators: 20, media: -15, patients: -5 }, narrative: 'You inform FDA before public announcement.' },
        { id: 'investigate-first', label: 'Investigate Before Disclosure', shortLabel: 'Investigate', consequences: { investigationProgress: 20, mediaPerception: -20, litigationExposure: 15 }, trustImpact: { regulators: -15, media: -25, patients: -10 }, narrative: 'You delay disclosure pending additional analysis.' },
      ]
    },
    { id: 'r1-investigation', title: 'Investigation Scope', description: 'How comprehensive should the initial investigation be?', role: 'medical',
      options: [
        { id: 'comprehensive', label: 'Full Independent Investigation', shortLabel: 'Full', consequences: { investigationProgress: 25, operationalContinuity: -10 }, trustImpact: { regulators: 15, physicians: 20 }, narrative: 'You engage external experts for comprehensive review.' },
        { id: 'targeted', label: 'Targeted Internal Analysis', shortLabel: 'Targeted', consequences: { investigationProgress: 15, operationalContinuity: -5 }, trustImpact: { regulators: 5 }, narrative: 'You focus internal resources on specific questions.' },
        { id: 'minimal', label: 'Minimal Initial Review', shortLabel: 'Minimal', consequences: { investigationProgress: 5 }, trustImpact: { regulators: -10, physicians: -10 }, narrative: 'You conduct limited review to preserve options.' },
      ]
    },
  ],
  // Round 2: Stakeholder Management (Week 2)
  [
    { id: 'r2-physician-comm', title: 'Physician Communication', description: 'How do you communicate with prescribing physicians?', role: 'medical',
      options: [
        { id: 'proactive', label: 'Proactive Outreach with Guidance', shortLabel: 'Proactive', consequences: { patientTrust: 10 }, trustImpact: { physicians: 25, patients: 15 }, narrative: 'You contact physicians directly with prescribing guidance.' },
        { id: 'reactive', label: 'Respond to Inquiries Only', shortLabel: 'Reactive', consequences: {}, trustImpact: { physicians: -10 }, narrative: 'You prepare responses but wait for physician questions.' },
        { id: 'silence', label: 'Maintain Silence Pending Investigation', shortLabel: 'Silence', consequences: { litigationExposure: 10 }, trustImpact: { physicians: -25, patients: -15 }, narrative: 'You avoid physician communication until investigation complete.' },
      ]
    },
    { id: 'r2-employee', title: 'Employee Communication', description: 'How do you address employee concerns?', role: 'hr',
      options: [
        { id: 'transparent', label: 'Full Town Hall Transparency', shortLabel: 'Transparent', consequences: { employeeMorale: 15 }, trustImpact: { employees: 25 }, narrative: 'You hold company-wide meeting with Q&A.' },
        { id: 'controlled', label: 'Controlled Messaging', shortLabel: 'Controlled', consequences: { employeeMorale: 5 }, trustImpact: { employees: 5 }, narrative: 'You provide talking points through management chain.' },
        { id: 'minimal', label: 'Minimal Internal Communication', shortLabel: 'Minimal', consequences: { employeeMorale: -15 }, trustImpact: { employees: -20 }, narrative: 'You focus on external stakeholders first.' },
      ]
    },
  ],
  // Round 3: Investigation Findings (Week 3)
  [
    { id: 'r3-findings', title: 'Investigation Findings Response', description: 'Preliminary findings are in. How do you respond?', role: 'gm',
      options: [
        { id: 'accept', label: 'Accept Findings, Take Action', shortLabel: 'Accept', consequences: { investigationProgress: 20, stockPrice: -15, operationalContinuity: -20 }, trustImpact: { regulators: 20, patients: 15, physicians: 15 }, narrative: 'You accept findings and initiate corrective action.' },
        { id: 'challenge', label: 'Challenge Methodology', shortLabel: 'Challenge', consequences: { investigationProgress: -10, litigationExposure: 10 }, trustImpact: { regulators: -15, media: -10 }, narrative: 'You question investigation methodology and seek additional review.' },
        { id: 'partial', label: 'Partial Acceptance with Caveats', shortLabel: 'Partial', consequences: { investigationProgress: 10 }, trustImpact: { regulators: 5 }, narrative: 'You accept some findings while questioning others.' },
      ]
    },
  ],
  // Round 4: Regulatory Engagement (Week 4)
  [
    { id: 'r4-fda', title: 'FDA Engagement Strategy', description: 'FDA has requested meeting. How do you approach?', role: 'legal',
      options: [
        { id: 'cooperative', label: 'Full Cooperation', shortLabel: 'Cooperate', consequences: { regulatoryStanding: 20, litigationExposure: -15 }, trustImpact: { regulators: 30 }, narrative: 'You provide complete access and full cooperation.' },
        { id: 'structured', label: 'Structured Engagement', shortLabel: 'Structured', consequences: { regulatoryStanding: 10, litigationExposure: -5 }, trustImpact: { regulators: 10 }, narrative: 'You engage through formal channels with legal oversight.' },
        { id: 'defensive', label: 'Defensive Posture', shortLabel: 'Defensive', consequences: { regulatoryStanding: -15, litigationExposure: 10 }, trustImpact: { regulators: -25 }, narrative: 'You protect information while meeting minimum requirements.' },
      ]
    },
    { id: 'r4-recall', title: 'Recall Decision', description: 'Pressure mounting for product recall. What do you decide?', role: 'operations',
      options: [
        { id: 'voluntary-full', label: 'Voluntary Full Recall', shortLabel: 'Full Recall', consequences: { operationalContinuity: -40, patientTrust: 20, stockPrice: -25 }, trustImpact: { patients: 25, regulators: 25, physicians: 20 }, narrative: 'You initiate voluntary recall of all affected product.' },
        { id: 'voluntary-partial', label: 'Voluntary Partial Recall', shortLabel: 'Partial', consequences: { operationalContinuity: -20, patientTrust: 10, stockPrice: -15 }, trustImpact: { patients: 10, regulators: 10, physicians: 10 }, narrative: 'You recall specific lots identified in investigation.' },
        { id: 'no-recall', label: 'No Recall, Enhanced Monitoring', shortLabel: 'No Recall', consequences: { operationalContinuity: 0, litigationExposure: 25 }, trustImpact: { patients: -20, regulators: -15, physicians: -10 }, narrative: 'You maintain product availability with increased monitoring.' },
      ]
    },
  ],
  // Round 5: Crisis Escalation (Week 5)
  [
    { id: 'r5-media', title: 'Media Crisis Response', description: 'Investigative story breaks. How do you respond?', role: 'comms',
      options: [
        { id: 'engage', label: 'Active Media Engagement', shortLabel: 'Engage', consequences: { mediaPerception: 20 }, trustImpact: { media: 25, patients: 10 }, narrative: 'You provide access, interviews, and proactive information.' },
        { id: 'statement', label: 'Prepared Statement Only', shortLabel: 'Statement', consequences: { mediaPerception: 5 }, trustImpact: { media: -5 }, narrative: 'You release statement but decline interview requests.' },
        { id: 'silence', label: 'No Comment Strategy', shortLabel: 'Silence', consequences: { mediaPerception: -25 }, trustImpact: { media: -30, patients: -15 }, narrative: 'You decline all media engagement.' },
      ]
    },
  ],
  // Round 6: Legal Exposure (Week 6)
  [
    { id: 'r6-litigation', title: 'Litigation Strategy', description: 'Class action lawsuit filed. How do you respond?', role: 'legal',
      options: [
        { id: 'settle', label: 'Seek Early Settlement', shortLabel: 'Settle', consequences: { litigationExposure: -30, stockPrice: -10 }, trustImpact: { investors: 10 }, narrative: 'You pursue settlement negotiations immediately.' },
        { id: 'defend', label: 'Vigorous Defense', shortLabel: 'Defend', consequences: { litigationExposure: 10 }, trustImpact: { investors: -5 }, narrative: 'You mount aggressive legal defense.' },
        { id: 'reserve', label: 'Reserve Judgment, Preserve Options', shortLabel: 'Reserve', consequences: { litigationExposure: 0 }, trustImpact: {}, narrative: 'You assess claims before committing to strategy.' },
      ]
    },
  ],
];

const EVENTS: GameEvent[] = [
  { id: 'adverse-event', title: 'Confirmed Adverse Event', description: 'Hospital reports patient death potentially linked to drug.', category: 'medical', severity: 'critical', probability: 0.2,
    conditions: (s) => s.metrics.investigationProgress < 50, consequences: { patientTrust: -25, stockPrice: -20, litigationExposure: 30 }, trustImpact: { patients: -30, physicians: -25, media: -20 } },
  { id: 'whistleblower', title: 'Whistleblower Emerges', description: 'Former employee goes public with internal safety concerns.', category: 'internal', severity: 'high', probability: 0.15,
    conditions: (s) => s.trust.employees < 60, consequences: { mediaPerception: -20, litigationExposure: 20, employeeMorale: -15 }, trustImpact: { employees: -25, media: -15 } },
  { id: 'media-investigation', title: 'Major Media Investigation', description: 'Investigative journalist publishes exposé with internal documents.', category: 'media', severity: 'high', probability: 0.2,
    consequences: { mediaPerception: -25, stockPrice: -15 }, trustImpact: { media: -20, patients: -15 } },
  { id: 'congressional', title: 'Congressional Inquiry', description: 'Congressional committee announces hearing on drug safety.', category: 'regulatory', severity: 'high', probability: 0.15,
    consequences: { regulatoryStanding: -15, mediaPerception: -10 }, trustImpact: { regulators: -10, investors: -15 } },
  { id: 'competitor-statement', title: 'Competitor Statement', description: 'Competitor CEO questions your safety protocols publicly.', category: 'media', severity: 'medium', probability: 0.2,
    consequences: { mediaPerception: -15 }, trustImpact: { media: -10, patients: -10 } },
  { id: 'physician-warning', title: 'Physician Group Warning', description: 'Medical association issues prescribing caution.', category: 'medical', severity: 'high', probability: 0.15,
    conditions: (s) => s.trust.physicians < 60, consequences: { patientTrust: -20 }, trustImpact: { physicians: -20, patients: -15 } },
  { id: 'insurance-decision', title: 'Insurance Coverage Decision', description: 'Major insurer restricts coverage pending safety review.', category: 'regulatory', severity: 'medium', probability: 0.15,
    consequences: { stockPrice: -10, operationalContinuity: -10 }, trustImpact: { investors: -10 } },
  { id: 'stock-downgrade', title: 'Analyst Downgrade', description: 'Major analyst downgrades stock citing crisis management concerns.', category: 'legal', severity: 'medium', probability: 0.2,
    consequences: { stockPrice: -15 }, trustImpact: { investors: -20 } },
  { id: 'employee-leak', title: 'Internal Document Leak', description: 'Confidential crisis documents appear on social media.', category: 'internal', severity: 'high', probability: 0.15,
    conditions: (s) => s.trust.employees < 50, consequences: { mediaPerception: -15, employeeMorale: -20 }, trustImpact: { employees: -15, media: -10 } },
  { id: 'manufacturing-issue', title: 'Manufacturing Discovery', description: 'Quality control discovers additional production concerns.', category: 'internal', severity: 'high', probability: 0.15,
    consequences: { operationalContinuity: -20, investigationProgress: 15 }, trustImpact: { regulators: -10 } },
  { id: 'fda-inspection', title: 'FDA Inspection', description: 'FDA announces unscheduled facility inspection.', category: 'regulatory', severity: 'medium', probability: 0.2,
    consequences: { regulatoryStanding: -10, operationalContinuity: -15 }, trustImpact: { regulators: 10 } },
  { id: 'lawsuit-filing', title: 'Major Lawsuit Filing', description: 'Prominent plaintiff attorney files high-profile case.', category: 'legal', severity: 'high', probability: 0.2,
    consequences: { litigationExposure: 20, stockPrice: -10 }, trustImpact: { investors: -15 } },
  { id: 'expert-vindication', title: 'Expert Panel Vindication', description: 'Independent experts find no causal link established.', category: 'medical', severity: 'low', probability: 0.1,
    conditions: (s) => s.metrics.investigationProgress > 60, consequences: { patientTrust: 15, stockPrice: 15, litigationExposure: -15 }, trustImpact: { patients: 20, physicians: 20 } },
  { id: 'patient-advocate', title: 'Patient Advocacy Support', description: 'Patient advocacy group praises transparency efforts.', category: 'media', severity: 'low', probability: 0.1,
    conditions: (s) => s.trust.patients > 65, consequences: { mediaPerception: 15, patientTrust: 10 }, trustImpact: { patients: 15, media: 10 } },
  { id: 'regulatory-guidance', title: 'Favorable Regulatory Guidance', description: 'FDA provides guidance supporting your safety monitoring approach.', category: 'regulatory', severity: 'low', probability: 0.1,
    conditions: (s) => s.trust.regulators > 65, consequences: { regulatoryStanding: 15, stockPrice: 10 }, trustImpact: { regulators: 15, investors: 10 } },
];

const STRATEGIC_FORKS: StrategicFork[] = [
  { id: 'disclosure-approach', title: 'Disclosure Philosophy', description: 'How transparent will you be throughout the crisis?', round: 2,
    paths: [
      { id: 'radical-transparency', name: 'Radical Transparency', description: 'Share all information as learned, including uncertainties', consequences: ['Maximum trust building', 'Legal exposure', 'Media scrutiny'], metricsImpact: { mediaPerception: 25, litigationExposure: 20 }, lockedPaths: ['controlled-disclosure'] },
      { id: 'controlled-disclosure', name: 'Controlled Disclosure', description: 'Strategic release of verified information only', consequences: ['Legal protection', 'Trust risk', 'Control maintenance'], metricsImpact: { litigationExposure: -15, mediaPerception: -10 }, lockedPaths: ['radical-transparency'] },
    ]
  },
  { id: 'investigation-control', title: 'Investigation Control', description: 'Who leads the investigation?', round: 3,
    paths: [
      { id: 'internal-led', name: 'Internal Investigation', description: 'Company-led investigation with internal resources', consequences: ['Control of process', 'Credibility questions', 'Cost efficiency'], metricsImpact: { investigationProgress: 20, regulatoryStanding: -10 }, lockedPaths: ['external-led'] },
      { id: 'external-led', name: 'Independent Investigation', description: 'External experts lead with company support', consequences: ['Higher credibility', 'Less control', 'Higher cost'], metricsImpact: { investigationProgress: 10, regulatoryStanding: 15 }, lockedPaths: ['internal-led'] },
    ]
  },
  { id: 'stakeholder-priority', title: 'Stakeholder Priority', description: 'Who is your primary stakeholder focus?', round: 4,
    paths: [
      { id: 'patient-first', name: 'Patient Safety First', description: 'Prioritize patient safety above business considerations', consequences: ['Ethical high ground', 'Financial impact', 'Regulatory favor'], metricsImpact: { patientTrust: 25, stockPrice: -20 }, lockedPaths: ['shareholder-balance'] },
      { id: 'shareholder-balance', name: 'Balanced Stakeholder Approach', description: 'Balance patient, shareholder, and employee interests', consequences: ['Pragmatic approach', 'Criticism from all sides', 'Sustainable path'], metricsImpact: { patientTrust: 5, stockPrice: 5 }, lockedPaths: ['patient-first'] },
    ]
  },
];

// =============================================================================
// GAME COMPONENT
// =============================================================================

export default function CruciblePage() {
  const { theme } = useTheme();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);
  const [currentDecisions, setCurrentDecisions] = useState<Record<string, string>>({});
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const initializeGame = useCallback((config: Configuration) => {
    const configData = CONFIGURATIONS[config];
    setGameState({
      configuration: config,
      currentRole: 'gm',
      round: 1,
      phase: 'intro',
      metrics: { ...configData.initialMetrics },
      trust: { ...configData.initialTrust },
      decisionHistory: [],
      activeForks: [],
      lockedPaths: [],
      triggeredEvents: [],
      currentEvent: null,
      currentFork: null,
      narrativeLog: [`Crisis initiated: ${configData.name} scenario.`],
      gameOver: false,
      endState: null,
    });
  }, []);

  const applyDecisions = useCallback(() => {
    if (!gameState) return;

    const roundDecisions = ROUND_DECISIONS[gameState.round - 1] || [];
    let newMetrics = { ...gameState.metrics };
    let newTrust = { ...gameState.trust };
    const newNarratives: string[] = [];

    roundDecisions.forEach(decision => {
      const selectedOption = decision.options.find(o => o.id === currentDecisions[decision.id]);
      if (selectedOption) {
        Object.entries(selectedOption.consequences).forEach(([key, value]) => {
          newMetrics[key as keyof GameMetrics] = (newMetrics[key as keyof GameMetrics] || 0) + (value as number);
        });
        Object.entries(selectedOption.trustImpact).forEach(([key, value]) => {
          newTrust[key as keyof StakeholderTrust] = Math.max(0, Math.min(100, (newTrust[key as keyof StakeholderTrust] || 0) + (value as number)));
        });
        newNarratives.push(selectedOption.narrative);
      }
    });

    const eligibleEvents = EVENTS.filter(e =>
      !gameState.triggeredEvents.includes(e.id) &&
      Math.random() < e.probability &&
      (!e.conditions || e.conditions(gameState))
    );

    const triggeredEvent = eligibleEvents.length > 0 ? eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)] : null;
    const fork = STRATEGIC_FORKS.find(f => f.round === gameState.round && !gameState.activeForks.includes(f.id));

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        metrics: newMetrics,
        trust: newTrust,
        narrativeLog: [...prev.narrativeLog, ...newNarratives],
        phase: triggeredEvent ? 'event' : fork ? 'fork' : 'feedback',
        currentEvent: triggeredEvent,
        currentFork: fork || null,
        triggeredEvents: triggeredEvent ? [...prev.triggeredEvents, triggeredEvent.id] : prev.triggeredEvents,
        decisionHistory: [...prev.decisionHistory, ...Object.entries(currentDecisions).map(([d, o]) => ({ round: prev.round, decision: d, option: o }))],
      };
    });
    setCurrentDecisions({});
  }, [gameState, currentDecisions]);

  const handleEventResolution = useCallback(() => {
    if (!gameState?.currentEvent) return;

    const event = gameState.currentEvent;
    let newMetrics = { ...gameState.metrics };
    let newTrust = { ...gameState.trust };

    Object.entries(event.consequences).forEach(([key, value]) => {
      newMetrics[key as keyof GameMetrics] = (newMetrics[key as keyof GameMetrics] || 0) + (value as number);
    });
    Object.entries(event.trustImpact).forEach(([key, value]) => {
      newTrust[key as keyof StakeholderTrust] = Math.max(0, Math.min(100, (newTrust[key as keyof StakeholderTrust] || 0) + (value as number)));
    });

    const fork = STRATEGIC_FORKS.find(f => f.round === gameState.round && !gameState.activeForks.includes(f.id));

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        metrics: newMetrics,
        trust: newTrust,
        currentEvent: null,
        phase: fork ? 'fork' : 'feedback',
        currentFork: fork || null,
        narrativeLog: [...prev.narrativeLog, `CRISIS EVENT: ${event.title}`],
      };
    });
  }, [gameState]);

  const handleForkChoice = useCallback((pathId: string) => {
    if (!gameState?.currentFork) return;

    const path = gameState.currentFork.paths.find(p => p.id === pathId);
    if (!path) return;

    let newMetrics = { ...gameState.metrics };
    Object.entries(path.metricsImpact).forEach(([key, value]) => {
      newMetrics[key as keyof GameMetrics] = (newMetrics[key as keyof GameMetrics] || 0) + (value as number);
    });

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        metrics: newMetrics,
        activeForks: [...prev.activeForks, prev.currentFork!.id],
        lockedPaths: [...prev.lockedPaths, ...path.lockedPaths],
        currentFork: null,
        phase: 'feedback',
        narrativeLog: [...prev.narrativeLog, `STRATEGIC CHOICE: ${path.name}`],
      };
    });
  }, [gameState]);

  const advanceRound = useCallback(() => {
    if (!gameState) return;

    // Check for catastrophic failure
    if (gameState.metrics.patientTrust <= 20 || gameState.metrics.stockPrice <= 20) {
      setGameState(prev => prev ? { ...prev, gameOver: true, endState: 'catastrophic-failure', phase: 'game-over' } : null);
      return;
    }

    if (gameState.round >= 6) {
      const score = calculateFinalScore(gameState);
      let endState = 'survival';
      if (score > 80) endState = 'trusted-leader';
      else if (score > 60) endState = 'contained-crisis';
      else if (score > 40) endState = 'controlled-exit';
      else if (score < 20) endState = 'cover-up-perception';

      setGameState(prev => prev ? { ...prev, gameOver: true, endState, phase: 'game-over' } : null);
      return;
    }

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        round: prev.round + 1,
        phase: 'sensemaking',
        currentRole: ROLES[(ROLES.findIndex(r => r.id === prev.currentRole) + 1) % ROLES.length].id,
      };
    });
  }, [gameState]);

  const calculateFinalScore = (state: GameState): number => {
    const trust = Object.values(state.trust).reduce((a, b) => a + b, 0) / 6 * 0.4;
    const metrics = ((state.metrics.patientTrust / 100) * 20) +
                   ((state.metrics.regulatoryStanding / 100) * 15) +
                   (((100 - state.metrics.litigationExposure) / 100) * 15) +
                   ((state.metrics.stockPrice / 100) * 10);
    return Math.min(100, Math.max(0, trust + metrics));
  };

  if (!gameState) {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-red-50 via-white to-orange-50' : 'bg-slate-950'}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/" className={`inline-flex items-center gap-2 mb-8 ${theme === 'light' ? 'text-red-600' : 'text-cyan-400'} hover:underline`}>
            <Home className="w-5 h-5" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${theme === 'light' ? 'bg-red-100' : 'bg-red-500/20'}`}>
              <Siren className={`w-10 h-10 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} />
            </div>
            <h1 className={`text-5xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>CRUCIBLE</h1>
            <p className={`text-2xl ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>Crisis Leadership and Organizational Resilience</p>
            <p className={`mt-4 text-lg max-w-2xl mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              You are leading Meridian Pharmaceuticals through a potential drug safety crisis. A safety signal has emerged in your best-selling drug. Navigate the crisis while protecting patients, preserving trust, and maintaining company viability.
            </p>
          </motion.div>

          <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Select Crisis Scenario</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(Object.entries(CONFIGURATIONS) as [Configuration, typeof CONFIGURATIONS[Configuration]][]).map(([key, config]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedConfig(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-2xl text-left transition-all ${
                  selectedConfig === key
                    ? theme === 'light' ? 'bg-red-100 border-2 border-red-500' : 'bg-red-500/20 border-2 border-red-500'
                    : theme === 'light' ? 'bg-white border-2 border-slate-200 hover:border-red-300' : 'bg-slate-900 border-2 border-slate-700 hover:border-red-500/50'
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.name}</h3>
                <p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{config.description}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Patient Trust</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.patientTrust}%</div>
                  </div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Stock Price</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.stockPrice}</div>
                  </div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Litigation</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.litigationExposure}%</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {selectedConfig && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
              <button
                onClick={() => initializeGame(selectedConfig)}
                className={`px-12 py-4 rounded-xl font-bold text-xl ${
                  theme === 'light'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30'
                }`}
              >
                <Play className="w-6 h-6 inline mr-2" /> Enter Crisis
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  const currentRoleInfo = ROLES.find(r => r.id === gameState.currentRole)!;
  const roundDecisions = ROUND_DECISIONS[gameState.round - 1] || [];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-red-50 via-white to-orange-50' : 'bg-slate-950'}`}>
      <header className={`sticky top-0 z-40 ${theme === 'light' ? 'bg-white/90 border-b border-red-200' : 'bg-slate-900/90 border-b border-red-800'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Siren className={`w-8 h-8 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} />
            <div>
              <h1 className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>CRUCIBLE</h1>
              <p className={`text-sm ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>Week {gameState.round} of 6</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="font-medium">Patient Trust:</span> {gameState.metrics.patientTrust}%
            </div>
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="font-medium">Litigation:</span> {gameState.metrics.litigationExposure}%
            </div>
            <button onClick={() => setShowRoleInfo(!showRoleInfo)} className={`p-2 rounded-lg ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800 hover:bg-slate-700'}`}>
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {gameState.phase === 'intro' && (
                <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg border-l-4 border-red-500' : 'bg-slate-900 border-l-4 border-red-500'}`}>
                  <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-red-700' : 'text-red-400'}`}>CRISIS ALERT: Meridian Pharmaceuticals</h2>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    A potential safety signal has emerged in Cardiozen, your $2.8B best-selling cardiovascular drug. The signal suggests increased adverse events in patients over 65 with certain comorbidities. You have 6 weeks to navigate this crisis.
                  </p>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    <strong>Scenario:</strong> {CONFIGURATIONS[gameState.configuration].name}
                  </p>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'sensemaking' } : null)} className={`px-8 py-3 rounded-xl font-bold bg-red-600 text-white`}>
                    Begin Crisis Response <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'sensemaking' && (
                <motion.div key="sensemaking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <currentRoleInfo.icon className={`w-8 h-8 text-${currentRoleInfo.color}-500`} />
                    <div>
                      <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Week {gameState.round}: Crisis Assessment</h2>
                      <p className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Perspective: {currentRoleInfo.title}</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-red-50 border border-red-200' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-red-800' : 'text-red-400'}`}>Confidential Intelligence</h3>
                    <ul className={`space-y-1 text-sm ${theme === 'light' ? 'text-red-700' : 'text-red-300'}`}>
                      {currentRoleInfo.privateInfo.map((info, i) => <li key={i}>• {info}</li>)}
                    </ul>
                  </div>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'decisions' } : null)} className={`px-8 py-3 rounded-xl font-bold bg-red-600 text-white`}>
                    Proceed to Crisis Decisions <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'decisions' && (
                <motion.div key="decisions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Week {gameState.round}: Critical Decisions</h2>
                  {roundDecisions.map(decision => (
                    <div key={decision.id} className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                      <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{decision.title}</h3>
                      <p className={`mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{decision.description}</p>
                      <div className="grid gap-3">
                        {decision.options.map(option => (
                          <button
                            key={option.id}
                            onClick={() => setCurrentDecisions(prev => ({ ...prev, [decision.id]: option.id }))}
                            className={`p-4 rounded-xl text-left transition-all ${
                              currentDecisions[decision.id] === option.id
                                ? theme === 'light' ? 'bg-red-100 border-2 border-red-500' : 'bg-red-500/20 border-2 border-red-500'
                                : theme === 'light' ? 'bg-slate-50 border-2 border-slate-200 hover:border-red-300' : 'bg-slate-800 border-2 border-slate-700 hover:border-red-500/50'
                            }`}
                          >
                            <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{option.label}</div>
                            <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{option.narrative}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {roundDecisions.every(d => currentDecisions[d.id]) && (
                    <button onClick={applyDecisions} className={`w-full px-8 py-4 rounded-xl font-bold text-lg bg-red-600 text-white`}>
                      Execute Decisions <ChevronRight className="inline w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              )}

              {gameState.phase === 'event' && gameState.currentEvent && (
                <motion.div key="event" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-red-100 border-2 border-red-400' : 'bg-red-500/20 border-2 border-red-500'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertOctagon className={`w-8 h-8 ${theme === 'light' ? 'text-red-700' : 'text-red-400'}`} />
                    <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-red-800' : 'text-red-400'}`}>CRISIS ESCALATION</h2>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentEvent.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentEvent.description}</p>
                  <button onClick={handleEventResolution} className={`px-8 py-3 rounded-xl font-bold bg-red-700 text-white`}>
                    Respond to Crisis <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'fork' && gameState.currentFork && (
                <motion.div key="fork" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-amber-50 border-2 border-amber-300' : 'bg-amber-500/10 border-2 border-amber-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className={`w-8 h-8 ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`} />
                    <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-amber-800' : 'text-amber-400'}`}>DEFINING MOMENT</h2>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentFork.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentFork.description}</p>
                  <div className="grid gap-4">
                    {gameState.currentFork.paths.filter(p => !gameState.lockedPaths.includes(p.id)).map(path => (
                      <button key={path.id} onClick={() => handleForkChoice(path.id)}
                        className={`p-6 rounded-xl text-left transition-all ${theme === 'light' ? 'bg-white hover:bg-amber-50 border-2 border-amber-200' : 'bg-slate-900 hover:bg-amber-500/10 border-2 border-amber-500/30'}`}>
                        <h4 className={`text-lg font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{path.name}</h4>
                        <p className={`text-sm mb-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{path.description}</p>
                        <div className={`text-xs ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>{path.consequences.join(' • ')}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {gameState.phase === 'feedback' && (
                <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Week {gameState.round} Summary</h2>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                    <ul className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      {gameState.narrativeLog.slice(-5).map((log, i) => <li key={i}>• {log}</li>)}
                    </ul>
                  </div>
                  <button onClick={advanceRound} className={`px-8 py-3 rounded-xl font-bold bg-red-600 text-white`}>
                    {gameState.round >= 6 ? 'View Crisis Resolution' : `Continue to Week ${gameState.round + 1}`} <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'game-over' && (
                <motion.div key="gameover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-xl' : 'bg-slate-900'}`}>
                  <h2 className={`text-3xl font-bold mb-6 text-center ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {gameState.endState === 'trusted-leader' ? 'EXEMPLARY: Trusted Leader' :
                     gameState.endState === 'contained-crisis' ? 'SUCCESS: Crisis Contained' :
                     gameState.endState === 'controlled-exit' ? 'ACCEPTABLE: Controlled Exit' :
                     gameState.endState === 'cover-up-perception' ? 'FAILURE: Cover-up Perception' :
                     gameState.endState === 'catastrophic-failure' ? 'CATASTROPHIC FAILURE' : 'Crisis Resolved'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                      <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Final Metrics</h3>
                      <div className="space-y-1 text-sm">
                        <div>Patient Trust: {gameState.metrics.patientTrust}%</div>
                        <div>Regulatory Standing: {gameState.metrics.regulatoryStanding}%</div>
                        <div>Stock Price: {gameState.metrics.stockPrice}</div>
                        <div>Litigation Exposure: {gameState.metrics.litigationExposure}%</div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                      <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Stakeholder Trust</h3>
                      <div className="space-y-1 text-sm">
                        {Object.entries(gameState.trust).map(([k, v]) => <div key={k}>{k}: {v}%</div>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setGameState(null)} className={`px-6 py-3 rounded-xl font-bold bg-red-600 text-white`}>
                      <RotateCcw className="inline w-5 h-5 mr-2" /> Play Again
                    </button>
                    <Link href="/" className={`px-6 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'}`}>
                      <Home className="inline w-5 h-5 mr-2" /> Return Home
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Crisis Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: 'Patient Trust', value: gameState.metrics.patientTrust, color: 'emerald' },
                  { label: 'Regulatory Standing', value: gameState.metrics.regulatoryStanding, color: 'blue' },
                  { label: 'Media Perception', value: gameState.metrics.mediaPerception, color: 'violet' },
                  { label: 'Litigation Exposure', value: gameState.metrics.litigationExposure, color: 'red', inverse: true },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{metric.label}</span>
                      <span className={theme === 'light' ? 'text-slate-800' : 'text-white'}>{metric.value}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
                      <div className={`h-full rounded-full bg-${metric.color}-500`} style={{ width: `${Math.min(100, metric.value)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Stakeholder Trust</h3>
              <div className="space-y-3">
                {Object.entries(gameState.trust).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`capitalize ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{key}</span>
                      <span className={value >= 60 ? 'text-green-500' : value >= 40 ? 'text-amber-500' : 'text-red-500'}>{value}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
                      <div className={`h-full rounded-full ${value >= 60 ? 'bg-green-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showRoleInfo && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-red-50 border border-red-200' : 'bg-red-500/10 border border-red-500/30'}`}>
                <h3 className={`font-bold mb-3 ${theme === 'light' ? 'text-red-800' : 'text-red-400'}`}>{currentRoleInfo.title}</h3>
                <div className={`text-sm space-y-2 ${theme === 'light' ? 'text-red-700' : 'text-red-300'}`}>
                  <div><strong>Metrics:</strong> {currentRoleInfo.metrics.join(', ')}</div>
                  <div><strong>Conflicts:</strong> {currentRoleInfo.conflicts.join(', ')}</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
