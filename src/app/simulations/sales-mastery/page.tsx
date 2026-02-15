'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Award,
  MapPin,
  UserMinus,
  UserPlus,
  Heart,
  AlertCircle,
  Trophy,
  Flame,
  Handshake,
  Crown,
  Skull,
  LifeBuoy,
  RefreshCw,
  Play,
  Percent,
  Shield,
  XCircle,
  Gift,
  Scale,
  Briefcase,
  BadgeDollarSign,
  ThumbsDown,
  Users2,
  Building2,
} from 'lucide-react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

type Phase = 'intro' | 'briefing' | 'decision' | 'consequence' | 'quarterly-report' | 'ending';
type EndingType = 'fired-missing-targets' | 'team-exodus' | 'survival' | 'sales-champion' | 'revenue-machine';

interface SalesRep {
  id: string;
  name: string;
  region: string;
  performance: number; // % of quota
  motivation: number; // 0-100
  tenure: number; // years
  atRisk: boolean;
  isTopPerformer: boolean;
}

interface SalesCrisis {
  id: string;
  quarter: number;
  title: string;
  description: string;
  severity: 'moderate' | 'severe' | 'critical';
  category: 'quota' | 'compensation' | 'territory' | 'pricing' | 'talent' | 'customer' | 'pipeline';
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
  revenue: number;
  quotaAttainment: number;
  customerTrust: number;
  teamMorale: number;
  burnout: number;
  discountTrend: number;
  retention: number;
  pipelineHealth: number;
  specialEffect?: string;
}

interface DecisionRecord {
  quarter: number;
  crisisId: string;
  choiceId: string;
  choiceLabel: string;
  consequences: ChoiceConsequence;
}

interface GameState {
  quarter: number;
  phase: Phase;
  // Revenue metrics
  revenue: number; // $M
  revenueTarget: number; // $M
  quotaAttainment: number; // %
  bookings: number; // $M
  pipeline: number; // $M
  pipelineCoverage: number; // ratio
  // Customer metrics
  customerTrust: number; // 0-100
  customerRetention: number; // %
  newLogos: number;
  nrr: number; // Net Revenue Retention %
  churnRisk: number; // % of ARR at risk
  // Team metrics
  teamMorale: number; // 0-100
  burnoutIndex: number; // 0-100 (higher = worse)
  attritionRate: number; // %
  openReqs: number;
  topPerformerRisk: number; // 0-100 (risk of losing top performers)
  // Sales health metrics
  winRate: number; // %
  avgDealSize: number; // $K
  salesCycle: number; // days
  discountTrend: number; // 0-100 (higher = more discounting)
  sandbagIndex: number; // 0-100 (higher = more sandbagging)
  pipelineHealth: number; // 0-100
  // Territory & Comp
  territoryBalance: number; // 0-100
  compSatisfaction: number; // 0-100
  // Team data
  salesReps: SalesRep[];
  // Game state
  currentCrisis: SalesCrisis | null;
  decisionHistory: DecisionRecord[];
  activeEffects: string[];
  gameOver: boolean;
  endingType: EndingType | null;
  endingNarrative: string;
}

// =============================================================================
// NARRATIVE CONTENT
// =============================================================================

const COMPANY_STORY = {
  name: 'Apex Software',
  industry: 'Enterprise SaaS',
  situation: `You are Jordan Blake, newly appointed VP of Sales at Apex Software, a $85M ARR enterprise SaaS company.

Your predecessor was fired six weeks ago after missing quota for three consecutive quarters. The board has lost patience. Revenue growth has stalled at 12% while competitors are growing 40%+.

The situation you've inherited is fragile:
- 40% of the sales team missed quota last quarter
- Your top performer is interviewing at Salesforce
- Customers are complaining about aggressive upselling tactics
- The pipeline is stuffed with "happy ears" deals that won't close
- Finance is demanding you cut discounts by 50%
- Marketing says sales is wasting all their leads

The CEO gave you eight quarters to turn this around. "Hit the number or we're all out of jobs," she said. No pressure.`,

  vpBackground: `Former enterprise AE who rose through the ranks at Oracle and HubSpot. You've seen what good looks like—and what bad looks like. Apex is somewhere in between, sliding toward bad. Your playbook: build trust, fix fundamentals, then scale. But the board wants results now, not later.`,
};

const INITIAL_SALES_REPS: SalesRep[] = [
  { id: 'rep-1', name: 'Marcus Chen', region: 'West', performance: 156, motivation: 72, tenure: 4, atRisk: true, isTopPerformer: true },
  { id: 'rep-2', name: 'Sarah Williams', region: 'East', performance: 142, motivation: 85, tenure: 3, atRisk: false, isTopPerformer: true },
  { id: 'rep-3', name: 'Jake Rodriguez', region: 'Central', performance: 98, motivation: 68, tenure: 2, atRisk: false, isTopPerformer: false },
  { id: 'rep-4', name: 'Emily Thompson', region: 'West', performance: 87, motivation: 55, tenure: 1, atRisk: true, isTopPerformer: false },
  { id: 'rep-5', name: 'David Park', region: 'East', performance: 76, motivation: 45, tenure: 2, atRisk: true, isTopPerformer: false },
  { id: 'rep-6', name: 'Lisa Johnson', region: 'Central', performance: 112, motivation: 78, tenure: 5, atRisk: false, isTopPerformer: false },
];

const SALES_CRISES: SalesCrisis[] = [
  // Quarter 1: The Quota Crucible
  {
    id: 'quota-reset',
    quarter: 1,
    title: 'The Quota Crucible',
    description: `It's annual planning time and the board wants 35% revenue growth—up from your current 12%. Finance has proposed increasing quotas by 40% across the board. Your sales team is already demoralized from missing targets. A 40% quota increase could break them. But pushing back on the board could cost you your job before you've even started.`,
    severity: 'critical',
    category: 'quota',
    choices: [
      {
        id: 'accept-quota',
        label: 'Accept the 40% Increase',
        description: 'Take the board\'s number, figure out how to hit it',
        shortTermImpact: 'Shows alignment with leadership',
        longTermRisk: 'Team may see quotas as unattainable and give up',
        consequences: {
          revenue: 5,
          quotaAttainment: -20,
          customerTrust: -5,
          teamMorale: -25,
          burnout: 20,
          discountTrend: 10,
          retention: -5,
          pipelineHealth: -10,
          specialEffect: 'crushing-quotas',
        },
      },
      {
        id: 'counter-proposal',
        label: 'Counter with 25% + Investment',
        description: 'Propose lower quota with headcount and enablement investment',
        shortTermImpact: 'May frustrate the board',
        longTermRisk: 'Seen as not aggressive enough',
        consequences: {
          revenue: -3,
          quotaAttainment: 5,
          customerTrust: 0,
          teamMorale: 10,
          burnout: -5,
          discountTrend: 0,
          retention: 5,
          pipelineHealth: 10,
        },
      },
      {
        id: 'tiered-quota',
        label: 'Propose Tiered Quota Model',
        description: 'Higher quotas for top performers, attainable for others',
        shortTermImpact: 'Creates quota inequality',
        longTermRisk: 'May create team friction',
        consequences: {
          revenue: 2,
          quotaAttainment: -5,
          customerTrust: 0,
          teamMorale: -5,
          burnout: 5,
          discountTrend: 0,
          retention: 0,
          pipelineHealth: 5,
          specialEffect: 'tiered-quotas',
        },
      },
    ],
  },
  // Quarter 2: Top Performer Hostage Situation
  {
    id: 'top-performer-leaving',
    quarter: 2,
    title: 'The Rainmaker Ultimatum',
    description: `Marcus Chen, your top performer who carries 25% of the team's bookings, just walked into your office. He has an offer from Salesforce—$150K base increase plus accelerated equity vesting. He wants you to match it, plus guarantee him the best territory, or he's gone in two weeks. The rest of the team is watching how you handle this.`,
    severity: 'critical',
    category: 'talent',
    choices: [
      {
        id: 'match-offer',
        label: 'Match the Full Package',
        description: 'Give him everything he wants',
        shortTermImpact: 'Keeps your rainmaker',
        longTermRisk: 'Sets dangerous precedent, others will follow',
        consequences: {
          revenue: 5,
          quotaAttainment: 10,
          customerTrust: 0,
          teamMorale: -15,
          burnout: 0,
          discountTrend: 0,
          retention: -8,
          pipelineHealth: 5,
          specialEffect: 'precedent-set',
        },
      },
      {
        id: 'partial-match',
        label: 'Counter with Retention Package',
        description: 'Offer RSU retention bonus tied to 2-year cliff',
        shortTermImpact: '50/50 he stays',
        longTermRisk: 'May lose him anyway',
        consequences: {
          revenue: 0,
          quotaAttainment: -5,
          customerTrust: 0,
          teamMorale: 5,
          burnout: 0,
          discountTrend: 0,
          retention: 5,
          pipelineHealth: 0,
        },
      },
      {
        id: 'let-him-go',
        label: 'Wish Him Well',
        description: 'Don\'t negotiate with hostage-takers',
        shortTermImpact: 'Lose your best seller',
        longTermRisk: 'Short-term revenue hit, but maintain fairness',
        consequences: {
          revenue: -15,
          quotaAttainment: -15,
          customerTrust: 0,
          teamMorale: 5,
          burnout: 0,
          discountTrend: 0,
          retention: 10,
          pipelineHealth: -10,
          specialEffect: 'top-performer-lost',
        },
      },
    ],
  },
  // Quarter 3: Territory Wars
  {
    id: 'territory-conflict',
    quarter: 3,
    title: 'Territory Wars',
    description: `Two of your best reps are at each other's throats. Sarah claims Jake is poaching her named accounts by finding different contacts. Jake says Sarah is sandbagging accounts she's not actively working. Both threaten to quit if you don't rule in their favor. Meanwhile, you've discovered that 30% of territories are either over or under-assigned.`,
    severity: 'severe',
    category: 'territory',
    choices: [
      {
        id: 'full-realignment',
        label: 'Complete Territory Redesign',
        description: 'Blow it all up, create fair territories from scratch',
        shortTermImpact: 'Major disruption, Q3 will be chaotic',
        longTermRisk: 'Some reps will hate their new territories',
        consequences: {
          revenue: -10,
          quotaAttainment: -15,
          customerTrust: -5,
          teamMorale: -10,
          burnout: 10,
          discountTrend: 0,
          retention: -5,
          pipelineHealth: -15,
          specialEffect: 'territory-reset',
        },
      },
      {
        id: 'split-baby',
        label: 'Mediate and Split Disputed Accounts',
        description: 'Rule case-by-case, keep everyone somewhat unhappy',
        shortTermImpact: 'Stops the bleeding',
        longTermRisk: 'Doesn\'t fix structural problems',
        consequences: {
          revenue: -3,
          quotaAttainment: -5,
          customerTrust: 0,
          teamMorale: -5,
          burnout: 5,
          discountTrend: 0,
          retention: 0,
          pipelineHealth: 0,
        },
      },
      {
        id: 'add-overlay',
        label: 'Create Account Development Team',
        description: 'Add overlay reps to work underpenetrated accounts',
        shortTermImpact: 'Adds headcount cost',
        longTermRisk: 'Creates complexity, potential for more conflicts',
        consequences: {
          revenue: 5,
          quotaAttainment: 5,
          customerTrust: 5,
          teamMorale: 5,
          burnout: -5,
          discountTrend: 0,
          retention: 5,
          pipelineHealth: 10,
          specialEffect: 'overlay-team',
        },
      },
    ],
  },
  // Quarter 4: Discount Death Spiral
  {
    id: 'discount-wars',
    quarter: 4,
    title: 'The Discount Death Spiral',
    description: `Your CFO is furious. Average discount rates have increased from 18% to 32% in the past year. "You're giving away the company!" she screams. Your reps say they can't win without discounting—competitors are undercutting you. Finance wants to cap discounts at 15% with no exceptions. Your reps say they'll miss quota by 40% if you do.`,
    severity: 'critical',
    category: 'pricing',
    choices: [
      {
        id: 'hard-cap',
        label: 'Implement Hard Discount Cap',
        description: '15% max discount, no exceptions without CEO approval',
        shortTermImpact: 'Deal velocity will crater',
        longTermRisk: 'Will lose deals but protect margins',
        consequences: {
          revenue: -12,
          quotaAttainment: -20,
          customerTrust: -5,
          teamMorale: -15,
          burnout: 10,
          discountTrend: -30,
          retention: -3,
          pipelineHealth: -10,
          specialEffect: 'discount-cap',
        },
      },
      {
        id: 'value-selling',
        label: 'Launch Value-Based Selling Training',
        description: 'Invest in training, phase in discount controls over 6 months',
        shortTermImpact: 'Slow change, CFO unhappy',
        longTermRisk: 'May not work if culture is broken',
        consequences: {
          revenue: -3,
          quotaAttainment: -5,
          customerTrust: 5,
          teamMorale: 5,
          burnout: -5,
          discountTrend: -10,
          retention: 5,
          pipelineHealth: 5,
        },
      },
      {
        id: 'deal-desk',
        label: 'Create Deal Desk with Pricing Authority',
        description: 'All discounts over 20% require deal desk approval',
        shortTermImpact: 'Adds friction to deals',
        longTermRisk: 'Reps may game the system',
        consequences: {
          revenue: -5,
          quotaAttainment: -8,
          customerTrust: 0,
          teamMorale: -8,
          burnout: 5,
          discountTrend: -15,
          retention: 0,
          pipelineHealth: 0,
          specialEffect: 'deal-desk-created',
        },
      },
    ],
  },
  // Quarter 5: Customer Trust Erosion
  {
    id: 'customer-trust-crisis',
    quarter: 5,
    title: 'The Trust Deficit',
    description: `Your largest customer, representing 8% of ARR, just called to cancel. "Your team promised us features that don't exist, pushed us into a 3-year contract we didn't need, and now we're stuck with shelfware." NPS has dropped from +40 to +12 in six months. Your renewal rates are falling. The customer success team is pointing fingers at sales.`,
    severity: 'severe',
    category: 'customer',
    choices: [
      {
        id: 'customer-first',
        label: 'Launch Customer Recovery Program',
        description: 'Let customers out of bad contracts, rebuild trust',
        shortTermImpact: 'Massive revenue hit this quarter',
        longTermRisk: 'Right thing to do, expensive short-term',
        consequences: {
          revenue: -15,
          quotaAttainment: -10,
          customerTrust: 25,
          teamMorale: 5,
          burnout: 0,
          discountTrend: 5,
          retention: 15,
          pipelineHealth: 5,
          specialEffect: 'trust-rebuilt',
        },
      },
      {
        id: 'hold-contracts',
        label: 'Enforce Contracts',
        description: 'A deal is a deal—hold customers to their commitments',
        shortTermImpact: 'Protects near-term revenue',
        longTermRisk: 'Will damage reputation and referrals',
        consequences: {
          revenue: 5,
          quotaAttainment: 5,
          customerTrust: -20,
          teamMorale: -5,
          burnout: 5,
          discountTrend: 0,
          retention: -15,
          pipelineHealth: -5,
          specialEffect: 'contract-hardball',
        },
      },
      {
        id: 'case-by-case',
        label: 'Case-by-Case Resolution',
        description: 'Review each unhappy customer individually',
        shortTermImpact: 'Time-consuming, inconsistent',
        longTermRisk: 'May please no one',
        consequences: {
          revenue: -5,
          quotaAttainment: -3,
          customerTrust: 5,
          teamMorale: 0,
          burnout: 5,
          discountTrend: 0,
          retention: 0,
          pipelineHealth: 0,
        },
      },
    ],
  },
  // Quarter 6: Comp Plan Revolt
  {
    id: 'comp-revolt',
    quarter: 6,
    title: 'The Compensation Revolt',
    description: `The new comp plan rolled out last month. Finance designed it to discourage discounting and reward multi-year deals. Your team hates it. They claim it's unfair, complicated, and will reduce their earnings by 30%. Three reps have already quit. The remaining team is threatening a mass exodus unless you fix it. Finance says no changes for 12 months.`,
    severity: 'critical',
    category: 'compensation',
    choices: [
      {
        id: 'fight-finance',
        label: 'Go to War with Finance',
        description: 'Escalate to CEO, demand comp plan rollback',
        shortTermImpact: 'Political capital spent',
        longTermRisk: 'Makes enemy of CFO',
        consequences: {
          revenue: 5,
          quotaAttainment: 5,
          customerTrust: 0,
          teamMorale: 20,
          burnout: -10,
          discountTrend: 5,
          retention: 10,
          pipelineHealth: 5,
          specialEffect: 'finance-war',
        },
      },
      {
        id: 'spiffs-workaround',
        label: 'Create SPIFF Programs',
        description: 'Work around comp plan with bonus incentives',
        shortTermImpact: 'Band-aid solution, adds cost',
        longTermRisk: 'Creates comp plan complexity',
        consequences: {
          revenue: 0,
          quotaAttainment: 0,
          customerTrust: 0,
          teamMorale: 10,
          burnout: -5,
          discountTrend: 0,
          retention: 5,
          pipelineHealth: 0,
        },
      },
      {
        id: 'hold-line',
        label: 'Defend the New Comp Plan',
        description: 'Stand with Finance, explain the "why" to the team',
        shortTermImpact: 'Team will be angry',
        longTermRisk: 'More attrition likely',
        consequences: {
          revenue: -5,
          quotaAttainment: -10,
          customerTrust: 0,
          teamMorale: -20,
          burnout: 15,
          discountTrend: -10,
          retention: -15,
          pipelineHealth: -5,
          specialEffect: 'team-resentment',
        },
      },
    ],
  },
  // Quarter 7: Pipeline Scandal
  {
    id: 'sandbagging-crisis',
    quarter: 7,
    title: 'The Pipeline Mirage',
    description: `An internal audit just revealed that 40% of your pipeline is either stale (no activity in 60+ days), duplicate, or fantasy (deals with no real buyer intent). Your reps have been sandbagging deals to make future quarters look achievable. The board presentation next week shows $45M in pipeline. The real number is closer to $27M. Do you tell the truth?`,
    severity: 'critical',
    category: 'pipeline',
    choices: [
      {
        id: 'clean-pipeline',
        label: 'Clean House and Come Clean',
        description: 'Scrub the pipeline, tell the board the truth',
        shortTermImpact: 'Board will be furious, your job at risk',
        longTermRisk: 'Only path to credibility',
        consequences: {
          revenue: -5,
          quotaAttainment: -10,
          customerTrust: 5,
          teamMorale: 5,
          burnout: 0,
          discountTrend: 0,
          retention: 5,
          pipelineHealth: 25,
          specialEffect: 'clean-slate',
        },
      },
      {
        id: 'gradual-cleanup',
        label: 'Quietly Clean Over Two Quarters',
        description: 'Phase out bad deals without announcing it',
        shortTermImpact: 'Buys time',
        longTermRisk: 'Problem may get worse before better',
        consequences: {
          revenue: -3,
          quotaAttainment: -5,
          customerTrust: 0,
          teamMorale: 0,
          burnout: 0,
          discountTrend: 0,
          retention: 0,
          pipelineHealth: 10,
        },
      },
      {
        id: 'present-as-is',
        label: 'Present Current Numbers',
        description: 'Hope enough deals close to make it work',
        shortTermImpact: 'Kicks can down road',
        longTermRisk: 'Board will find out eventually, career-ending',
        consequences: {
          revenue: 0,
          quotaAttainment: 0,
          customerTrust: -5,
          teamMorale: -5,
          burnout: 10,
          discountTrend: 5,
          retention: 0,
          pipelineHealth: -15,
          specialEffect: 'deferred-reckoning',
        },
      },
    ],
  },
  // Quarter 8: Final Reckoning
  {
    id: 'final-quarter',
    quarter: 8,
    title: 'The Final Forecast',
    description: `Eight quarters. This is it. The board meets in four weeks for annual review. You're tracking to hit 94% of the revised target—not quite 100%, but a far cry from the disaster you inherited. The CEO wants to know: should she present you as the turnaround leader or start looking for your replacement? Your final quarter strategy will determine your fate.`,
    severity: 'critical',
    category: 'quota',
    choices: [
      {
        id: 'pull-forward',
        label: 'Pull Forward Q1 Deals',
        description: 'Offer deep discounts to close next quarter\'s deals now',
        shortTermImpact: 'Hit the number, look like a hero',
        longTermRisk: 'Q1 will be a disaster, mortgaging future',
        consequences: {
          revenue: 15,
          quotaAttainment: 20,
          customerTrust: -10,
          teamMorale: 5,
          burnout: 10,
          discountTrend: 15,
          retention: -5,
          pipelineHealth: -20,
          specialEffect: 'borrowed-time',
        },
      },
      {
        id: 'honest-forecast',
        label: 'Present Honest Assessment',
        description: 'Show progress made, realistic path to growth',
        shortTermImpact: 'May not satisfy board',
        longTermRisk: 'Sustainable path if they trust you',
        consequences: {
          revenue: 0,
          quotaAttainment: 5,
          customerTrust: 10,
          teamMorale: 10,
          burnout: -5,
          discountTrend: -5,
          retention: 5,
          pipelineHealth: 10,
          specialEffect: 'credibility-built',
        },
      },
      {
        id: 'all-hands-blitz',
        label: 'Launch End-of-Year Blitz',
        description: 'All-hands-on-deck push, everyone in the field',
        shortTermImpact: 'Maximize effort, may close more',
        longTermRisk: 'Team burnout guaranteed',
        consequences: {
          revenue: 10,
          quotaAttainment: 12,
          customerTrust: -5,
          teamMorale: -10,
          burnout: 20,
          discountTrend: 8,
          retention: -8,
          pipelineHealth: -5,
          specialEffect: 'burnout-blitz',
        },
      },
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateEnding(state: GameState): { type: EndingType; narrative: string } {
  // Fired for missing targets
  if (state.quotaAttainment < 60 || state.revenue < 70) {
    return {
      type: 'fired-missing-targets',
      narrative: `The board called an emergency meeting. When you walked in, the CEO wouldn't meet your eyes. "We appreciate your efforts, but the numbers speak for themselves." Your tenure at Apex lasted 22 months—longer than your predecessor, but not by much. As you packed your office, you wondered if the job was ever winnable, or if you were just the fall guy for problems years in the making.`,
    };
  }

  // Team exodus
  if (state.teamMorale < 30 || state.burnoutIndex > 75 || state.attritionRate > 35) {
    return {
      type: 'team-exodus',
      narrative: `You hit the numbers. The board is satisfied. But look around—where is everyone? Your top performers are gone. The remaining team is burned out, resentful, and interviewing elsewhere. You built a machine that worked for exactly eight quarters, then collapsed. The next VP of Sales will inherit the same mess you did, maybe worse. Some victories aren't worth the cost.`,
    };
  }

  // Revenue Machine
  if (state.quotaAttainment >= 110 && state.revenue >= 115 && state.customerTrust >= 70 && state.teamMorale >= 60) {
    return {
      type: 'revenue-machine',
      narrative: `The impossible happened. Revenue up 38%. Customer NPS at all-time highs. Team retention at 92%. When you presented at the board meeting, the CEO smiled—actually smiled. "This is what a world-class sales organization looks like," she said. The VCs are now talking IPO. And every recruiter in Silicon Valley has your number. You didn't just turn around a struggling sales team—you built a revenue machine that will outlast you.`,
    };
  }

  // Sales Champion
  if (state.quotaAttainment >= 95 && state.customerTrust >= 60 && state.teamMorale >= 50 && state.pipelineHealth >= 60) {
    return {
      type: 'sales-champion',
      narrative: `You did it. Not perfectly, not without scars, but you did it. Quota attainment is back above 90%. Customer trust is rebuilding. The team believes in the mission again. When you look at where Apex was two years ago—the chaos, the finger-pointing, the desperation—and compare it to today, the transformation is remarkable. You're not a turnaround artist anymore. You're a sales leader. The CEO just asked you to stay for another three years.`,
    };
  }

  // Survival
  return {
    type: 'survival',
    narrative: `Apex survived. You survived. It's not the triumphant turnaround story you imagined when you took the job, but it's not failure either. Revenue stabilized. Attrition slowed. Customers stopped leaving in droves. The board renewed your contract with a "meets expectations" rating and a modest bonus. In sales leadership, survival is an achievement. Many don't even get that. Now the real work begins—turning survival into success.`,
  };
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const INITIAL_STATE: GameState = {
  quarter: 0,
  phase: 'intro',
  revenue: 85, // $M ARR
  revenueTarget: 100,
  quotaAttainment: 72, // %
  bookings: 18, // $M this quarter
  pipeline: 145, // $M
  pipelineCoverage: 3.2,
  customerTrust: 58,
  customerRetention: 82, // %
  newLogos: 24,
  nrr: 98, // %
  churnRisk: 18,
  teamMorale: 45,
  burnoutIndex: 55,
  attritionRate: 22,
  openReqs: 8,
  topPerformerRisk: 65,
  winRate: 22, // %
  avgDealSize: 45, // $K
  salesCycle: 78, // days
  discountTrend: 62, // higher = more discounting
  sandbagIndex: 48,
  pipelineHealth: 42,
  territoryBalance: 55,
  compSatisfaction: 38,
  salesReps: INITIAL_SALES_REPS,
  currentCrisis: null,
  decisionHistory: [],
  activeEffects: [],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/scenarios/scenario-06.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      )}
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-rose-950/80" />

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
            className="w-24 h-24 bg-gradient-to-br from-rose-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Target className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-5xl font-black text-white mb-4">Sales Mastery</h1>
          <p className="text-2xl text-rose-400 font-light">Quota, Culture, and Survival</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{COMPANY_STORY.name}</h2>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line mb-6">
            {COMPANY_STORY.situation}
          </p>
          <div className="p-4 bg-rose-900/30 border border-rose-700/50 rounded-xl">
            <p className="text-rose-300 italic">{COMPANY_STORY.vpBackground}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Clock, label: '8 Quarters', desc: '2 Years to Turnaround' },
            { icon: AlertTriangle, label: 'High Stakes', desc: 'Board Watching Closely' },
            { icon: Target, label: 'Your Mission', desc: 'Hit the Number' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-slate-800/50 rounded-xl p-4 text-center"
            >
              <item.icon className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <p className="font-bold text-white">{item.label}</p>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xl font-bold rounded-xl flex items-center justify-center gap-3 hover:from-rose-500 hover:to-pink-500 transition-all"
        >
          <Play className="w-6 h-6" />
          Begin Your Sales Turnaround
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
  crisis: SalesCrisis;
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
    quota: Target,
    compensation: BadgeDollarSign,
    territory: MapPin,
    pricing: Percent,
    talent: Users,
    customer: Heart,
    pipeline: BarChart3,
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
            { label: 'Quota Attainment', value: `${state.quotaAttainment}%`, color: state.quotaAttainment < 80 ? 'text-red-400' : state.quotaAttainment < 95 ? 'text-amber-400' : 'text-emerald-400' },
            { label: 'Customer Trust', value: `${state.customerTrust}%`, color: state.customerTrust < 50 ? 'text-red-400' : 'text-amber-400' },
            { label: 'Team Morale', value: `${state.teamMorale}%`, color: state.teamMorale < 40 ? 'text-red-400' : 'text-amber-400' },
            { label: 'Burnout Index', value: `${state.burnoutIndex}%`, color: state.burnoutIndex > 60 ? 'text-red-400' : 'text-emerald-400' },
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
                  ? 'bg-rose-900/30 border-rose-500'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{choice.label}</h3>
                  <p className="text-slate-400 mt-1">{choice.description}</p>
                </div>
                <ChevronRight className={`w-6 h-6 transition-transform ${
                  selectedChoice?.id === choice.id ? 'text-rose-400 rotate-90' : 'text-slate-600'
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
                  You are about to: <span className="text-rose-400 font-semibold">{selectedChoice.label}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  This decision will affect your team and numbers. Choose wisely.
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
                    className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-500 hover:to-pink-500 transition-all"
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
  crisis: SalesCrisis;
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
    { label: 'Revenue Impact', value: choice.consequences.revenue, suffix: '%', positive: choice.consequences.revenue > 0 },
    { label: 'Quota Attainment', value: choice.consequences.quotaAttainment, suffix: '%', positive: choice.consequences.quotaAttainment > 0 },
    { label: 'Customer Trust', value: choice.consequences.customerTrust, suffix: '%', positive: choice.consequences.customerTrust > 0 },
    { label: 'Team Morale', value: choice.consequences.teamMorale, suffix: '%', positive: choice.consequences.teamMorale > 0 },
    { label: 'Burnout Index', value: choice.consequences.burnout, suffix: '%', positive: choice.consequences.burnout < 0 },
    { label: 'Discount Trend', value: choice.consequences.discountTrend, suffix: '%', positive: choice.consequences.discountTrend < 0 },
    { label: 'Retention', value: choice.consequences.retention, suffix: '%', positive: choice.consequences.retention > 0 },
    { label: 'Pipeline Health', value: choice.consequences.pipelineHealth, suffix: '%', positive: choice.consequences.pipelineHealth > 0 },
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
            animate={{ opacity: revealIndex >= 8 ? 1 : 0 }}
            className="p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl mb-8"
          >
            <p className="text-amber-300 text-center">
              <AlertTriangle className="w-5 h-5 inline mr-2" />
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
          className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-xl"
        >
          Continue
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
  const quotaProgress = (state.revenue / state.revenueTarget) * 100;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Quarterly Business Review</h1>
          <p className="text-slate-400">End of Quarter {state.quarter}</p>
        </motion.div>

        {/* Revenue Progress */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Revenue Performance
            </h3>
            <span className={`text-2xl font-bold ${quotaProgress >= 100 ? 'text-emerald-400' : quotaProgress >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
              {quotaProgress.toFixed(0)}% to Target
            </span>
          </div>
          <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(quotaProgress, 120)}%` }}
              transition={{ duration: 1 }}
              className={`h-full rounded-full ${
                quotaProgress >= 100 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                quotaProgress >= 80 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                'bg-gradient-to-r from-red-600 to-red-400'
              }`}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'ARR', value: `$${state.revenue}M`, target: `$${state.revenueTarget}M` },
              { label: 'Bookings', value: `$${state.bookings}M`, target: 'QTD' },
              { label: 'Pipeline', value: `$${state.pipeline}M`, target: `${state.pipelineCoverage}x coverage` },
              { label: 'Win Rate', value: `${state.winRate}%`, target: 'vs 25% target' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-slate-500">{item.target}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Customer Health */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Customer Health
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Customer Trust', value: `${state.customerTrust}%`, danger: state.customerTrust < 50 },
                { label: 'Retention Rate', value: `${state.customerRetention}%`, danger: state.customerRetention < 85 },
                { label: 'Net Revenue Retention', value: `${state.nrr}%`, danger: state.nrr < 100 },
                { label: 'Churn Risk (ARR)', value: `${state.churnRisk}%`, danger: state.churnRisk > 15 },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-semibold ${item.danger ? 'text-red-400' : 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Health */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Team Health
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Team Morale', value: `${state.teamMorale}%`, danger: state.teamMorale < 40 },
                { label: 'Burnout Index', value: `${state.burnoutIndex}%`, danger: state.burnoutIndex > 60 },
                { label: 'Attrition Rate', value: `${state.attritionRate}%`, danger: state.attritionRate > 20 },
                { label: 'Comp Satisfaction', value: `${state.compSatisfaction}%`, danger: state.compSatisfaction < 50 },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-semibold ${item.danger ? 'text-red-400' : 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Metrics */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Sales Effectiveness
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Quota Attainment', value: `${state.quotaAttainment}%`, danger: state.quotaAttainment < 80 },
              { label: 'Avg Deal Size', value: `$${state.avgDealSize}K`, danger: false },
              { label: 'Sales Cycle', value: `${state.salesCycle} days`, danger: state.salesCycle > 90 },
              { label: 'Discount Trend', value: `${state.discountTrend}%`, danger: state.discountTrend > 50 },
              { label: 'Pipeline Health', value: `${state.pipelineHealth}%`, danger: state.pipelineHealth < 50 },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-slate-800/50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.danger ? 'text-red-400' : 'text-white'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Roster */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Team Performance
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            {state.salesReps.map((rep) => (
              <div
                key={rep.id}
                className={`p-3 rounded-xl border ${
                  rep.isTopPerformer ? 'bg-emerald-500/10 border-emerald-500/30' :
                  rep.atRisk ? 'bg-red-500/10 border-red-500/30' :
                  'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{rep.name}</span>
                  {rep.isTopPerformer && <Trophy className="w-4 h-4 text-amber-400" />}
                  {rep.atRisk && <AlertTriangle className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{rep.region}</span>
                  <span className={`font-bold ${
                    rep.performance >= 100 ? 'text-emerald-400' :
                    rep.performance >= 80 ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {rep.performance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Banners */}
        {state.teamMorale < 35 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-900/50 border border-red-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <Skull className="w-6 h-6 text-red-400" />
            <p className="text-red-300">
              <span className="font-bold">CRITICAL:</span> Team morale is dangerously low. Mass exodus imminent.
            </p>
          </motion.div>
        )}

        {state.customerTrust < 40 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-orange-900/50 border border-orange-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <AlertCircle className="w-6 h-6 text-orange-400" />
            <p className="text-orange-300">
              <span className="font-bold">WARNING:</span> Customer trust eroding. Churn acceleration likely.
            </p>
          </motion.div>
        )}

        {state.burnoutIndex > 70 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-amber-900/50 border border-amber-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <Flame className="w-6 h-6 text-amber-400" />
            <p className="text-amber-300">
              <span className="font-bold">ALERT:</span> Team burnout at critical levels. Performance will suffer.
            </p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
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
    'fired-missing-targets': Skull,
    'team-exodus': UserMinus,
    'survival': LifeBuoy,
    'sales-champion': Trophy,
    'revenue-machine': Crown,
  };

  const endingColors: Record<EndingType, string> = {
    'fired-missing-targets': 'from-red-600 to-red-800',
    'team-exodus': 'from-orange-600 to-red-600',
    'survival': 'from-amber-600 to-orange-600',
    'sales-champion': 'from-blue-600 to-cyan-600',
    'revenue-machine': 'from-emerald-600 to-teal-600',
  };

  const endingTitles: Record<EndingType, string> = {
    'fired-missing-targets': 'Terminated',
    'team-exodus': 'Team Exodus',
    'survival': 'Survived',
    'sales-champion': 'Sales Champion',
    'revenue-machine': 'Revenue Machine',
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
            { label: 'Revenue', value: `$${state.revenue}M` },
            { label: 'Quota %', value: `${state.quotaAttainment}%` },
            { label: 'Team Morale', value: `${state.teamMorale}%` },
            { label: 'Quarters', value: state.quarter },
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
          className="py-4 px-8 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto"
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

export default function SalesMasteryPage() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [lastChoice, setLastChoice] = useState<CrisisChoice | null>(null);

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      quarter: 1,
      phase: 'decision',
      currentCrisis: SALES_CRISES.find((c) => c.quarter === 1) || null,
    }));
  }, []);

  const handleChoice = useCallback((choice: CrisisChoice) => {
    setLastChoice(choice);

    setGameState((prev) => {
      // Apply consequences
      const newRevenue = Math.max(50, prev.revenue + (prev.revenue * choice.consequences.revenue / 100));
      const newQuotaAttainment = Math.max(0, Math.min(150, prev.quotaAttainment + choice.consequences.quotaAttainment));
      const newCustomerTrust = Math.max(0, Math.min(100, prev.customerTrust + choice.consequences.customerTrust));
      const newTeamMorale = Math.max(0, Math.min(100, prev.teamMorale + choice.consequences.teamMorale));
      const newBurnout = Math.max(0, Math.min(100, prev.burnoutIndex + choice.consequences.burnout));
      const newDiscountTrend = Math.max(0, Math.min(100, prev.discountTrend + choice.consequences.discountTrend));
      const newRetention = Math.max(50, Math.min(100, prev.customerRetention + choice.consequences.retention));
      const newPipelineHealth = Math.max(0, Math.min(100, prev.pipelineHealth + choice.consequences.pipelineHealth));

      // Update attrition based on morale and burnout
      const newAttrition = Math.max(5, Math.min(50, prev.attritionRate + (newBurnout > 60 ? 5 : 0) + (newTeamMorale < 40 ? 5 : -2)));

      // Update comp satisfaction based on morale
      const newCompSat = Math.max(0, Math.min(100, prev.compSatisfaction + (choice.consequences.teamMorale > 0 ? 5 : -3)));

      // Record decision
      const newDecisionHistory = [...prev.decisionHistory, {
        quarter: prev.quarter,
        crisisId: prev.currentCrisis?.id || '',
        choiceId: choice.id,
        choiceLabel: choice.label,
        consequences: choice.consequences,
      }];

      // Track special effects
      const newEffects = choice.consequences.specialEffect
        ? [...prev.activeEffects, choice.consequences.specialEffect]
        : prev.activeEffects;

      // Update reps based on consequences
      const updatedReps = prev.salesReps.map(rep => ({
        ...rep,
        motivation: Math.max(0, Math.min(100, rep.motivation + choice.consequences.teamMorale / 2)),
        atRisk: rep.motivation + choice.consequences.teamMorale / 2 < 50 || (rep.isTopPerformer && newCompSat < 40),
      }));

      return {
        ...prev,
        revenue: Math.round(newRevenue),
        quotaAttainment: Math.round(newQuotaAttainment),
        customerTrust: Math.round(newCustomerTrust),
        teamMorale: Math.round(newTeamMorale),
        burnoutIndex: Math.round(newBurnout),
        discountTrend: Math.round(newDiscountTrend),
        customerRetention: Math.round(newRetention),
        pipelineHealth: Math.round(newPipelineHealth),
        attritionRate: Math.round(newAttrition),
        compSatisfaction: Math.round(newCompSat),
        salesReps: updatedReps,
        decisionHistory: newDecisionHistory,
        activeEffects: newEffects,
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
      const shouldEnd =
        prev.quotaAttainment < 50 ||  // Fired for missing targets badly
        prev.teamMorale < 20 ||        // Team exodus
        prev.customerTrust < 25 ||     // Customer trust collapse
        prev.quarter >= 8;             // Natural end

      if (shouldEnd) {
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
      const nextCrisis = SALES_CRISES.find((c) => c.quarter === nextQuarter) || null;

      // Quarterly natural changes
      const quarterlyRevenueDrift = (Math.random() - 0.4) * 3; // slight positive bias
      const quarterlyMoraleDrift = prev.burnoutIndex > 50 ? -3 : 1;
      const quarterlyBurnoutDrift = prev.teamMorale < 50 ? 3 : -2;

      // Pipeline naturally decays if not healthy
      const pipelineDecay = prev.pipelineHealth < 50 ? -5 : 2;

      // Win rate affected by morale and trust
      const winRateAdjust = (prev.teamMorale - 50) / 20 + (prev.customerTrust - 50) / 30;

      return {
        ...prev,
        quarter: nextQuarter,
        phase: 'decision',
        currentCrisis: nextCrisis,
        revenue: Math.round(prev.revenue * (1 + quarterlyRevenueDrift / 100)),
        teamMorale: Math.max(0, Math.min(100, prev.teamMorale + quarterlyMoraleDrift)),
        burnoutIndex: Math.max(0, Math.min(100, prev.burnoutIndex + quarterlyBurnoutDrift)),
        pipelineHealth: Math.max(0, Math.min(100, prev.pipelineHealth + pipelineDecay)),
        winRate: Math.max(10, Math.min(50, prev.winRate + winRateAdjust)),
        bookings: Math.round(prev.bookings * (0.95 + Math.random() * 0.1)),
        pipeline: Math.round(prev.pipeline * (0.9 + Math.random() * 0.2)),
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
