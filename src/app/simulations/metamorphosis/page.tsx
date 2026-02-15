'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Users, DollarSign, Building2, ChevronRight, Target, Scale, Play,
  RotateCcw, Eye, Home, RefreshCw, Shuffle, Compass, Sparkles, Layers, Leaf,
  Mountain, Sunrise, Footprints, Wind, Milestone, ArrowUpCircle, Flame,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// TYPES
// =============================================================================

type Configuration = 'burning-platform' | 'proactive-reinvention' | 'merger-integration' | 'digital-disruption';
type Role = 'gm' | 'strategy' | 'hr' | 'operations' | 'finance' | 'technology' | 'culture';
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
  transformationProgress: number;
  culturalAlignment: number;
  operationalEfficiency: number;
  employeeEngagement: number;
  customerSatisfaction: number;
  financialHealth: number;
  innovationCapability: number;
  changeCapacity: number;
}

interface StakeholderTrust {
  employees: number;
  leadership: number;
  board: number;
  customers: number;
  unions: number;
  investors: number;
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
  category: 'resistance' | 'opportunity' | 'crisis' | 'milestone' | 'external';
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
  'burning-platform': {
    name: 'Burning Platform',
    description: 'Legacy business model collapsing. Urgent transformation required. 3-year runway to reinvent or face irrelevance. Organizational resistance high.',
    initialMetrics: { transformationProgress: 10, culturalAlignment: 35, operationalEfficiency: 55, employeeEngagement: 45, customerSatisfaction: 50, financialHealth: 40, innovationCapability: 30, changeCapacity: 40 },
    initialTrust: { employees: 45, leadership: 55, board: 60, customers: 50, unions: 40, investors: 45 },
  },
  'proactive-reinvention': {
    name: 'Proactive Reinvention',
    description: 'Strong position today but industry shifting. Opportunity to transform from strength. Complacency is the primary obstacle.',
    initialMetrics: { transformationProgress: 15, culturalAlignment: 60, operationalEfficiency: 75, employeeEngagement: 70, customerSatisfaction: 72, financialHealth: 70, innovationCapability: 45, changeCapacity: 55 },
    initialTrust: { employees: 70, leadership: 65, board: 70, customers: 72, unions: 60, investors: 68 },
  },
  'merger-integration': {
    name: 'Post-Merger Integration',
    description: 'Two distinct cultures must become one. Competing systems, processes, and power structures. Integration consuming leadership attention.',
    initialMetrics: { transformationProgress: 20, culturalAlignment: 30, operationalEfficiency: 50, employeeEngagement: 40, customerSatisfaction: 55, financialHealth: 60, innovationCapability: 40, changeCapacity: 45 },
    initialTrust: { employees: 35, leadership: 45, board: 55, customers: 55, unions: 35, investors: 55 },
  },
  'digital-disruption': {
    name: 'Digital Transformation',
    description: 'Traditional operations must digitize. Technology enabling new business models. Workforce skills gap widening. Customer expectations changing.',
    initialMetrics: { transformationProgress: 25, culturalAlignment: 50, operationalEfficiency: 60, employeeEngagement: 55, customerSatisfaction: 58, financialHealth: 55, innovationCapability: 35, changeCapacity: 50 },
    initialTrust: { employees: 50, leadership: 55, board: 60, customers: 55, unions: 45, investors: 60 },
  },
};

const ROLES: RoleInfo[] = [
  { id: 'gm', name: 'CEO', title: 'Chief Executive Officer', icon: Building2, color: 'slate',
    privateInfo: ['Board patience limited to 18 months', 'Key competitor transformation succeeding', 'Personal credibility tied to transformation success'],
    metrics: ['Transformation progress', 'Stakeholder alignment', 'Strategic execution'], conflicts: ['All functions resist change differently'] },
  { id: 'strategy', name: 'Strategy', title: 'Chief Strategy Officer', icon: Compass, color: 'violet',
    privateInfo: ['Industry disruption accelerating faster than projected', 'Strategic partnerships being explored by competitors', 'New market entry window closing in 24 months'],
    metrics: ['Strategic clarity', 'Market positioning', 'Competitive differentiation'], conflicts: ['Operations (pace of change)', 'Finance (investment levels)'] },
  { id: 'hr', name: 'HR', title: 'Chief Human Resources Officer', icon: Users, color: 'emerald',
    privateInfo: ['30% of workforce at risk of skill obsolescence', 'Top talent receiving external offers', 'Union contract negotiations in 6 months'],
    metrics: ['Employee engagement', 'Talent retention', 'Skills development'], conflicts: ['Operations (workforce changes)', 'Finance (training costs)'] },
  { id: 'operations', name: 'Operations', title: 'Chief Operating Officer', icon: Layers, color: 'amber',
    privateInfo: ['Legacy systems creating 40% productivity drag', 'Process changes threatening quality', 'Middle management resisting new operating model'],
    metrics: ['Operational efficiency', 'Process reliability', 'Execution capability'], conflicts: ['Strategy (change pace)', 'Technology (system transitions)'] },
  { id: 'finance', name: 'Finance', title: 'Chief Financial Officer', icon: DollarSign, color: 'cyan',
    privateInfo: ['Transformation costs exceeding projections by 35%', 'Revenue at risk during transition period', 'Investment community skeptical of timeline'],
    metrics: ['Financial health', 'ROI on transformation', 'Cost management'], conflicts: ['All functions want transformation investment'] },
  { id: 'technology', name: 'Technology', title: 'Chief Technology Officer', icon: Sparkles, color: 'blue',
    privateInfo: ['Technical debt higher than disclosed', 'Key systems cannot support new business model', 'Build vs buy decision creating paralysis'],
    metrics: ['Technology modernization', 'Digital capability', 'System reliability'], conflicts: ['Operations (transition timing)', 'Finance (investment)'] },
  { id: 'culture', name: 'Culture', title: 'Chief Culture Officer', icon: Flame, color: 'rose',
    privateInfo: ['Cultural resistance stronger at middle management', 'Values disconnect between departments', 'Previous change initiatives created cynicism'],
    metrics: ['Cultural alignment', 'Change readiness', 'Behavioral change'], conflicts: ['Speed vs. sustainable change in all functions'] },
];

const ROUND_DECISIONS: Decision[][] = [
  // Year 1, Quarter 1: Vision and Burning Platform
  [
    { id: 'r1-vision', title: 'Transformation Vision', description: 'How do you communicate the need for transformation?', role: 'gm',
      options: [
        { id: 'burning-platform', label: 'Burning Platform Narrative', shortLabel: 'Urgent', consequences: { changeCapacity: 15, employeeEngagement: -10 }, trustImpact: { employees: -15, board: 15, investors: 10 }, narrative: 'You paint stark picture of existential threat requiring immediate action.' },
        { id: 'opportunity', label: 'Opportunity Narrative', shortLabel: 'Opportunity', consequences: { changeCapacity: 10, employeeEngagement: 5 }, trustImpact: { employees: 10, board: 5 }, narrative: 'You frame transformation as exciting opportunity for growth.' },
        { id: 'balanced', label: 'Balanced Reality', shortLabel: 'Balanced', consequences: { changeCapacity: 12, culturalAlignment: 5 }, trustImpact: { employees: 5, leadership: 10 }, narrative: 'You present honest assessment of challenges and opportunities.' },
      ]
    },
    { id: 'r1-pace', title: 'Transformation Pace', description: 'How fast should the transformation proceed?', role: 'strategy',
      options: [
        { id: 'aggressive', label: 'Aggressive 18-Month Plan', shortLabel: 'Aggressive', consequences: { transformationProgress: 15, changeCapacity: -15, operationalEfficiency: -10 }, trustImpact: { board: 15, employees: -20, unions: -25 }, narrative: 'You commit to rapid transformation with aggressive milestones.' },
        { id: 'measured', label: 'Measured 3-Year Journey', shortLabel: 'Measured', consequences: { transformationProgress: 8, culturalAlignment: 10 }, trustImpact: { employees: 10, unions: 10 }, narrative: 'You design phased approach with sustainable pace.' },
        { id: 'adaptive', label: 'Adaptive Approach', shortLabel: 'Adaptive', consequences: { transformationProgress: 10, changeCapacity: 5 }, trustImpact: { leadership: 10 }, narrative: 'You build flexibility to adjust pace based on progress.' },
      ]
    },
  ],
  // Year 1, Quarter 2: People and Structure
  [
    { id: 'r2-leadership', title: 'Leadership Changes', description: 'The transformation requires leadership capability. How do you approach the leadership team?', role: 'hr',
      options: [
        { id: 'upgrade', label: 'External Leadership Upgrade', shortLabel: 'External', consequences: { innovationCapability: 20, culturalAlignment: -15, employeeEngagement: -10 }, trustImpact: { leadership: -25, employees: -15, board: 15 }, narrative: 'You bring in external leaders with transformation experience.' },
        { id: 'develop', label: 'Develop Existing Leaders', shortLabel: 'Develop', consequences: { innovationCapability: 10, changeCapacity: 10, culturalAlignment: 10 }, trustImpact: { leadership: 15, employees: 10 }, narrative: 'You invest in developing current leadership capabilities.' },
        { id: 'hybrid', label: 'Strategic External + Development', shortLabel: 'Hybrid', consequences: { innovationCapability: 15, culturalAlignment: -5 }, trustImpact: { leadership: -5, employees: 5, board: 10 }, narrative: 'You bring targeted external hires while developing internal talent.' },
      ]
    },
  ],
  // Year 1, Quarter 3: Operating Model
  [
    { id: 'r3-operating-model', title: 'Operating Model Redesign', description: 'Current operating model cannot deliver new strategy. How do you redesign?', role: 'operations',
      options: [
        { id: 'revolutionary', label: 'Clean Sheet Redesign', shortLabel: 'Revolutionary', consequences: { operationalEfficiency: -20, transformationProgress: 20, innovationCapability: 15 }, trustImpact: { employees: -25, unions: -30, board: 10 }, narrative: 'You redesign operating model from scratch.' },
        { id: 'evolutionary', label: 'Evolutionary Optimization', shortLabel: 'Evolutionary', consequences: { operationalEfficiency: 10, transformationProgress: 8 }, trustImpact: { employees: 10, unions: 10 }, narrative: 'You optimize current model while introducing changes gradually.' },
        { id: 'pilot', label: 'Pilot Then Scale', shortLabel: 'Pilot', consequences: { operationalEfficiency: 5, transformationProgress: 12, changeCapacity: 10 }, trustImpact: { employees: 5, leadership: 10 }, narrative: 'You pilot new model in one unit before scaling.' },
      ]
    },
  ],
  // Year 1, Quarter 4: Technology Foundation
  [
    { id: 'r4-technology', title: 'Technology Transformation', description: 'Legacy systems constraining transformation. What approach?', role: 'technology',
      options: [
        { id: 'replace', label: 'Full Platform Replacement', shortLabel: 'Replace', consequences: { operationalEfficiency: -15, innovationCapability: 25, financialHealth: -20 }, trustImpact: { employees: -10, investors: -15 }, narrative: 'You commit to replacing core systems with modern platform.' },
        { id: 'modernize', label: 'Incremental Modernization', shortLabel: 'Modernize', consequences: { operationalEfficiency: 5, innovationCapability: 15 }, trustImpact: { employees: 5 }, narrative: 'You modernize systems incrementally while maintaining operations.' },
        { id: 'wrap', label: 'Wrap and Extend', shortLabel: 'Wrap', consequences: { innovationCapability: 10, financialHealth: 5 }, trustImpact: { investors: 10 }, narrative: 'You build modern layer around legacy systems.' },
      ]
    },
    { id: 'r4-workforce', title: 'Workforce Transformation', description: 'Skills gap widening. How do you address workforce capabilities?', role: 'hr',
      options: [
        { id: 'reskill', label: 'Massive Reskilling Investment', shortLabel: 'Reskill', consequences: { financialHealth: -15, employeeEngagement: 20, changeCapacity: 15 }, trustImpact: { employees: 25, unions: 20 }, narrative: 'You invest heavily in reskilling existing workforce.' },
        { id: 'replace', label: 'Strategic Workforce Reshaping', shortLabel: 'Reshape', consequences: { innovationCapability: 15, employeeEngagement: -25, changeCapacity: -10 }, trustImpact: { employees: -30, unions: -35, board: 10 }, narrative: 'You reshape workforce through attrition and new hiring.' },
        { id: 'hybrid-workforce', label: 'Hybrid Approach', shortLabel: 'Hybrid', consequences: { financialHealth: -10, employeeEngagement: 5, innovationCapability: 10 }, trustImpact: { employees: 5, unions: 5 }, narrative: 'You balance reskilling with targeted new talent acquisition.' },
      ]
    },
  ],
  // Year 2, Quarter 1: Culture Shift
  [
    { id: 'r5-culture', title: 'Culture Transformation', description: 'Cultural resistance emerging as primary barrier. How do you address?', role: 'culture',
      options: [
        { id: 'top-down', label: 'Leadership-Driven Change', shortLabel: 'Top-Down', consequences: { culturalAlignment: 15, employeeEngagement: -10 }, trustImpact: { leadership: 15, employees: -15 }, narrative: 'You drive culture change through leadership behavior modeling.' },
        { id: 'grassroots', label: 'Grassroots Movement', shortLabel: 'Grassroots', consequences: { culturalAlignment: 10, employeeEngagement: 15, transformationProgress: -5 }, trustImpact: { employees: 20, board: -10 }, narrative: 'You empower change champions throughout organization.' },
        { id: 'structural', label: 'Structure Drives Culture', shortLabel: 'Structure', consequences: { culturalAlignment: 20, operationalEfficiency: -10 }, trustImpact: { employees: -5 }, narrative: 'You change incentives, metrics, and processes to drive behavior.' },
      ]
    },
  ],
  // Year 2, Quarter 2: Customer Experience
  [
    { id: 'r6-customer', title: 'Customer Experience Transformation', description: 'Customer expectations changing faster than delivery capability.', role: 'strategy',
      options: [
        { id: 'digital-first', label: 'Digital-First Experience', shortLabel: 'Digital', consequences: { customerSatisfaction: 20, operationalEfficiency: -10, innovationCapability: 15 }, trustImpact: { customers: 25, employees: -10 }, narrative: 'You prioritize digital customer experience transformation.' },
        { id: 'human-digital', label: 'Human + Digital Blend', shortLabel: 'Blend', consequences: { customerSatisfaction: 15, employeeEngagement: 10 }, trustImpact: { customers: 15, employees: 10 }, narrative: 'You create integrated human-digital experience.' },
        { id: 'segment', label: 'Segmented Approach', shortLabel: 'Segment', consequences: { customerSatisfaction: 12, operationalEfficiency: 5 }, trustImpact: { customers: 10 }, narrative: 'You differentiate experience by customer segment needs.' },
      ]
    },
  ],
  // Year 2, Quarter 3: Financial Sustainability
  [
    { id: 'r7-financial', title: 'Transformation Funding', description: 'Transformation costs exceeding budget. How do you maintain momentum?', role: 'finance',
      options: [
        { id: 'invest-through', label: 'Invest Through the Valley', shortLabel: 'Invest', consequences: { financialHealth: -20, transformationProgress: 20, innovationCapability: 15 }, trustImpact: { investors: -15, board: -10 }, narrative: 'You maintain investment despite short-term financial impact.' },
        { id: 'self-fund', label: 'Self-Funding Through Efficiency', shortLabel: 'Self-Fund', consequences: { operationalEfficiency: 15, transformationProgress: 10, employeeEngagement: -10 }, trustImpact: { employees: -15, investors: 10 }, narrative: 'You fund transformation through operational improvements.' },
        { id: 'staged', label: 'Staged Investment with Gates', shortLabel: 'Staged', consequences: { financialHealth: -10, transformationProgress: 12 }, trustImpact: { board: 10, investors: 10 }, narrative: 'You implement funding gates tied to transformation milestones.' },
      ]
    },
  ],
  // Year 2, Quarter 4: Resistance Management
  [
    { id: 'r8-resistance', title: 'Resistance Breaking Point', description: 'Middle management resistance crystallizing. Union concerns escalating.', role: 'gm',
      options: [
        { id: 'confront', label: 'Direct Confrontation', shortLabel: 'Confront', consequences: { transformationProgress: 15, employeeEngagement: -20, culturalAlignment: -10 }, trustImpact: { employees: -25, unions: -30, leadership: 10 }, narrative: 'You directly address resistance with clear consequences.' },
        { id: 'co-opt', label: 'Co-opt Resisters', shortLabel: 'Co-opt', consequences: { transformationProgress: 8, culturalAlignment: 15, changeCapacity: 10 }, trustImpact: { employees: 15, unions: 10 }, narrative: 'You bring resisters into transformation design.' },
        { id: 'bypass', label: 'Work Around Resistance', shortLabel: 'Bypass', consequences: { transformationProgress: 12, culturalAlignment: -5 }, trustImpact: { leadership: -10 }, narrative: 'You create parallel structures bypassing resistant groups.' },
      ]
    },
  ],
  // Year 3, Quarter 1: Consolidation
  [
    { id: 'r9-consolidation', title: 'Transformation Consolidation', description: 'Gains at risk of erosion. How do you embed changes?', role: 'operations',
      options: [
        { id: 'institutionalize', label: 'Institutionalize Changes', shortLabel: 'Institutionalize', consequences: { culturalAlignment: 20, transformationProgress: 10, changeCapacity: -10 }, trustImpact: { employees: 10, leadership: 15 }, narrative: 'You formalize new ways of working into systems and processes.' },
        { id: 'accelerate', label: 'Accelerate to Next Phase', shortLabel: 'Accelerate', consequences: { transformationProgress: 20, changeCapacity: -15, employeeEngagement: -10 }, trustImpact: { employees: -15, board: 15 }, narrative: 'You push forward to next transformation phase.' },
        { id: 'stabilize', label: 'Stabilize Before Advancing', shortLabel: 'Stabilize', consequences: { operationalEfficiency: 15, culturalAlignment: 10 }, trustImpact: { employees: 15, unions: 15 }, narrative: 'You pause to stabilize gains before continuing.' },
      ]
    },
  ],
  // Year 3, Quarter 2: Endgame
  [
    { id: 'r10-endgame', title: 'Transformation Endgame', description: 'Final phase of transformation. How do you position the organization?', role: 'gm',
      options: [
        { id: 'continuous', label: 'Continuous Transformation', shortLabel: 'Continuous', consequences: { changeCapacity: 25, innovationCapability: 20, employeeEngagement: -5 }, trustImpact: { board: 15, employees: -10 }, narrative: 'You position transformation as ongoing capability, not project.' },
        { id: 'declare-victory', label: 'Declare Victory and Stabilize', shortLabel: 'Victory', consequences: { employeeEngagement: 20, culturalAlignment: 15, changeCapacity: -15 }, trustImpact: { employees: 25, unions: 20, board: 5 }, narrative: 'You celebrate success and allow organization to stabilize.' },
        { id: 'next-horizon', label: 'Launch Next Horizon', shortLabel: 'Next', consequences: { transformationProgress: 20, innovationCapability: 25, employeeEngagement: -15 }, trustImpact: { board: 20, investors: 15, employees: -20 }, narrative: 'You immediately launch next phase of transformation.' },
      ]
    },
  ],
];

const EVENTS: GameEvent[] = [
  { id: 'key-departure', title: 'Key Leader Departure', description: 'Transformation champion announces departure for competitor.', category: 'crisis', severity: 'high', probability: 0.15,
    conditions: (s) => s.trust.leadership < 50, consequences: { changeCapacity: -15, transformationProgress: -10 }, trustImpact: { leadership: -20, employees: -15 } },
  { id: 'union-action', title: 'Union Action Threat', description: 'Union announces potential action over transformation impact on jobs.', category: 'resistance', severity: 'high', probability: 0.2,
    conditions: (s) => s.trust.unions < 40, consequences: { operationalEfficiency: -10, transformationProgress: -10 }, trustImpact: { unions: -20, employees: -10 } },
  { id: 'competitor-success', title: 'Competitor Transformation Success', description: 'Key competitor announces successful transformation completion.', category: 'external', severity: 'medium', probability: 0.15,
    consequences: { changeCapacity: 10, transformationProgress: -5 }, trustImpact: { board: -15, investors: -10 } },
  { id: 'quick-win', title: 'Unexpected Quick Win', description: 'Early transformation initiative delivers unexpected positive results.', category: 'milestone', severity: 'low', probability: 0.2,
    consequences: { transformationProgress: 10, employeeEngagement: 10 }, trustImpact: { employees: 15, leadership: 10, board: 10 } },
  { id: 'customer-defection', title: 'Major Customer Defection', description: 'Top 10 customer announces switch to competitor during transition.', category: 'crisis', severity: 'high', probability: 0.15,
    conditions: (s) => s.metrics.customerSatisfaction < 55, consequences: { financialHealth: -15, customerSatisfaction: -10 }, trustImpact: { board: -15, investors: -15 } },
  { id: 'technology-failure', title: 'Technology Initiative Failure', description: 'Major technology transformation initiative fails milestone.', category: 'crisis', severity: 'high', probability: 0.15,
    conditions: (s) => s.metrics.innovationCapability < 40, consequences: { transformationProgress: -15, innovationCapability: -10 }, trustImpact: { board: -15, leadership: -10 } },
  { id: 'cultural-breakthrough', title: 'Cultural Breakthrough', description: 'Grassroots movement signals genuine cultural shift taking hold.', category: 'milestone', severity: 'low', probability: 0.15,
    conditions: (s) => s.trust.employees > 60, consequences: { culturalAlignment: 15, changeCapacity: 10 }, trustImpact: { employees: 15 } },
  { id: 'board-pressure', title: 'Board Impatience', description: 'Board expresses concern about transformation pace and cost.', category: 'external', severity: 'medium', probability: 0.2,
    conditions: (s) => s.metrics.financialHealth < 50, consequences: { changeCapacity: -10 }, trustImpact: { board: -20 } },
  { id: 'talent-influx', title: 'Transformation Talent Influx', description: 'High-profile talent joins attracted by transformation vision.', category: 'opportunity', severity: 'low', probability: 0.15,
    conditions: (s) => s.metrics.transformationProgress > 40, consequences: { innovationCapability: 15, changeCapacity: 10 }, trustImpact: { leadership: 15 } },
  { id: 'regulatory-change', title: 'Regulatory Environment Shift', description: 'New regulations accelerate need for transformation.', category: 'external', severity: 'medium', probability: 0.1,
    consequences: { changeCapacity: 15, transformationProgress: 5 }, trustImpact: { board: 10 } },
  { id: 'market-downturn', title: 'Market Downturn', description: 'Economic conditions deteriorate, pressuring transformation investment.', category: 'external', severity: 'high', probability: 0.15,
    consequences: { financialHealth: -15, transformationProgress: -10 }, trustImpact: { investors: -15, board: -10 } },
  { id: 'change-fatigue', title: 'Change Fatigue Epidemic', description: 'Organization showing signs of severe change fatigue.', category: 'resistance', severity: 'high', probability: 0.2,
    conditions: (s) => s.metrics.changeCapacity < 35, consequences: { employeeEngagement: -20, transformationProgress: -15 }, trustImpact: { employees: -25 } },
  { id: 'innovation-success', title: 'Innovation Breakthrough', description: 'New capability creates unexpected competitive advantage.', category: 'milestone', severity: 'low', probability: 0.1,
    conditions: (s) => s.metrics.innovationCapability > 50, consequences: { customerSatisfaction: 15, financialHealth: 10 }, trustImpact: { customers: 15, investors: 15 } },
  { id: 'middle-management-revolt', title: 'Middle Management Revolt', description: 'Collective resistance from middle management threatens initiative.', category: 'resistance', severity: 'critical', probability: 0.1,
    conditions: (s) => s.trust.leadership < 40 && s.trust.employees < 40, consequences: { transformationProgress: -20, culturalAlignment: -15 }, trustImpact: { leadership: -30, employees: -20 } },
];

const STRATEGIC_FORKS: StrategicFork[] = [
  { id: 'transformation-approach', title: 'Transformation Philosophy', description: 'What is the fundamental approach to transformation?', round: 2,
    paths: [
      { id: 'revolutionary', name: 'Revolutionary Change', description: 'Rapid, comprehensive transformation across all dimensions', consequences: ['Fast results', 'High risk', 'Organizational stress'], metricsImpact: { transformationProgress: 25, changeCapacity: -20, employeeEngagement: -15 }, lockedPaths: ['evolutionary'] },
      { id: 'evolutionary', name: 'Evolutionary Change', description: 'Gradual, sustainable transformation with deep embedding', consequences: ['Sustainable change', 'Slower progress', 'Lower risk'], metricsImpact: { transformationProgress: 10, culturalAlignment: 20, changeCapacity: 15 }, lockedPaths: ['revolutionary'] },
    ]
  },
  { id: 'people-vs-process', title: 'People vs Process Priority', description: 'What drives transformation success?', round: 4,
    paths: [
      { id: 'people-first', name: 'People First', description: 'Invest primarily in people development and engagement', consequences: ['Strong culture', 'Slower execution', 'Sustainable change'], metricsImpact: { employeeEngagement: 25, culturalAlignment: 20, operationalEfficiency: -10 }, lockedPaths: ['process-first'] },
      { id: 'process-first', name: 'Process First', description: 'Focus on systems, processes, and structure changes', consequences: ['Fast execution', 'Culture risk', 'Clear metrics'], metricsImpact: { operationalEfficiency: 25, transformationProgress: 15, culturalAlignment: -15 }, lockedPaths: ['people-first'] },
    ]
  },
  { id: 'transformation-legacy', title: 'Transformation Legacy', description: 'How will transformation capability be sustained?', round: 8,
    paths: [
      { id: 'embedded', name: 'Embedded Capability', description: 'Build transformation as ongoing organizational capability', consequences: ['Continuous improvement', 'Permanent change function', 'Higher cost'], metricsImpact: { changeCapacity: 30, innovationCapability: 20 }, lockedPaths: ['project-end'] },
      { id: 'project-end', name: 'Project Conclusion', description: 'Conclude transformation and return to business as usual', consequences: ['Clear endpoint', 'Reduced overhead', 'Sustainability risk'], metricsImpact: { employeeEngagement: 20, operationalEfficiency: 15, changeCapacity: -20 }, lockedPaths: ['embedded'] },
    ]
  },
];

// =============================================================================
// GAME COMPONENT
// =============================================================================

export default function MetamorphosisPage() {
  const { theme } = useTheme();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);
  const [currentDecisions, setCurrentDecisions] = useState<Record<string, string>>({});
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const initializeGame = useCallback((config: Configuration) => {
    const configData = CONFIGURATIONS[config];
    setGameState({
      configuration: config, currentRole: 'gm', round: 1, phase: 'intro',
      metrics: { ...configData.initialMetrics }, trust: { ...configData.initialTrust },
      decisionHistory: [], activeForks: [], lockedPaths: [], triggeredEvents: [],
      currentEvent: null, currentFork: null, narrativeLog: [`Transformation initiated: ${configData.name}`],
      gameOver: false, endState: null,
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
        Object.entries(selectedOption.consequences).forEach(([key, value]) => { newMetrics[key as keyof GameMetrics] = (newMetrics[key as keyof GameMetrics] || 0) + (value as number); });
        Object.entries(selectedOption.trustImpact).forEach(([key, value]) => { newTrust[key as keyof StakeholderTrust] = Math.max(0, Math.min(100, (newTrust[key as keyof StakeholderTrust] || 0) + (value as number))); });
        newNarratives.push(selectedOption.narrative);
      }
    });

    const eligibleEvents = EVENTS.filter(e => !gameState.triggeredEvents.includes(e.id) && Math.random() < e.probability && (!e.conditions || e.conditions(gameState)));
    const triggeredEvent = eligibleEvents.length > 0 ? eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)] : null;
    const fork = STRATEGIC_FORKS.find(f => f.round === gameState.round && !gameState.activeForks.includes(f.id));

    setGameState(prev => prev ? { ...prev, metrics: newMetrics, trust: newTrust, narrativeLog: [...prev.narrativeLog, ...newNarratives], phase: triggeredEvent ? 'event' : fork ? 'fork' : 'feedback', currentEvent: triggeredEvent, currentFork: fork || null, triggeredEvents: triggeredEvent ? [...prev.triggeredEvents, triggeredEvent.id] : prev.triggeredEvents, decisionHistory: [...prev.decisionHistory, ...Object.entries(currentDecisions).map(([d, o]) => ({ round: prev.round, decision: d, option: o }))] } : null);
    setCurrentDecisions({});
  }, [gameState, currentDecisions]);

  const handleEventResolution = useCallback(() => {
    if (!gameState?.currentEvent) return;
    const event = gameState.currentEvent;
    let newMetrics = { ...gameState.metrics };
    let newTrust = { ...gameState.trust };
    Object.entries(event.consequences).forEach(([key, value]) => { newMetrics[key as keyof GameMetrics] = (newMetrics[key as keyof GameMetrics] || 0) + (value as number); });
    Object.entries(event.trustImpact).forEach(([key, value]) => { newTrust[key as keyof StakeholderTrust] = Math.max(0, Math.min(100, (newTrust[key as keyof StakeholderTrust] || 0) + (value as number))); });
    const fork = STRATEGIC_FORKS.find(f => f.round === gameState.round && !gameState.activeForks.includes(f.id));
    setGameState(prev => prev ? { ...prev, metrics: newMetrics, trust: newTrust, currentEvent: null, phase: fork ? 'fork' : 'feedback', currentFork: fork || null, narrativeLog: [...prev.narrativeLog, `EVENT: ${event.title}`] } : null);
  }, [gameState]);

  const handleForkChoice = useCallback((pathId: string) => {
    if (!gameState?.currentFork) return;
    const path = gameState.currentFork.paths.find(p => p.id === pathId);
    if (!path) return;
    let newMetrics = { ...gameState.metrics };
    Object.entries(path.metricsImpact).forEach(([key, value]) => { newMetrics[key as keyof GameMetrics] = (newMetrics[key as keyof GameMetrics] || 0) + (value as number); });
    setGameState(prev => prev ? { ...prev, metrics: newMetrics, activeForks: [...prev.activeForks, prev.currentFork!.id], lockedPaths: [...prev.lockedPaths, ...path.lockedPaths], currentFork: null, phase: 'feedback', narrativeLog: [...prev.narrativeLog, `STRATEGIC FORK: ${path.name}`] } : null);
  }, [gameState]);

  const advanceRound = useCallback(() => {
    if (!gameState) return;
    if (gameState.metrics.employeeEngagement <= 15 || gameState.metrics.financialHealth <= 15) {
      setGameState(prev => prev ? { ...prev, gameOver: true, endState: 'transformation-collapse', phase: 'game-over' } : null);
      return;
    }
    if (gameState.round >= 10) {
      const score = calculateFinalScore(gameState);
      let endState = 'partial-transformation';
      if (score > 80) endState = 'transformed-leader';
      else if (score > 60) endState = 'successful-transition';
      else if (score > 40) endState = 'partial-transformation';
      else if (score < 20) endState = 'transformation-theater';
      setGameState(prev => prev ? { ...prev, gameOver: true, endState, phase: 'game-over' } : null);
      return;
    }
    setGameState(prev => prev ? { ...prev, round: prev.round + 1, phase: 'sensemaking', currentRole: ROLES[(ROLES.findIndex(r => r.id === prev.currentRole) + 1) % ROLES.length].id } : null);
  }, [gameState]);

  const calculateFinalScore = (state: GameState): number => {
    const transformation = ((state.metrics.transformationProgress / 100) * 25) + ((state.metrics.culturalAlignment / 100) * 15);
    const operational = ((state.metrics.operationalEfficiency / 100) * 15) + ((state.metrics.innovationCapability / 100) * 10);
    const people = ((state.metrics.employeeEngagement / 100) * 15) + ((state.metrics.changeCapacity / 100) * 10);
    const stakeholders = Object.values(state.trust).reduce((a, b) => a + b, 0) / 6 * 0.1;
    return Math.min(100, Math.max(0, transformation + operational + people + stakeholders));
  };

  if (!gameState) {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50' : 'bg-slate-950'}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/" className={`inline-flex items-center gap-2 mb-8 ${theme === 'light' ? 'text-emerald-600' : 'text-cyan-400'} hover:underline`}><Home className="w-5 h-5" /> Back to Home</Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${theme === 'light' ? 'bg-emerald-100' : 'bg-emerald-500/20'}`}>
              <RefreshCw className={`w-10 h-10 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            </div>
            <h1 className={`text-5xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>METAMORPHOSIS</h1>
            <p className={`text-2xl ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>Long-term Transformation and Cultural Change</p>
            <p className={`mt-4 text-lg max-w-2xl mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              Lead Atlas Industries through a 3-year transformation journey. Balance the urgency of change with organizational capacity, navigate resistance, and build lasting change capability.
            </p>
          </motion.div>
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Select Transformation Scenario</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(Object.entries(CONFIGURATIONS) as [Configuration, typeof CONFIGURATIONS[Configuration]][]).map(([key, config]) => (
              <motion.button key={key} onClick={() => setSelectedConfig(key)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-2xl text-left transition-all ${selectedConfig === key ? theme === 'light' ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-emerald-500/20 border-2 border-emerald-500' : theme === 'light' ? 'bg-white border-2 border-slate-200 hover:border-emerald-300' : 'bg-slate-900 border-2 border-slate-700 hover:border-emerald-500/50'}`}>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.name}</h3>
                <p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{config.description}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}><div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Progress</div><div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.transformationProgress}%</div></div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}><div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Culture</div><div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.culturalAlignment}%</div></div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}><div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Engagement</div><div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.employeeEngagement}%</div></div>
                </div>
              </motion.button>
            ))}
          </div>
          {selectedConfig && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
              <button onClick={() => initializeGame(selectedConfig)} className={`px-12 py-4 rounded-xl font-bold text-xl ${theme === 'light' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-900 shadow-lg shadow-cyan-500/30'}`}>
                <Play className="w-6 h-6 inline mr-2" /> Begin Transformation
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  const currentRoleInfo = ROLES.find(r => r.id === gameState.currentRole)!;
  const roundDecisions = ROUND_DECISIONS[gameState.round - 1] || [];
  const quarterLabel = `Year ${Math.ceil(gameState.round / 4)}, Q${((gameState.round - 1) % 4) + 1}`;

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50' : 'bg-slate-950'}`}>
      <header className={`sticky top-0 z-40 ${theme === 'light' ? 'bg-white/90 border-b border-slate-200' : 'bg-slate-900/90 border-b border-slate-800'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <RefreshCw className={`w-8 h-8 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <div><h1 className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>METAMORPHOSIS</h1><p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{quarterLabel}</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}><span className="font-medium">Progress:</span> {gameState.metrics.transformationProgress}%</div>
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}><span className="font-medium">Engagement:</span> {gameState.metrics.employeeEngagement}%</div>
            <button onClick={() => setShowRoleInfo(!showRoleInfo)} className={`p-2 rounded-lg ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800 hover:bg-slate-700'}`}><Eye className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {gameState.phase === 'intro' && (
                <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Atlas Industries Transformation</h2>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>You lead a 3-year transformation of Atlas Industries, a $4.2B industrial company. The industry is shifting, the organization needs to change, and you must balance urgency with sustainability. Navigate resistance, build capability, and deliver lasting change.</p>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'sensemaking' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-emerald-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>Begin Transformation <ChevronRight className="inline w-5 h-5" /></button>
                </motion.div>
              )}

              {gameState.phase === 'sensemaking' && (
                <motion.div key="sensemaking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <div className="flex items-center gap-3 mb-6"><currentRoleInfo.icon className={`w-8 h-8 text-${currentRoleInfo.color}-500`} /><div><h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{quarterLabel}: Sensemaking</h2><p className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Perspective: {currentRoleInfo.title}</p></div></div>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/30'}`}>
                    <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'}`}>Private Intelligence</h3>
                    <ul className={`space-y-1 text-sm ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}`}>{currentRoleInfo.privateInfo.map((info, i) => <li key={i}>• {info}</li>)}</ul>
                  </div>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'decisions' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-emerald-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>Proceed to Decisions <ChevronRight className="inline w-5 h-5" /></button>
                </motion.div>
              )}

              {gameState.phase === 'decisions' && (
                <motion.div key="decisions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{quarterLabel}: Decisions</h2>
                  {roundDecisions.map(decision => (
                    <div key={decision.id} className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                      <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{decision.title}</h3>
                      <p className={`mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{decision.description}</p>
                      <div className="grid gap-3">
                        {decision.options.map(option => (
                          <button key={option.id} onClick={() => setCurrentDecisions(prev => ({ ...prev, [decision.id]: option.id }))}
                            className={`p-4 rounded-xl text-left transition-all ${currentDecisions[decision.id] === option.id ? theme === 'light' ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-emerald-500/20 border-2 border-emerald-500' : theme === 'light' ? 'bg-slate-50 border-2 border-slate-200 hover:border-emerald-300' : 'bg-slate-800 border-2 border-slate-700 hover:border-emerald-500/50'}`}>
                            <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{option.label}</div>
                            <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{option.narrative}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {roundDecisions.every(d => currentDecisions[d.id]) && (<button onClick={applyDecisions} className={`w-full px-8 py-4 rounded-xl font-bold text-lg ${theme === 'light' ? 'bg-emerald-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>Execute Decisions <ChevronRight className="inline w-5 h-5" /></button>)}
                </motion.div>
              )}

              {gameState.phase === 'event' && gameState.currentEvent && (
                <motion.div key="event" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-teal-50 border-2 border-teal-200' : 'bg-teal-500/10 border-2 border-teal-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4"><AlertTriangle className={`w-8 h-8 ${theme === 'light' ? 'text-teal-600' : 'text-teal-400'}`} /><h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-teal-800' : 'text-teal-400'}`}>TRANSFORMATION EVENT</h2></div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentEvent.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentEvent.description}</p>
                  <button onClick={handleEventResolution} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-teal-600 text-white' : 'bg-teal-500 text-white'}`}>Acknowledge <ChevronRight className="inline w-5 h-5" /></button>
                </motion.div>
              )}

              {gameState.phase === 'fork' && gameState.currentFork && (
                <motion.div key="fork" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-emerald-500/10 border-2 border-emerald-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4"><Milestone className={`w-8 h-8 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} /><h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'}`}>DEFINING MOMENT</h2></div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentFork.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentFork.description}</p>
                  <div className="grid gap-4">
                    {gameState.currentFork.paths.filter(p => !gameState.lockedPaths.includes(p.id)).map(path => (
                      <button key={path.id} onClick={() => handleForkChoice(path.id)} className={`p-6 rounded-xl text-left transition-all ${theme === 'light' ? 'bg-white hover:bg-emerald-50 border-2 border-emerald-200' : 'bg-slate-900 hover:bg-emerald-500/10 border-2 border-emerald-500/30'}`}>
                        <h4 className={`text-lg font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{path.name}</h4>
                        <p className={`text-sm mb-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{path.description}</p>
                        <div className={`text-xs ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>{path.consequences.join(' • ')}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {gameState.phase === 'feedback' && (
                <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{quarterLabel} Summary</h2>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}><ul className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.narrativeLog.slice(-5).map((log, i) => <li key={i}>• {log}</li>)}</ul></div>
                  <button onClick={advanceRound} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-emerald-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>{gameState.round >= 10 ? 'View Transformation Results' : 'Continue to Next Quarter'} <ChevronRight className="inline w-5 h-5" /></button>
                </motion.div>
              )}

              {gameState.phase === 'game-over' && (
                <motion.div key="gameover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-xl' : 'bg-slate-900'}`}>
                  <h2 className={`text-3xl font-bold mb-6 text-center ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {gameState.endState === 'transformed-leader' ? 'EXEMPLARY: Transformed Leader' : gameState.endState === 'successful-transition' ? 'SUCCESS: Successful Transition' : gameState.endState === 'partial-transformation' ? 'PARTIAL: Incomplete Transformation' : gameState.endState === 'transformation-theater' ? 'FAILURE: Transformation Theater' : gameState.endState === 'transformation-collapse' ? 'COLLAPSE: Transformation Failed' : 'Transformation Complete'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}><h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Final Metrics</h3><div className="space-y-1 text-sm"><div>Progress: {gameState.metrics.transformationProgress}%</div><div>Culture: {gameState.metrics.culturalAlignment}%</div><div>Engagement: {gameState.metrics.employeeEngagement}%</div><div>Change Capacity: {gameState.metrics.changeCapacity}%</div></div></div>
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}><h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Stakeholder Trust</h3><div className="space-y-1 text-sm">{Object.entries(gameState.trust).map(([k, v]) => <div key={k}>{k}: {v}%</div>)}</div></div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setGameState(null)} className={`px-6 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-emerald-600 text-white' : 'bg-cyan-500 text-slate-900'}`}><RotateCcw className="inline w-5 h-5 mr-2" /> Play Again</button>
                    <Link href="/" className={`px-6 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'}`}><Home className="inline w-5 h-5 mr-2" /> Return Home</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Transformation Metrics</h3>
              <div className="space-y-3">
                {[{ label: 'Progress', value: gameState.metrics.transformationProgress, color: 'emerald' }, { label: 'Culture', value: gameState.metrics.culturalAlignment, color: 'violet' }, { label: 'Engagement', value: gameState.metrics.employeeEngagement, color: 'blue' }, { label: 'Change Capacity', value: gameState.metrics.changeCapacity, color: 'amber' }].map(metric => (
                  <div key={metric.label}><div className="flex justify-between text-sm mb-1"><span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{metric.label}</span><span className={theme === 'light' ? 'text-slate-800' : 'text-white'}>{metric.value}%</span></div><div className={`h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}><div className={`h-full rounded-full bg-${metric.color}-500`} style={{ width: `${Math.min(100, metric.value)}%` }} /></div></div>
                ))}
              </div>
            </div>
            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Stakeholder Trust</h3>
              <div className="space-y-3">
                {Object.entries(gameState.trust).map(([key, value]) => (
                  <div key={key}><div className="flex justify-between text-sm mb-1"><span className={`capitalize ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{key}</span><span className={value >= 60 ? 'text-green-500' : value >= 40 ? 'text-amber-500' : 'text-red-500'}>{value}%</span></div><div className={`h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}><div className={`h-full rounded-full ${value >= 60 ? 'bg-green-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${value}%` }} /></div></div>
                ))}
              </div>
            </div>
            {showRoleInfo && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/30'}`}><h3 className={`font-bold mb-3 ${theme === 'light' ? 'text-emerald-800' : 'text-emerald-400'}`}>{currentRoleInfo.title}</h3><div className={`text-sm space-y-2 ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}`}><div><strong>Metrics:</strong> {currentRoleInfo.metrics.join(', ')}</div><div><strong>Conflicts:</strong> {currentRoleInfo.conflicts.join(', ')}</div></div></motion.div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
