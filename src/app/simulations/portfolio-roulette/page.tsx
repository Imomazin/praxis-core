'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, AlertTriangle, Users, DollarSign,
  Building2, ChevronRight, BarChart3, Target, Scale, Play, RotateCcw, Eye,
  Database, Cpu, PieChart, Home, Beaker, FlaskConical, Atom, Microscope,
  Rocket, Settings, Wrench, Zap, Award, BookOpen, GraduationCap,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// TYPES
// =============================================================================

type Configuration = 'portfolio-bloat' | 'bet-the-company' | 'acquisition-integration' | 'talent-crisis';
type Role = 'strategy' | 'marketing' | 'product' | 'rd' | 'sales' | 'legal' | 'gm';
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
  rdBudget: number;
  horizon1Projects: number;
  horizon2Projects: number;
  horizon3Projects: number;
  patentPortfolio: number;
  talentRetention: number;
  projectSuccessRate: number;
  timeToMarket: number;
  competitivePosition: number;
  boardConfidence: number;
}

interface StakeholderTrust {
  board: number;
  engineers: number;
  productTeams: number;
  customers: number;
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
  category: 'technology' | 'talent' | 'market' | 'regulatory' | 'competitive';
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
  'portfolio-bloat': {
    name: 'Portfolio Bloat',
    description: '47 active projects with insufficient resources. Projects compete for engineers, equipment, and attention. Nothing moves fast enough. Cancellation politics paralyze decision-making.',
    initialMetrics: { rdBudget: 380, horizon1Projects: 28, horizon2Projects: 14, horizon3Projects: 5, patentPortfolio: 156, talentRetention: 72, projectSuccessRate: 45, timeToMarket: 24, competitivePosition: 55, boardConfidence: 50 },
    initialTrust: { board: 45, engineers: 55, productTeams: 40, customers: 60, investors: 50 },
  },
  'bet-the-company': {
    name: 'Bet-the-Company Technology',
    description: 'One Horizon 3 project shows breakthrough results but requires 3x investment. Success transforms the company. Failure wastes 40% of annual R&D budget.',
    initialMetrics: { rdBudget: 380, horizon1Projects: 18, horizon2Projects: 8, horizon3Projects: 3, patentPortfolio: 189, talentRetention: 82, projectSuccessRate: 62, timeToMarket: 18, competitivePosition: 68, boardConfidence: 65 },
    initialTrust: { board: 60, engineers: 75, productTeams: 65, customers: 70, investors: 55 },
  },
  'acquisition-integration': {
    name: 'Acquisition Integration',
    description: 'Recently acquired startup with promising technology. Integration consuming R&D leadership attention. Acquired team members departing. Technology value at risk.',
    initialMetrics: { rdBudget: 420, horizon1Projects: 22, horizon2Projects: 10, horizon3Projects: 4, patentPortfolio: 210, talentRetention: 58, projectSuccessRate: 52, timeToMarket: 20, competitivePosition: 62, boardConfidence: 55 },
    initialTrust: { board: 55, engineers: 45, productTeams: 50, customers: 65, investors: 60 },
  },
  'talent-crisis': {
    name: 'Talent Crisis',
    description: 'Key technical talent departing for competitors and startups. Knowledge loss threatens project continuity. Compensation constraints prevent matching offers.',
    initialMetrics: { rdBudget: 380, horizon1Projects: 20, horizon2Projects: 9, horizon3Projects: 3, patentPortfolio: 145, talentRetention: 48, projectSuccessRate: 55, timeToMarket: 22, competitivePosition: 58, boardConfidence: 52 },
    initialTrust: { board: 50, engineers: 35, productTeams: 55, customers: 62, investors: 48 },
  },
};

const ROLES: RoleInfo[] = [
  { id: 'strategy', name: 'Strategy', title: 'VP Strategy', icon: Target, color: 'violet',
    privateInfo: ['Board considering acquisition alternatives to organic R&D', 'CEO evaluating CTO replacement', 'Competitor R&D spend increased 40%'],
    metrics: ['Portfolio ROI', 'Strategic alignment', 'Competitive differentiation'], conflicts: ['R&D (project cancellation)', 'Finance (investment levels)'] },
  { id: 'marketing', name: 'Marketing', title: 'Chief Marketing Officer', icon: BarChart3, color: 'blue',
    privateInfo: ['Customer demand for new capabilities exceeds roadmap', 'Competitor launching similar product in 6 months', 'Industry analyst preparing critical report'],
    metrics: ['Market positioning', 'Launch success', 'Customer perception'], conflicts: ['R&D (timeline pressure)', 'Product (feature scope)'] },
  { id: 'product', name: 'Product', title: 'Chief Product Officer', icon: Cpu, color: 'emerald',
    privateInfo: ['Three projects have hidden technical dependencies', 'Key platform component needs replacement', 'Customer beta feedback on flagship product is negative'],
    metrics: ['Product-market fit', 'Development efficiency', 'Technical debt'], conflicts: ['R&D (research vs development)', 'Sales (customer commitments)'] },
  { id: 'rd', name: 'R&D', title: 'Chief Technology Officer', icon: Beaker, color: 'cyan',
    privateInfo: ['Breakthrough in Horizon 3 project—not yet disclosed', 'University partnership could accelerate research 2x', 'Key patent being challenged by competitor'],
    metrics: ['Innovation output', 'Patent quality', 'Research velocity'], conflicts: ['Product (priorities)', 'Strategy (project cuts)'] },
  { id: 'sales', name: 'Sales', title: 'Chief Revenue Officer', icon: DollarSign, color: 'amber',
    privateInfo: ['Enterprise customers demanding features on cancelled projects', 'Competitor won 3 major deals with innovation message', 'Key account threatening churn over roadmap delays'],
    metrics: ['Revenue from new products', 'Win rate', 'Customer retention'], conflicts: ['R&D (timeline)', 'Product (customization)'] },
  { id: 'legal', name: 'Legal', title: 'General Counsel', icon: Scale, color: 'rose',
    privateInfo: ['Patent infringement risk in Horizon 2 project', 'Government grant opportunity requires compliance changes', 'University partnership has IP ownership complications'],
    metrics: ['IP protection', 'Regulatory compliance', 'Partnership risk'], conflicts: ['R&D (IP disclosure)', 'Strategy (partnership terms)'] },
  { id: 'gm', name: 'General Management', title: 'CEO', icon: Building2, color: 'slate',
    privateInfo: ['R&D morale at 5-year low', 'Board patience running thin—12 months to show results', 'Competitor approached about merger'],
    metrics: ['Organizational health', 'Board confidence', 'Innovation culture'], conflicts: ['All functions compete for limited R&D resources'] },
];

const ROUND_DECISIONS: Decision[][] = [
  // Round 1: Portfolio Rationalization
  [
    { id: 'r1-portfolio-strategy', title: 'Portfolio Rationalization', description: 'Too many projects, too few resources. How do you prioritize?', role: 'strategy',
      options: [
        { id: 'aggressive-cuts', label: 'Aggressive Project Cuts', shortLabel: 'Cut 40%', consequences: { horizon1Projects: -8, horizon2Projects: -4, horizon3Projects: -2, projectSuccessRate: 15, boardConfidence: 10 }, trustImpact: { board: 15, engineers: -20 }, narrative: 'You cancel 14 projects to focus resources on remaining portfolio.' },
        { id: 'selective-cuts', label: 'Selective Cuts with Reinvestment', shortLabel: 'Cut 20%', consequences: { horizon1Projects: -4, horizon2Projects: -2, projectSuccessRate: 8, boardConfidence: 5 }, trustImpact: { board: 5, engineers: -10 }, narrative: 'You cancel underperforming projects and reinvest in winners.' },
        { id: 'no-cuts', label: 'Optimize Without Cutting', shortLabel: 'Optimize', consequences: { projectSuccessRate: -5, timeToMarket: 3 }, trustImpact: { engineers: 10, board: -10 }, narrative: 'You attempt to improve efficiency without project cancellations.' },
      ]
    },
    { id: 'r1-horizon-balance', title: 'Horizon Investment Balance', description: 'How should R&D budget be allocated across horizons?', role: 'rd',
      options: [
        { id: 'h1-focus', label: 'Near-Term Focus (70/20/10)', shortLabel: 'H1 Focus', consequences: { horizon1Projects: 3, horizon3Projects: -1, timeToMarket: -3, competitivePosition: 5 }, trustImpact: { productTeams: 15, customers: 10, board: 5 }, narrative: 'You shift resources to product extensions and near-term revenue.' },
        { id: 'balanced', label: 'Balanced Portfolio (50/30/20)', shortLabel: 'Balanced', consequences: { projectSuccessRate: 5 }, trustImpact: { engineers: 5 }, narrative: 'You maintain balanced investment across all horizons.' },
        { id: 'h3-bet', label: 'Transformational Bet (40/30/30)', shortLabel: 'H3 Bet', consequences: { horizon3Projects: 2, rdBudget: -30, timeToMarket: 4 }, trustImpact: { engineers: 15, board: -10 }, narrative: 'You increase Horizon 3 investment for breakthrough potential.' },
      ]
    },
  ],
  // Round 2: Talent Strategy
  [
    { id: 'r2-talent-retention', title: 'Talent Retention Strategy', description: 'Key researchers receiving competitive offers. How do you respond?', role: 'gm',
      options: [
        { id: 'compensation', label: 'Match Market Compensation', shortLabel: 'Match Comp', consequences: { rdBudget: -25, talentRetention: 15 }, trustImpact: { engineers: 25, board: -10 }, narrative: 'You increase R&D compensation to market rates.' },
        { id: 'equity-research', label: 'Equity + Research Freedom', shortLabel: 'Equity', consequences: { rdBudget: -10, talentRetention: 10, horizon3Projects: 1 }, trustImpact: { engineers: 20 }, narrative: 'You offer equity and dedicated research time.' },
        { id: 'let-go', label: 'Accept Some Attrition', shortLabel: 'Accept', consequences: { talentRetention: -10, projectSuccessRate: -8 }, trustImpact: { engineers: -15, board: 5 }, narrative: 'You accept some talent loss to maintain budget discipline.' },
      ]
    },
  ],
  // Round 3: Technology Direction
  [
    { id: 'r3-tech-direction', title: 'Technology Platform Decision', description: 'Core platform needs major upgrade or replacement. What approach?', role: 'product',
      options: [
        { id: 'incremental', label: 'Incremental Upgrade', shortLabel: 'Upgrade', consequences: { rdBudget: -30, timeToMarket: -2, projectSuccessRate: 5 }, trustImpact: { productTeams: 10, engineers: 5 }, narrative: 'You invest in upgrading the existing platform.' },
        { id: 'rebuild', label: 'Platform Rebuild', shortLabel: 'Rebuild', consequences: { rdBudget: -80, timeToMarket: 8, horizon1Projects: -3, projectSuccessRate: -10 }, trustImpact: { engineers: 15, productTeams: -15, board: -10 }, narrative: 'You commit to comprehensive platform replacement.' },
        { id: 'acquire', label: 'Acquire Platform Technology', shortLabel: 'Acquire', consequences: { rdBudget: -60, talentRetention: -5, timeToMarket: 2 }, trustImpact: { board: 10, engineers: -10 }, narrative: 'You acquire startup with modern platform technology.' },
      ]
    },
  ],
  // Round 4: Partnership Strategy
  [
    { id: 'r4-partnership', title: 'Research Partnership', description: 'University offers joint research program. Terms include shared IP.', role: 'rd',
      options: [
        { id: 'full-partnership', label: 'Full Partnership (Shared IP)', shortLabel: 'Full', consequences: { rdBudget: 20, horizon3Projects: 2, patentPortfolio: -10 }, trustImpact: { engineers: 15, board: 5 }, narrative: 'You enter full partnership with shared IP arrangements.' },
        { id: 'limited', label: 'Limited Engagement', shortLabel: 'Limited', consequences: { rdBudget: 5, horizon3Projects: 1 }, trustImpact: { engineers: 5 }, narrative: 'You engage on specific projects with protected IP.' },
        { id: 'decline', label: 'Maintain Independence', shortLabel: 'Decline', consequences: { competitivePosition: -5 }, trustImpact: { engineers: -5 }, narrative: 'You decline to protect IP and maintain independence.' },
      ]
    },
    { id: 'r4-project-kill', title: 'Horizon 2 Project Decision', description: 'Promising H2 project hitting major technical barriers. Continue or kill?', role: 'strategy',
      options: [
        { id: 'double-down', label: 'Double Down Investment', shortLabel: 'Double', consequences: { rdBudget: -40, horizon2Projects: 0, projectSuccessRate: 10 }, trustImpact: { engineers: 10, board: -10 }, narrative: 'You invest heavily to overcome technical barriers.' },
        { id: 'pivot', label: 'Pivot Direction', shortLabel: 'Pivot', consequences: { rdBudget: -15, timeToMarket: 4 }, trustImpact: { engineers: 5 }, narrative: 'You redirect the project to a more achievable scope.' },
        { id: 'kill', label: 'Kill Project', shortLabel: 'Kill', consequences: { horizon2Projects: -1, rdBudget: 15, projectSuccessRate: 5 }, trustImpact: { engineers: -15, board: 10 }, narrative: 'You terminate the project and reallocate resources.' },
      ]
    },
  ],
  // Round 5: Commercialization
  [
    { id: 'r5-commercialization', title: 'Technology Commercialization', description: 'Horizon 3 breakthrough ready for commercialization path. How do you proceed?', role: 'strategy',
      options: [
        { id: 'internal', label: 'Internal Product Development', shortLabel: 'Internal', consequences: { rdBudget: -50, horizon1Projects: 1, timeToMarket: 6 }, trustImpact: { productTeams: 15, customers: 10 }, narrative: 'You bring technology in-house for product development.' },
        { id: 'spinout', label: 'Spinout with Equity', shortLabel: 'Spinout', consequences: { horizon3Projects: -1, rdBudget: 30, competitivePosition: 5 }, trustImpact: { engineers: -10, board: 15 }, narrative: 'You create separate entity with parent company stake.' },
        { id: 'license', label: 'License to Partners', shortLabel: 'License', consequences: { rdBudget: 25, patentPortfolio: 10, competitivePosition: -10 }, trustImpact: { board: 10, customers: -5 }, narrative: 'You license technology to generate royalty revenue.' },
      ]
    },
  ],
  // Round 6: Competitive Response
  [
    { id: 'r6-competitive', title: 'Competitive Technology Threat', description: 'Competitor announces breakthrough in your core technology area.', role: 'rd',
      options: [
        { id: 'accelerate', label: 'Accelerate Internal Program', shortLabel: 'Accelerate', consequences: { rdBudget: -35, horizon2Projects: 1, timeToMarket: -4, talentRetention: -5 }, trustImpact: { engineers: -10, board: 10 }, narrative: 'You accelerate development to beat competitor to market.' },
        { id: 'differentiate', label: 'Pursue Differentiation', shortLabel: 'Differentiate', consequences: { rdBudget: -20, horizon3Projects: 1, competitivePosition: 5 }, trustImpact: { engineers: 10 }, narrative: 'You pursue alternative approach with unique advantages.' },
        { id: 'fast-follow', label: 'Fast Follower Strategy', shortLabel: 'Follow', consequences: { timeToMarket: 6, rdBudget: -15 }, trustImpact: { board: -5 }, narrative: 'You wait to see market response then quickly follow.' },
      ]
    },
  ],
  // Round 7: Resource Reallocation
  [
    { id: 'r7-reallocation', title: 'Major Resource Reallocation', description: 'Board demands 20% budget cut. How do you implement?', role: 'gm',
      options: [
        { id: 'across-board', label: 'Across-the-Board Cuts', shortLabel: 'Even Cuts', consequences: { rdBudget: -76, horizon1Projects: -3, horizon2Projects: -2, horizon3Projects: -1, projectSuccessRate: -10 }, trustImpact: { engineers: -15, board: 10 }, narrative: 'You reduce all projects proportionally.' },
        { id: 'strategic', label: 'Strategic Consolidation', shortLabel: 'Strategic', consequences: { rdBudget: -76, horizon1Projects: -6, horizon2Projects: -1, projectSuccessRate: 5, competitivePosition: 5 }, trustImpact: { engineers: -10, board: 15 }, narrative: 'You eliminate lower-priority projects to protect core.' },
        { id: 'push-back', label: 'Push Back on Board', shortLabel: 'Resist', consequences: { rdBudget: -38, boardConfidence: -15 }, trustImpact: { engineers: 15, board: -20 }, narrative: 'You negotiate reduced cuts with business case.' },
      ]
    },
  ],
  // Round 8-10: Final Rounds
  [
    { id: 'r8-legacy', title: 'Innovation Legacy', description: 'Final strategic direction for R&D organization.', role: 'strategy',
      options: [
        { id: 'engine', label: 'Build Innovation Engine', shortLabel: 'Engine', consequences: { horizon3Projects: 2, projectSuccessRate: 10, competitivePosition: 10 }, trustImpact: { engineers: 15, board: 10 }, narrative: 'You establish sustainable innovation processes and culture.' },
        { id: 'efficiency', label: 'Optimize for Efficiency', shortLabel: 'Efficiency', consequences: { projectSuccessRate: 15, timeToMarket: -4, rdBudget: 30 }, trustImpact: { board: 20, engineers: -5 }, narrative: 'You maximize return on existing R&D investment.' },
        { id: 'external', label: 'Shift to External Innovation', shortLabel: 'External', consequences: { horizon3Projects: -2, rdBudget: 50, patentPortfolio: 20 }, trustImpact: { board: 15, engineers: -20 }, narrative: 'You pursue partnerships and acquisitions over internal R&D.' },
      ]
    },
  ],
  [
    { id: 'r9-breakthrough', title: 'Breakthrough Investment', description: 'Opportunity to fund high-risk, high-reward project.', role: 'rd',
      options: [
        { id: 'fund', label: 'Full Funding', shortLabel: 'Fund', consequences: { rdBudget: -60, horizon3Projects: 1, competitivePosition: 15 }, trustImpact: { engineers: 20, board: -5 }, narrative: 'You commit full resources to breakthrough attempt.' },
        { id: 'partial', label: 'Staged Funding', shortLabel: 'Staged', consequences: { rdBudget: -25, horizon3Projects: 0 }, trustImpact: { engineers: 5 }, narrative: 'You provide initial funding with milestone gates.' },
        { id: 'pass', label: 'Pass on Opportunity', shortLabel: 'Pass', consequences: { competitivePosition: -10 }, trustImpact: { engineers: -10, board: 5 }, narrative: 'You decline to maintain budget discipline.' },
      ]
    },
  ],
  [
    { id: 'r10-endgame', title: 'R&D Endgame', description: 'Final strategic positioning of R&D capability.', role: 'gm',
      options: [
        { id: 'leader', label: 'Technology Leadership', shortLabel: 'Lead', consequences: { competitivePosition: 15, patentPortfolio: 15, boardConfidence: 15 }, trustImpact: { engineers: 15, board: 15 }, narrative: 'You position R&D as source of competitive advantage.' },
        { id: 'enabler', label: 'Business Enabler', shortLabel: 'Enable', consequences: { projectSuccessRate: 20, boardConfidence: 10 }, trustImpact: { productTeams: 15, board: 10 }, narrative: 'You align R&D closely with business unit needs.' },
        { id: 'cost-center', label: 'Optimized Cost Center', shortLabel: 'Cost', consequences: { rdBudget: 40, talentRetention: -15 }, trustImpact: { board: 15, engineers: -25 }, narrative: 'You position R&D for maximum efficiency and minimum cost.' },
      ]
    },
  ],
];

const EVENTS: GameEvent[] = [
  { id: 'competitor-breakthrough', title: 'Competitor Breakthrough', description: 'Major competitor announces breakthrough in adjacent technology.', category: 'competitive', severity: 'high', probability: 0.2,
    consequences: { competitivePosition: -10, boardConfidence: -10 }, trustImpact: { board: -15 } },
  { id: 'patent-challenge', title: 'Patent Challenge', description: 'Key patent challenged by competitor litigation.', category: 'competitive', severity: 'medium', probability: 0.15,
    consequences: { patentPortfolio: -15, rdBudget: -10 }, trustImpact: { board: -10 } },
  { id: 'star-departure', title: 'Star Researcher Departure', description: 'Lead researcher on flagship project departs for competitor.', category: 'talent', severity: 'high', probability: 0.2,
    conditions: (s) => s.trust.engineers < 50, consequences: { talentRetention: -15, projectSuccessRate: -10 }, trustImpact: { engineers: -20 } },
  { id: 'grant-award', title: 'Government Grant Award', description: 'Major government R&D grant awarded to your program.', category: 'market', severity: 'low', probability: 0.15,
    conditions: (s) => s.metrics.patentPortfolio > 150, consequences: { rdBudget: 30, horizon3Projects: 1 }, trustImpact: { board: 10, engineers: 10 } },
  { id: 'regulatory-change', title: 'Regulatory Requirement', description: 'New environmental regulations require product redesign.', category: 'regulatory', severity: 'medium', probability: 0.15,
    consequences: { horizon1Projects: 2, rdBudget: -20, timeToMarket: 4 }, trustImpact: { customers: -10 } },
  { id: 'customer-mandate', title: 'Customer Technology Mandate', description: 'Key customers mandate specific technology capabilities.', category: 'market', severity: 'medium', probability: 0.2,
    consequences: { horizon2Projects: 1, timeToMarket: -2 }, trustImpact: { customers: 15, productTeams: 10 } },
  { id: 'supply-disruption', title: 'R&D Supply Disruption', description: 'Critical research materials face supply shortage.', category: 'market', severity: 'medium', probability: 0.15,
    consequences: { timeToMarket: 3, rdBudget: -10 }, trustImpact: { engineers: -10 } },
  { id: 'acquisition-offer', title: 'R&D Division Acquisition Offer', description: 'Strategic buyer expresses interest in acquiring R&D assets.', category: 'competitive', severity: 'low', probability: 0.1,
    conditions: (s) => s.metrics.patentPortfolio > 180, consequences: {}, trustImpact: { board: 10, engineers: -15 } },
  { id: 'lab-incident', title: 'Laboratory Incident', description: 'Safety incident requires facility shutdown.', category: 'technology', severity: 'high', probability: 0.1,
    consequences: { timeToMarket: 4, rdBudget: -15 }, trustImpact: { engineers: -15, board: -10 } },
  { id: 'university-partnership', title: 'University Partnership Opportunity', description: 'Top university proposes research collaboration.', category: 'market', severity: 'low', probability: 0.2,
    consequences: { horizon3Projects: 1 }, trustImpact: { engineers: 10 } },
  { id: 'tech-standard', title: 'Technology Standard Adoption', description: 'Industry adopts standard based on your technology.', category: 'technology', severity: 'low', probability: 0.1,
    conditions: (s) => s.metrics.patentPortfolio > 170, consequences: { competitivePosition: 15, patentPortfolio: 10 }, trustImpact: { board: 15, customers: 10 } },
  { id: 'talent-shift', title: 'Talent Market Shift', description: 'Tech companies aggressively recruiting R&D talent.', category: 'talent', severity: 'medium', probability: 0.2,
    consequences: { talentRetention: -10, rdBudget: -15 }, trustImpact: { engineers: -10 } },
  { id: 'budget-cut', title: 'Surprise Budget Cut', description: 'Corporate mandates immediate R&D budget reduction.', category: 'market', severity: 'high', probability: 0.15,
    consequences: { rdBudget: -40, horizon3Projects: -1 }, trustImpact: { board: 5, engineers: -20 } },
  { id: 'discovery', title: 'Unexpected Discovery', description: 'Research team makes unexpected breakthrough.', category: 'technology', severity: 'low', probability: 0.1,
    conditions: (s) => s.metrics.horizon3Projects > 3, consequences: { patentPortfolio: 15, competitivePosition: 10 }, trustImpact: { engineers: 15, board: 10 } },
  { id: 'project-failure', title: 'Major Project Failure', description: 'Flagship project fails critical milestone.', category: 'technology', severity: 'high', probability: 0.15,
    conditions: (s) => s.metrics.projectSuccessRate < 50, consequences: { projectSuccessRate: -10, boardConfidence: -15 }, trustImpact: { board: -20, engineers: -10 } },
];

const STRATEGIC_FORKS: StrategicFork[] = [
  { id: 'h3-investment', title: 'Horizon 3 Investment Decision', description: 'Breakthrough project requires major investment decision.', round: 3,
    paths: [
      { id: 'full-h3', name: 'Full Investment', description: 'Commit major resources to breakthrough potential', consequences: ['High risk, high reward', 'Resource strain', 'Transformational potential'], metricsImpact: { rdBudget: -80, horizon3Projects: 2, competitivePosition: 15 }, lockedPaths: ['conservative-h3'] },
      { id: 'conservative-h3', name: 'Staged Investment', description: 'Incremental funding with milestone gates', consequences: ['Lower risk', 'Slower progress', 'Preserved flexibility'], metricsImpact: { rdBudget: -30, horizon3Projects: 1 }, lockedPaths: ['full-h3'] },
    ]
  },
  { id: 'talent-strategy', title: 'Talent Strategy Fork', description: 'How will you address the talent crisis?', round: 5,
    paths: [
      { id: 'premium-talent', name: 'Premium Talent Investment', description: 'Invest heavily in attracting and retaining top talent', consequences: ['Higher costs', 'Better innovation', 'Stronger retention'], metricsImpact: { rdBudget: -50, talentRetention: 25, projectSuccessRate: 15 }, lockedPaths: ['lean-talent'] },
      { id: 'lean-talent', name: 'Lean Talent Model', description: 'Optimize with outsourcing and partnerships', consequences: ['Lower costs', 'Knowledge risk', 'Flexibility'], metricsImpact: { rdBudget: 30, talentRetention: -15, patentPortfolio: -10 }, lockedPaths: ['premium-talent'] },
    ]
  },
  { id: 'tech-direction', title: 'Technology Direction Fork', description: 'Competing approaches require choosing direction.', round: 7,
    paths: [
      { id: 'internal-tech', name: 'Internal Technology', description: 'Commit to internally developed approach', consequences: ['Full control', 'Slower development', 'Proprietary advantage'], metricsImpact: { patentPortfolio: 20, timeToMarket: 4, competitivePosition: 10 }, lockedPaths: ['licensed-tech'] },
      { id: 'licensed-tech', name: 'Licensed Technology', description: 'License external technology to accelerate', consequences: ['Faster to market', 'Dependency risk', 'Lower differentiation'], metricsImpact: { timeToMarket: -6, rdBudget: -30, competitivePosition: -5 }, lockedPaths: ['internal-tech'] },
    ]
  },
];

// =============================================================================
// GAME COMPONENT
// =============================================================================

export default function PortfolioRoulettePage() {
  const { theme } = useTheme();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);
  const [currentDecisions, setCurrentDecisions] = useState<Record<string, string>>({});
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const initializeGame = useCallback((config: Configuration) => {
    const configData = CONFIGURATIONS[config];
    setGameState({
      configuration: config,
      currentRole: 'strategy',
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
      narrativeLog: [`Game initialized with ${configData.name} configuration.`],
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
        narrativeLog: [...prev.narrativeLog, `EVENT: ${event.title} - ${event.description}`],
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
        narrativeLog: [...prev.narrativeLog, `STRATEGIC FORK: Chose ${path.name}`],
      };
    });
  }, [gameState]);

  const advanceRound = useCallback(() => {
    if (!gameState) return;

    if (gameState.metrics.rdBudget <= 0) {
      setGameState(prev => prev ? { ...prev, gameOver: true, endState: 'budget-exhausted', phase: 'game-over' } : null);
      return;
    }

    if (gameState.round >= 10) {
      const score = calculateFinalScore(gameState);
      let endState = 'survival';
      if (score > 80) endState = 'innovation-engine';
      else if (score > 60) endState = 'efficient-incrementalist';
      else if (score > 40) endState = 'platform-pivot';
      else if (score < 20) endState = 'innovation-theater';

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
    const innovation = ((state.metrics.horizon3Projects / 8) * 20) + ((state.metrics.patentPortfolio / 250) * 15);
    const execution = ((state.metrics.projectSuccessRate / 80) * 20) + (((30 - state.metrics.timeToMarket) / 30) * 10);
    const competitiveness = ((state.metrics.competitivePosition / 100) * 15) + ((state.metrics.talentRetention / 100) * 10);
    const stakeholders = Object.values(state.trust).reduce((a, b) => a + b, 0) / 5 * 0.1;
    return Math.min(100, Math.max(0, innovation + execution + competitiveness + stakeholders));
  };

  if (!gameState) {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-cyan-50 via-white to-blue-50' : 'bg-slate-950'}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/" className={`inline-flex items-center gap-2 mb-8 ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'} hover:underline`}>
            <Home className="w-5 h-5" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${theme === 'light' ? 'bg-cyan-100' : 'bg-cyan-500/20'}`}>
              <FlaskConical className={`w-10 h-10 ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`} />
            </div>
            <h1 className={`text-5xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>PORTFOLIO ROULETTE</h1>
            <p className={`text-2xl ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`}>Innovation Portfolio Management</p>
            <p className={`mt-4 text-lg max-w-2xl mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              You are leading R&D at Prometheus Technologies, a diversified industrial technology company. Balance near-term product development with transformational research while managing talent, budget, and stakeholder expectations.
            </p>
          </motion.div>

          <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Select Starting Configuration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(Object.entries(CONFIGURATIONS) as [Configuration, typeof CONFIGURATIONS[Configuration]][]).map(([key, config]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedConfig(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-2xl text-left transition-all ${
                  selectedConfig === key
                    ? theme === 'light' ? 'bg-cyan-100 border-2 border-cyan-500' : 'bg-cyan-500/20 border-2 border-cyan-500'
                    : theme === 'light' ? 'bg-white border-2 border-slate-200 hover:border-cyan-300' : 'bg-slate-900 border-2 border-slate-700 hover:border-cyan-500/50'
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.name}</h3>
                <p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{config.description}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Budget</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>${config.initialMetrics.rdBudget}M</div>
                  </div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Projects</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.horizon1Projects + config.initialMetrics.horizon2Projects + config.initialMetrics.horizon3Projects}</div>
                  </div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Retention</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.talentRetention}%</div>
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
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-900 shadow-lg shadow-cyan-500/30'
                }`}
              >
                <Play className="w-6 h-6 inline mr-2" /> Start Simulation
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
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-cyan-50 via-white to-blue-50' : 'bg-slate-950'}`}>
      <header className={`sticky top-0 z-40 ${theme === 'light' ? 'bg-white/90 border-b border-slate-200' : 'bg-slate-900/90 border-b border-slate-800'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FlaskConical className={`w-8 h-8 ${theme === 'light' ? 'text-cyan-600' : 'text-cyan-400'}`} />
            <div>
              <h1 className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>PORTFOLIO ROULETTE</h1>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Round {gameState.round} of 10</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="font-medium">Budget:</span> ${gameState.metrics.rdBudget.toFixed(0)}M
            </div>
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="font-medium">H3 Projects:</span> {gameState.metrics.horizon3Projects}
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
                <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Welcome to Prometheus Technologies R&D</h2>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    You lead the R&D division of a $4.2B industrial technology company. Balance near-term product development, adjacent opportunities, and transformational research while managing a portfolio of 47 projects and 2,400 engineers.
                  </p>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'sensemaking' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                    Begin Round 1 <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'sensemaking' && (
                <motion.div key="sensemaking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <currentRoleInfo.icon className={`w-8 h-8 text-${currentRoleInfo.color}-500`} />
                    <div>
                      <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Round {gameState.round}: Sensemaking</h2>
                      <p className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Playing as {currentRoleInfo.title}</p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-cyan-50 border border-cyan-200' : 'bg-cyan-500/10 border border-cyan-500/30'}`}>
                    <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-cyan-800' : 'text-cyan-400'}`}>Private Intelligence</h3>
                    <ul className={`space-y-1 text-sm ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>
                      {currentRoleInfo.privateInfo.map((info, i) => <li key={i}>• {info}</li>)}
                    </ul>
                  </div>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'decisions' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                    Proceed to Decisions <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'decisions' && (
                <motion.div key="decisions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Round {gameState.round}: Decisions</h2>
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
                                ? theme === 'light' ? 'bg-cyan-100 border-2 border-cyan-500' : 'bg-cyan-500/20 border-2 border-cyan-500'
                                : theme === 'light' ? 'bg-slate-50 border-2 border-slate-200 hover:border-cyan-300' : 'bg-slate-800 border-2 border-slate-700 hover:border-cyan-500/50'
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
                    <button onClick={applyDecisions} className={`w-full px-8 py-4 rounded-xl font-bold text-lg ${theme === 'light' ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                      Submit Decisions <ChevronRight className="inline w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              )}

              {gameState.phase === 'event' && gameState.currentEvent && (
                <motion.div key="event" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-orange-50 border-2 border-orange-200' : 'bg-orange-500/10 border-2 border-orange-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className={`w-8 h-8 ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`} />
                    <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-orange-800' : 'text-orange-400'}`}>R&D EVENT</h2>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentEvent.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentEvent.description}</p>
                  <button onClick={handleEventResolution} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white'}`}>
                    Acknowledge <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'fork' && gameState.currentFork && (
                <motion.div key="fork" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-blue-500/10 border-2 border-blue-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className={`w-8 h-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                    <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-blue-800' : 'text-blue-400'}`}>STRATEGIC FORK</h2>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentFork.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentFork.description}</p>
                  <div className="grid gap-4">
                    {gameState.currentFork.paths.filter(p => !gameState.lockedPaths.includes(p.id)).map(path => (
                      <button key={path.id} onClick={() => handleForkChoice(path.id)}
                        className={`p-6 rounded-xl text-left transition-all ${theme === 'light' ? 'bg-white hover:bg-blue-50 border-2 border-blue-200' : 'bg-slate-900 hover:bg-blue-500/10 border-2 border-blue-500/30'}`}>
                        <h4 className={`text-lg font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{path.name}</h4>
                        <p className={`text-sm mb-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{path.description}</p>
                        <div className={`text-xs ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>{path.consequences.join(' • ')}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {gameState.phase === 'feedback' && (
                <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Round {gameState.round} Summary</h2>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                    <ul className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      {gameState.narrativeLog.slice(-5).map((log, i) => <li key={i}>• {log}</li>)}
                    </ul>
                  </div>
                  <button onClick={advanceRound} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                    {gameState.round >= 10 ? 'View Results' : `Begin Round ${gameState.round + 1}`} <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'game-over' && (
                <motion.div key="gameover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-xl' : 'bg-slate-900'}`}>
                  <h2 className={`text-3xl font-bold mb-6 text-center ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {gameState.endState === 'innovation-engine' ? 'VICTORY: Innovation Engine' :
                     gameState.endState === 'efficient-incrementalist' ? 'SUCCESS: Efficient Incrementalist' :
                     gameState.endState === 'platform-pivot' ? 'SUCCESS: Platform Pivot' :
                     gameState.endState === 'innovation-theater' ? 'FAILURE: Innovation Theater' : 'Simulation Complete'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                      <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Final Metrics</h3>
                      <div className="space-y-1 text-sm">
                        <div>R&D Budget: ${gameState.metrics.rdBudget.toFixed(0)}M</div>
                        <div>H3 Projects: {gameState.metrics.horizon3Projects}</div>
                        <div>Patents: {gameState.metrics.patentPortfolio}</div>
                        <div>Success Rate: {gameState.metrics.projectSuccessRate.toFixed(0)}%</div>
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
                    <button onClick={() => setGameState(null)} className={`px-6 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-cyan-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
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
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Portfolio Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: 'H1 Projects', value: gameState.metrics.horizon1Projects, max: 30, color: 'emerald' },
                  { label: 'H2 Projects', value: gameState.metrics.horizon2Projects, max: 15, color: 'blue' },
                  { label: 'H3 Projects', value: gameState.metrics.horizon3Projects, max: 8, color: 'violet' },
                  { label: 'Success Rate', value: gameState.metrics.projectSuccessRate, max: 100, suffix: '%', color: 'cyan' },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{metric.label}</span>
                      <span className={theme === 'light' ? 'text-slate-800' : 'text-white'}>{metric.value}{metric.suffix || ''}</span>
                    </div>
                    <div className={`h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
                      <div className={`h-full rounded-full bg-${metric.color}-500`} style={{ width: `${Math.min(100, (metric.value / metric.max) * 100)}%` }} />
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-cyan-50 border border-cyan-200' : 'bg-cyan-500/10 border border-cyan-500/30'}`}>
                <h3 className={`font-bold mb-3 ${theme === 'light' ? 'text-cyan-800' : 'text-cyan-400'}`}>{currentRoleInfo.title}</h3>
                <div className={`text-sm space-y-2 ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-300'}`}>
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
