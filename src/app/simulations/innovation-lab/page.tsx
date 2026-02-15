'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Rocket,
  Beaker,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  DollarSign,
  Code,
  Users,
  Brain,
  Sparkles,
  FlaskConical,
  GitBranch,
  Award,
  Skull,
  Crown,
  LifeBuoy,
  RefreshCw,
  Play,
  AlertCircle,
  Flame,
  Eye,
  Layers,
  Microscope,
  CircuitBoard,
  Atom,
  Gem,
} from 'lucide-react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

type Phase = 'intro' | 'briefing' | 'decision' | 'consequence' | 'quarterly-report' | 'ending';
type EndingType = 'innovation-stagnation' | 'portfolio-collapse' | 'survival' | 'innovation-engine' | 'market-disruptor';
type InnovationCulture = 'risk-averse' | 'balanced' | 'moonshot' | 'chaotic';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  sentiment: number;
  avatar: string;
  archetype: 'ceo' | 'board' | 'engineering' | 'product' | 'finance';
}

interface InnovationCrisis {
  id: string;
  quarter: number;
  title: string;
  description: string;
  severity: 'moderate' | 'severe' | 'critical';
  category: 'project' | 'talent' | 'budget' | 'competitive' | 'strategic';
  choices: CrisisChoice[];
}

interface CrisisChoice {
  id: string;
  label: string;
  description: string;
  shortTermImpact: string;
  longTermRisk: string;
  consequences: ChoiceConsequence;
}

interface ChoiceConsequence {
  pipelineValue: number;
  successRate: number;
  timeToMarket: number;
  technicalDebt: number;
  creativityIndex: number;
  patents: number;
  talentRetention: number;
  budgetChange: number;
  stakeholderEffects: { id: string; change: number }[];
  specialEffect?: string;
}

interface DecisionRecord {
  quarter: number;
  crisisId: string;
  choiceId: string;
  choiceLabel: string;
  consequences: ChoiceConsequence;
}

interface Project {
  id: string;
  name: string;
  type: 'incremental' | 'adjacent' | 'breakthrough';
  status: 'active' | 'paused' | 'killed' | 'launched';
  progress: number;
  risk: number;
  potential: number;
}

interface GameState {
  quarter: number;
  phase: Phase;
  // Innovation metrics
  pipelineValue: number;
  successRate: number;
  timeToMarket: number;
  technicalDebt: number;
  creativityIndex: number;
  patents: number;
  patentsPending: number;
  // Resource metrics
  rdBudget: number;
  budgetUtilization: number;
  talentRetention: number;
  teamSize: number;
  // Portfolio metrics
  incrementalShare: number;
  adjacentShare: number;
  breakthroughShare: number;
  // Market metrics
  marketPosition: number;
  competitiveGap: number;
  revenueFromNew: number;
  // Culture
  innovationCulture: InnovationCulture;
  riskAppetite: number;
  // Stakeholders
  stakeholders: Stakeholder[];
  // Projects
  projects: Project[];
  // Game state
  currentCrisis: InnovationCrisis | null;
  decisionHistory: DecisionRecord[];
  gameOver: boolean;
  endingType: EndingType | null;
  endingNarrative: string;
}

// =============================================================================
// NARRATIVE CONTENT
// =============================================================================

const COMPANY_STORY = {
  name: 'Nexus Technologies',
  industry: 'Enterprise Software & AI',
  situation: `You are Dr. Maya Chen, newly appointed Chief Innovation Officer at Nexus Technologies, a $4.2B enterprise software company.

For two decades, Nexus dominated the market with its flagship analytics platform. But the world has changed. AI is reshaping every industry. Cloud-native competitors are eating your lunch. Your core product, once revolutionary, is now called "legacy" by analysts.

Your predecessor played it safe for too long. The R&D portfolio is 85% incremental improvements, 15% vaporware that never shipped. Your best engineers are being poached by startups. The board is demanding "transformative innovation" but won't define what that means.

You have 8 quarters to rebuild the innovation engine. Too conservative and you'll be disrupted. Too aggressive and you'll burn through cash chasing moonshots. The future of 12,000 employees depends on getting this balance right.`,

  cioBackground: `Former VP of AI at Google, you left to take on this challenge. You've built products used by billions. You've also killed projects that wasted hundreds of millions. You know that innovation isn't about ideas - it's about disciplined execution of the right bets at the right time.`,
};

const STAKEHOLDERS: Stakeholder[] = [
  {
    id: 'ceo',
    name: 'Marcus Webb',
    role: 'CEO',
    sentiment: 40,
    avatar: '👔',
    archetype: 'ceo',
  },
  {
    id: 'board',
    name: 'Board Innovation Committee',
    role: 'Strategic Oversight',
    sentiment: 35,
    avatar: '🏛️',
    archetype: 'board',
  },
  {
    id: 'engineering',
    name: 'Dr. Sarah Kim',
    role: 'VP Engineering',
    sentiment: 55,
    avatar: '👩‍💻',
    archetype: 'engineering',
  },
  {
    id: 'product',
    name: 'James Morrison',
    role: 'Chief Product Officer',
    sentiment: 45,
    avatar: '📱',
    archetype: 'product',
  },
  {
    id: 'finance',
    name: 'Robert Chen',
    role: 'CFO',
    sentiment: 30,
    avatar: '💰',
    archetype: 'finance',
  },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Analytics Platform 7.0', type: 'incremental', status: 'active', progress: 72, risk: 15, potential: 25 },
  { id: 'proj-2', name: 'Cloud Migration Tools', type: 'incremental', status: 'active', progress: 45, risk: 25, potential: 35 },
  { id: 'proj-3', name: 'AI Assistant Beta', type: 'adjacent', status: 'active', progress: 28, risk: 45, potential: 120 },
  { id: 'proj-4', name: 'Quantum Computing Research', type: 'breakthrough', status: 'paused', progress: 8, risk: 85, potential: 500 },
];

const INNOVATION_CRISES: InnovationCrisis[] = [
  // Quarter 1: The Wake-Up Call
  {
    id: 'competitor-launch',
    quarter: 1,
    title: 'Competitor Leapfrog',
    description: `Your first week on the job, and DataPrime just announced "Aurora" - an AI-native analytics platform that does everything your flagship product does, but 10x faster and at half the price. They're offering free migration for your customers. Your stock dropped 12% on the news. The CEO is on line one asking what your response is.`,
    severity: 'critical',
    category: 'competitive',
    choices: [
      {
        id: 'fast-follow',
        label: 'Launch Emergency Response',
        description: 'Pull engineers from all projects to build competing AI features in 6 months',
        shortTermImpact: 'Shows market we\'re responsive',
        longTermRisk: 'Rushed features, tech debt, other projects stall',
        consequences: {
          pipelineValue: -15,
          successRate: -10,
          timeToMarket: -3,
          technicalDebt: 20,
          creativityIndex: -15,
          patents: 0,
          talentRetention: -10,
          budgetChange: 15,
          stakeholderEffects: [
            { id: 'ceo', change: 15 },
            { id: 'engineering', change: -20 },
            { id: 'finance', change: -10 },
          ],
          specialEffect: 'crunch-mode',
        },
      },
      {
        id: 'strategic-pivot',
        label: 'Accelerate AI Assistant Project',
        description: 'Double down on your existing AI project, make it the flagship response',
        shortTermImpact: 'Focused strategy, but 12+ months to market',
        longTermRisk: 'May be too late if customers churn',
        consequences: {
          pipelineValue: 10,
          successRate: 5,
          timeToMarket: 2,
          technicalDebt: 5,
          creativityIndex: 10,
          patents: 2,
          talentRetention: 5,
          budgetChange: 10,
          stakeholderEffects: [
            { id: 'board', change: 10 },
            { id: 'engineering', change: 15 },
            { id: 'product', change: 10 },
          ],
          specialEffect: 'ai-focus',
        },
      },
      {
        id: 'differentiate',
        label: 'Differentiate, Don\'t Compete',
        description: 'Focus on enterprise features DataPrime can\'t match - security, compliance, integration',
        shortTermImpact: 'Doesn\'t address AI gap directly',
        longTermRisk: 'May be seen as conceding the AI battle',
        consequences: {
          pipelineValue: 5,
          successRate: 10,
          timeToMarket: 0,
          technicalDebt: -5,
          creativityIndex: -5,
          patents: 1,
          talentRetention: 0,
          budgetChange: -5,
          stakeholderEffects: [
            { id: 'ceo', change: -10 },
            { id: 'finance', change: 15 },
            { id: 'product', change: 5 },
          ],
        },
      },
    ],
  },
  // Quarter 2: Talent Crisis
  {
    id: 'talent-exodus',
    quarter: 2,
    title: 'The Talent Drain',
    description: `Your top AI research team - 8 engineers, including 3 who built the original AI Assistant prototype - just gave notice. They're leaving to start their own company, and they're taking their institutional knowledge with them. Worse, they're being funded by your competitor's VC arm. You have 2 weeks to make a counter-offer or let them go.`,
    severity: 'severe',
    category: 'talent',
    choices: [
      {
        id: 'counter-offer',
        label: 'Aggressive Counter-Offer',
        description: '40% salary increase, equity refresh, and "Innovation Lab" with autonomy',
        shortTermImpact: '$2.4M additional annual cost, retention uncertain',
        longTermRisk: 'Sets precedent, may cause resentment among other teams',
        consequences: {
          pipelineValue: 5,
          successRate: 5,
          timeToMarket: 0,
          technicalDebt: 0,
          creativityIndex: 15,
          patents: 3,
          talentRetention: 20,
          budgetChange: 8,
          stakeholderEffects: [
            { id: 'engineering', change: 25 },
            { id: 'finance', change: -20 },
            { id: 'ceo', change: 5 },
          ],
          specialEffect: 'star-retention',
        },
      },
      {
        id: 'let-them-go',
        label: 'Wish Them Well',
        description: 'Accept departures, protect IP, begin external recruiting',
        shortTermImpact: '6-12 month setback on AI projects',
        longTermRisk: 'Fresh talent may bring new perspectives',
        consequences: {
          pipelineValue: -20,
          successRate: -15,
          timeToMarket: 4,
          technicalDebt: 10,
          creativityIndex: -10,
          patents: -2,
          talentRetention: -15,
          budgetChange: -3,
          stakeholderEffects: [
            { id: 'engineering', change: -25 },
            { id: 'board', change: -10 },
          ],
          specialEffect: 'brain-drain',
        },
      },
      {
        id: 'acqui-hire',
        label: 'Acquire to Retain',
        description: 'Offer to fund their startup as internal venture, they stay as entrepreneurs-in-residence',
        shortTermImpact: '$5M seed funding commitment',
        longTermRisk: 'Complex structure, unclear IP ownership',
        consequences: {
          pipelineValue: 15,
          successRate: 0,
          timeToMarket: 2,
          technicalDebt: 5,
          creativityIndex: 20,
          patents: 4,
          talentRetention: 10,
          budgetChange: 12,
          stakeholderEffects: [
            { id: 'engineering', change: 15 },
            { id: 'finance', change: -15 },
            { id: 'board', change: 10 },
          ],
          specialEffect: 'internal-venture',
        },
      },
    ],
  },
  // Quarter 3: Breakthrough Failure
  {
    id: 'moonshot-failure',
    quarter: 3,
    title: 'The Quantum Collapse',
    description: `Your Quantum Computing Research project just hit a wall. After $12M invested over 3 years, your lead researcher admitted the fundamental approach is flawed. The technology won't be viable for at least a decade. The board wants answers. Do you kill the project, pivot, or double down with new leadership?`,
    severity: 'severe',
    category: 'project',
    choices: [
      {
        id: 'kill-project',
        label: 'Kill the Project',
        description: 'Write off $12M, redeploy team to other initiatives',
        shortTermImpact: 'Clean break, frees up resources',
        longTermRisk: 'Signals low tolerance for moonshots',
        consequences: {
          pipelineValue: -25,
          successRate: 5,
          timeToMarket: -2,
          technicalDebt: -10,
          creativityIndex: -15,
          patents: 0,
          talentRetention: -5,
          budgetChange: -8,
          stakeholderEffects: [
            { id: 'finance', change: 20 },
            { id: 'engineering', change: -15 },
            { id: 'board', change: 5 },
          ],
          specialEffect: 'moonshot-killed',
        },
      },
      {
        id: 'pivot-approach',
        label: 'Pivot to Quantum-Inspired Algorithms',
        description: 'Apply learnings to classical computing, salvage IP',
        shortTermImpact: 'Recovers some value, team stays engaged',
        longTermRisk: 'May be seen as face-saving measure',
        consequences: {
          pipelineValue: 10,
          successRate: 10,
          timeToMarket: 0,
          technicalDebt: 5,
          creativityIndex: 5,
          patents: 2,
          talentRetention: 5,
          budgetChange: 0,
          stakeholderEffects: [
            { id: 'engineering', change: 10 },
            { id: 'product', change: 15 },
          ],
        },
      },
      {
        id: 'new-leadership',
        label: 'Bring in External Expert',
        description: 'Hire top quantum researcher from IBM, restart with new approach',
        shortTermImpact: 'Expensive, risky, but keeps dream alive',
        longTermRisk: '$3M hire, another 2 years before results',
        consequences: {
          pipelineValue: 5,
          successRate: -5,
          timeToMarket: 3,
          technicalDebt: 10,
          creativityIndex: 15,
          patents: 3,
          talentRetention: 0,
          budgetChange: 10,
          stakeholderEffects: [
            { id: 'finance', change: -15 },
            { id: 'engineering', change: 5 },
            { id: 'board', change: -10 },
          ],
          specialEffect: 'quantum-restart',
        },
      },
    ],
  },
  // Quarter 4: Cannibalization Decision
  {
    id: 'cannibalization-choice',
    quarter: 4,
    title: 'The Cannibalization Dilemma',
    description: `Your AI Assistant is ready for beta launch. But there's a problem: it's so good that it will cannibalize 40% of your flagship Analytics Platform revenue within 2 years. The CPO is threatening to resign if you launch. The CFO says the board will never approve revenue cannibalization. But if you don't launch, DataPrime will own the market.`,
    severity: 'critical',
    category: 'strategic',
    choices: [
      {
        id: 'full-launch',
        label: 'Launch Full Speed',
        description: 'Cannibalize yourself before competitors do it for you',
        shortTermImpact: 'Revenue disruption, internal conflict',
        longTermRisk: 'Stock price hit, but strategic leadership',
        consequences: {
          pipelineValue: 30,
          successRate: 15,
          timeToMarket: -4,
          technicalDebt: 5,
          creativityIndex: 20,
          patents: 4,
          talentRetention: 10,
          budgetChange: 5,
          stakeholderEffects: [
            { id: 'product', change: -25 },
            { id: 'finance', change: -20 },
            { id: 'board', change: -10 },
            { id: 'engineering', change: 20 },
          ],
          specialEffect: 'self-disruption',
        },
      },
      {
        id: 'premium-tier',
        label: 'Launch as Premium Add-on',
        description: 'Position AI as complementary to existing product, premium pricing',
        shortTermImpact: 'Protects revenue, limits market reach',
        longTermRisk: 'Competitors offer same features for free',
        consequences: {
          pipelineValue: 15,
          successRate: 10,
          timeToMarket: -2,
          technicalDebt: 0,
          creativityIndex: 5,
          patents: 2,
          talentRetention: 5,
          budgetChange: 0,
          stakeholderEffects: [
            { id: 'product', change: 10 },
            { id: 'finance', change: 15 },
            { id: 'board', change: 10 },
          ],
        },
      },
      {
        id: 'delay-launch',
        label: 'Delay Until Q7',
        description: 'Wait for flagship revenue to stabilize, de-risk transition',
        shortTermImpact: 'Preserves short-term revenue',
        longTermRisk: 'Window of opportunity may close',
        consequences: {
          pipelineValue: -10,
          successRate: 5,
          timeToMarket: 6,
          technicalDebt: 10,
          creativityIndex: -10,
          patents: 0,
          talentRetention: -10,
          budgetChange: -5,
          stakeholderEffects: [
            { id: 'product', change: 15 },
            { id: 'finance', change: 10 },
            { id: 'engineering', change: -20 },
            { id: 'ceo', change: -15 },
          ],
          specialEffect: 'market-window-risk',
        },
      },
    ],
  },
  // Quarter 5: Budget Crisis
  {
    id: 'budget-cut',
    quarter: 5,
    title: 'The Budget Guillotine',
    description: `Economic headwinds are hitting the tech sector. The CFO just informed you that R&D budget is being cut 25% next quarter. You have to decide what to cut: the safe incremental projects that keep the lights on, the adjacent bets that could become the next core product, or the breakthrough moonshots that define the future?`,
    severity: 'severe',
    category: 'budget',
    choices: [
      {
        id: 'cut-incremental',
        label: 'Cut Incremental Projects',
        description: 'Protect innovation bets, accept slower core product evolution',
        shortTermImpact: 'Customers notice slower updates',
        longTermRisk: 'Core product loses ground to competition',
        consequences: {
          pipelineValue: 10,
          successRate: -5,
          timeToMarket: 2,
          technicalDebt: 15,
          creativityIndex: 10,
          patents: 2,
          talentRetention: 5,
          budgetChange: -25,
          stakeholderEffects: [
            { id: 'product', change: -20 },
            { id: 'engineering', change: 10 },
            { id: 'board', change: 5 },
          ],
        },
      },
      {
        id: 'cut-moonshots',
        label: 'Cut Breakthrough Projects',
        description: 'Preserve near-term revenue, sacrifice long-term bets',
        shortTermImpact: 'Safe choice, predictable outcomes',
        longTermRisk: 'Innovation culture erodes, talent leaves',
        consequences: {
          pipelineValue: -20,
          successRate: 10,
          timeToMarket: -2,
          technicalDebt: -5,
          creativityIndex: -20,
          patents: -3,
          talentRetention: -15,
          budgetChange: -25,
          stakeholderEffects: [
            { id: 'finance', change: 20 },
            { id: 'engineering', change: -25 },
            { id: 'board', change: -10 },
          ],
          specialEffect: 'innovation-retreat',
        },
      },
      {
        id: 'proportional-cuts',
        label: 'Proportional Cuts Across All',
        description: 'Spread the pain equally, keep all options alive',
        shortTermImpact: 'Nothing dies, but everything slows',
        longTermRisk: 'Death by a thousand cuts - nothing reaches critical mass',
        consequences: {
          pipelineValue: -5,
          successRate: -5,
          timeToMarket: 3,
          technicalDebt: 5,
          creativityIndex: -5,
          patents: 0,
          talentRetention: -5,
          budgetChange: -25,
          stakeholderEffects: [
            { id: 'finance', change: 10 },
            { id: 'product', change: -5 },
            { id: 'engineering', change: -10 },
          ],
        },
      },
    ],
  },
  // Quarter 6: Technical Debt Crisis
  {
    id: 'tech-debt-crisis',
    quarter: 6,
    title: 'The Technical Debt Reckoning',
    description: `Years of "move fast and break things" have caught up with you. Your platform architecture is so tangled that new features take 3x longer to ship than competitors. A security audit revealed critical vulnerabilities. You can ship your AI product now with the current architecture, or pause everything to rebuild the foundation.`,
    severity: 'critical',
    category: 'project',
    choices: [
      {
        id: 'ship-now',
        label: 'Ship Now, Fix Later',
        description: 'Launch AI product, deal with tech debt in parallel',
        shortTermImpact: 'Gets to market faster',
        longTermRisk: 'Compounding debt, security risks, talent frustration',
        consequences: {
          pipelineValue: 15,
          successRate: -10,
          timeToMarket: -4,
          technicalDebt: 25,
          creativityIndex: -5,
          patents: 2,
          talentRetention: -10,
          budgetChange: 5,
          stakeholderEffects: [
            { id: 'ceo', change: 10 },
            { id: 'engineering', change: -25 },
            { id: 'board', change: -5 },
          ],
          specialEffect: 'debt-spiral',
        },
      },
      {
        id: 'platform-reset',
        label: '6-Month Platform Reset',
        description: 'Pause all new development, rebuild foundation',
        shortTermImpact: 'No new features for 6 months',
        longTermRisk: 'Competitors gain ground, but future velocity improves',
        consequences: {
          pipelineValue: -15,
          successRate: 15,
          timeToMarket: 6,
          technicalDebt: -35,
          creativityIndex: 10,
          patents: 1,
          talentRetention: 15,
          budgetChange: 10,
          stakeholderEffects: [
            { id: 'ceo', change: -15 },
            { id: 'engineering', change: 30 },
            { id: 'finance', change: -10 },
          ],
          specialEffect: 'platform-modernization',
        },
      },
      {
        id: 'parallel-track',
        label: 'Parallel Modernization',
        description: 'Build new platform while maintaining old - expensive but no pause',
        shortTermImpact: '50% budget increase, complex execution',
        longTermRisk: 'May end up with two half-finished platforms',
        consequences: {
          pipelineValue: 5,
          successRate: 5,
          timeToMarket: 2,
          technicalDebt: -15,
          creativityIndex: 5,
          patents: 2,
          talentRetention: 5,
          budgetChange: 20,
          stakeholderEffects: [
            { id: 'engineering', change: 10 },
            { id: 'finance', change: -20 },
            { id: 'board', change: -5 },
          ],
        },
      },
    ],
  },
  // Quarter 7: Acquisition Opportunity
  {
    id: 'acquisition-offer',
    quarter: 7,
    title: 'The Acquisition Play',
    description: `A breakthrough AI startup, Cognition Labs, is running out of runway. They have technology that would leapfrog your AI roadmap by 18 months. They're asking $180M - triple their last valuation. The board is skeptical, but you know their tech is real. They have other bidders circling, including DataPrime.`,
    severity: 'severe',
    category: 'strategic',
    choices: [
      {
        id: 'acquire-full',
        label: 'Acquire at Asking Price',
        description: 'Move fast, secure the technology before competitors',
        shortTermImpact: 'Major capital outlay, integration risk',
        longTermRisk: 'Overpaying if integration fails',
        consequences: {
          pipelineValue: 45,
          successRate: 10,
          timeToMarket: -6,
          technicalDebt: 10,
          creativityIndex: 20,
          patents: 8,
          talentRetention: 10,
          budgetChange: 25,
          stakeholderEffects: [
            { id: 'board', change: -15 },
            { id: 'finance', change: -25 },
            { id: 'engineering', change: 15 },
            { id: 'ceo', change: 10 },
          ],
          specialEffect: 'tech-acquisition',
        },
      },
      {
        id: 'negotiate-down',
        label: 'Negotiate Hard',
        description: 'Offer $120M, risk losing to DataPrime',
        shortTermImpact: 'May get deal at better price, may lose it',
        longTermRisk: 'DataPrime with this tech would be devastating',
        consequences: {
          pipelineValue: 20,
          successRate: 5,
          timeToMarket: -3,
          technicalDebt: 5,
          creativityIndex: 10,
          patents: 4,
          talentRetention: 5,
          budgetChange: 15,
          stakeholderEffects: [
            { id: 'finance', change: 10 },
            { id: 'board', change: 5 },
          ],
          specialEffect: 'acquisition-gamble',
        },
      },
      {
        id: 'partnership',
        label: 'Propose Strategic Partnership',
        description: 'License technology, option to acquire later',
        shortTermImpact: 'Lower risk, but may not get exclusivity',
        longTermRisk: 'They could license to competitors too',
        consequences: {
          pipelineValue: 15,
          successRate: 5,
          timeToMarket: -2,
          technicalDebt: 0,
          creativityIndex: 10,
          patents: 2,
          talentRetention: 5,
          budgetChange: 8,
          stakeholderEffects: [
            { id: 'finance', change: 15 },
            { id: 'board', change: 10 },
            { id: 'engineering', change: 5 },
          ],
        },
      },
    ],
  },
  // Quarter 8: Final Strategic Decision
  {
    id: 'final-positioning',
    quarter: 8,
    title: 'The Future of Innovation',
    description: `Eight quarters in. The board is meeting to determine the future direction of Nexus Technologies. Your innovations have shaped the company's trajectory. Now comes the final question: What kind of innovation organization should Nexus become? This decision will define the next decade.`,
    severity: 'critical',
    category: 'strategic',
    choices: [
      {
        id: 'innovation-hub',
        label: 'Become an Innovation Hub',
        description: 'Spin out innovation as a separate entity, attract outside investment',
        shortTermImpact: 'Complex restructuring, but unleashes creativity',
        longTermRisk: 'May lose control of best innovations',
        consequences: {
          pipelineValue: 25,
          successRate: 10,
          timeToMarket: -2,
          technicalDebt: -10,
          creativityIndex: 25,
          patents: 5,
          talentRetention: 15,
          budgetChange: 15,
          stakeholderEffects: [
            { id: 'engineering', change: 25 },
            { id: 'board', change: 15 },
            { id: 'ceo', change: 10 },
          ],
          specialEffect: 'innovation-spinout',
        },
      },
      {
        id: 'integrated-excellence',
        label: 'Integrated Innovation Excellence',
        description: 'Embed innovation deeply into every business unit',
        shortTermImpact: 'Cultural transformation required',
        longTermRisk: 'Innovation may get diluted by business pressures',
        consequences: {
          pipelineValue: 15,
          successRate: 15,
          timeToMarket: 0,
          technicalDebt: -5,
          creativityIndex: 10,
          patents: 3,
          talentRetention: 10,
          budgetChange: 5,
          stakeholderEffects: [
            { id: 'product', change: 20 },
            { id: 'engineering', change: 15 },
            { id: 'finance', change: 10 },
          ],
        },
      },
      {
        id: 'platform-play',
        label: 'Platform Strategy',
        description: 'Open innovation platform - let partners and customers build on top',
        shortTermImpact: 'Requires exposing APIs, enabling ecosystem',
        longTermRisk: 'Platform economics are winner-take-all',
        consequences: {
          pipelineValue: 35,
          successRate: 5,
          timeToMarket: -4,
          technicalDebt: 10,
          creativityIndex: 15,
          patents: 4,
          talentRetention: 5,
          budgetChange: 10,
          stakeholderEffects: [
            { id: 'ceo', change: 20 },
            { id: 'board', change: 15 },
            { id: 'product', change: 10 },
          ],
          specialEffect: 'platform-ecosystem',
        },
      },
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateEnding(state: GameState): { type: EndingType; narrative: string } {
  // Portfolio collapse - critical failure
  if (state.pipelineValue <= 50 || state.talentRetention <= 30) {
    return {
      type: 'portfolio-collapse',
      narrative: `The innovation engine sputtered and died. Your best engineers left for competitors. Projects were killed one after another. When DataPrime acquired your core customer base, there was nothing left to fight with. The board asked for your resignation on a quiet Tuesday morning. Nexus was acquired 18 months later for parts. Sometimes the window of opportunity closes faster than anyone expects.`,
    };
  }

  // Innovation stagnation - played too safe
  if (state.creativityIndex <= 40 && state.successRate >= 60) {
    return {
      type: 'innovation-stagnation',
      narrative: `Nexus survived, but at what cost? Your portfolio delivered consistent returns, but nothing transformative. The breakthrough projects were killed. The moonshots never launched. Five years later, Nexus is a "mature company" - analyst-speak for "no longer relevant." You delivered stability, but innovation died quietly in committee meetings and budget reviews. The best engineers left to join companies where big swings were still possible.`,
    };
  }

  // Market disruptor - exceptional success
  if (state.pipelineValue >= 200 && state.competitiveGap >= 25 && state.creativityIndex >= 75) {
    return {
      type: 'market-disruptor',
      narrative: `Against all odds, you did it. Nexus didn't just catch up to DataPrime - you leapfrogged them. Your AI platform became the industry standard. The quantum-inspired algorithms opened new markets no one saw coming. The stock price tripled. Harvard Business School is writing a case study called "The Nexus Transformation." But you know the real story: you made bold bets, protected creative talent, and had the courage to cannibalize your own products before competitors did it for you. This is what innovation leadership looks like.`,
    };
  }

  // Innovation engine - strong success
  if (state.pipelineValue >= 150 && state.successRate >= 50 && state.talentRetention >= 65) {
    return {
      type: 'innovation-engine',
      narrative: `Nexus is back. The innovation engine is humming. Your AI Assistant became a billion-dollar product line. The patent portfolio is the envy of the industry. Most importantly, the culture changed - engineers want to work here again. You balanced the portfolio, protected the moonshots, and navigated the budget cuts without losing sight of the future. The board renewed your contract for another five years. The best part? The next breakthrough is already in development.`,
    };
  }

  // Survival - moderate outcome
  return {
    type: 'survival',
    narrative: `Nexus survived the transformation. Not thrived - survived. Some bets paid off. Others didn't. The AI product launched, but didn't dominate. The talent drain slowed, but didn't reverse. The company is smaller, more focused, and still fighting. In the brutal world of enterprise software, survival means you get to play another round. Many companies don't get that chance. Whether this is a platform for future greatness or a slow decline depends on what happens next.`,
  };
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const INITIAL_STATE: GameState = {
  quarter: 0,
  phase: 'intro',
  // Innovation metrics
  pipelineValue: 120,
  successRate: 42,
  timeToMarket: 18,
  technicalDebt: 45,
  creativityIndex: 55,
  patents: 34,
  patentsPending: 12,
  // Resource metrics
  rdBudget: 85,
  budgetUtilization: 78,
  talentRetention: 72,
  teamSize: 340,
  // Portfolio metrics
  incrementalShare: 65,
  adjacentShare: 25,
  breakthroughShare: 10,
  // Market metrics
  marketPosition: 2,
  competitiveGap: -15,
  revenueFromNew: 12,
  // Culture
  innovationCulture: 'risk-averse',
  riskAppetite: 35,
  // Stakeholders
  stakeholders: STAKEHOLDERS,
  // Projects
  projects: INITIAL_PROJECTS,
  // Game state
  currentCrisis: null,
  decisionHistory: [],
  gameOver: false,
  endingType: null,
  endingNarrative: '',
};

// =============================================================================
// COMPONENTS
// =============================================================================

function IntroScreen({ onStart }: { onStart: () => void }) {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/scenarios/scenario-07.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      )}
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-violet-950/80" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Lightbulb className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-5xl font-black text-white mb-4">Innovation Lab</h1>
          <p className="text-2xl text-violet-400 font-light">Betting on the Future</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{COMPANY_STORY.name}</h2>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line mb-6">
            {COMPANY_STORY.situation}
          </p>
          <div className="p-4 bg-violet-900/30 border border-violet-700/50 rounded-xl">
            <p className="text-violet-300 italic">{COMPANY_STORY.cioBackground}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Clock, label: '8 Quarters', desc: '2 Years to Transform' },
            { icon: AlertTriangle, label: 'Disruption', desc: 'Competitors Ahead' },
            { icon: Target, label: 'Your Mission', desc: 'Rebuild Innovation Engine' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-slate-800/50 rounded-xl p-4 text-center"
            >
              <item.icon className="w-8 h-8 text-violet-400 mx-auto mb-2" />
              <p className="font-bold text-white">{item.label}</p>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xl font-bold rounded-xl flex items-center justify-center gap-3 hover:from-violet-500 hover:to-purple-500 transition-all"
        >
          <Play className="w-6 h-6" />
          Begin Your Tenure as CIO
        </motion.button>
      </motion.div>
    </div>
  );
}

function CrisisScreen({
  crisis,
  onChoice,
  state
}: {
  crisis: InnovationCrisis;
  onChoice: (choice: CrisisChoice) => void;
  state: GameState;
}) {
  const [selectedChoice, setSelectedChoice] = useState<CrisisChoice | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const severityColors = {
    moderate: 'from-amber-600 to-yellow-600',
    severe: 'from-orange-600 to-red-600',
    critical: 'from-red-600 to-red-800',
  };

  const categoryIcons = {
    project: FlaskConical,
    talent: Users,
    budget: DollarSign,
    competitive: Target,
    strategic: Brain,
  };

  const CategoryIcon = categoryIcons[crisis.category];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Crisis Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${severityColors[crisis.severity]} flex items-center justify-center`}>
              <CategoryIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-400">
                  Quarter {crisis.quarter}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  crisis.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  crisis.severity === 'severe' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {crisis.severity.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mt-2">{crisis.title}</h1>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-800">
            <p className="text-lg text-slate-300 leading-relaxed">{crisis.description}</p>
          </div>
        </motion.div>

        {/* Current Status Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pipeline Value', value: `$${state.pipelineValue}M`, color: state.pipelineValue < 80 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Creativity Index', value: `${state.creativityIndex}%`, color: state.creativityIndex < 50 ? 'text-red-400' : 'text-violet-400' },
            { label: 'Success Rate', value: `${state.successRate}%`, color: state.successRate < 40 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Talent Retention', value: `${state.talentRetention}%`, color: state.talentRetention < 60 ? 'text-red-400' : 'text-amber-400' },
          ].map((metric) => (
            <div key={metric.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <p className="text-xs text-slate-500 mb-1">{metric.label}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Choices */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Your Decision</h2>
          {crisis.choices.map((choice, index) => (
            <motion.div
              key={choice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setSelectedChoice(choice);
                setShowConfirm(true);
              }}
              className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                selectedChoice?.id === choice.id
                  ? 'bg-violet-900/30 border-violet-500'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{choice.label}</h3>
                  <p className="text-slate-400 mt-1">{choice.description}</p>
                </div>
                <ChevronRight className={`w-6 h-6 transition-transform ${
                  selectedChoice?.id === choice.id ? 'text-violet-400 rotate-90' : 'text-slate-600'
                }`} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Short-term Impact</p>
                  <p className="text-sm text-slate-300">{choice.shortTermImpact}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Long-term Risk</p>
                  <p className="text-sm text-amber-400">{choice.longTermRisk}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Confirm Modal */}
        <AnimatePresence>
          {showConfirm && selectedChoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
              onClick={() => setShowConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 rounded-2xl p-8 max-w-lg w-full border border-slate-700"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Confirm Decision</h3>
                <p className="text-slate-300 mb-6">
                  You are about to: <span className="text-violet-400 font-semibold">{selectedChoice.label}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  This decision will shape the innovation trajectory of Nexus Technologies.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Reconsider
                  </button>
                  <button
                    onClick={() => onChoice(selectedChoice)}
                    className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConsequenceScreen({
  choice,
  crisis,
  onContinue
}: {
  choice: CrisisChoice;
  crisis: InnovationCrisis;
  onContinue: () => void;
}) {
  const [revealIndex, setRevealIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevealIndex((i) => Math.min(i + 1, 8));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const consequences = [
    { label: 'Pipeline Value', value: choice.consequences.pipelineValue, suffix: 'M', positive: choice.consequences.pipelineValue > 0, prefix: '$' },
    { label: 'Success Rate', value: choice.consequences.successRate, suffix: '%', positive: choice.consequences.successRate > 0 },
    { label: 'Time to Market', value: choice.consequences.timeToMarket, suffix: ' mo', positive: choice.consequences.timeToMarket < 0 },
    { label: 'Technical Debt', value: choice.consequences.technicalDebt, suffix: '%', positive: choice.consequences.technicalDebt < 0 },
    { label: 'Creativity Index', value: choice.consequences.creativityIndex, suffix: '%', positive: choice.consequences.creativityIndex > 0 },
    { label: 'Patents', value: choice.consequences.patents, suffix: '', positive: choice.consequences.patents > 0 },
    { label: 'Talent Retention', value: choice.consequences.talentRetention, suffix: '%', positive: choice.consequences.talentRetention > 0 },
    { label: 'Budget Impact', value: choice.consequences.budgetChange, suffix: '%', positive: choice.consequences.budgetChange < 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Innovation Impact</h2>
          <p className="text-slate-400">Quarter {crisis.quarter}: {choice.label}</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-8">
          <div className="space-y-4">
            {consequences.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: index < revealIndex ? 1 : 0.3, x: index < revealIndex ? 0 : -20 }}
                className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0"
              >
                <span className="text-slate-400">{item.label}</span>
                <span className={`font-bold ${
                  item.positive ? 'text-emerald-400' : item.value === 0 ? 'text-slate-400' : 'text-red-400'
                }`}>
                  {item.value > 0 ? '+' : ''}{item.prefix || ''}{item.value}{item.suffix}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {choice.consequences.specialEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: revealIndex >= 8 ? 1 : 0 }}
            className="p-4 bg-violet-900/30 border border-violet-700/50 rounded-xl mb-8"
          >
            <p className="text-violet-300 text-center">
              <Sparkles className="w-5 h-5 inline mr-2" />
              Effect: <span className="font-semibold">{choice.consequences.specialEffect}</span>
            </p>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: revealIndex >= 8 ? 1 : 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl"
        >
          Continue to Quarterly Report
        </motion.button>
      </motion.div>
    </div>
  );
}

function QuarterlyReportScreen({
  state,
  onContinue
}: {
  state: GameState;
  onContinue: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Innovation Portfolio Report</h1>
          <p className="text-slate-400">End of Quarter {state.quarter}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Innovation Metrics */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-violet-400" />
              Innovation Health
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Pipeline Value', value: `$${state.pipelineValue}M`, danger: state.pipelineValue < 80 },
                { label: 'Success Rate', value: `${state.successRate}%`, danger: state.successRate < 40 },
                { label: 'Time to Market', value: `${state.timeToMarket} mo`, danger: state.timeToMarket > 20 },
                { label: 'Creativity Index', value: `${state.creativityIndex}%`, danger: state.creativityIndex < 50 },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-semibold ${item.danger ? 'text-red-400' : 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical & Resources */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Resources & Technical
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Technical Debt', value: `${state.technicalDebt}%`, danger: state.technicalDebt > 50 },
                { label: 'Talent Retention', value: `${state.talentRetention}%`, danger: state.talentRetention < 60 },
                { label: 'R&D Budget', value: `$${state.rdBudget}M` },
                { label: 'Patents', value: `${state.patents} (+${state.patentsPending} pending)` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-semibold ${item.danger ? 'text-red-400' : 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Balance */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Portfolio Balance
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Investment Mix</span>
                <span className="text-slate-500">(Target: 70-20-10)</span>
              </div>
              <div className="h-8 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${state.incrementalShare}%` }}
                >
                  {state.incrementalShare > 15 ? `${state.incrementalShare}%` : ''}
                </div>
                <div
                  className="bg-violet-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${state.adjacentShare}%` }}
                >
                  {state.adjacentShare > 15 ? `${state.adjacentShare}%` : ''}
                </div>
                <div
                  className="bg-amber-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{ width: `${state.breakthroughShare}%` }}
                >
                  {state.breakthroughShare > 10 ? `${state.breakthroughShare}%` : ''}
                </div>
              </div>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-400">Incremental</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-slate-400">Adjacent</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-slate-400">Breakthrough</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stakeholder Sentiment */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Stakeholder Sentiment
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.stakeholders.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <span className="text-2xl">{s.avatar}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.role}</p>
                </div>
                <div className={`text-sm font-bold ${
                  s.sentiment > 20 ? 'text-emerald-400' :
                  s.sentiment < -20 ? 'text-red-400' :
                  'text-amber-400'
                }`}>
                  {s.sentiment > 0 ? '+' : ''}{s.sentiment}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Banners */}
        {state.creativityIndex < 40 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-900/50 border border-red-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <Skull className="w-6 h-6 text-red-400" />
            <p className="text-red-300">
              <span className="font-bold">CRITICAL:</span> Innovation culture is collapsing. Best talent is leaving.
            </p>
          </motion.div>
        )}

        {state.technicalDebt > 60 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-orange-900/50 border border-orange-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <AlertCircle className="w-6 h-6 text-orange-400" />
            <p className="text-orange-300">
              <span className="font-bold">WARNING:</span> Technical debt is crippling development velocity.
            </p>
          </motion.div>
        )}

        {state.competitiveGap < -20 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-amber-900/50 border border-amber-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <p className="text-amber-300">
              <span className="font-bold">ALERT:</span> Competitors are pulling ahead. Market window closing.
            </p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          {state.quarter < 8 ? 'Proceed to Next Quarter' : 'See Final Results'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

function EndingScreen({
  state,
  onRestart
}: {
  state: GameState;
  onRestart: () => void;
}) {
  const endingIcons: Record<EndingType, typeof Crown> = {
    'innovation-stagnation': Eye,
    'portfolio-collapse': Skull,
    'survival': LifeBuoy,
    'innovation-engine': Rocket,
    'market-disruptor': Crown,
  };

  const endingColors: Record<EndingType, string> = {
    'innovation-stagnation': 'from-slate-600 to-slate-700',
    'portfolio-collapse': 'from-red-600 to-red-800',
    'survival': 'from-amber-600 to-orange-600',
    'innovation-engine': 'from-violet-600 to-purple-600',
    'market-disruptor': 'from-emerald-600 to-teal-600',
  };

  const endingTitles: Record<EndingType, string> = {
    'innovation-stagnation': 'Innovation Stagnation',
    'portfolio-collapse': 'Portfolio Collapse',
    'survival': 'Survived',
    'innovation-engine': 'Innovation Engine',
    'market-disruptor': 'Market Disruptor',
  };

  const EndingIcon = state.endingType ? endingIcons[state.endingType] : Crown;
  const colorClass = state.endingType ? endingColors[state.endingType] : 'from-slate-600 to-slate-800';
  const title = state.endingType ? endingTitles[state.endingType] : 'The End';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${colorClass} flex items-center justify-center mx-auto mb-8`}
        >
          <EndingIcon className="w-16 h-16 text-white" />
        </motion.div>

        <h1 className="text-5xl font-black text-white mb-4">{title}</h1>

        <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-8 border border-slate-800 mb-8">
          <p className="text-lg text-slate-300 leading-relaxed">{state.endingNarrative}</p>
        </div>

        {/* Final Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pipeline Value', value: `$${state.pipelineValue}M` },
            { label: 'Success Rate', value: `${state.successRate}%` },
            { label: 'Creativity', value: `${state.creativityIndex}%` },
            { label: 'Patents', value: state.patents.toString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          className="py-4 px-8 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          Play Again
        </motion.button>
      </motion.div>
    </div>
  );
}

// =============================================================================
// MAIN GAME COMPONENT
// =============================================================================

export default function InnovationLabPage() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [lastChoice, setLastChoice] = useState<CrisisChoice | null>(null);

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      quarter: 1,
      phase: 'decision',
      currentCrisis: INNOVATION_CRISES.find((c) => c.quarter === 1) || null,
    }));
  }, []);

  const handleChoice = useCallback((choice: CrisisChoice) => {
    setLastChoice(choice);

    setGameState((prev) => {
      // Apply consequences
      const newPipelineValue = Math.max(0, prev.pipelineValue + choice.consequences.pipelineValue);
      const newSuccessRate = Math.max(0, Math.min(100, prev.successRate + choice.consequences.successRate));
      const newTimeToMarket = Math.max(6, prev.timeToMarket + choice.consequences.timeToMarket);
      const newTechnicalDebt = Math.max(0, Math.min(100, prev.technicalDebt + choice.consequences.technicalDebt));
      const newCreativityIndex = Math.max(0, Math.min(100, prev.creativityIndex + choice.consequences.creativityIndex));
      const newPatents = Math.max(0, prev.patents + choice.consequences.patents);
      const newTalentRetention = Math.max(0, Math.min(100, prev.talentRetention + choice.consequences.talentRetention));
      const newRdBudget = Math.max(20, prev.rdBudget + choice.consequences.budgetChange);

      // Update competitive gap based on decisions
      const gapChange = (choice.consequences.pipelineValue > 10 ? 5 : -2) +
                       (choice.consequences.timeToMarket < 0 ? 3 : -1);
      const newCompetitiveGap = prev.competitiveGap + gapChange;

      // Update stakeholders
      const newStakeholders = prev.stakeholders.map((s) => {
        const effect = choice.consequences.stakeholderEffects.find((e) => e.id === s.id);
        return effect ? { ...s, sentiment: Math.max(-100, Math.min(100, s.sentiment + effect.change)) } : s;
      });

      // Record decision
      const newDecisionHistory = [...prev.decisionHistory, {
        quarter: prev.quarter,
        crisisId: prev.currentCrisis?.id || '',
        choiceId: choice.id,
        choiceLabel: choice.label,
        consequences: choice.consequences,
      }];

      // Update portfolio balance based on effects
      let incrementalShare = prev.incrementalShare;
      let adjacentShare = prev.adjacentShare;
      let breakthroughShare = prev.breakthroughShare;

      if (choice.consequences.specialEffect === 'moonshot-killed') {
        breakthroughShare = Math.max(5, breakthroughShare - 5);
        incrementalShare = Math.min(80, incrementalShare + 5);
      } else if (choice.consequences.specialEffect === 'ai-focus' || choice.consequences.specialEffect === 'tech-acquisition') {
        adjacentShare = Math.min(40, adjacentShare + 5);
        incrementalShare = Math.max(50, incrementalShare - 5);
      } else if (choice.consequences.specialEffect === 'innovation-retreat') {
        breakthroughShare = Math.max(5, breakthroughShare - 5);
        incrementalShare = Math.min(80, incrementalShare + 5);
      }

      return {
        ...prev,
        pipelineValue: newPipelineValue,
        successRate: newSuccessRate,
        timeToMarket: newTimeToMarket,
        technicalDebt: newTechnicalDebt,
        creativityIndex: newCreativityIndex,
        patents: newPatents,
        talentRetention: newTalentRetention,
        rdBudget: newRdBudget,
        competitiveGap: newCompetitiveGap,
        incrementalShare,
        adjacentShare,
        breakthroughShare,
        stakeholders: newStakeholders,
        decisionHistory: newDecisionHistory,
        phase: 'consequence',
      };
    });
  }, []);

  const handleConsequenceContinue = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      phase: 'quarterly-report',
    }));
  }, []);

  const handleQuarterlyContinue = useCallback(() => {
    setGameState((prev) => {
      // Check for game over conditions
      if (prev.pipelineValue <= 50 || prev.talentRetention <= 30 || prev.quarter >= 8) {
        const ending = calculateEnding(prev);
        return {
          ...prev,
          phase: 'ending',
          gameOver: true,
          endingType: ending.type,
          endingNarrative: ending.narrative,
        };
      }

      // Advance to next quarter
      const nextQuarter = prev.quarter + 1;
      const nextCrisis = INNOVATION_CRISES.find((c) => c.quarter === nextQuarter) || null;

      // Apply quarterly changes
      const quarterlyTalentDrift = prev.creativityIndex > 60 ? 2 : -3;
      const quarterlyDebtGrowth = prev.technicalDebt > 40 ? 3 : 0;
      const quarterlyCompetitorProgress = -2; // Competitors always gaining

      return {
        ...prev,
        quarter: nextQuarter,
        phase: 'decision',
        currentCrisis: nextCrisis,
        talentRetention: Math.max(0, Math.min(100, prev.talentRetention + quarterlyTalentDrift)),
        technicalDebt: Math.max(0, Math.min(100, prev.technicalDebt + quarterlyDebtGrowth)),
        competitiveGap: prev.competitiveGap + quarterlyCompetitorProgress,
        patentsPending: Math.max(0, prev.patentsPending + Math.floor(Math.random() * 3) - 1),
      };
    });
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(INITIAL_STATE);
    setLastChoice(null);
  }, []);

  // Render based on phase
  if (gameState.phase === 'intro') {
    return <IntroScreen onStart={startGame} />;
  }

  if (gameState.phase === 'decision' && gameState.currentCrisis) {
    return (
      <CrisisScreen
        crisis={gameState.currentCrisis}
        state={gameState}
        onChoice={handleChoice}
      />
    );
  }

  if (gameState.phase === 'consequence' && lastChoice && gameState.currentCrisis) {
    return (
      <ConsequenceScreen
        choice={lastChoice}
        crisis={gameState.currentCrisis}
        onContinue={handleConsequenceContinue}
      />
    );
  }

  if (gameState.phase === 'quarterly-report') {
    return (
      <QuarterlyReportScreen
        state={gameState}
        onContinue={handleQuarterlyContinue}
      />
    );
  }

  if (gameState.phase === 'ending') {
    return (
      <EndingScreen
        state={gameState}
        onRestart={handleRestart}
      />
    );
  }

  // Fallback
  return <IntroScreen onStart={startGame} />;
}
