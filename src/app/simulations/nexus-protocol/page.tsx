'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Shield, TrendingUp, TrendingDown, AlertTriangle, Users, DollarSign,
  Building2, ChevronRight, ChevronLeft, BarChart3, Activity, Clock, Target,
  Briefcase, Scale, Zap, Globe, FileText, CheckCircle, XCircle, AlertCircle,
  ArrowUpRight, ArrowDownRight, Play, RotateCcw, Lock, Gavel, Eye, Settings,
  Database, Server, Cloud, Cpu, LineChart, PieChart, ArrowRight, Home,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// TYPES
// =============================================================================

type Configuration = 'first-mover' | 'regulatory-headwinds' | 'partnership-dependent' | 'international';
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
  regulatoryStanding: number;
  platformStability: number;
  customerCount: number;
  revenue: number;
  valuation: number;
}

interface StakeholderTrust {
  investors: number;
  customers: number;
  regulators: number;
  employees: number;
  partners: number;
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
  category: 'regulatory' | 'market' | 'technology' | 'talent' | 'reputation' | 'macro';
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
  'first-mover': {
    name: 'First-Mover Advantage',
    description: 'Two major hospital systems have issued RFPs with 90-day decision timelines. Win both to establish category leadership, but HITRUST certification is 6 months away.',
    initialMetrics: { cash: 127, runway: 16, marketShare: 8, regulatoryStanding: 65, platformStability: 78, customerCount: 12, revenue: 4.2, valuation: 380 },
    initialTrust: { investors: 75, customers: 70, regulators: 60, employees: 80, partners: 65 },
  },
  'regulatory-headwinds': {
    name: 'Regulatory Headwinds',
    description: 'A recent enforcement action against an adjacent company has created risk aversion. Sales cycles have extended to 12 months. You have received an informal inquiry from a state AG.',
    initialMetrics: { cash: 98, runway: 13, marketShare: 6, regulatoryStanding: 45, platformStability: 82, customerCount: 8, revenue: 3.1, valuation: 290 },
    initialTrust: { investors: 55, customers: 50, regulators: 35, employees: 70, partners: 45 },
  },
  'partnership-dependent': {
    name: 'Partnership Dependent',
    description: 'The largest hospital system offers a joint development agreement with revenue and validation—but requires 24-month exclusivity that limits your ability to serve competitors.',
    initialMetrics: { cash: 142, runway: 18, marketShare: 5, regulatoryStanding: 70, platformStability: 75, customerCount: 6, revenue: 2.8, valuation: 320 },
    initialTrust: { investors: 70, customers: 80, regulators: 65, employees: 75, partners: 85 },
  },
  'international': {
    name: 'International Expansion',
    description: 'The domestic market is saturated. The UK NHS has issued a tender for interoperability solutions. Winning would establish MedLink as a global player.',
    initialMetrics: { cash: 127, runway: 16, marketShare: 12, regulatoryStanding: 72, platformStability: 80, customerCount: 45, revenue: 8.5, valuation: 520 },
    initialTrust: { investors: 72, customers: 75, regulators: 68, employees: 78, partners: 60 },
  },
};

const ROLES: RoleInfo[] = [
  { id: 'strategy', name: 'Strategy', title: 'Chief Strategy Officer', icon: Target, color: 'violet',
    privateInfo: ['Board member has been approached by competitor', 'Venture investor needs liquidity within 24 months', 'Hyperscaler has expressed M&A interest'],
    metrics: ['Board confidence', 'Strategic clarity', 'Competitive position'], conflicts: ['Sales (growth targets)', 'Legal (risk tolerance)'] },
  { id: 'marketing', name: 'Marketing', title: 'Chief Marketing Officer', icon: LineChart, color: 'blue',
    privateInfo: ['CIOs express interest but compliance officers block', 'Industry analyst preparing critical report', 'Competitor increased marketing spend 40%'],
    metrics: ['Pipeline contribution', 'Brand awareness', 'Market positioning'], conflicts: ['Sales (lead quality)', 'Legal (claims approval)'] },
  { id: 'product', name: 'Product', title: 'Chief Product Officer', icon: Cpu, color: 'emerald',
    privateInfo: ['Critical integration held by workarounds', 'Key engineer considering departure', 'Emerging standard could obsolete architecture'],
    metrics: ['Platform reliability', 'Roadmap execution', 'Customer satisfaction'], conflicts: ['Sales (feature commitments)', 'R&D (resource allocation)'] },
  { id: 'rd', name: 'R&D', title: 'Chief Technology Officer', icon: Database, color: 'cyan',
    privateInfo: ['University research could leapfrog technology in 18 months', 'Patent application likely challenged', 'Competitor technical hiring signals pivot'],
    metrics: ['Innovation pipeline', 'Patent portfolio', 'Technical differentiation'], conflicts: ['Product (research vs development)', 'Finance (long-term investments)'] },
  { id: 'sales', name: 'Sales', title: 'Chief Revenue Officer', icon: DollarSign, color: 'amber',
    privateInfo: ['Key prospect in final negotiations with competitor', 'Current customer considering churn', 'Competitor pricing 25% below'],
    metrics: ['Quota attainment', 'Pipeline coverage', 'Win rate'], conflicts: ['Product (feature gaps)', 'Legal (contract terms)'] },
  { id: 'legal', name: 'Legal', title: 'General Counsel', icon: Gavel, color: 'rose',
    privateInfo: ['Enforcement action implications not publicly analyzed', 'Contract term creates hidden liability', 'Informal regulatory guidance received'],
    metrics: ['Compliance status', 'Litigation exposure', 'Regulatory relationships'], conflicts: ['Sales (deal terms)', 'Strategy (market entry timing)'] },
  { id: 'gm', name: 'General Management', title: 'Chief Executive Officer', icon: Building2, color: 'slate',
    privateInfo: ['Two executives have unresolved conflict', 'Employee engagement declining in engineering', 'Cash flow tighter than board realizes'],
    metrics: ['Organizational health', 'Executive alignment', 'Stakeholder confidence'], conflicts: ['All functions compete for resources'] },
];

const ROUND_DECISIONS: Decision[][] = [
  // Round 1
  [
    { id: 'r1-market-approach', title: 'Market Approach', description: 'How aggressively should we pursue the RFP opportunities?', role: 'strategy',
      options: [
        { id: 'aggressive', label: 'Aggressive Pursuit', shortLabel: 'Aggressive', consequences: { marketShare: 3, cash: -15, regulatoryStanding: -5 }, trustImpact: { investors: 10, regulators: -10 }, narrative: 'You commit significant resources to win both RFPs, stretching the team thin.' },
        { id: 'selective', label: 'Selective Targeting', shortLabel: 'Selective', consequences: { marketShare: 1, cash: -8 }, trustImpact: { investors: 5, customers: 5 }, narrative: 'You focus on the higher-probability opportunity with better fit.' },
        { id: 'conservative', label: 'Conservative Posture', shortLabel: 'Conservative', consequences: { cash: -3, regulatoryStanding: 5 }, trustImpact: { regulators: 10, investors: -5 }, narrative: 'You prioritize compliance readiness over immediate growth.' },
      ]
    },
    { id: 'r1-compliance-investment', title: 'Compliance Investment', description: 'How much should we invest in accelerating HITRUST certification?', role: 'legal',
      options: [
        { id: 'fast-track', label: 'Fast-Track Certification', shortLabel: 'Fast-Track', consequences: { cash: -12, regulatoryStanding: 15, runway: -1 }, trustImpact: { regulators: 15, customers: 10 }, narrative: 'You bring in external consultants to accelerate the certification timeline.' },
        { id: 'standard', label: 'Standard Timeline', shortLabel: 'Standard', consequences: { cash: -5, regulatoryStanding: 8 }, trustImpact: { regulators: 5 }, narrative: 'You maintain the planned certification path without acceleration.' },
        { id: 'defer', label: 'Defer Certification', shortLabel: 'Defer', consequences: { regulatoryStanding: -10, cash: 5 }, trustImpact: { regulators: -15, investors: 5 }, narrative: 'You redirect certification resources to product development.' },
      ]
    },
  ],
  // Round 2
  [
    { id: 'r2-platform-investment', title: 'Platform Architecture', description: 'Technical assessment reveals scalability limits. How do you respond?', role: 'product',
      options: [
        { id: 'incremental', label: 'Incremental Optimization', shortLabel: 'Incremental', consequences: { platformStability: 5, cash: -8 }, trustImpact: { customers: 5 }, narrative: 'You optimize the current architecture to extend its limits.' },
        { id: 'rearchitect', label: 'Full Re-architecture', shortLabel: 'Re-architect', consequences: { platformStability: -10, cash: -25, runway: -2 }, trustImpact: { employees: 10, customers: -5 }, narrative: 'You begin a comprehensive platform rebuild.' },
        { id: 'hybrid', label: 'Hybrid Approach', shortLabel: 'Hybrid', consequences: { platformStability: 0, cash: -35, runway: -3 }, trustImpact: { employees: 5 }, narrative: 'You pursue parallel development of new platform while maintaining current.' },
      ]
    },
    { id: 'r2-sales-strategy', title: 'Pricing Response', description: 'Competitor has slashed prices 25%. How do you respond?', role: 'sales',
      options: [
        { id: 'match', label: 'Match Pricing', shortLabel: 'Match', consequences: { revenue: -1.2, marketShare: 2 }, trustImpact: { customers: 10, investors: -10 }, narrative: 'You reduce prices to remain competitive.' },
        { id: 'value', label: 'Emphasize Value', shortLabel: 'Value', consequences: { revenue: 0.5, marketShare: -1 }, trustImpact: { customers: -5, investors: 5 }, narrative: 'You maintain pricing and invest in demonstrating superior value.' },
        { id: 'segment', label: 'Segmented Pricing', shortLabel: 'Segment', consequences: { revenue: -0.3, marketShare: 1 }, trustImpact: { customers: 5 }, narrative: 'You create tiered pricing for different customer segments.' },
      ]
    },
  ],
  // Rounds 3-8 follow similar pattern...
  [
    { id: 'r3-regulatory-response', title: 'Regulatory Engagement', description: 'A state AG announces investigation into health data practices. How do you respond?', role: 'legal',
      options: [
        { id: 'proactive', label: 'Proactive Cooperation', shortLabel: 'Proactive', consequences: { cash: -8, regulatoryStanding: 20 }, trustImpact: { regulators: 25, investors: -5 }, narrative: 'You voluntarily contact the AG and offer to serve as industry model.', unlocksPath: 'regulatory-leader' },
        { id: 'defensive', label: 'Defensive Posture', shortLabel: 'Defensive', consequences: { regulatoryStanding: -5 }, trustImpact: { regulators: -10 }, narrative: 'You maintain current practices and monitor the investigation.' },
        { id: 'coalition', label: 'Industry Coalition', shortLabel: 'Coalition', consequences: { cash: -4, regulatoryStanding: 10 }, trustImpact: { regulators: 10, partners: 15 }, narrative: 'You form an industry association to respond collectively.', locksPath: 'regulatory-leader' },
      ]
    },
  ],
  [
    { id: 'r4-talent-crisis', title: 'Talent Retention', description: 'Key technical talent is being recruited by competitors. How do you respond?', role: 'gm',
      options: [
        { id: 'compensation', label: 'Compensation Match', shortLabel: 'Match Comp', consequences: { cash: -10, runway: -1 }, trustImpact: { employees: 20 }, narrative: 'You increase compensation to retain critical talent.' },
        { id: 'equity', label: 'Equity Refresh', shortLabel: 'Equity', consequences: { valuation: -20 }, trustImpact: { employees: 15, investors: -5 }, narrative: 'You grant additional equity to key employees.' },
        { id: 'culture', label: 'Culture Investment', shortLabel: 'Culture', consequences: { cash: -5 }, trustImpact: { employees: 10 }, narrative: 'You invest in mission and culture to improve retention.' },
      ]
    },
  ],
  [
    { id: 'r5-expansion', title: 'Market Expansion', description: 'International and upmarket opportunities emerge. Where do you focus?', role: 'strategy',
      options: [
        { id: 'international', label: 'International (UK NHS)', shortLabel: 'International', consequences: { cash: -30, runway: -3, marketShare: 0 }, trustImpact: { investors: 10, partners: -10 }, narrative: 'You pursue the NHS tender and establish UK operations.', unlocksPath: 'global-player' },
        { id: 'upmarket', label: 'Upmarket (Top-20 Health Systems)', shortLabel: 'Upmarket', consequences: { cash: -20, runway: -2, revenue: 2 }, trustImpact: { customers: 15, investors: 10 }, narrative: 'You build enterprise sales capability for large health systems.', unlocksPath: 'enterprise-leader' },
        { id: 'deepen', label: 'Deepen Current Market', shortLabel: 'Deepen', consequences: { cash: -10, marketShare: 3, revenue: 1 }, trustImpact: { customers: 10 }, narrative: 'You optimize and capture remaining mid-market opportunity.' },
      ]
    },
  ],
  [
    { id: 'r6-partnership', title: 'Partnership Opportunity', description: 'A hyperscaler approaches about deep integration partnership. Terms require data sharing.', role: 'strategy',
      options: [
        { id: 'accept', label: 'Accept Partnership', shortLabel: 'Accept', consequences: { revenue: 3, marketShare: 5, regulatoryStanding: -10 }, trustImpact: { partners: 25, regulators: -15, investors: 15 }, narrative: 'You formalize the partnership with data sharing provisions.' },
        { id: 'negotiate', label: 'Negotiate Terms', shortLabel: 'Negotiate', consequences: { cash: -3 }, trustImpact: { partners: 5 }, narrative: 'You push back on data sharing terms and seek alternatives.' },
        { id: 'decline', label: 'Decline Partnership', shortLabel: 'Decline', consequences: { marketShare: -2 }, trustImpact: { partners: -15, regulators: 10 }, narrative: 'You maintain independence and decline the partnership.' },
      ]
    },
  ],
  [
    { id: 'r7-ma', title: 'M&A Decision', description: 'A larger player has made a serious acquisition offer at 4x revenue.', role: 'gm',
      options: [
        { id: 'engage', label: 'Engage Seriously', shortLabel: 'Engage', consequences: {}, trustImpact: { investors: 20, employees: -15 }, narrative: 'You enter formal M&A discussions with board approval.' },
        { id: 'leverage', label: 'Use as Leverage', shortLabel: 'Leverage', consequences: { valuation: 30 }, trustImpact: { investors: 10 }, narrative: 'You use the offer to strengthen negotiating position with other investors.' },
        { id: 'decline', label: 'Decline Offer', shortLabel: 'Decline', consequences: {}, trustImpact: { employees: 10, investors: -10 }, narrative: 'You commit to independent path and decline discussions.' },
      ]
    },
  ],
  [
    { id: 'r8-endgame', title: 'Strategic Direction', description: 'Final strategic positioning decision for the company.', role: 'strategy',
      options: [
        { id: 'growth', label: 'Maximize Growth', shortLabel: 'Growth', consequences: { cash: -20, marketShare: 5 }, trustImpact: { investors: 15 }, narrative: 'You push for maximum market share regardless of profitability.' },
        { id: 'profit', label: 'Path to Profitability', shortLabel: 'Profit', consequences: { revenue: 2, cash: 10 }, trustImpact: { investors: 10, employees: -5 }, narrative: 'You optimize for near-term profitability and sustainability.' },
        { id: 'position', label: 'Strategic Positioning', shortLabel: 'Position', consequences: { valuation: 50 }, trustImpact: { investors: 20, partners: 10 }, narrative: 'You position for premium exit or IPO.' },
      ]
    },
  ],
];

const EVENTS: GameEvent[] = [
  { id: 'enforcement-action', title: 'Regulatory Enforcement', description: 'A competitor receives enforcement action for similar practices.', category: 'regulatory', severity: 'high', probability: 0.3,
    conditions: (s) => s.metrics.regulatoryStanding < 60, consequences: { regulatoryStanding: -10 }, trustImpact: { regulators: -15, customers: -10 } },
  { id: 'data-breach-customer', title: 'Customer Data Breach', description: 'A customer experiences a breach through adjacent systems.', category: 'reputation', severity: 'critical', probability: 0.15,
    conditions: (s) => s.metrics.platformStability < 70, consequences: { revenue: -2, marketShare: -3 }, trustImpact: { customers: -25, regulators: -20 } },
  { id: 'key-departure', title: 'Key Executive Departure', description: 'A critical executive departs unexpectedly.', category: 'talent', severity: 'medium', probability: 0.2,
    conditions: (s) => s.trust.employees < 60, consequences: { platformStability: -8 }, trustImpact: { employees: -15, investors: -10 } },
  { id: 'competitor-acquisition', title: 'Competitor Acquired', description: 'A major tech company acquires one of your direct competitors.', category: 'market', severity: 'high', probability: 0.25,
    consequences: { marketShare: -2, valuation: 40 }, trustImpact: { investors: 10 } },
  { id: 'favorable-regulation', title: 'Favorable Regulatory Development', description: 'Regulators issue guidance validating your technical approach.', category: 'regulatory', severity: 'medium', probability: 0.2,
    conditions: (s) => s.metrics.regulatoryStanding > 70, consequences: { regulatoryStanding: 15, marketShare: 2 }, trustImpact: { regulators: 20, customers: 15 } },
  { id: 'customer-bankruptcy', title: 'Customer Bankruptcy', description: 'A significant customer enters financial distress.', category: 'market', severity: 'medium', probability: 0.15,
    consequences: { revenue: -1.5, cash: -5 }, trustImpact: { investors: -5 } },
  { id: 'tech-disruption', title: 'Technology Disruption', description: 'Research reveals technology that could obsolete your core approach.', category: 'technology', severity: 'high', probability: 0.1,
    conditions: (s) => s.round > 5, consequences: { valuation: -50, platformStability: -10 }, trustImpact: { investors: -20 } },
  { id: 'talent-market-shift', title: 'Talent Market Shift', description: 'Compensation expectations surge due to competitor funding.', category: 'talent', severity: 'medium', probability: 0.25,
    consequences: { cash: -8 }, trustImpact: { employees: -10 } },
  { id: 'partnership-opportunity', title: 'Strategic Partnership', description: 'An important partner approaches about collaboration.', category: 'market', severity: 'low', probability: 0.3,
    conditions: (s) => s.metrics.marketShare > 10, consequences: { revenue: 1 }, trustImpact: { partners: 15 } },
  { id: 'activist-interest', title: 'Activist Investor Interest', description: 'An activist investor signals interest in your company.', category: 'market', severity: 'medium', probability: 0.15,
    conditions: (s) => s.metrics.valuation > 400, consequences: {}, trustImpact: { investors: -10 } },
  { id: 'macro-shock', title: 'Macroeconomic Shock', description: 'Interest rate changes affect funding environment.', category: 'macro', severity: 'high', probability: 0.2,
    consequences: { runway: -2, valuation: -30 }, trustImpact: { investors: -15 } },
  { id: 'security-incident', title: 'Security Incident', description: 'Your own systems experience a security incident.', category: 'technology', severity: 'critical', probability: 0.1,
    conditions: (s) => s.metrics.platformStability < 65, consequences: { regulatoryStanding: -20, marketShare: -3 }, trustImpact: { customers: -30, regulators: -25 } },
  { id: 'whistleblower', title: 'Whistleblower Complaint', description: 'An employee files a compliance complaint.', category: 'regulatory', severity: 'high', probability: 0.1,
    conditions: (s) => s.trust.employees < 50, consequences: { regulatoryStanding: -15 }, trustImpact: { regulators: -20, employees: -10 } },
  { id: 'positive-press', title: 'Positive Press Coverage', description: 'Major publication profiles company favorably.', category: 'reputation', severity: 'low', probability: 0.25,
    conditions: (s) => s.metrics.marketShare > 8, consequences: { marketShare: 1, valuation: 20 }, trustImpact: { customers: 10, investors: 10 } },
];

const STRATEGIC_FORKS: StrategicFork[] = [
  { id: 'regulatory-posture', title: 'Regulatory Engagement Strategy', description: 'How will you position the company relative to regulators?', round: 3,
    paths: [
      { id: 'regulatory-leader', name: 'Compliance Leader', description: 'Position as industry model for regulatory compliance', consequences: ['Higher compliance costs', 'Stronger regulatory relationships', 'Slower time-to-market'], metricsImpact: { regulatoryStanding: 25, cash: -15 }, lockedPaths: ['regulatory-minimal'] },
      { id: 'regulatory-minimal', name: 'Minimal Compliance', description: 'Meet requirements without exceeding them', consequences: ['Lower costs', 'Regulatory risk exposure', 'Faster execution'], metricsImpact: { cash: 10, regulatoryStanding: -15 }, lockedPaths: ['regulatory-leader'] },
    ]
  },
  { id: 'platform-strategy', title: 'Platform Architecture Decision', description: 'Fundamental technology direction for the platform', round: 4,
    paths: [
      { id: 'platform-rebuild', name: 'Full Rebuild', description: 'Comprehensive re-architecture for long-term scalability', consequences: ['Short-term slowdown', 'Long-term advantages', 'Engineering investment'], metricsImpact: { platformStability: 30, cash: -40, runway: -4 }, lockedPaths: ['platform-optimize'] },
      { id: 'platform-optimize', name: 'Optimize Current', description: 'Incremental improvements to existing platform', consequences: ['Faster iteration', 'Technical debt accumulation', 'Near-term stability'], metricsImpact: { platformStability: 10, cash: -10 }, lockedPaths: ['platform-rebuild'] },
    ]
  },
  { id: 'market-focus', title: 'Market Expansion Strategy', description: 'Where will you focus growth efforts?', round: 5,
    paths: [
      { id: 'global-player', name: 'International Expansion', description: 'Pursue UK NHS and establish global presence', consequences: ['Geographic diversification', 'Operational complexity', 'New regulatory requirements'], metricsImpact: { marketShare: 5, cash: -35, regulatoryStanding: -10 }, lockedPaths: ['enterprise-leader', 'market-defender'] },
      { id: 'enterprise-leader', name: 'Enterprise Focus', description: 'Capture top-tier US health systems', consequences: ['High-value customers', 'Long sales cycles', 'Premium positioning'], metricsImpact: { revenue: 5, cash: -25 }, lockedPaths: ['global-player', 'market-defender'] },
      { id: 'market-defender', name: 'Market Deepening', description: 'Dominate current mid-market segment', consequences: ['Operational efficiency', 'Limited TAM', 'Strong unit economics'], metricsImpact: { marketShare: 8, revenue: 3, cash: -15 }, lockedPaths: ['global-player', 'enterprise-leader'] },
    ]
  },
];

// =============================================================================
// GAME COMPONENT
// =============================================================================

export default function NexusProtocolPage() {
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
    if (gameState.metrics.cash <= 0 || gameState.metrics.runway <= 0) {
      setGameState(prev => prev ? { ...prev, gameOver: true, endState: 'bankruptcy', phase: 'game-over' } : null);
      return;
    }

    if (gameState.round >= 8) {
      // Calculate final score
      const score = calculateFinalScore(gameState);
      let endState = 'survival';
      if (score > 80) endState = 'category-leader';
      else if (score > 60) endState = 'profitable-niche';
      else if (score > 40) endState = 'strategic-exit';
      else if (score < 20) endState = 'zombie-company';

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
    const financialHealth = ((state.metrics.cash / 150) * 25) + ((state.metrics.revenue / 15) * 25);
    const strategicPosition = ((state.metrics.marketShare / 20) * 25) + ((state.metrics.valuation / 600) * 25);
    const resilience = ((state.trust.employees / 100) * 20) + ((state.metrics.platformStability / 100) * 20);
    const stakeholderTrust = Object.values(state.trust).reduce((a, b) => a + b, 0) / 5 * 0.15;
    const optionality = (state.activeForks.length * 5) + ((100 - state.lockedPaths.length * 10) * 0.15);
    return Math.min(100, Math.max(0, financialHealth + strategicPosition + resilience + stakeholderTrust + optionality));
  };

  // Render configuration selection
  if (!gameState) {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-violet-50 via-white to-blue-50' : 'bg-slate-950'}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/" className={`inline-flex items-center gap-2 mb-8 ${theme === 'light' ? 'text-violet-600' : 'text-cyan-400'} hover:underline`}>
            <Home className="w-5 h-5" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${theme === 'light' ? 'bg-violet-100' : 'bg-violet-500/20'}`}>
              <Network className={`w-10 h-10 ${theme === 'light' ? 'text-violet-600' : 'text-violet-400'}`} />
            </div>
            <h1 className={`text-5xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>NEXUS PROTOCOL</h1>
            <p className={`text-2xl ${theme === 'light' ? 'text-violet-600' : 'text-violet-400'}`}>Platform Launch Under Regulatory Uncertainty</p>
            <p className={`mt-4 text-lg max-w-2xl mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              You are leading MedLink Technologies, a Series C healthcare data platform company. Navigate regulatory complexity, competitive pressure, and stakeholder demands across 8 rounds of strategic decision-making.
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
                    ? theme === 'light' ? 'bg-violet-100 border-2 border-violet-500' : 'bg-violet-500/20 border-2 border-violet-500'
                    : theme === 'light' ? 'bg-white border-2 border-slate-200 hover:border-violet-300' : 'bg-slate-900 border-2 border-slate-700 hover:border-violet-500/50'
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.name}</h3>
                <p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{config.description}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Cash</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>${config.initialMetrics.cash}M</div>
                  </div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Runway</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.runway} mo</div>
                  </div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Reg. Standing</div>
                    <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.regulatoryStanding}%</div>
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
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
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

  // Main game UI
  const currentRoleInfo = ROLES.find(r => r.id === gameState.currentRole)!;
  const roundDecisions = ROUND_DECISIONS[gameState.round - 1] || [];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-violet-50 via-white to-blue-50' : 'bg-slate-950'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${theme === 'light' ? 'bg-white/90 border-b border-slate-200' : 'bg-slate-900/90 border-b border-slate-800'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Network className={`w-8 h-8 ${theme === 'light' ? 'text-violet-600' : 'text-violet-400'}`} />
            <div>
              <h1 className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>NEXUS PROTOCOL</h1>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Round {gameState.round} of 8</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="font-medium">Cash:</span> ${gameState.metrics.cash.toFixed(0)}M
            </div>
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className="font-medium">Runway:</span> {gameState.metrics.runway.toFixed(0)} months
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
            {/* Phase Content */}
            <AnimatePresence mode="wait">
              {gameState.phase === 'intro' && (
                <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Welcome to MedLink Technologies</h2>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    You are leading a Series C healthcare data platform company navigating the complex intersection of technology innovation, regulatory compliance, and market dynamics. Your decisions will shape the company's trajectory over the next 8 quarters.
                  </p>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    <strong>Configuration:</strong> {CONFIGURATIONS[gameState.configuration].name}
                  </p>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'sensemaking' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-violet-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>
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

                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'decisions' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-violet-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>
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
                                ? theme === 'light' ? 'bg-violet-100 border-2 border-violet-500' : 'bg-violet-500/20 border-2 border-violet-500'
                                : theme === 'light' ? 'bg-slate-50 border-2 border-slate-200 hover:border-violet-300' : 'bg-slate-800 border-2 border-slate-700 hover:border-violet-500/50'
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
                    <button onClick={applyDecisions} className={`w-full px-8 py-4 rounded-xl font-bold text-lg ${theme === 'light' ? 'bg-violet-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                      Submit Decisions <ChevronRight className="inline w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              )}

              {gameState.phase === 'event' && gameState.currentEvent && (
                <motion.div key="event" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-red-50 border-2 border-red-200' : 'bg-red-500/10 border-2 border-red-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className={`w-8 h-8 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} />
                    <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-red-800' : 'text-red-400'}`}>EMERGENT EVENT</h2>
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
                <motion.div key="fork" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-purple-50 border-2 border-purple-200' : 'bg-purple-500/10 border-2 border-purple-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className={`w-8 h-8 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
                    <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-purple-800' : 'text-purple-400'}`}>STRATEGIC FORK</h2>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentFork.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentFork.description}</p>
                  <div className="grid gap-4">
                    {gameState.currentFork.paths.filter(p => !gameState.lockedPaths.includes(p.id)).map(path => (
                      <button
                        key={path.id}
                        onClick={() => handleForkChoice(path.id)}
                        className={`p-6 rounded-xl text-left transition-all ${theme === 'light' ? 'bg-white hover:bg-purple-50 border-2 border-purple-200' : 'bg-slate-900 hover:bg-purple-500/10 border-2 border-purple-500/30'}`}
                      >
                        <h4 className={`text-lg font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{path.name}</h4>
                        <p className={`text-sm mb-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{path.description}</p>
                        <div className={`text-xs ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
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
                  <button onClick={advanceRound} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-violet-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>
                    {gameState.round >= 8 ? 'View Final Results' : `Begin Round ${gameState.round + 1}`} <ChevronRight className="inline w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {gameState.phase === 'game-over' && (
                <motion.div key="gameover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-xl' : 'bg-slate-900'}`}>
                  <h2 className={`text-3xl font-bold mb-6 text-center ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {gameState.endState === 'bankruptcy' ? 'GAME OVER: Bankruptcy' :
                     gameState.endState === 'category-leader' ? 'VICTORY: Category Leader' :
                     gameState.endState === 'profitable-niche' ? 'SUCCESS: Profitable Niche' :
                     gameState.endState === 'strategic-exit' ? 'SUCCESS: Strategic Exit' :
                     gameState.endState === 'zombie-company' ? 'FAILURE: Zombie Company' : 'Simulation Complete'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                      <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Final Metrics</h3>
                      <div className="space-y-1 text-sm">
                        <div>Cash: ${gameState.metrics.cash.toFixed(0)}M</div>
                        <div>Revenue: ${gameState.metrics.revenue.toFixed(1)}M/quarter</div>
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
                    <button onClick={() => setGameState(null)} className={`px-6 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-violet-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>
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
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Company Metrics</h3>
              <div className="space-y-3">
                {[
                  { label: 'Market Share', value: gameState.metrics.marketShare, suffix: '%', color: 'violet' },
                  { label: 'Regulatory Standing', value: gameState.metrics.regulatoryStanding, suffix: '%', color: 'emerald' },
                  { label: 'Platform Stability', value: gameState.metrics.platformStability, suffix: '%', color: 'blue' },
                  { label: 'Valuation', value: gameState.metrics.valuation, prefix: '$', suffix: 'M', color: 'amber' },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{metric.label}</span>
                      <span className={theme === 'light' ? 'text-slate-800' : 'text-white'}>{metric.prefix || ''}{metric.value.toFixed(0)}{metric.suffix}</span>
                    </div>
                    <div className={`h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
                      <div className={`h-full rounded-full bg-${metric.color}-500`} style={{ width: `${Math.min(100, metric.value)}%` }} />
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

            {/* Role Info */}
            {showRoleInfo && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-violet-50 border border-violet-200' : 'bg-violet-500/10 border border-violet-500/30'}`}>
                <h3 className={`font-bold mb-3 ${theme === 'light' ? 'text-violet-800' : 'text-violet-400'}`}>{currentRoleInfo.title}</h3>
                <div className={`text-sm space-y-2 ${theme === 'light' ? 'text-violet-700' : 'text-violet-300'}`}>
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
