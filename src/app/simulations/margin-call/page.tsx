'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign,
  Building2, ChevronRight, ChevronLeft, BarChart3, Activity, Clock, Target,
  Briefcase, Scale, Zap, Globe, FileText, CheckCircle, XCircle, AlertCircle,
  ArrowUpRight, ArrowDownRight, Play, RotateCcw, Lock, Gavel, Eye, Settings,
  Database, Server, Cloud, Cpu, LineChart, PieChart, ArrowRight, Home,
  CreditCard, Wallet, Receipt, BadgeDollarSign, Percent,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// TYPES
// =============================================================================

type Configuration = 'growth-trap' | 'margin-pressure' | 'vertical-concentration' | 'international-opportunity';
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
  cash: number;
  runway: number;
  marketShare: number;
  grossMargin: number;
  customerCount: number;
  arr: number;
  burnRate: number;
  valuation: number;
  netRevenue: number;
  churnRate: number;
}

interface StakeholderTrust {
  investors: number;
  customers: number;
  employees: number;
  partners: number;
  bankPartners: number;
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
  unlocksPath?: string;
  locksPath?: string;
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: 'market' | 'regulatory' | 'technology' | 'talent' | 'financial' | 'competitive';
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
  'growth-trap': {
    name: 'Growth Trap',
    description: 'Strong growth but decelerating. CAC rising, competitors accelerating. Series C requires either profitability path or category leadership—current trajectory delivers neither.',
    initialMetrics: { cash: 68, runway: 22, marketShare: 12, grossMargin: 62, customerCount: 380, arr: 24, burnRate: 3.5, valuation: 180, netRevenue: 6, churnRate: 8 },
    initialTrust: { investors: 55, customers: 70, employees: 75, partners: 60, bankPartners: 65 },
  },
  'margin-pressure': {
    name: 'Margin Pressure',
    description: 'Pricing power eroding. Customers playing vendors against each other. Renewals require discounts. Cost base already optimized—further cuts impact quality.',
    initialMetrics: { cash: 82, runway: 26, marketShare: 15, grossMargin: 48, customerCount: 520, arr: 32, burnRate: 2.8, valuation: 210, netRevenue: 8, churnRate: 12 },
    initialTrust: { investors: 60, customers: 55, employees: 65, partners: 50, bankPartners: 70 },
  },
  'vertical-concentration': {
    name: 'Vertical Concentration',
    description: 'Dominant position in retail vertical but minimal presence elsewhere. Deep expertise creates moat but also concentration risk. Expansion requires significant investment.',
    initialMetrics: { cash: 75, runway: 24, marketShare: 28, grossMargin: 58, customerCount: 280, arr: 28, burnRate: 2.5, valuation: 195, netRevenue: 7, churnRate: 5 },
    initialTrust: { investors: 65, customers: 80, employees: 70, partners: 45, bankPartners: 68 },
  },
  'international-opportunity': {
    name: 'International Opportunity',
    description: 'Strong US position but competitors moving into Europe and LatAm. International expansion could unlock growth but requires significant investment in local compliance.',
    initialMetrics: { cash: 68, runway: 22, marketShare: 18, grossMargin: 55, customerCount: 420, arr: 30, burnRate: 3.2, valuation: 220, netRevenue: 7.5, churnRate: 7 },
    initialTrust: { investors: 70, customers: 72, employees: 68, partners: 55, bankPartners: 72 },
  },
};

const ROLES: RoleInfo[] = [
  { id: 'strategy', name: 'Strategy', title: 'Chief Strategy Officer', icon: Target, color: 'violet',
    privateInfo: ['Series B lead needs 3x return within 18 months', 'Competitor likely running low on capital', 'Board considering replacing CEO if metrics don\'t improve'],
    metrics: ['Board confidence', 'Strategic clarity', 'Competitive position'], conflicts: ['Sales (discounting)', 'Product (platform vs features)'] },
  { id: 'marketing', name: 'Marketing', title: 'Chief Marketing Officer', icon: LineChart, color: 'blue',
    privateInfo: ['Brand perceived as "smaller" than actual capabilities', 'Competitor spending 2x on marketing', 'Enterprise segment has 3x better unit economics'],
    metrics: ['Pipeline contribution', 'Brand awareness', 'CAC efficiency'], conflicts: ['Sales (lead quality)', 'Finance (marketing ROI)'] },
  { id: 'product', name: 'Product', title: 'Chief Product Officer', icon: Cpu, color: 'emerald',
    privateInfo: ['Major customer integration is fragile—3 months to stabilize if fails', 'Platform can\'t scale beyond 800 customers without rebuild', 'Key engineer has competing offer'],
    metrics: ['Platform reliability', 'Feature velocity', 'Customer satisfaction'], conflicts: ['Sales (custom features)', 'R&D (technical debt)'] },
  { id: 'rd', name: 'R&D', title: 'Chief Technology Officer', icon: Database, color: 'cyan',
    privateInfo: ['New payment rail emerging could disrupt architecture in 24 months', 'Patent exposure could create licensing obligations', 'Next-gen platform 60% complete but unfunded'],
    metrics: ['Innovation pipeline', 'Technical differentiation', 'Architecture scalability'], conflicts: ['Product (research vs development)', 'Finance (R&D investment)'] },
  { id: 'sales', name: 'Sales', title: 'Chief Revenue Officer', icon: DollarSign, color: 'amber',
    privateInfo: ['Three enterprise prospects in final stage with competitor', 'Largest customer considering 30% volume reduction', 'Competitor pricing 35% below on recent deals'],
    metrics: ['Quota attainment', 'Win rate', 'Deal size'], conflicts: ['Product (feature gaps)', 'Legal (contract terms)'] },
  { id: 'legal', name: 'Legal', title: 'General Counsel', icon: Gavel, color: 'rose',
    privateInfo: ['Primary bank partner under examination—may reduce fintech exposure', 'Contract term in enterprise deal creates hidden liability', 'CFPB considering action on embedded finance'],
    metrics: ['Compliance status', 'Bank partner health', 'Regulatory relationships'], conflicts: ['Sales (contract risk)', 'Product (compliance features)'] },
  { id: 'gm', name: 'General Management', title: 'Chief Executive Officer', icon: Building2, color: 'slate',
    privateInfo: ['Two senior leaders interviewing elsewhere', 'Weekly cash more constrained than board realizes', 'Acquirer has expressed informal interest at 3x ARR'],
    metrics: ['Organizational health', 'Burn efficiency', 'Strategic execution'], conflicts: ['All functions compete for limited resources'] },
];

const ROUND_DECISIONS: Decision[][] = [
  // Round 1: Pricing and Growth Strategy
  [
    { id: 'r1-pricing-strategy', title: 'Pricing Response', description: 'Competitor has slashed prices 25% across all segments. How do you respond?', role: 'sales',
      options: [
        { id: 'match', label: 'Match Pricing', shortLabel: 'Match', consequences: { grossMargin: -8, marketShare: 3, arr: -2 }, trustImpact: { customers: 15, investors: -15 }, narrative: 'You reduce prices across the board to maintain competitive position.' },
        { id: 'value', label: 'Emphasize Value Differentiation', shortLabel: 'Value', consequences: { grossMargin: 2, marketShare: -2, churnRate: 2 }, trustImpact: { customers: -5, investors: 10 }, narrative: 'You maintain pricing and invest in demonstrating superior ROI.' },
        { id: 'segment', label: 'Segmented Response', shortLabel: 'Segment', consequences: { grossMargin: -3, marketShare: 1 }, trustImpact: { customers: 5, partners: 5 }, narrative: 'You create competitive pricing for SMB while holding enterprise pricing.' },
      ]
    },
    { id: 'r1-growth-investment', title: 'Growth Investment', description: 'Where should limited growth capital be allocated?', role: 'strategy',
      options: [
        { id: 'sales', label: 'Sales Capacity Expansion', shortLabel: 'Sales', consequences: { burnRate: 0.8, arr: 3, customerCount: 50 }, trustImpact: { investors: 10, employees: 5 }, narrative: 'You hire 8 additional AEs to expand coverage.' },
        { id: 'product', label: 'Product Enhancement', shortLabel: 'Product', consequences: { burnRate: 0.6, churnRate: -2 }, trustImpact: { customers: 15, employees: 10 }, narrative: 'You invest in platform improvements to reduce churn.' },
        { id: 'efficiency', label: 'Efficiency Focus', shortLabel: 'Efficiency', consequences: { burnRate: -0.5, grossMargin: 3 }, trustImpact: { investors: 15, employees: -10 }, narrative: 'You optimize operations and defer growth investments.' },
      ]
    },
  ],
  // Round 2: Bank Partner and Unit Economics
  [
    { id: 'r2-bank-strategy', title: 'Bank Partner Strategy', description: 'Primary bank partner signals potential exposure reduction. How do you respond?', role: 'legal',
      options: [
        { id: 'diversify', label: 'Accelerate Partner Diversification', shortLabel: 'Diversify', consequences: { cash: -5, burnRate: 0.3 }, trustImpact: { bankPartners: 20, investors: 5 }, narrative: 'You fast-track onboarding of secondary bank partners.', unlocksPath: 'multi-bank' },
        { id: 'deepen', label: 'Deepen Primary Relationship', shortLabel: 'Deepen', consequences: { cash: -2 }, trustImpact: { bankPartners: 10, investors: -5 }, narrative: 'You invest in strengthening the existing bank relationship.' },
        { id: 'wait', label: 'Monitor Situation', shortLabel: 'Wait', consequences: {}, trustImpact: { bankPartners: -5 }, narrative: 'You continue monitoring without significant action.' },
      ]
    },
    { id: 'r2-unit-economics', title: 'Unit Economics Improvement', description: 'Gross margins are under pressure. What\'s the priority?', role: 'product',
      options: [
        { id: 'automation', label: 'Ops Automation Investment', shortLabel: 'Automate', consequences: { cash: -8, grossMargin: 5, burnRate: -0.3 }, trustImpact: { employees: -10, investors: 10 }, narrative: 'You invest in automation to reduce operational costs.' },
        { id: 'pricing-power', label: 'Feature-Based Pricing Power', shortLabel: 'Features', consequences: { cash: -6, grossMargin: 3, churnRate: -1 }, trustImpact: { customers: 10 }, narrative: 'You develop premium features that justify higher pricing.' },
        { id: 'cost-pass', label: 'Pass Costs to Customers', shortLabel: 'Pass Costs', consequences: { grossMargin: 4, churnRate: 3 }, trustImpact: { customers: -20, investors: 5 }, narrative: 'You implement surcharges and adjust pricing to improve margins.' },
      ]
    },
  ],
  // Round 3: Vertical Strategy
  [
    { id: 'r3-vertical-expansion', title: 'Vertical Strategy', description: 'Healthcare and logistics verticals show opportunity. Retail is your strength.', role: 'strategy',
      options: [
        { id: 'healthcare', label: 'Expand to Healthcare', shortLabel: 'Healthcare', consequences: { cash: -15, burnRate: 0.5, arr: 0 }, trustImpact: { investors: 10, partners: -10 }, narrative: 'You invest in healthcare-specific compliance and sales.', unlocksPath: 'healthcare-vertical' },
        { id: 'deepen-retail', label: 'Dominate Retail Vertical', shortLabel: 'Retail Focus', consequences: { cash: -8, marketShare: 5, arr: 4 }, trustImpact: { customers: 15, investors: 5 }, narrative: 'You double down on retail to capture dominant position.', unlocksPath: 'retail-leader' },
        { id: 'platform', label: 'Horizontal Platform Play', shortLabel: 'Platform', consequences: { cash: -20, burnRate: 0.8 }, trustImpact: { investors: 15, partners: 10 }, narrative: 'You invest in horizontal capabilities enabling any vertical.', unlocksPath: 'platform-play' },
      ]
    },
  ],
  // Round 4: Talent and Culture
  [
    { id: 'r4-talent-retention', title: 'Talent Market Response', description: 'Compensation expectations surging. Key people receiving offers. How do you respond?', role: 'gm',
      options: [
        { id: 'match', label: 'Match Market Compensation', shortLabel: 'Match Comp', consequences: { cash: -8, burnRate: 0.4 }, trustImpact: { employees: 25, investors: -10 }, narrative: 'You increase compensation to retain critical talent.' },
        { id: 'equity', label: 'Equity-Heavy Retention', shortLabel: 'Equity', consequences: { valuation: -15 }, trustImpact: { employees: 15, investors: -5 }, narrative: 'You grant additional equity to key employees.' },
        { id: 'mission', label: 'Mission and Growth Focus', shortLabel: 'Mission', consequences: { cash: -3 }, trustImpact: { employees: 5 }, narrative: 'You invest in culture and growth opportunities rather than comp.' },
      ]
    },
    { id: 'r4-efficiency-vs-growth', title: 'Efficiency vs Growth', description: 'Board pressure mounting for clear path. What\'s the priority?', role: 'strategy',
      options: [
        { id: 'growth', label: 'Prioritize Growth Metrics', shortLabel: 'Growth', consequences: { burnRate: 0.5, arr: 5, marketShare: 3 }, trustImpact: { investors: 10 }, narrative: 'You prioritize top-line growth to demonstrate market leadership.' },
        { id: 'efficiency', label: 'Prioritize Unit Economics', shortLabel: 'Efficiency', consequences: { burnRate: -0.4, grossMargin: 4 }, trustImpact: { investors: 15, employees: -5 }, narrative: 'You focus on improving unit economics and path to profitability.' },
        { id: 'balanced', label: 'Balanced Approach', shortLabel: 'Balanced', consequences: { burnRate: 0.1, arr: 2, grossMargin: 2 }, trustImpact: { investors: 5 }, narrative: 'You attempt to deliver both growth and improving economics.' },
      ]
    },
  ],
  // Round 5: Competitive Response
  [
    { id: 'r5-competitor-response', title: 'Competitor Funding', description: 'Key competitor just raised $150M. Expect aggressive moves. How do you respond?', role: 'strategy',
      options: [
        { id: 'accelerate', label: 'Accelerate Own Fundraise', shortLabel: 'Fundraise', consequences: { cash: 40, valuation: -20, runway: 12 }, trustImpact: { investors: -10 }, narrative: 'You pursue Series C at lower valuation to match competitive resources.', unlocksPath: 'series-c' },
        { id: 'niche', label: 'Double Down on Differentiation', shortLabel: 'Differentiate', consequences: { cash: -10, marketShare: -2, grossMargin: 5 }, trustImpact: { customers: 15, partners: 10 }, narrative: 'You focus on segments where competitor can\'t compete effectively.' },
        { id: 'efficiency', label: 'Extreme Efficiency Mode', shortLabel: 'Efficiency', consequences: { burnRate: -1.0, arr: -2, marketShare: -3 }, trustImpact: { employees: -15, investors: 10 }, narrative: 'You cut costs aggressively to extend runway beyond competitor\'s patience.' },
      ]
    },
  ],
  // Round 6: M&A and Partnerships
  [
    { id: 'r6-partnership', title: 'Strategic Partnership', description: 'Major platform offers deep integration with revenue share. Requires exclusivity.', role: 'strategy',
      options: [
        { id: 'accept', label: 'Accept Partnership Terms', shortLabel: 'Accept', consequences: { arr: 8, marketShare: 5, grossMargin: -5 }, trustImpact: { partners: 30, investors: 10, customers: -10 }, narrative: 'You formalize partnership with exclusivity provisions.' },
        { id: 'negotiate', label: 'Negotiate Modified Terms', shortLabel: 'Negotiate', consequences: { arr: 3, cash: -2 }, trustImpact: { partners: 5 }, narrative: 'You push for non-exclusive arrangement with reduced benefits.' },
        { id: 'decline', label: 'Maintain Independence', shortLabel: 'Decline', consequences: { marketShare: -2 }, trustImpact: { partners: -15, investors: 5 }, narrative: 'You decline to preserve strategic flexibility.' },
      ]
    },
  ],
  // Round 7: Acquisition Decision
  [
    { id: 'r7-acquisition', title: 'Acquisition Opportunity', description: 'Smaller competitor in distress. Acquisition would add customers and technology.', role: 'gm',
      options: [
        { id: 'acquire', label: 'Acquire Competitor', shortLabel: 'Acquire', consequences: { cash: -25, customerCount: 150, arr: 6, burnRate: 0.5 }, trustImpact: { investors: 10, employees: -10 }, narrative: 'You acquire distressed competitor to consolidate market.' },
        { id: 'cherry-pick', label: 'Cherry-Pick Talent/Customers', shortLabel: 'Cherry-Pick', consequences: { cash: -5, customerCount: 40, burnRate: 0.2 }, trustImpact: { employees: 5 }, narrative: 'You hire key talent and win over departing customers.' },
        { id: 'pass', label: 'Focus on Organic Growth', shortLabel: 'Pass', consequences: {}, trustImpact: { investors: -5 }, narrative: 'You pass on acquisition to maintain focus.' },
      ]
    },
  ],
  // Round 8: Endgame
  [
    { id: 'r8-endgame', title: 'Strategic Endgame', description: 'Final strategic positioning for Series C or exit.', role: 'strategy',
      options: [
        { id: 'growth-leader', label: 'Growth at All Costs', shortLabel: 'Growth', consequences: { burnRate: 1.0, arr: 10, marketShare: 5 }, trustImpact: { investors: 15 }, narrative: 'You push for maximum growth to command premium valuation.' },
        { id: 'profitable', label: 'Path to Profitability', shortLabel: 'Profit', consequences: { burnRate: -1.5, grossMargin: 8 }, trustImpact: { investors: 20, employees: -10 }, narrative: 'You demonstrate clear path to profitability.' },
        { id: 'exit', label: 'Position for Strategic Exit', shortLabel: 'Exit', consequences: { valuation: 40 }, trustImpact: { investors: 25, employees: -5 }, narrative: 'You position company for strategic acquisition.' },
      ]
    },
  ],
];

const EVENTS: GameEvent[] = [
  { id: 'bank-partner-disruption', title: 'Bank Partner Disruption', description: 'Primary bank partner announces reduction in fintech partnerships.', category: 'regulatory', severity: 'critical', probability: 0.2,
    conditions: (s) => s.trust.bankPartners < 60, consequences: { arr: -3, churnRate: 5 }, trustImpact: { bankPartners: -25, customers: -15 } },
  { id: 'competitor-funding', title: 'Competitor Mega-Round', description: 'Key competitor announces $200M funding round.', category: 'competitive', severity: 'high', probability: 0.25,
    consequences: { marketShare: -2, valuation: -20 }, trustImpact: { investors: -10 } },
  { id: 'cfpb-action', title: 'Regulatory Action', description: 'CFPB announces investigation into embedded finance practices.', category: 'regulatory', severity: 'high', probability: 0.15,
    consequences: { cash: -5, valuation: -15 }, trustImpact: { bankPartners: -20, investors: -10 } },
  { id: 'customer-bankruptcy', title: 'Large Customer Bankruptcy', description: 'Top 10 customer enters Chapter 11.', category: 'financial', severity: 'medium', probability: 0.15,
    consequences: { arr: -2, cash: -3 }, trustImpact: { investors: -5 } },
  { id: 'key-departure', title: 'Key Executive Departure', description: 'CTO announces departure for competitor.', category: 'talent', severity: 'high', probability: 0.2,
    conditions: (s) => s.trust.employees < 65, consequences: { valuation: -10 }, trustImpact: { employees: -20, investors: -10 } },
  { id: 'platform-outage', title: 'Platform Outage', description: 'Major platform outage affects customer transactions.', category: 'technology', severity: 'critical', probability: 0.1,
    consequences: { churnRate: 5, arr: -2 }, trustImpact: { customers: -30 } },
  { id: 'pricing-war', title: 'Pricing War Escalates', description: 'Multiple competitors announce aggressive pricing moves.', category: 'competitive', severity: 'medium', probability: 0.25,
    consequences: { grossMargin: -5 }, trustImpact: { customers: 5, investors: -5 } },
  { id: 'macro-downturn', title: 'Macro Downturn', description: 'Economic indicators signal recession. Customer spending contracts.', category: 'market', severity: 'high', probability: 0.2,
    consequences: { arr: -3, churnRate: 3, valuation: -25 }, trustImpact: { investors: -15 } },
  { id: 'partnership-opportunity', title: 'Strategic Partner Approaches', description: 'Major enterprise platform seeks embedded finance partnership.', category: 'market', severity: 'low', probability: 0.25,
    conditions: (s) => s.metrics.marketShare > 12, consequences: { arr: 2 }, trustImpact: { partners: 15, investors: 5 } },
  { id: 'fraud-incident', title: 'Fraud Detection', description: 'Fraud ring detected exploiting platform. Losses contained but reputation affected.', category: 'financial', severity: 'medium', probability: 0.15,
    consequences: { cash: -4 }, trustImpact: { bankPartners: -15, customers: -10 } },
  { id: 'talent-market-shift', title: 'Talent Market Heats Up', description: 'Hyperscaler enters embedded finance, recruiting aggressively.', category: 'talent', severity: 'medium', probability: 0.2,
    consequences: { burnRate: 0.3 }, trustImpact: { employees: -15 } },
  { id: 'positive-coverage', title: 'Positive Industry Analysis', description: 'Major analyst report positions company as category leader.', category: 'market', severity: 'low', probability: 0.2,
    conditions: (s) => s.metrics.marketShare > 15, consequences: { valuation: 25, arr: 2 }, trustImpact: { investors: 15, customers: 10 } },
  { id: 'customer-concentration', title: 'Customer Renegotiation', description: 'Largest customer demands 40% price reduction or will churn.', category: 'financial', severity: 'high', probability: 0.15,
    consequences: { grossMargin: -3 }, trustImpact: { customers: -5 } },
  { id: 'new-entrant', title: 'Tech Giant Enters Market', description: 'Major technology company announces embedded finance product.', category: 'competitive', severity: 'critical', probability: 0.1,
    conditions: (s) => s.round > 4, consequences: { marketShare: -3, valuation: -30 }, trustImpact: { investors: -20 } },
];

const STRATEGIC_FORKS: StrategicFork[] = [
  { id: 'pricing-strategy', title: 'Pricing Strategy Fork', description: 'How will you compete on pricing long-term?', round: 2,
    paths: [
      { id: 'premium-positioning', name: 'Premium Positioning', description: 'Maintain pricing, compete on value and service', consequences: ['Higher margins', 'Smaller market share', 'Enterprise focus'], metricsImpact: { grossMargin: 8, marketShare: -3 }, lockedPaths: ['low-cost-leader'] },
      { id: 'low-cost-leader', name: 'Low-Cost Leader', description: 'Compete aggressively on price, win on volume', consequences: ['Lower margins', 'Higher volume', 'SMB focus'], metricsImpact: { grossMargin: -10, marketShare: 8, customerCount: 200 }, lockedPaths: ['premium-positioning'] },
    ]
  },
  { id: 'vertical-focus', title: 'Vertical Strategy Fork', description: 'How will you approach vertical expansion?', round: 4,
    paths: [
      { id: 'vertical-specialist', name: 'Vertical Specialist', description: 'Deep expertise in 1-2 verticals', consequences: ['Defensible moat', 'Limited TAM', 'Strong unit economics'], metricsImpact: { grossMargin: 10, marketShare: 5 }, lockedPaths: ['horizontal-platform'] },
      { id: 'horizontal-platform', name: 'Horizontal Platform', description: 'Generic platform serving multiple verticals', consequences: ['Larger TAM', 'More competition', 'Scale advantages'], metricsImpact: { marketShare: 10, grossMargin: -5, burnRate: 0.5 }, lockedPaths: ['vertical-specialist'] },
    ]
  },
  { id: 'growth-vs-profit', title: 'Growth vs Profitability Fork', description: 'Fundamental strategic direction for the business', round: 6,
    paths: [
      { id: 'growth-mode', name: 'Growth Mode', description: 'Prioritize growth, pursue Series C', consequences: ['Higher valuation potential', 'Dilution', 'Market leadership'], metricsImpact: { arr: 10, burnRate: 1.0, valuation: 30 }, lockedPaths: ['profit-mode'] },
      { id: 'profit-mode', name: 'Profitability Mode', description: 'Prioritize unit economics, extend runway', consequences: ['Self-sustaining', 'Slower growth', 'Independence'], metricsImpact: { burnRate: -2.0, grossMargin: 12, arr: -3 }, lockedPaths: ['growth-mode'] },
    ]
  },
];

// =============================================================================
// GAME COMPONENT
// =============================================================================

export default function MarginCallPage() {
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

    // Update runway based on burn rate
    newMetrics.runway = newMetrics.cash / newMetrics.burnRate;

    // Check for events
    const eligibleEvents = EVENTS.filter(e =>
      !gameState.triggeredEvents.includes(e.id) &&
      Math.random() < e.probability &&
      (!e.conditions || e.conditions(gameState))
    );

    const triggeredEvent = eligibleEvents.length > 0 ? eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)] : null;

    // Check for strategic forks
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

    // Check end conditions
    if (gameState.metrics.cash <= 0 || gameState.metrics.runway <= 3) {
      setGameState(prev => prev ? { ...prev, gameOver: true, endState: 'cash-out', phase: 'game-over' } : null);
      return;
    }

    if (gameState.round >= 8) {
      const score = calculateFinalScore(gameState);
      let endState = 'survival';
      if (score > 80) endState = 'growth-leader';
      else if (score > 60) endState = 'profitable-niche';
      else if (score > 40) endState = 'strategic-exit';
      else if (score < 20) endState = 'margin-death-spiral';

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
    const financialHealth = ((state.metrics.cash / 100) * 15) + ((state.metrics.arr / 50) * 15) + ((state.metrics.grossMargin / 70) * 10);
    const growthMetrics = ((state.metrics.marketShare / 30) * 15) + ((state.metrics.customerCount / 600) * 10);
    const efficiency = ((100 - state.metrics.churnRate * 5) * 0.1) + ((100 - state.metrics.burnRate * 10) * 0.1);
    const stakeholderTrust = Object.values(state.trust).reduce((a, b) => a + b, 0) / 5 * 0.15;
    return Math.min(100, Math.max(0, financialHealth + growthMetrics + efficiency + stakeholderTrust));
  };

  // Render configuration selection
  if (!gameState) {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50' : 'bg-slate-950'}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/" className={`inline-flex items-center gap-2 mb-8 ${theme === 'light' ? 'text-amber-600' : 'text-cyan-400'} hover:underline`}>
            <Home className="w-5 h-5" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${theme === 'light' ? 'bg-amber-100' : 'bg-amber-500/20'}`}>
              <BarChart3 className={`w-10 h-10 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
            </div>
            <h1 className={`text-5xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>MARGIN CALL</h1>
            <p className={`text-2xl ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>Scale-up vs. Profitability Tradeoff</p>
            <p className={`mt-4 text-lg max-w-2xl mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              You are leading PayStream, a Series B consumer fintech company in embedded payments. Navigate the fundamental tension between growth and profitability as competitors raise mega-rounds and pricing pressure mounts.
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
                    ? theme === 'light' ? 'bg-amber-100 border-2 border-amber-500' : 'bg-amber-500/20 border-2 border-amber-500'
                    : theme === 'light' ? 'bg-white border-2 border-slate-200 hover:border-amber-300' : 'bg-slate-900 border-2 border-slate-700 hover:border-amber-500/50'
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.name}</h3>
                <p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{config.description}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>ARR</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>${config.initialMetrics.arr}M</div>
                  </div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Margin</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.grossMargin}%</div>
                  </div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Runway</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.runway} mo</div>
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
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-gradient-to-r from-cyan-500 to-amber-500 text-slate-900 shadow-lg shadow-cyan-500/30'
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
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-amber-50 via-white to-orange-50' : 'bg-slate-950'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${theme === 'light' ? 'bg-white/90 border-b border-slate-200' : 'bg-slate-900/90 border-b border-slate-800'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BarChart3 className={`w-8 h-8 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
            <div>
              <h1 className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>MARGIN CALL</h1>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Round {gameState.round} of 8</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="font-medium">ARR:</span> ${gameState.metrics.arr.toFixed(0)}M
            </div>
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="font-medium">Margin:</span> {gameState.metrics.grossMargin.toFixed(0)}%
            </div>
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="font-medium">Runway:</span> {gameState.metrics.runway.toFixed(0)} mo
            </div>
            <button onClick={() => setShowRoleInfo(!showRoleInfo)} className={`p-2 rounded-lg ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800 hover:bg-slate-700'}`}>
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              {gameState.phase === 'intro' && (
                <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Welcome to PayStream</h2>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    You are leading a Series B consumer fintech company in the embedded payments space. The fundamental tension between growth and profitability defines every decision. Competitors have more capital. Pricing is under pressure. Your board is divided on strategy.
                  </p>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    <strong>Configuration:</strong> {CONFIGURATIONS[gameState.configuration].name}
                  </p>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'sensemaking' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-amber-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                    Begin Round 1 <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'sensemaking' && (
                <motion.div key="sensemaking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <currentRoleInfo.icon className={`w-8 h-8 text-${currentRoleInfo.color}-500`} />
                    <div>
                      <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Round {gameState.round}: Sensemaking Phase</h2>
                      <p className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Playing as {currentRoleInfo.title}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                    <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-amber-800' : 'text-amber-400'}`}>Private Intelligence (Role-Specific)</h3>
                    <ul className={`space-y-1 text-sm ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>
                      {currentRoleInfo.privateInfo.map((info, i) => (
                        <li key={i}>• {info}</li>
                      ))}
                    </ul>
                  </div>

                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'decisions' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-amber-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                    Proceed to Decisions <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'decisions' && (
                <motion.div key="decisions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Round {gameState.round}: Decision Phase</h2>
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
                                ? theme === 'light' ? 'bg-amber-100 border-2 border-amber-500' : 'bg-amber-500/20 border-2 border-amber-500'
                                : theme === 'light' ? 'bg-slate-50 border-2 border-slate-200 hover:border-amber-300' : 'bg-slate-800 border-2 border-slate-700 hover:border-amber-500/50'
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
                    <button onClick={applyDecisions} className={`w-full px-8 py-4 rounded-xl font-bold text-lg ${theme === 'light' ? 'bg-amber-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                      Submit Decisions <ChevronRight className="inline w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              )}

              {gameState.phase === 'event' && gameState.currentEvent && (
                <motion.div key="event" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-red-50 border-2 border-red-200' : 'bg-red-500/10 border-2 border-red-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className={`w-8 h-8 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} />
                    <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-red-800' : 'text-red-400'}`}>MARKET EVENT</h2>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentEvent.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentEvent.description}</p>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-white' : 'bg-slate-900'}`}>
                    <h4 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Impact:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(gameState.currentEvent.consequences).map(([k, v]) => (
                        <div key={k} className={v as number > 0 ? 'text-green-500' : 'text-red-500'}>
                          {k}: {v as number > 0 ? '+' : ''}{v}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleEventResolution} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}>
                    Acknowledge & Continue <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'fork' && gameState.currentFork && (
                <motion.div key="fork" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-orange-50 border-2 border-orange-200' : 'bg-orange-500/10 border-2 border-orange-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className={`w-8 h-8 ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`} />
                    <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-orange-800' : 'text-orange-400'}`}>STRATEGIC FORK</h2>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentFork.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentFork.description}</p>
                  <div className="grid gap-4">
                    {gameState.currentFork.paths.filter(p => !gameState.lockedPaths.includes(p.id)).map(path => (
                      <button
                        key={path.id}
                        onClick={() => handleForkChoice(path.id)}
                        className={`p-6 rounded-xl text-left transition-all ${theme === 'light' ? 'bg-white hover:bg-orange-50 border-2 border-orange-200' : 'bg-slate-900 hover:bg-orange-500/10 border-2 border-orange-500/30'}`}
                      >
                        <h4 className={`text-lg font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{path.name}</h4>
                        <p className={`text-sm mb-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{path.description}</p>
                        <div className={`text-xs ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`}>
                          Consequences: {path.consequences.join(' • ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {gameState.phase === 'feedback' && (
                <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Round {gameState.round} Summary</h2>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                    <h3 className={`font-bold mb-3 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Recent Narrative:</h3>
                    <ul className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      {gameState.narrativeLog.slice(-5).map((log, i) => (
                        <li key={i}>• {log}</li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={advanceRound} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-amber-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                    {gameState.round >= 8 ? 'View Final Results' : `Begin Round ${gameState.round + 1}`} <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'game-over' && (
                <motion.div key="gameover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-xl' : 'bg-slate-900'}`}>
                  <h2 className={`text-3xl font-bold mb-6 text-center ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {gameState.endState === 'cash-out' ? 'GAME OVER: Cash Exhausted' :
                     gameState.endState === 'growth-leader' ? 'VICTORY: Growth Leader' :
                     gameState.endState === 'profitable-niche' ? 'SUCCESS: Profitable Niche' :
                     gameState.endState === 'strategic-exit' ? 'SUCCESS: Strategic Exit' :
                     gameState.endState === 'margin-death-spiral' ? 'FAILURE: Margin Death Spiral' : 'Simulation Complete'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                      <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Final Metrics</h3>
                      <div className="space-y-1 text-sm">
                        <div>ARR: ${gameState.metrics.arr.toFixed(0)}M</div>
                        <div>Gross Margin: {gameState.metrics.grossMargin.toFixed(0)}%</div>
                        <div>Market Share: {gameState.metrics.marketShare.toFixed(0)}%</div>
                        <div>Valuation: ${gameState.metrics.valuation.toFixed(0)}M</div>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                      <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Stakeholder Trust</h3>
                      <div className="space-y-1 text-sm">
                        {Object.entries(gameState.trust).map(([k, v]) => (
                          <div key={k}>{k}: {v}%</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setGameState(null)} className={`px-6 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-amber-500 text-white' : 'bg-cyan-500 text-slate-900'}`}>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metrics Panel */}
            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Financial Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: 'Market Share', value: gameState.metrics.marketShare, suffix: '%', color: 'amber', max: 40 },
                  { label: 'Gross Margin', value: gameState.metrics.grossMargin, suffix: '%', color: 'emerald', max: 80 },
                  { label: 'Churn Rate', value: gameState.metrics.churnRate, suffix: '%', color: 'rose', max: 20, inverse: true },
                  { label: 'Burn Rate', value: gameState.metrics.burnRate, prefix: '$', suffix: 'M/mo', color: 'blue', max: 5 },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{metric.label}</span>
                      <span className={theme === 'light' ? 'text-slate-800' : 'text-white'}>{metric.prefix || ''}{metric.value.toFixed(1)}{metric.suffix}</span>
                    </div>
                    <div className={`h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
                      <div className={`h-full rounded-full bg-${metric.color}-500`} style={{ width: `${Math.min(100, (metric.value / metric.max) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Panel */}
            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Stakeholder Trust</h3>
              <div className="space-y-3">
                {Object.entries(gameState.trust).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`capitalize ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                <h3 className={`font-bold mb-3 ${theme === 'light' ? 'text-amber-800' : 'text-amber-400'}`}>{currentRoleInfo.title}</h3>
                <div className={`text-sm space-y-2 ${theme === 'light' ? 'text-amber-700' : 'text-amber-300'}`}>
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
