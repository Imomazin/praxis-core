'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Users, DollarSign, Building2, ChevronRight, Target, Scale, Play,
  RotateCcw, Eye, Home, Cloud, Server, Share2, Link2, Unplug, Plug, GitBranch,
  Shield, Lock, Unlock, Network, Boxes, ArrowLeftRight, Workflow, Globe,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// TYPES
// =============================================================================

type Configuration = 'platform-favorite' | 'platform-threat' | 'multi-platform' | 'direct-channel';
type Role = 'strategy' | 'partnerships' | 'product' | 'sales' | 'legal' | 'engineering' | 'gm';
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
  arr: number;
  marketplaceRevenue: number;
  directRevenue: number;
  platformDependency: number;
  productDifferentiation: number;
  customerRetention: number;
  partnerTier: number;
  technicalDebt: number;
}

interface StakeholderTrust {
  awsPartner: number;
  azurePartner: number;
  gcpPartner: number;
  customers: number;
  employees: number;
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
  category: 'platform' | 'competitive' | 'market' | 'technology' | 'regulatory';
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
  'platform-favorite': {
    name: 'Platform Favorite',
    description: 'Strong relationship with AWS who is investing in co-marketing. Deepening could accelerate growth but increases single-platform dependency.',
    initialMetrics: { arr: 156, marketplaceRevenue: 114, directRevenue: 42, platformDependency: 73, productDifferentiation: 65, customerRetention: 88, partnerTier: 3, technicalDebt: 25 },
    initialTrust: { awsPartner: 85, azurePartner: 40, gcpPartner: 35, customers: 78, employees: 75, investors: 72 },
  },
  'platform-threat': {
    name: 'Platform Threat',
    description: 'AWS has announced native capabilities overlapping your core product. Competitive dynamics are shifting. Must find differentiation or face margin compression.',
    initialMetrics: { arr: 156, marketplaceRevenue: 105, directRevenue: 51, platformDependency: 67, productDifferentiation: 45, customerRetention: 82, partnerTier: 2, technicalDebt: 35 },
    initialTrust: { awsPartner: 50, azurePartner: 55, gcpPartner: 50, customers: 72, employees: 70, investors: 65 },
  },
  'multi-platform': {
    name: 'Multi-Platform Complexity',
    description: 'Operating across all three clouds but lacking deep relationship with any. Breadth creates operational complexity without partnership benefits.',
    initialMetrics: { arr: 156, marketplaceRevenue: 95, directRevenue: 61, platformDependency: 55, productDifferentiation: 55, customerRetention: 80, partnerTier: 1, technicalDebt: 45 },
    initialTrust: { awsPartner: 55, azurePartner: 55, gcpPartner: 55, customers: 75, employees: 68, investors: 70 },
  },
  'direct-channel': {
    name: 'Direct Channel Opportunity',
    description: 'Enterprise customers expressing interest in direct relationships. Building direct channel reduces platform dependency but requires significant investment.',
    initialMetrics: { arr: 156, marketplaceRevenue: 78, directRevenue: 78, platformDependency: 50, productDifferentiation: 70, customerRetention: 85, partnerTier: 2, technicalDebt: 30 },
    initialTrust: { awsPartner: 60, azurePartner: 58, gcpPartner: 55, customers: 82, employees: 78, investors: 75 },
  },
};

const ROLES: RoleInfo[] = [
  { id: 'strategy', name: 'Strategy', title: 'Chief Strategy Officer', icon: Target, color: 'violet',
    privateInfo: ['AWS considering acquisition of companies like CloudBridge', 'Azure prepared to offer favorable partner terms if exclusive', 'Platform dependency reducing acquisition premium'],
    metrics: ['Platform strategy', 'Channel mix', 'Strategic independence'], conflicts: ['Partnerships (exclusivity)', 'Sales (channel prioritization)'] },
  { id: 'partnerships', name: 'Partnerships', title: 'VP Partnerships', icon: Share2, color: 'blue',
    privateInfo: ['AWS partner manager hinting at tier upgrade requirements', 'Azure offering $2M co-marketing if exclusive', 'GCP partner program restructuring coming'],
    metrics: ['Partner tier', 'Co-sell pipeline', 'Partner satisfaction'], conflicts: ['Strategy (independence)', 'Product (integration scope)'] },
  { id: 'product', name: 'Product', title: 'Chief Product Officer', icon: Boxes, color: 'emerald',
    privateInfo: ['AWS building feature that directly competes with core module', 'Platform APIs changing—3 months to migrate', 'Multi-cloud architecture doubles maintenance cost'],
    metrics: ['Product differentiation', 'Platform integration', 'Technical independence'], conflicts: ['Partnerships (feature gaps)', 'Engineering (debt management)'] },
  { id: 'sales', name: 'Sales', title: 'Chief Revenue Officer', icon: DollarSign, color: 'amber',
    privateInfo: ['Top 10 customer wants direct contract off marketplace', 'Platform sales team undermining deals for native features', 'Enterprise segment has 2x better margins via direct'],
    metrics: ['Revenue mix', 'Deal size', 'Win rate'], conflicts: ['Partnerships (channel conflict)', 'Finance (margin impact)'] },
  { id: 'legal', name: 'Legal', title: 'General Counsel', icon: Scale, color: 'rose',
    privateInfo: ['Platform terms changing unfavorably in next revision', 'API agreement includes non-compete clause implications', 'Customer contracts require platform availability guarantees'],
    metrics: ['Contract terms', 'Risk management', 'Regulatory compliance'], conflicts: ['Partnerships (terms negotiation)', 'Sales (contract flexibility)'] },
  { id: 'engineering', name: 'Engineering', title: 'VP Engineering', icon: Server, color: 'cyan',
    privateInfo: ['Platform SDK lock-in growing—45% of codebase platform-specific', 'Multi-cloud abstraction layer needed—6 month project', 'Key engineers frustrated with platform-driven roadmap'],
    metrics: ['Technical architecture', 'Platform integration', 'Engineering velocity'], conflicts: ['Product (feature vs infrastructure)', 'Partnerships (integration demands)'] },
  { id: 'gm', name: 'General Management', title: 'Chief Executive Officer', icon: Building2, color: 'slate',
    privateInfo: ['Board concerned about platform dependency in due diligence', 'Strategic acquirer values direct customer relationships higher', 'Platform revenue share increasing next year'],
    metrics: ['Company independence', 'Strategic optionality', 'Stakeholder alignment'], conflicts: ['All functions have different platform views'] },
];

const ROUND_DECISIONS: Decision[][] = [
  // Round 1: Platform Prioritization
  [
    { id: 'r1-platform-focus', title: 'Platform Prioritization', description: 'With limited resources, how do you prioritize platform relationships?', role: 'strategy',
      options: [
        { id: 'aws-deep', label: 'Deepen AWS Relationship', shortLabel: 'AWS Deep', consequences: { platformDependency: 15, partnerTier: 1, marketplaceRevenue: 20 }, trustImpact: { awsPartner: 25, azurePartner: -15, gcpPartner: -15 }, narrative: 'You invest heavily in AWS partnership and integration.' },
        { id: 'diversify', label: 'Diversify Across Platforms', shortLabel: 'Diversify', consequences: { platformDependency: -10, technicalDebt: 10 }, trustImpact: { awsPartner: -10, azurePartner: 10, gcpPartner: 10 }, narrative: 'You invest in multi-cloud capabilities and partnerships.' },
        { id: 'direct-focus', label: 'Prioritize Direct Sales', shortLabel: 'Direct', consequences: { directRevenue: 15, marketplaceRevenue: -10, platformDependency: -15 }, trustImpact: { customers: 15, awsPartner: -20 }, narrative: 'You shift investment toward direct customer relationships.' },
      ]
    },
    { id: 'r1-integration-depth', title: 'Integration Depth', description: 'How deep should platform integration be?', role: 'product',
      options: [
        { id: 'native', label: 'Deep Native Integration', shortLabel: 'Native', consequences: { productDifferentiation: -10, platformDependency: 20, customerRetention: 10 }, trustImpact: { awsPartner: 20 }, narrative: 'You deeply integrate with platform-native services.' },
        { id: 'abstracted', label: 'Abstraction Layer', shortLabel: 'Abstract', consequences: { technicalDebt: 15, platformDependency: -15 }, trustImpact: { awsPartner: -10 }, narrative: 'You build abstraction layer for multi-cloud portability.' },
        { id: 'minimal', label: 'Minimal Integration', shortLabel: 'Minimal', consequences: { productDifferentiation: 15, platformDependency: -10, partnerTier: -1 }, trustImpact: { awsPartner: -15, customers: 10 }, narrative: 'You maintain loose coupling with platform services.' },
      ]
    },
  ],
  // Round 2: Competitive Response
  [
    { id: 'r2-competition', title: 'Platform Competition Response', description: 'Platform announces feature competing with your core product. How do you respond?', role: 'product',
      options: [
        { id: 'differentiate', label: 'Accelerate Differentiation', shortLabel: 'Differentiate', consequences: { productDifferentiation: 20, technicalDebt: -10 }, trustImpact: { customers: 15, investors: 10 }, narrative: 'You invest in unique capabilities platforms cannot replicate.' },
        { id: 'complement', label: 'Position as Complement', shortLabel: 'Complement', consequences: { productDifferentiation: -5, platformDependency: 10 }, trustImpact: { awsPartner: 15 }, narrative: 'You reposition product as complementary to platform capabilities.' },
        { id: 'alternative', label: 'Pivot to Alternatives', shortLabel: 'Alternative', consequences: { platformDependency: -20, arr: -10 }, trustImpact: { awsPartner: -25, azurePartner: 15, gcpPartner: 15 }, narrative: 'You reduce reliance on competing platform.' },
      ]
    },
  ],
  // Round 3: Partnership Terms
  [
    { id: 'r3-exclusivity', title: 'Exclusivity Negotiation', description: 'Azure offers significant co-marketing investment for exclusivity. AWS counters with premier partner tier.', role: 'partnerships',
      options: [
        { id: 'aws-exclusive', label: 'Accept AWS Premier Tier', shortLabel: 'AWS', consequences: { partnerTier: 2, marketplaceRevenue: 25, platformDependency: 20 }, trustImpact: { awsPartner: 30, azurePartner: -30, gcpPartner: -20 }, narrative: 'You commit to AWS with exclusivity provisions.' },
        { id: 'azure-switch', label: 'Accept Azure Offer', shortLabel: 'Azure', consequences: { marketplaceRevenue: 15, platformDependency: 15 }, trustImpact: { awsPartner: -35, azurePartner: 35, gcpPartner: -10 }, narrative: 'You shift primary partnership to Azure.' },
        { id: 'negotiate-both', label: 'Negotiate Non-Exclusive Terms', shortLabel: 'Non-Exclusive', consequences: { partnerTier: -1 }, trustImpact: { awsPartner: -10, azurePartner: -10 }, narrative: 'You maintain multi-cloud positioning despite partner pressure.' },
      ]
    },
  ],
  // Round 4: Channel Strategy
  [
    { id: 'r4-channel', title: 'Channel Mix Strategy', description: 'Enterprise customers demand direct contracts. Platform partners want marketplace-only.', role: 'sales',
      options: [
        { id: 'marketplace-first', label: 'Marketplace First', shortLabel: 'Marketplace', consequences: { marketplaceRevenue: 20, directRevenue: -15, platformDependency: 15 }, trustImpact: { awsPartner: 20, customers: -15 }, narrative: 'You prioritize marketplace revenue and partner relationships.' },
        { id: 'hybrid', label: 'Hybrid Channel Strategy', shortLabel: 'Hybrid', consequences: { marketplaceRevenue: 5, directRevenue: 10 }, trustImpact: { awsPartner: -5, customers: 10 }, narrative: 'You balance marketplace and direct based on customer preference.' },
        { id: 'direct-first', label: 'Direct First for Enterprise', shortLabel: 'Direct', consequences: { marketplaceRevenue: -20, directRevenue: 30, platformDependency: -20 }, trustImpact: { awsPartner: -25, customers: 25, investors: 15 }, narrative: 'You build direct enterprise sales motion.' },
      ]
    },
  ],
  // Round 5: Technical Independence
  [
    { id: 'r5-architecture', title: 'Architecture Independence', description: 'Platform SDK changes require significant rework. This is opportunity to reduce lock-in.', role: 'engineering',
      options: [
        { id: 'migrate', label: 'Migrate to Platform SDK v2', shortLabel: 'Migrate', consequences: { platformDependency: 10, technicalDebt: -15 }, trustImpact: { awsPartner: 15 }, narrative: 'You migrate to new platform SDK maintaining deep integration.' },
        { id: 'abstract', label: 'Build Abstraction Layer', shortLabel: 'Abstract', consequences: { platformDependency: -25, technicalDebt: 20 }, trustImpact: { awsPartner: -20, investors: 15 }, narrative: 'You use migration as opportunity to reduce platform coupling.' },
        { id: 'partial', label: 'Selective Modernization', shortLabel: 'Selective', consequences: { platformDependency: -10, technicalDebt: 5 }, trustImpact: { awsPartner: 5 }, narrative: 'You modernize selectively while maintaining key integrations.' },
      ]
    },
  ],
  // Round 6: Strategic Positioning
  [
    { id: 'r6-positioning', title: 'Long-term Platform Strategy', description: 'Board demands clear platform strategy for next 3 years.', role: 'strategy',
      options: [
        { id: 'platform-embedded', label: 'Platform-Embedded Future', shortLabel: 'Embedded', consequences: { platformDependency: 25, partnerTier: 1, arr: 20 }, trustImpact: { awsPartner: 25, investors: -10 }, narrative: 'You commit to deep platform partnership as strategic moat.' },
        { id: 'platform-independent', label: 'Platform-Independent Future', shortLabel: 'Independent', consequences: { platformDependency: -30, directRevenue: 25, arr: -10 }, trustImpact: { awsPartner: -30, investors: 20 }, narrative: 'You invest in platform independence and direct relationships.' },
        { id: 'selective-partnership', label: 'Selective Partnership', shortLabel: 'Selective', consequences: { platformDependency: -10, productDifferentiation: 10 }, trustImpact: { awsPartner: 5, investors: 10 }, narrative: 'You maintain partnerships where advantageous, direct elsewhere.' },
      ]
    },
  ],
  // Round 7: Growth Decision
  [
    { id: 'r7-growth', title: 'Growth Acceleration', description: 'Funding available for growth. How do you invest?', role: 'gm',
      options: [
        { id: 'marketplace-growth', label: 'Marketplace Acceleration', shortLabel: 'Marketplace', consequences: { marketplaceRevenue: 30, platformDependency: 15 }, trustImpact: { awsPartner: 20, investors: 5 }, narrative: 'You invest in marketplace presence and partner go-to-market.' },
        { id: 'direct-growth', label: 'Direct Sales Investment', shortLabel: 'Direct Sales', consequences: { directRevenue: 35, platformDependency: -15 }, trustImpact: { awsPartner: -15, customers: 20, investors: 15 }, narrative: 'You build enterprise direct sales and customer success.' },
        { id: 'product-growth', label: 'Product Differentiation', shortLabel: 'Product', consequences: { productDifferentiation: 25, arr: 10 }, trustImpact: { customers: 20, investors: 10 }, narrative: 'You invest in product capabilities that drive switching costs.' },
      ]
    },
  ],
  // Round 8: Endgame
  [
    { id: 'r8-endgame', title: 'Strategic Endgame', description: 'Position company for next phase of growth.', role: 'strategy',
      options: [
        { id: 'acquisition-target', label: 'Position for Acquisition', shortLabel: 'Acquisition', consequences: { platformDependency: 20, arr: 15 }, trustImpact: { awsPartner: 20, investors: 25 }, narrative: 'You optimize for platform acquisition interest.' },
        { id: 'independent-scale', label: 'Independent Scale', shortLabel: 'Independent', consequences: { platformDependency: -25, directRevenue: 30, arr: 10 }, trustImpact: { awsPartner: -20, investors: 20 }, narrative: 'You build toward independent growth at scale.' },
        { id: 'ecosystem-hub', label: 'Multi-Cloud Ecosystem Hub', shortLabel: 'Ecosystem', consequences: { productDifferentiation: 20, platformDependency: -15 }, trustImpact: { awsPartner: -5, azurePartner: 15, gcpPartner: 15 }, narrative: 'You position as multi-cloud integration hub.' },
      ]
    },
  ],
];

const EVENTS: GameEvent[] = [
  { id: 'api-deprecation', title: 'Platform API Deprecation', description: 'AWS announces deprecation of key API your product depends on. 6 months to migrate.', category: 'platform', severity: 'high', probability: 0.2,
    consequences: { technicalDebt: 20, productDifferentiation: -10 }, trustImpact: { awsPartner: -10 } },
  { id: 'partner-program-change', title: 'Partner Program Restructure', description: 'Azure restructures partner program. Your tier benefits reduced by 40%.', category: 'platform', severity: 'medium', probability: 0.15,
    consequences: { marketplaceRevenue: -10 }, trustImpact: { azurePartner: -15 } },
  { id: 'platform-acquisition', title: 'Platform Acquires Competitor', description: 'AWS acquires one of your direct competitors.', category: 'platform', severity: 'critical', probability: 0.1,
    conditions: (s) => s.metrics.platformDependency > 60, consequences: { productDifferentiation: -15, arr: -10 }, trustImpact: { awsPartner: -20 } },
  { id: 'marketplace-algorithm', title: 'Marketplace Algorithm Change', description: 'Marketplace discovery algorithm changes, reducing visibility 50%.', category: 'platform', severity: 'medium', probability: 0.2,
    consequences: { marketplaceRevenue: -15 }, trustImpact: {} },
  { id: 'competitive-partnership', title: 'Competitor Wins Partnership', description: 'Key competitor announces exclusive partnership with GCP.', category: 'competitive', severity: 'medium', probability: 0.15,
    consequences: { productDifferentiation: -5 }, trustImpact: { gcpPartner: -15 } },
  { id: 'customer-migration', title: 'Customer Platform Migration', description: 'Top 5 customer migrating from AWS to Azure. Want you to support both.', category: 'market', severity: 'medium', probability: 0.15,
    conditions: (s) => s.metrics.platformDependency > 50, consequences: { technicalDebt: 10 }, trustImpact: { customers: -10 } },
  { id: 'regulatory-action', title: 'Platform Antitrust Investigation', description: 'DOJ announces investigation into cloud marketplace practices.', category: 'regulatory', severity: 'low', probability: 0.1,
    consequences: { platformDependency: -10 }, trustImpact: { investors: 10 } },
  { id: 'partner-tier-upgrade', title: 'Partner Tier Upgrade Offered', description: 'AWS offers premier partner tier if you commit to exclusivity.', category: 'platform', severity: 'low', probability: 0.15,
    conditions: (s) => s.trust.awsPartner > 70, consequences: { partnerTier: 2, platformDependency: 20 }, trustImpact: { awsPartner: 20, azurePartner: -20 } },
  { id: 'direct-demand', title: 'Enterprise Direct Demand', description: 'Fortune 100 prospect demands direct contract outside marketplace.', category: 'market', severity: 'low', probability: 0.2,
    consequences: { directRevenue: 15 }, trustImpact: { customers: 15 } },
  { id: 'platform-native-launch', title: 'Platform Native Feature Launch', description: 'Platform launches native feature directly competing with core product.', category: 'platform', severity: 'high', probability: 0.15,
    conditions: (s) => s.metrics.productDifferentiation < 60, consequences: { productDifferentiation: -20, marketplaceRevenue: -15 }, trustImpact: { awsPartner: -10 } },
  { id: 'multi-cloud-win', title: 'Multi-Cloud Enterprise Win', description: 'Major enterprise selects you specifically for multi-cloud capabilities.', category: 'market', severity: 'low', probability: 0.15,
    conditions: (s) => s.metrics.platformDependency < 55, consequences: { arr: 10, productDifferentiation: 10 }, trustImpact: { customers: 15, investors: 10 } },
  { id: 'partner-conflict', title: 'Partner Sales Conflict', description: 'Platform sales team actively positioning against you in key account.', category: 'platform', severity: 'medium', probability: 0.2,
    conditions: (s) => s.metrics.productDifferentiation > 65, consequences: { marketplaceRevenue: -10 }, trustImpact: { awsPartner: -15 } },
];

const STRATEGIC_FORKS: StrategicFork[] = [
  { id: 'platform-commitment', title: 'Platform Commitment Level', description: 'How committed will you be to platform ecosystems?', round: 2,
    paths: [
      { id: 'deep-embedded', name: 'Deep Platform Embedding', description: 'Fully commit to platform ecosystem strategy', consequences: ['Maximum platform support', 'High dependency', 'Strong co-sell'], metricsImpact: { platformDependency: 30, partnerTier: 2, marketplaceRevenue: 30 }, lockedPaths: ['independent-path'] },
      { id: 'independent-path', name: 'Platform Independence', description: 'Build for maximum portability and direct relationships', consequences: ['Customer ownership', 'Platform friction', 'Higher margins'], metricsImpact: { platformDependency: -30, directRevenue: 30 }, lockedPaths: ['deep-embedded'] },
    ]
  },
  { id: 'multi-cloud', title: 'Multi-Cloud Strategy', description: 'How will you approach multi-cloud support?', round: 4,
    paths: [
      { id: 'single-platform', name: 'Single Platform Deep', description: 'Focus exclusively on one platform for depth', consequences: ['Best-in-class integration', 'Partner preference', 'Limited TAM'], metricsImpact: { platformDependency: 25, partnerTier: 1, technicalDebt: -15 }, lockedPaths: ['true-multi-cloud'] },
      { id: 'true-multi-cloud', name: 'True Multi-Cloud', description: 'Build platform-agnostic architecture', consequences: ['Maximum TAM', 'Engineering cost', 'Reduced partner support'], metricsImpact: { platformDependency: -25, technicalDebt: 20, productDifferentiation: 15 }, lockedPaths: ['single-platform'] },
    ]
  },
  { id: 'channel-strategy', title: 'Channel Strategy Fork', description: 'Where will revenue primarily come from?', round: 6,
    paths: [
      { id: 'marketplace-dominant', name: 'Marketplace Dominant', description: 'Double down on marketplace distribution', consequences: ['Platform alignment', 'Lower margin', 'Scaled distribution'], metricsImpact: { marketplaceRevenue: 40, platformDependency: 20 }, lockedPaths: ['direct-dominant'] },
      { id: 'direct-dominant', name: 'Direct Dominant', description: 'Build enterprise direct sales motion', consequences: ['Customer ownership', 'Partner conflict', 'Higher margin'], metricsImpact: { directRevenue: 40, platformDependency: -20 }, lockedPaths: ['marketplace-dominant'] },
    ]
  },
];

// =============================================================================
// GAME COMPONENT
// =============================================================================

export default function EntangledPage() {
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
      narrativeLog: [`Game initialized: ${configData.name}`],
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

    const eligibleEvents = EVENTS.filter(e => !gameState.triggeredEvents.includes(e.id) && Math.random() < e.probability && (!e.conditions || e.conditions(gameState)));
    const triggeredEvent = eligibleEvents.length > 0 ? eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)] : null;
    const fork = STRATEGIC_FORKS.find(f => f.round === gameState.round && !gameState.activeForks.includes(f.id));

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev, metrics: newMetrics, trust: newTrust, narrativeLog: [...prev.narrativeLog, ...newNarratives],
        phase: triggeredEvent ? 'event' : fork ? 'fork' : 'feedback', currentEvent: triggeredEvent, currentFork: fork || null,
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
    if (gameState.metrics.platformDependency >= 95 && gameState.trust.awsPartner < 40) {
      setGameState(prev => prev ? { ...prev, gameOver: true, endState: 'platform-trapped', phase: 'game-over' } : null);
      return;
    }
    if (gameState.round >= 8) {
      const score = calculateFinalScore(gameState);
      let endState = 'survival';
      if (score > 80) endState = 'ecosystem-leader';
      else if (score > 60) endState = 'strategic-balance';
      else if (score > 40) endState = 'dependent-partner';
      else if (score < 20) endState = 'channel-trapped';
      setGameState(prev => prev ? { ...prev, gameOver: true, endState, phase: 'game-over' } : null);
      return;
    }
    setGameState(prev => prev ? { ...prev, round: prev.round + 1, phase: 'sensemaking', currentRole: ROLES[(ROLES.findIndex(r => r.id === prev.currentRole) + 1) % ROLES.length].id } : null);
  }, [gameState]);

  const calculateFinalScore = (state: GameState): number => {
    const independence = ((100 - state.metrics.platformDependency) / 100) * 25;
    const revenue = ((state.metrics.arr / 250) * 20) + ((state.metrics.directRevenue / 120) * 10);
    const differentiation = ((state.metrics.productDifferentiation / 100) * 20);
    const relationships = Object.values(state.trust).reduce((a, b) => a + b, 0) / 6 * 0.25;
    return Math.min(100, Math.max(0, independence + revenue + differentiation + relationships));
  };

  if (!gameState) {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' : 'bg-slate-950'}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link href="/" className={`inline-flex items-center gap-2 mb-8 ${theme === 'light' ? 'text-indigo-600' : 'text-cyan-400'} hover:underline`}><Home className="w-5 h-5" /> Back to Home</Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${theme === 'light' ? 'bg-indigo-100' : 'bg-indigo-500/20'}`}>
              <Network className={`w-10 h-10 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`} />
            </div>
            <h1 className={`text-5xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>ENTANGLED</h1>
            <p className={`text-2xl ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>Ecosystem Strategy and Partner Dependence</p>
            <p className={`mt-4 text-lg max-w-2xl mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              You lead CloudBridge, a software company heavily dependent on cloud platform ecosystems. Navigate the tension between platform partnership benefits and strategic independence.
            </p>
          </motion.div>
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Select Starting Configuration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(Object.entries(CONFIGURATIONS) as [Configuration, typeof CONFIGURATIONS[Configuration]][]).map(([key, config]) => (
              <motion.button key={key} onClick={() => setSelectedConfig(key)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-2xl text-left transition-all ${selectedConfig === key ? theme === 'light' ? 'bg-indigo-100 border-2 border-indigo-500' : 'bg-indigo-500/20 border-2 border-indigo-500' : theme === 'light' ? 'bg-white border-2 border-slate-200 hover:border-indigo-300' : 'bg-slate-900 border-2 border-slate-700 hover:border-indigo-500/50'}`}>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.name}</h3>
                <p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{config.description}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}><div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>ARR</div><div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>${config.initialMetrics.arr}M</div></div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}><div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Dependency</div><div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.platformDependency}%</div></div>
                  <div className={`p-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}><div className={theme === 'light' ? 'text-slate-500' : 'text-slate-500'}>Partner Tier</div><div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{config.initialMetrics.partnerTier}</div></div>
                </div>
              </motion.button>
            ))}
          </div>
          {selectedConfig && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
              <button onClick={() => initializeGame(selectedConfig)} className={`px-12 py-4 rounded-xl font-bold text-xl ${theme === 'light' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-900 shadow-lg shadow-cyan-500/30'}`}>
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
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' : 'bg-slate-950'}`}>
      <header className={`sticky top-0 z-40 ${theme === 'light' ? 'bg-white/90 border-b border-slate-200' : 'bg-slate-900/90 border-b border-slate-800'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Network className={`w-8 h-8 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <div><h1 className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>ENTANGLED</h1><p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Round {gameState.round} of 8</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}><span className="font-medium">ARR:</span> ${gameState.metrics.arr.toFixed(0)}M</div>
            <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}><span className="font-medium">Dependency:</span> {gameState.metrics.platformDependency}%</div>
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
                  <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Welcome to CloudBridge</h2>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>You lead a $156M ARR software company heavily dependent on cloud platform ecosystems. 73% of revenue flows through platform marketplaces. Navigate the tension between partnership benefits and strategic independence.</p>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'sensemaking' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>Begin Round 1 <ChevronRight className="inline w-5 h-5" /></button>
                </motion.div>
              )}

              {gameState.phase === 'sensemaking' && (
                <motion.div key="sensemaking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <div className="flex items-center gap-3 mb-6"><currentRoleInfo.icon className={`w-8 h-8 text-${currentRoleInfo.color}-500`} /><div><h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Round {gameState.round}: Sensemaking</h2><p className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Playing as {currentRoleInfo.title}</p></div></div>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-indigo-50 border border-indigo-200' : 'bg-indigo-500/10 border border-indigo-500/30'}`}>
                    <h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-indigo-800' : 'text-indigo-400'}`}>Private Intelligence</h3>
                    <ul className={`space-y-1 text-sm ${theme === 'light' ? 'text-indigo-700' : 'text-indigo-300'}`}>{currentRoleInfo.privateInfo.map((info, i) => <li key={i}>• {info}</li>)}</ul>
                  </div>
                  <button onClick={() => setGameState(prev => prev ? { ...prev, phase: 'decisions' } : null)} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>Proceed to Decisions <ChevronRight className="inline w-5 h-5" /></button>
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
                          <button key={option.id} onClick={() => setCurrentDecisions(prev => ({ ...prev, [decision.id]: option.id }))}
                            className={`p-4 rounded-xl text-left transition-all ${currentDecisions[decision.id] === option.id ? theme === 'light' ? 'bg-indigo-100 border-2 border-indigo-500' : 'bg-indigo-500/20 border-2 border-indigo-500' : theme === 'light' ? 'bg-slate-50 border-2 border-slate-200 hover:border-indigo-300' : 'bg-slate-800 border-2 border-slate-700 hover:border-indigo-500/50'}`}>
                            <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{option.label}</div>
                            <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{option.narrative}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {roundDecisions.every(d => currentDecisions[d.id]) && (<button onClick={applyDecisions} className={`w-full px-8 py-4 rounded-xl font-bold text-lg ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>Submit Decisions <ChevronRight className="inline w-5 h-5" /></button>)}
                </motion.div>
              )}

              {gameState.phase === 'event' && gameState.currentEvent && (
                <motion.div key="event" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-purple-50 border-2 border-purple-200' : 'bg-purple-500/10 border-2 border-purple-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4"><AlertTriangle className={`w-8 h-8 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} /><h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-purple-800' : 'text-purple-400'}`}>ECOSYSTEM EVENT</h2></div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentEvent.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentEvent.description}</p>
                  <button onClick={handleEventResolution} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'}`}>Acknowledge <ChevronRight className="inline w-5 h-5" /></button>
                </motion.div>
              )}

              {gameState.phase === 'fork' && gameState.currentFork && (
                <motion.div key="fork" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-indigo-500/10 border-2 border-indigo-500/30'}`}>
                  <div className="flex items-center gap-3 mb-4"><GitBranch className={`w-8 h-8 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`} /><h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-indigo-800' : 'text-indigo-400'}`}>STRATEGIC FORK</h2></div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{gameState.currentFork.title}</h3>
                  <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.currentFork.description}</p>
                  <div className="grid gap-4">
                    {gameState.currentFork.paths.filter(p => !gameState.lockedPaths.includes(p.id)).map(path => (
                      <button key={path.id} onClick={() => handleForkChoice(path.id)} className={`p-6 rounded-xl text-left transition-all ${theme === 'light' ? 'bg-white hover:bg-indigo-50 border-2 border-indigo-200' : 'bg-slate-900 hover:bg-indigo-500/10 border-2 border-indigo-500/30'}`}>
                        <h4 className={`text-lg font-bold mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{path.name}</h4>
                        <p className={`text-sm mb-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{path.description}</p>
                        <div className={`text-xs ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>{path.consequences.join(' • ')}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {gameState.phase === 'feedback' && (
                <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Round {gameState.round} Summary</h2>
                  <div className={`p-4 rounded-xl mb-6 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}><ul className={`space-y-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{gameState.narrativeLog.slice(-5).map((log, i) => <li key={i}>• {log}</li>)}</ul></div>
                  <button onClick={advanceRound} className={`px-8 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-cyan-500 text-slate-900'}`}>{gameState.round >= 8 ? 'View Results' : `Begin Round ${gameState.round + 1}`} <ChevronRight className="inline w-5 h-5" /></button>
                </motion.div>
              )}

              {gameState.phase === 'game-over' && (
                <motion.div key="gameover" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white shadow-xl' : 'bg-slate-900'}`}>
                  <h2 className={`text-3xl font-bold mb-6 text-center ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {gameState.endState === 'ecosystem-leader' ? 'VICTORY: Ecosystem Leader' : gameState.endState === 'strategic-balance' ? 'SUCCESS: Strategic Balance' : gameState.endState === 'dependent-partner' ? 'PARTIAL: Dependent Partner' : gameState.endState === 'channel-trapped' ? 'FAILURE: Channel Trapped' : 'Simulation Complete'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}><h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Final Metrics</h3><div className="space-y-1 text-sm"><div>ARR: ${gameState.metrics.arr}M</div><div>Platform Dependency: {gameState.metrics.platformDependency}%</div><div>Direct Revenue: ${gameState.metrics.directRevenue}M</div><div>Differentiation: {gameState.metrics.productDifferentiation}%</div></div></div>
                    <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}><h3 className={`font-bold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Partner Trust</h3><div className="space-y-1 text-sm">{Object.entries(gameState.trust).map(([k, v]) => <div key={k}>{k}: {v}%</div>)}</div></div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setGameState(null)} className={`px-6 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-indigo-600 text-white' : 'bg-cyan-500 text-slate-900'}`}><RotateCcw className="inline w-5 h-5 mr-2" /> Play Again</button>
                    <Link href="/" className={`px-6 py-3 rounded-xl font-bold ${theme === 'light' ? 'bg-slate-200 text-slate-800' : 'bg-slate-700 text-white'}`}><Home className="inline w-5 h-5 mr-2" /> Return Home</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Platform Metrics</h3>
              <div className="space-y-3">
                {[{ label: 'Platform Dependency', value: gameState.metrics.platformDependency, color: 'red' }, { label: 'Differentiation', value: gameState.metrics.productDifferentiation, color: 'emerald' }, { label: 'Marketplace Rev', value: (gameState.metrics.marketplaceRevenue / 150) * 100, color: 'blue' }, { label: 'Direct Revenue', value: (gameState.metrics.directRevenue / 100) * 100, color: 'violet' }].map(metric => (
                  <div key={metric.label}><div className="flex justify-between text-sm mb-1"><span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{metric.label}</span><span className={theme === 'light' ? 'text-slate-800' : 'text-white'}>{metric.value.toFixed(0)}%</span></div><div className={`h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}><div className={`h-full rounded-full bg-${metric.color}-500`} style={{ width: `${Math.min(100, metric.value)}%` }} /></div></div>
                ))}
              </div>
            </div>
            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white shadow-lg' : 'bg-slate-900'}`}>
              <h3 className={`font-bold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Partner Trust</h3>
              <div className="space-y-3">
                {Object.entries(gameState.trust).map(([key, value]) => (
                  <div key={key}><div className="flex justify-between text-sm mb-1"><span className={`capitalize ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{key.replace('Partner', '')}</span><span className={value >= 60 ? 'text-green-500' : value >= 40 ? 'text-amber-500' : 'text-red-500'}>{value}%</span></div><div className={`h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}><div className={`h-full rounded-full ${value >= 60 ? 'bg-green-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${value}%` }} /></div></div>
                ))}
              </div>
            </div>
            {showRoleInfo && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-indigo-50 border border-indigo-200' : 'bg-indigo-500/10 border border-indigo-500/30'}`}><h3 className={`font-bold mb-3 ${theme === 'light' ? 'text-indigo-800' : 'text-indigo-400'}`}>{currentRoleInfo.title}</h3><div className={`text-sm space-y-2 ${theme === 'light' ? 'text-indigo-700' : 'text-indigo-300'}`}><div><strong>Metrics:</strong> {currentRoleInfo.metrics.join(', ')}</div><div><strong>Conflicts:</strong> {currentRoleInfo.conflicts.join(', ')}</div></div></motion.div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
