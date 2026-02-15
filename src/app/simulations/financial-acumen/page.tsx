'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Scale,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Banknote,
  Landmark,
  TrendingDown as Decline,
  Flame,
  LifeBuoy,
  Crown,
  Skull,
  RefreshCw,
  Play,
} from 'lucide-react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

type Phase = 'intro' | 'briefing' | 'decision' | 'consequence' | 'quarterly-report' | 'ending';
type CreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D';
type EconomicCycle = 'expansion' | 'peak' | 'contraction' | 'trough';
type EndingType = 'bankruptcy' | 'hostile-takeover' | 'survival' | 'turnaround-hero' | 'ipo-success';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  sentiment: number; // -100 to 100
  avatar: string;
  archetype: 'activist' | 'long-term' | 'institutional' | 'founder' | 'creditor';
}

interface FinancialCrisis {
  id: string;
  quarter: number;
  title: string;
  description: string;
  severity: 'moderate' | 'severe' | 'critical';
  category: 'liquidity' | 'credit' | 'market' | 'operational' | 'strategic';
  choices: CrisisChoice[];
  timeLimit?: number;
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
  cashFlow: number;
  creditRating: number;
  investorConfidence: number;
  bankruptcyRisk: number;
  revenue: number;
  costOfCapital: number;
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

interface QuarterlyMetrics {
  revenue: number;
  ebitda: number;
  netIncome: number;
  freeCashFlow: number;
  debtToEquity: number;
  interestCoverage: number;
}

interface GameState {
  quarter: number;
  phase: Phase;
  // Financial metrics
  cashBalance: number;
  cashBurnRate: number;
  revenue: number;
  ebitda: number;
  netIncome: number;
  freeCashFlow: number;
  totalDebt: number;
  equity: number;
  debtToEquity: number;
  interestCoverage: number;
  // Market metrics
  stockPrice: number;
  marketCap: number;
  peRatio: number;
  // Risk metrics
  creditRating: CreditRating;
  costOfDebt: number;
  bankruptcyRisk: number;
  covenantBreached: boolean;
  liquidityStress: boolean;
  // Environment
  economicCycle: EconomicCycle;
  interestRateEnv: number;
  // Stakeholders
  investorConfidence: number;
  stakeholders: Stakeholder[];
  // Game state
  currentCrisis: FinancialCrisis | null;
  decisionHistory: DecisionRecord[];
  quarterlyHistory: QuarterlyMetrics[];
  gameOver: boolean;
  endingType: EndingType | null;
  endingNarrative: string;
}

// =============================================================================
// NARRATIVE CONTENT
// =============================================================================

const COMPANY_STORY = {
  name: 'Titan Industrial Holdings',
  industry: 'Industrial Manufacturing & Technology',
  situation: `You are Marcus Chen, newly appointed CFO of Titan Industrial Holdings, a $2.8B industrial conglomerate.

Your predecessor left suddenly after a whistleblower revealed aggressive revenue recognition practices. The restatement wiped $180M from last year's earnings, and the SEC is circling.

The company has 18 months of runway, but storm clouds are gathering: a major customer representing 22% of revenue is reviewing the relationship, credit rating agencies have you on negative watch, and an activist investor has been quietly accumulating shares.

Your mandate from the board: stabilize the finances, restore creditor confidence, and avoid bankruptcy. The previous CFO made promises the company can't keep. Now you must decide which ones to break.`,

  cfoBackground: `Former investment banker at Goldman Sachs, you joined for the challenge of a turnaround. You've seen companies survive worse—and you've seen them fail. The difference is always in the decisions made under pressure.`,
};

const STAKEHOLDERS: Stakeholder[] = [
  {
    id: 'activist',
    name: 'Victoria Blackwood',
    role: 'Activist Investor (12% stake)',
    sentiment: -20,
    avatar: '👩‍💼',
    archetype: 'activist',
  },
  {
    id: 'institutional',
    name: 'CalPERS Fund',
    role: 'Institutional Investor (8% stake)',
    sentiment: 30,
    avatar: '🏛️',
    archetype: 'institutional',
  },
  {
    id: 'founder',
    name: 'Richard Titan III',
    role: 'Founder Family (15% stake)',
    sentiment: 40,
    avatar: '👴',
    archetype: 'founder',
  },
  {
    id: 'creditor',
    name: 'JP Morgan Syndicate',
    role: 'Lead Creditor ($800M facility)',
    sentiment: 10,
    avatar: '🏦',
    archetype: 'creditor',
  },
  {
    id: 'longterm',
    name: 'Berkshire Holdings',
    role: 'Long-term Investor (6% stake)',
    sentiment: 50,
    avatar: '📈',
    archetype: 'long-term',
  },
];

const FINANCIAL_CRISES: FinancialCrisis[] = [
  // Quarter 1: The Reckoning Begins
  {
    id: 'sec-investigation',
    quarter: 1,
    title: 'SEC Enforcement Action',
    description: `The SEC has concluded its investigation into the revenue recognition issues. They're offering a settlement: $45M fine plus a consent decree requiring enhanced financial controls. Your legal team says fighting it could cost $80M+ and drag on for years. But settling means admitting wrongdoing, which could trigger shareholder lawsuits.`,
    severity: 'severe',
    category: 'strategic',
    choices: [
      {
        id: 'settle-fast',
        label: 'Accept the Settlement',
        description: 'Pay $45M, implement controls, move forward',
        shortTermImpact: 'Immediate cash hit, but certainty',
        longTermRisk: 'May trigger derivative lawsuits',
        consequences: {
          cashFlow: -45,
          creditRating: 0,
          investorConfidence: -5,
          bankruptcyRisk: 2,
          revenue: 0,
          costOfCapital: 0.5,
          stakeholderEffects: [
            { id: 'institutional', change: 10 },
            { id: 'creditor', change: 15 },
            { id: 'activist', change: -10 },
          ],
        },
      },
      {
        id: 'fight-sec',
        label: 'Fight the Charges',
        description: 'Hire elite defense team, contest everything',
        shortTermImpact: 'Uncertainty continues, legal costs mount',
        longTermRisk: 'Could win big or lose catastrophically',
        consequences: {
          cashFlow: -20,
          creditRating: -1,
          investorConfidence: -15,
          bankruptcyRisk: 8,
          revenue: -3,
          costOfCapital: 1.5,
          stakeholderEffects: [
            { id: 'institutional', change: -20 },
            { id: 'creditor', change: -25 },
            { id: 'founder', change: 15 },
          ],
          specialEffect: 'legal-battle',
        },
      },
      {
        id: 'negotiate-harder',
        label: 'Counter-Offer: $25M + No Admission',
        description: 'Push back on terms, risk breakdown',
        shortTermImpact: 'May reduce fine or may escalate',
        longTermRisk: 'SEC could get aggressive',
        consequences: {
          cashFlow: -25,
          creditRating: 0,
          investorConfidence: 5,
          bankruptcyRisk: 4,
          revenue: 0,
          costOfCapital: 0.8,
          stakeholderEffects: [
            { id: 'institutional', change: 5 },
            { id: 'activist', change: 5 },
          ],
        },
      },
    ],
  },
  // Quarter 2: Credit Crunch
  {
    id: 'covenant-breach',
    quarter: 2,
    title: 'Covenant Breach Imminent',
    description: `Your $800M revolving credit facility has a debt-to-EBITDA covenant of 4.0x. After the restatement, you're at 4.3x. JP Morgan is demanding either an immediate paydown of $150M, a covenant waiver (with fees and higher rates), or they'll declare a technical default. A default would trigger cross-acceleration on $400M of bonds.`,
    severity: 'critical',
    category: 'credit',
    choices: [
      {
        id: 'emergency-paydown',
        label: 'Emergency Paydown',
        description: 'Liquidate investments, drain cash to pay $150M',
        shortTermImpact: 'Covenant restored, but cash runway drops',
        longTermRisk: 'Limited flexibility for operations',
        consequences: {
          cashFlow: -150,
          creditRating: 1,
          investorConfidence: -5,
          bankruptcyRisk: -5,
          revenue: 0,
          costOfCapital: -0.5,
          stakeholderEffects: [
            { id: 'creditor', change: 25 },
            { id: 'activist', change: -15 },
          ],
        },
      },
      {
        id: 'waiver-request',
        label: 'Negotiate Covenant Waiver',
        description: 'Pay 2% fee, accept rate increase, buy time',
        shortTermImpact: 'Breathing room, but higher costs',
        longTermRisk: 'Sets precedent for future negotiations',
        consequences: {
          cashFlow: -16,
          creditRating: -1,
          investorConfidence: 0,
          bankruptcyRisk: 3,
          revenue: 0,
          costOfCapital: 2,
          stakeholderEffects: [
            { id: 'creditor', change: 5 },
            { id: 'institutional', change: -5 },
          ],
          specialEffect: 'covenant-waiver',
        },
      },
      {
        id: 'asset-sale',
        label: 'Emergency Asset Sale',
        description: 'Sell the Aerospace division for $200M (below value)',
        shortTermImpact: 'Generates cash, loses strategic asset',
        longTermRisk: 'Reduces diversification, signals distress',
        consequences: {
          cashFlow: 200,
          creditRating: 0,
          investorConfidence: -10,
          bankruptcyRisk: -8,
          revenue: -8,
          costOfCapital: 0,
          stakeholderEffects: [
            { id: 'creditor', change: 20 },
            { id: 'founder', change: -30 },
            { id: 'activist', change: 10 },
          ],
          specialEffect: 'asset-sold',
        },
      },
    ],
  },
  // Quarter 3: Customer Exodus
  {
    id: 'major-customer-review',
    quarter: 3,
    title: 'Strategic Customer at Risk',
    description: `Caterpillar, representing 22% of revenue, has completed their supplier review. Their procurement chief just called: they're concerned about your financial stability and considering dual-sourcing with a competitor. They want either a 15% price reduction or financial guarantees (standby LC) to continue the relationship.`,
    severity: 'severe',
    category: 'operational',
    choices: [
      {
        id: 'price-concession',
        label: 'Accept 15% Price Reduction',
        description: 'Protect the relationship, absorb margin hit',
        shortTermImpact: 'Revenue preserved, margins crushed',
        longTermRisk: 'Other customers may demand same',
        consequences: {
          cashFlow: -12,
          creditRating: 0,
          investorConfidence: -8,
          bankruptcyRisk: 5,
          revenue: -4,
          costOfCapital: 0.5,
          stakeholderEffects: [
            { id: 'activist', change: -20 },
            { id: 'institutional', change: -10 },
          ],
          specialEffect: 'margin-compression',
        },
      },
      {
        id: 'standby-lc',
        label: 'Provide Financial Guarantee',
        description: 'Issue $50M standby letter of credit',
        shortTermImpact: 'Ties up credit capacity',
        longTermRisk: 'Reduces financial flexibility',
        consequences: {
          cashFlow: -5,
          creditRating: -1,
          investorConfidence: 0,
          bankruptcyRisk: 3,
          revenue: 0,
          costOfCapital: 0.3,
          stakeholderEffects: [
            { id: 'creditor', change: -10 },
          ],
        },
      },
      {
        id: 'call-bluff',
        label: 'Call Their Bluff',
        description: 'Stand firm—switching costs are high for them too',
        shortTermImpact: 'Risk losing major customer',
        longTermRisk: 'Could trigger cascade of customer reviews',
        consequences: {
          cashFlow: 0,
          creditRating: 0,
          investorConfidence: 10,
          bankruptcyRisk: 15,
          revenue: -18,
          costOfCapital: 1,
          stakeholderEffects: [
            { id: 'activist', change: 15 },
            { id: 'founder', change: 10 },
            { id: 'creditor', change: -20 },
          ],
          specialEffect: 'customer-gamble',
        },
      },
    ],
  },
  // Quarter 4: Activist Attack
  {
    id: 'activist-campaign',
    quarter: 4,
    title: 'Activist Goes Public',
    description: `Victoria Blackwood has launched a public campaign. Her presentation "Titan's Tower of Debt" is trending on FinTwit. She's demanding three board seats, a strategic review, and your resignation. The proxy fight will cost $15M+ to defend. Your stock is down 12% since her announcement.`,
    severity: 'severe',
    category: 'strategic',
    choices: [
      {
        id: 'settle-activist',
        label: 'Negotiate Settlement',
        description: 'Offer two board seats, form strategic committee',
        shortTermImpact: 'Ends uncertainty, shares some control',
        longTermRisk: 'Activist influence on strategy',
        consequences: {
          cashFlow: -3,
          creditRating: 0,
          investorConfidence: 5,
          bankruptcyRisk: -3,
          revenue: 0,
          costOfCapital: -0.3,
          stakeholderEffects: [
            { id: 'activist', change: 40 },
            { id: 'founder', change: -25 },
            { id: 'institutional', change: 15 },
          ],
          specialEffect: 'activist-settlement',
        },
      },
      {
        id: 'fight-proxy',
        label: 'Fight the Proxy War',
        description: 'Full defense campaign, rally institutional support',
        shortTermImpact: 'Expensive, distracting, uncertain',
        longTermRisk: 'Could still lose, damage relationships',
        consequences: {
          cashFlow: -18,
          creditRating: 0,
          investorConfidence: -10,
          bankruptcyRisk: 5,
          revenue: -2,
          costOfCapital: 0.5,
          stakeholderEffects: [
            { id: 'activist', change: -30 },
            { id: 'institutional', change: -10 },
            { id: 'founder', change: 20 },
          ],
        },
      },
      {
        id: 'preemptive-plan',
        label: 'Announce Transformation Plan',
        description: 'Preempt with your own strategic review',
        shortTermImpact: 'Shows proactive leadership',
        longTermRisk: 'Must deliver on promises',
        consequences: {
          cashFlow: -8,
          creditRating: 0,
          investorConfidence: 15,
          bankruptcyRisk: 0,
          revenue: 0,
          costOfCapital: -0.5,
          stakeholderEffects: [
            { id: 'activist', change: 10 },
            { id: 'institutional', change: 20 },
            { id: 'longterm', change: 15 },
          ],
          specialEffect: 'transformation-plan',
        },
      },
    ],
  },
  // Quarter 5: Market Crash
  {
    id: 'market-correction',
    quarter: 5,
    title: 'Market Correction',
    description: `The Fed just raised rates 75bps in an emergency meeting. Industrial stocks are down 25% in a week. Your stock has been hit harder—down 35%—because of your leverage. Bond yields are spiking. Your $200M bond maturity in Q7 now looks problematic. Refinancing costs have doubled.`,
    severity: 'critical',
    category: 'market',
    choices: [
      {
        id: 'early-refinance',
        label: 'Refinance Now at Higher Rates',
        description: 'Lock in 9.5% before rates go higher',
        shortTermImpact: 'Higher interest costs, but certainty',
        longTermRisk: 'Locked into expensive debt',
        consequences: {
          cashFlow: -8,
          creditRating: 0,
          investorConfidence: 5,
          bankruptcyRisk: -10,
          revenue: 0,
          costOfCapital: 2,
          stakeholderEffects: [
            { id: 'creditor', change: 15 },
            { id: 'institutional', change: 5 },
          ],
          specialEffect: 'refinanced',
        },
      },
      {
        id: 'wait-and-see',
        label: 'Wait for Markets to Stabilize',
        description: 'Bet on rate cuts or market recovery',
        shortTermImpact: 'No immediate cost',
        longTermRisk: 'Rates could go higher, markets could panic',
        consequences: {
          cashFlow: 0,
          creditRating: -1,
          investorConfidence: -5,
          bankruptcyRisk: 12,
          revenue: 0,
          costOfCapital: 0,
          stakeholderEffects: [
            { id: 'creditor', change: -15 },
            { id: 'activist', change: -10 },
          ],
        },
      },
      {
        id: 'equity-raise',
        label: 'Emergency Equity Raise',
        description: 'Issue $150M equity at distressed prices (40% dilution)',
        shortTermImpact: 'Massive dilution, but fortress balance sheet',
        longTermRisk: 'Shareholders furious, takeover risk',
        consequences: {
          cashFlow: 150,
          creditRating: 2,
          investorConfidence: -20,
          bankruptcyRisk: -25,
          revenue: 0,
          costOfCapital: -1,
          stakeholderEffects: [
            { id: 'founder', change: -35 },
            { id: 'institutional', change: -15 },
            { id: 'creditor', change: 30 },
          ],
          specialEffect: 'dilution',
        },
      },
    ],
  },
  // Quarter 6: Operational Crisis
  {
    id: 'plant-shutdown',
    quarter: 6,
    title: 'Critical Plant Failure',
    description: `Your largest manufacturing plant in Ohio just had a catastrophic equipment failure. The main production line is down. Repairs will cost $35M and take 8 weeks. Insurance covers $20M but with a 90-day delay. You're already behind on orders. Customers are asking about delivery guarantees.`,
    severity: 'severe',
    category: 'operational',
    choices: [
      {
        id: 'expedite-repairs',
        label: 'Expedited Emergency Repairs',
        description: 'Pay premium for 4-week repair, $55M total',
        shortTermImpact: 'Faster recovery, higher cost',
        longTermRisk: 'Strains cash position',
        consequences: {
          cashFlow: -55,
          creditRating: 0,
          investorConfidence: 5,
          bankruptcyRisk: 5,
          revenue: -3,
          costOfCapital: 0,
          stakeholderEffects: [
            { id: 'creditor', change: -5 },
          ],
        },
      },
      {
        id: 'standard-repairs',
        label: 'Standard Repair Timeline',
        description: 'Accept 8-week downtime, $35M cost',
        shortTermImpact: 'Customer relationships strained',
        longTermRisk: 'May lose orders to competitors',
        consequences: {
          cashFlow: -35,
          creditRating: 0,
          investorConfidence: -5,
          bankruptcyRisk: 8,
          revenue: -8,
          costOfCapital: 0.3,
          stakeholderEffects: [
            { id: 'activist', change: -10 },
          ],
        },
      },
      {
        id: 'outsource-production',
        label: 'Emergency Outsourcing',
        description: 'Contract with competitor to fulfill orders',
        shortTermImpact: 'Maintains customer relationships',
        longTermRisk: 'Competitor learns your processes, margin hit',
        consequences: {
          cashFlow: -25,
          creditRating: 0,
          investorConfidence: 0,
          bankruptcyRisk: 3,
          revenue: -2,
          costOfCapital: 0,
          stakeholderEffects: [
            { id: 'founder', change: -15 },
            { id: 'longterm', change: -10 },
          ],
          specialEffect: 'outsourced',
        },
      },
    ],
  },
  // Quarter 7: The Reckoning
  {
    id: 'hostile-bid',
    quarter: 7,
    title: 'Hostile Takeover Bid',
    description: `Apex Industrial has launched a hostile takeover bid at $18/share—a 25% premium to yesterday's close, but 40% below your 52-week high. Your poison pill kicks in at 15%, but Apex is offering to acquire the whole company. The board is divided. Some see it as salvation, others as theft.`,
    severity: 'critical',
    category: 'strategic',
    choices: [
      {
        id: 'reject-bid',
        label: 'Reject and Defend',
        description: 'Activate defenses, seek white knight',
        shortTermImpact: 'Independence preserved (maybe)',
        longTermRisk: 'Apex may raise bid or go hostile to shareholders',
        consequences: {
          cashFlow: -12,
          creditRating: 0,
          investorConfidence: -15,
          bankruptcyRisk: 5,
          revenue: 0,
          costOfCapital: 1,
          stakeholderEffects: [
            { id: 'activist', change: -25 },
            { id: 'institutional', change: -20 },
            { id: 'founder', change: 25 },
          ],
        },
      },
      {
        id: 'negotiate-higher',
        label: 'Negotiate for Higher Price',
        description: 'Engage but demand $24/share',
        shortTermImpact: 'Shows willingness to deal',
        longTermRisk: 'May end up selling anyway',
        consequences: {
          cashFlow: 0,
          creditRating: 0,
          investorConfidence: 10,
          bankruptcyRisk: -5,
          revenue: 0,
          costOfCapital: 0,
          stakeholderEffects: [
            { id: 'activist', change: 20 },
            { id: 'institutional', change: 15 },
            { id: 'creditor', change: 10 },
          ],
          specialEffect: 'negotiating-sale',
        },
      },
      {
        id: 'leveraged-recap',
        label: 'Leveraged Recapitalization',
        description: 'Special dividend funded by new debt, makes takeover expensive',
        shortTermImpact: 'Shareholders get cash, company gets debt',
        longTermRisk: 'Significantly increases leverage',
        consequences: {
          cashFlow: -80,
          creditRating: -2,
          investorConfidence: 5,
          bankruptcyRisk: 20,
          revenue: 0,
          costOfCapital: 2.5,
          stakeholderEffects: [
            { id: 'founder', change: 15 },
            { id: 'institutional', change: 10 },
            { id: 'creditor', change: -30 },
          ],
          specialEffect: 'leveraged-recap',
        },
      },
    ],
  },
  // Quarter 8: Final Crisis
  {
    id: 'final-reckoning',
    quarter: 8,
    title: 'The Final Reckoning',
    description: `It's year-end. The board is meeting to decide the company's fate. Your actions over the past two years have led to this moment. The creditors are in the room. The activists are on the call. The founder is watching. What's your final move?`,
    severity: 'critical',
    category: 'strategic',
    choices: [
      {
        id: 'turnaround-complete',
        label: 'Present Turnaround Success',
        description: 'Show the board how far you\'ve come',
        shortTermImpact: 'Rally support for continued independence',
        longTermRisk: 'Must have the numbers to back it up',
        consequences: {
          cashFlow: 0,
          creditRating: 1,
          investorConfidence: 20,
          bankruptcyRisk: -10,
          revenue: 5,
          costOfCapital: -0.5,
          stakeholderEffects: [
            { id: 'longterm', change: 20 },
            { id: 'institutional', change: 15 },
            { id: 'founder', change: 25 },
          ],
        },
      },
      {
        id: 'strategic-sale',
        label: 'Recommend Strategic Sale',
        description: 'Advise the board to sell at premium',
        shortTermImpact: 'Shareholders get liquidity',
        longTermRisk: 'Company ceases to exist independently',
        consequences: {
          cashFlow: 50,
          creditRating: 0,
          investorConfidence: 15,
          bankruptcyRisk: -30,
          revenue: 0,
          costOfCapital: 0,
          stakeholderEffects: [
            { id: 'activist', change: 30 },
            { id: 'creditor', change: 25 },
            { id: 'founder', change: -40 },
          ],
          specialEffect: 'strategic-sale',
        },
      },
      {
        id: 'ipo-spinoff',
        label: 'IPO High-Growth Division',
        description: 'Spin off tech division at high multiple',
        shortTermImpact: 'Unlocks hidden value, generates cash',
        longTermRisk: 'Loses best asset, remaining company weaker',
        consequences: {
          cashFlow: 120,
          creditRating: 1,
          investorConfidence: 25,
          bankruptcyRisk: -20,
          revenue: -5,
          costOfCapital: -1,
          stakeholderEffects: [
            { id: 'activist', change: 25 },
            { id: 'institutional', change: 20 },
            { id: 'longterm', change: 15 },
          ],
          specialEffect: 'ipo-spinoff',
        },
      },
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const CREDIT_RATING_ORDER: CreditRating[] = ['D', 'CCC', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA'];

function adjustCreditRating(current: CreditRating, change: number): CreditRating {
  const currentIndex = CREDIT_RATING_ORDER.indexOf(current);
  const newIndex = Math.max(0, Math.min(CREDIT_RATING_ORDER.length - 1, currentIndex + change));
  return CREDIT_RATING_ORDER[newIndex];
}

function getCreditRatingColor(rating: CreditRating): string {
  const colors: Record<CreditRating, string> = {
    AAA: 'from-emerald-600 to-emerald-400',
    AA: 'from-emerald-600 to-green-400',
    A: 'from-green-600 to-lime-400',
    BBB: 'from-amber-600 to-yellow-400',
    BB: 'from-orange-600 to-amber-400',
    B: 'from-orange-600 to-red-400',
    CCC: 'from-red-600 to-red-400',
    D: 'from-red-800 to-red-600',
  };
  return colors[rating];
}

function calculateEnding(state: GameState): { type: EndingType; narrative: string } {
  // Bankruptcy check
  if (state.bankruptcyRisk >= 80 || state.cashBalance <= 0) {
    return {
      type: 'bankruptcy',
      narrative: `The weight of debt finally crushed Titan Industrial. On a gray Tuesday morning, you filed Chapter 11. The creditors picked over the carcass, the employees scattered, and Victoria Blackwood tweeted "I told you so." Your turnaround failed—but you learned more about survival in two years than most CFOs learn in a lifetime.`,
    };
  }

  // Hostile takeover
  if (state.investorConfidence < 20 && state.stockPrice < 12) {
    return {
      type: 'hostile-takeover',
      narrative: `Apex Industrial won. Despite your defenses, shareholders tendered their shares for $22/share—a premium, but far below what the company was worth before the crisis. You negotiated a decent severance and a non-disparagement clause. Six months later, Apex laid off 40% of the workforce. Sometimes survival isn't victory.`,
    };
  }

  // IPO Success
  if (state.cashBalance > 200 && state.investorConfidence > 70) {
    return {
      type: 'ipo-success',
      narrative: `Against all odds, you did it. The tech division IPO raised $400M at a $2B valuation. Titan Industrial's stock doubled. Victoria Blackwood sold her stake at a profit and moved on to her next target. The founder shook your hand and said three words: "You saved us." CFO of the Year, they called you. But you know the truth: you got lucky, you got smart, and you never gave up.`,
    };
  }

  // Turnaround Hero
  if (state.bankruptcyRisk < 25 && state.creditRating !== 'D' && state.creditRating !== 'CCC' && state.investorConfidence > 50) {
    return {
      type: 'turnaround-hero',
      narrative: `Two years ago, they gave Titan Industrial six months to live. Today, you rang the bell at the NYSE to celebrate your return to investment-grade credit. The SEC settlement is ancient history. The activist is an ally. The customers are loyal. You didn't just survive—you built something stronger. This is what leadership looks like.`,
    };
  }

  // Survival
  return {
    type: 'survival',
    narrative: `Titan Industrial survived. Not thrived—survived. The company is smaller, leaner, and humbler than before. Some divisions were sold. Some people were let go. But the lights are still on, the creditors are paid, and there's a future to fight for. In the world of corporate turnarounds, survival is victory. Everything else is a bonus.`,
  };
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const INITIAL_STATE: GameState = {
  quarter: 0,
  phase: 'intro',
  cashBalance: 145,
  cashBurnRate: 8,
  revenue: 485,
  ebitda: 95,
  netIncome: 28,
  freeCashFlow: -12,
  totalDebt: 620,
  equity: 380,
  debtToEquity: 1.63,
  interestCoverage: 2.8,
  stockPrice: 14.5,
  marketCap: 1.2,
  peRatio: 12.5,
  creditRating: 'BB',
  costOfDebt: 7.5,
  bankruptcyRisk: 25,
  covenantBreached: false,
  liquidityStress: false,
  economicCycle: 'contraction',
  interestRateEnv: 5.25,
  investorConfidence: 35,
  stakeholders: STAKEHOLDERS,
  currentCrisis: null,
  decisionHistory: [],
  quarterlyHistory: [],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/scenarios/scenario-04.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      )}
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-emerald-950/80" />

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
            className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <DollarSign className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-5xl font-black text-white mb-4">Financial Acumen</h1>
          <p className="text-2xl text-emerald-400 font-light">Capital, Risk, and Survival</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{COMPANY_STORY.name}</h2>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line mb-6">
            {COMPANY_STORY.situation}
          </p>
          <div className="p-4 bg-emerald-900/30 border border-emerald-700/50 rounded-xl">
            <p className="text-emerald-300 italic">{COMPANY_STORY.cfoBackground}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Clock, label: '8 Quarters', desc: '2 Years of Crisis' },
            { icon: AlertTriangle, label: 'High Stakes', desc: 'Bankruptcy Risk Real' },
            { icon: Target, label: 'Your Mission', desc: 'Survive & Rebuild' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-slate-800/50 rounded-xl p-4 text-center"
            >
              <item.icon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-white">{item.label}</p>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xl font-bold rounded-xl flex items-center justify-center gap-3 hover:from-emerald-500 hover:to-teal-500 transition-all"
        >
          <Play className="w-6 h-6" />
          Begin Your Tenure as CFO
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
  crisis: FinancialCrisis;
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
    liquidity: Wallet,
    credit: CreditCard,
    market: TrendingDown,
    operational: Building2,
    strategic: Target,
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
            { label: 'Cash', value: `$${state.cashBalance}M`, color: state.cashBalance < 50 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Credit Rating', value: state.creditRating, color: ['D', 'CCC', 'B'].includes(state.creditRating) ? 'text-red-400' : 'text-amber-400' },
            { label: 'Bankruptcy Risk', value: `${state.bankruptcyRisk}%`, color: state.bankruptcyRisk > 50 ? 'text-red-400' : 'text-amber-400' },
            { label: 'Investor Confidence', value: `${state.investorConfidence}%`, color: state.investorConfidence < 30 ? 'text-red-400' : 'text-emerald-400' },
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
                  ? 'bg-emerald-900/30 border-emerald-500'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{choice.label}</h3>
                  <p className="text-slate-400 mt-1">{choice.description}</p>
                </div>
                <ChevronRight className={`w-6 h-6 transition-transform ${
                  selectedChoice?.id === choice.id ? 'text-emerald-400 rotate-90' : 'text-slate-600'
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
                  You are about to: <span className="text-emerald-400 font-semibold">{selectedChoice.label}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  This decision cannot be undone. The consequences will unfold over the coming quarters.
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
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all"
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
  crisis: FinancialCrisis;
  onContinue: () => void;
}) {
  const [revealIndex, setRevealIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevealIndex((i) => Math.min(i + 1, 6));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  const consequences = [
    { label: 'Cash Flow Impact', value: choice.consequences.cashFlow, suffix: 'M', positive: choice.consequences.cashFlow > 0 },
    { label: 'Credit Rating', value: choice.consequences.creditRating, suffix: ' notch', positive: choice.consequences.creditRating > 0 },
    { label: 'Investor Confidence', value: choice.consequences.investorConfidence, suffix: '%', positive: choice.consequences.investorConfidence > 0 },
    { label: 'Bankruptcy Risk', value: choice.consequences.bankruptcyRisk, suffix: '%', positive: choice.consequences.bankruptcyRisk < 0 },
    { label: 'Revenue Impact', value: choice.consequences.revenue, suffix: '%', positive: choice.consequences.revenue > 0 },
    { label: 'Cost of Capital', value: choice.consequences.costOfCapital, suffix: '%', positive: choice.consequences.costOfCapital < 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Consequences Unfold</h2>
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
                  {item.value > 0 ? '+' : ''}{item.value}{item.suffix}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {choice.consequences.specialEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: revealIndex >= 6 ? 1 : 0 }}
            className="p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl mb-8"
          >
            <p className="text-amber-300 text-center">
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              Special Effect: <span className="font-semibold">{choice.consequences.specialEffect}</span>
            </p>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: revealIndex >= 6 ? 1 : 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl"
        >
          Continue to Next Quarter
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
          <h1 className="text-4xl font-bold text-white mb-2">Quarterly Report</h1>
          <p className="text-slate-400">End of Quarter {state.quarter}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Financial Health */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Financial Health
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Cash Balance', value: `$${state.cashBalance}M` },
                { label: 'Revenue', value: `$${state.revenue}M` },
                { label: 'EBITDA', value: `$${state.ebitda}M` },
                { label: 'Free Cash Flow', value: `$${state.freeCashFlow}M` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Risk Assessment
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Credit Rating</span>
                <span className={`font-bold ${
                  ['D', 'CCC', 'B'].includes(state.creditRating) ? 'text-red-400' :
                  ['BB', 'BBB'].includes(state.creditRating) ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>{state.creditRating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bankruptcy Risk</span>
                <span className={`font-bold ${
                  state.bankruptcyRisk > 50 ? 'text-red-400' :
                  state.bankruptcyRisk > 25 ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>{state.bankruptcyRisk}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Debt-to-Equity</span>
                <span className="font-semibold text-white">{state.debtToEquity.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interest Coverage</span>
                <span className={`font-bold ${state.interestCoverage < 2 ? 'text-red-400' : 'text-white'}`}>
                  {state.interestCoverage.toFixed(1)}x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stakeholder Sentiment */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
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
        {state.bankruptcyRisk > 50 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-900/50 border border-red-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <Skull className="w-6 h-6 text-red-400" />
            <p className="text-red-300">
              <span className="font-bold">CRITICAL:</span> Bankruptcy risk is dangerously high. Immediate action required.
            </p>
          </motion.div>
        )}

        {state.covenantBreached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-orange-900/50 border border-orange-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <AlertCircle className="w-6 h-6 text-orange-400" />
            <p className="text-orange-300">
              <span className="font-bold">WARNING:</span> Debt covenants have been breached. Lenders may accelerate repayment.
            </p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
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
    'bankruptcy': Skull,
    'hostile-takeover': Building2,
    'survival': LifeBuoy,
    'turnaround-hero': Crown,
    'ipo-success': Flame,
  };

  const endingColors: Record<EndingType, string> = {
    'bankruptcy': 'from-red-600 to-red-800',
    'hostile-takeover': 'from-orange-600 to-red-600',
    'survival': 'from-amber-600 to-orange-600',
    'turnaround-hero': 'from-emerald-600 to-teal-600',
    'ipo-success': 'from-violet-600 to-purple-600',
  };

  const endingTitles: Record<EndingType, string> = {
    'bankruptcy': 'Chapter 11',
    'hostile-takeover': 'Acquired',
    'survival': 'Survived',
    'turnaround-hero': 'Turnaround Hero',
    'ipo-success': 'Victory',
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
            { label: 'Final Cash', value: `$${state.cashBalance}M` },
            { label: 'Credit Rating', value: state.creditRating },
            { label: 'Decisions Made', value: state.decisionHistory.length },
            { label: 'Quarters Survived', value: state.quarter },
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
          className="py-4 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto"
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

export default function FinancialAcumenPage() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [lastChoice, setLastChoice] = useState<CrisisChoice | null>(null);

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      quarter: 1,
      phase: 'decision',
      currentCrisis: FINANCIAL_CRISES.find((c) => c.quarter === 1) || null,
    }));
  }, []);

  const handleChoice = useCallback((choice: CrisisChoice) => {
    setLastChoice(choice);

    setGameState((prev) => {
      // Apply consequences
      const newCashBalance = prev.cashBalance + choice.consequences.cashFlow;
      const newCreditRating = adjustCreditRating(prev.creditRating, choice.consequences.creditRating);
      const newInvestorConfidence = Math.max(0, Math.min(100, prev.investorConfidence + choice.consequences.investorConfidence));
      const newBankruptcyRisk = Math.max(0, Math.min(100, prev.bankruptcyRisk + choice.consequences.bankruptcyRisk));
      const newRevenue = prev.revenue * (1 + choice.consequences.revenue / 100);
      const newCostOfDebt = prev.costOfDebt + choice.consequences.costOfCapital;

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

      return {
        ...prev,
        cashBalance: newCashBalance,
        creditRating: newCreditRating,
        investorConfidence: newInvestorConfidence,
        bankruptcyRisk: newBankruptcyRisk,
        revenue: Math.round(newRevenue),
        costOfDebt: newCostOfDebt,
        stakeholders: newStakeholders,
        decisionHistory: newDecisionHistory,
        phase: 'consequence',
        covenantBreached: newCashBalance < 50 || newBankruptcyRisk > 60,
        liquidityStress: newCashBalance < 30,
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
      if (prev.bankruptcyRisk >= 80 || prev.cashBalance <= 0 || prev.quarter >= 8) {
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
      const nextCrisis = FINANCIAL_CRISES.find((c) => c.quarter === nextQuarter) || null;

      // Apply quarterly changes
      const quarterlyBurn = prev.cashBurnRate * (0.9 + Math.random() * 0.2);
      const quarterlyRevenue = prev.revenue * (0.98 + Math.random() * 0.04);

      return {
        ...prev,
        quarter: nextQuarter,
        phase: 'decision',
        currentCrisis: nextCrisis,
        cashBalance: Math.round(prev.cashBalance - quarterlyBurn),
        revenue: Math.round(quarterlyRevenue),
        ebitda: Math.round(quarterlyRevenue * 0.18),
        freeCashFlow: Math.round(quarterlyRevenue * 0.02 - quarterlyBurn),
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
