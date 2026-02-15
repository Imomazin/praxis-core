'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  DollarSign,
  Building2,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Activity,
  Clock,
  Target,
  Briefcase,
  Scale,
  Heart,
  Zap,
  Globe,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Play,
  RotateCcw,
  Send,
  Lock,
  Flame,
  Eye,
  Server,
  Wifi,
  MapPin,
  Landmark,
  Siren,
  Bug,
  Network,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

type Phase = 'intro' | 'briefing' | 'crisis' | 'decisions' | 'consequences' | 'board-reaction' | 'round-end' | 'game-over';
type RiskCategory = 'cyber' | 'operational' | 'strategic' | 'compliance' | 'financial' | 'reputational';
type Severity = 'low' | 'moderate' | 'high' | 'critical';

interface RiskMetrics {
  cyberRisk: number;
  operationalRisk: number;
  complianceRisk: number;
  reputationalRisk: number;
  financialExposure: number; // in millions
  riskAppetite: number;
}

interface StakeholderState {
  board: number;
  executives: number;
  regulators: number;
  insurers: number;
  employees: number;
}

interface GameState {
  round: number;
  phase: Phase;
  overallRiskScore: number;
  metrics: RiskMetrics;
  stakeholders: StakeholderState;
  budget: number;
  currentCrisis: Crisis | null;
  decisionHistory: DecisionRecord[];
  narrativeLog: NarrativeEntry[];
  gameOver: boolean;
  gameOverReason: string | null;
  endingType: 'catastrophe' | 'resignation' | 'survival' | 'excellence' | null;
  activeRisks: ActiveRisk[];
}

interface ActiveRisk {
  id: string;
  name: string;
  category: RiskCategory;
  severity: Severity;
  likelihood: number;
  impact: number;
  mitigated: boolean;
  turnsActive: number;
}

interface Crisis {
  id: string;
  name: string;
  description: string;
  category: RiskCategory;
  severity: Severity;
  urgency: string;
  potentialImpact: string;
  options: CrisisOption[];
  context: string;
  hiddenInfo?: string;
}

interface CrisisOption {
  id: string;
  label: string;
  description: string;
  tradeoff: string;
  consequences: Consequence[];
  cost: number;
}

interface Consequence {
  type: 'risk' | 'stakeholder' | 'budget' | 'narrative' | 'exposure';
  target?: string;
  value: number;
  delay?: number;
  message?: string;
}

interface NarrativeEntry {
  round: number;
  type: 'decision' | 'event' | 'consequence' | 'risk' | 'crisis';
  content: string;
  tone: 'positive' | 'negative' | 'neutral' | 'critical';
}

interface DecisionRecord {
  round: number;
  crisisId: string;
  optionId: string;
  label: string;
}

// =============================================================================
// SCENARIO DATA
// =============================================================================

const OPENING_NARRATIVE = {
  title: "Titan Industries",
  subtitle: "Chief Risk Officer - Day One of Crisis Mode",
  content: `You are Morgan Hayes, Chief Risk Officer of Titan Industries, a $12B multinational manufacturing and technology company.

For three years, your enterprise risk management program has been the envy of the industry. ISO 31000 certified. Best-in-class risk registers. Award-winning board presentations. Your dashboard shows green across every category.

That was yesterday.

This morning, three things happened:

First, your CISO flagged a potential breach in your supply chain management system. A third-party vendor may have been compromised. You don't know what was accessed or for how long.

Second, your VP of International Operations called from Singapore. New export regulations just dropped in your three largest Asian markets. Your legal team says compliance will take 18 months. You have 90 days.

Third, a whistleblower complaint landed on your desk. Someone in procurement is alleging kickbacks on $200M worth of contracts. The audit committee chair already knows.

Your enterprise risk dashboard still shows green. Because it measures what happened, not what's coming.

The board meets tomorrow. They expect your risk report.

Welcome to real risk management.`,
};

const ROUND_SCENARIOS: Record<number, { briefing: string; crisis: Crisis }> = {
  1: {
    briefing: `**RISK INTELLIGENCE BRIEFING - WEEK 1**

Current Enterprise Risk Status:
- Cyber Risk Score: 72/100 (Acceptable)
- Operational Risk Score: 68/100 (Acceptable)
- Compliance Risk Score: 75/100 (Acceptable)
- Reputational Risk Score: 80/100 (Good)
- Total Financial Exposure: $340M

Budget Remaining: $15M (Risk Mitigation Fund)

The supply chain breach is worse than initially thought. Your security team has identified unauthorized access spanning 47 days. Customer data, supplier contracts, and product specifications may have been exfiltrated.

Your insurance carrier is asking questions. Your largest customer just called wanting "assurance."`,
    crisis: {
      id: 'crisis-1-cyber',
      name: 'Supply Chain Cyber Breach',
      description: `The forensic analysis is complete. The breach originated from a compromised vendor credential. Attackers had access to:

- 2.3M customer records (names, addresses, purchase history)
- 847 supplier contracts with pricing details
- Product specifications for 12 unreleased products
- Internal communications spanning 6 weeks

Your General Counsel says notification is required within 72 hours in 23 jurisdictions. Your CISO wants to delay until you understand the full scope. Your CEO wants to know why the "award-winning" risk program didn't catch this.`,
      category: 'cyber',
      severity: 'critical',
      urgency: '72 hours to mandatory disclosure',
      potentialImpact: '$50-200M in direct costs, unlimited reputational damage',
      context: 'This breach could trigger regulatory investigations in multiple jurisdictions.',
      hiddenInfo: 'The compromised vendor was flagged as high-risk 18 months ago, but remediation was deprioritized due to budget constraints.',
      options: [
        {
          id: 'cyber-immediate-disclosure',
          label: 'Immediate Full Disclosure',
          description: 'Disclose everything now. Notify all affected parties. Get ahead of the story.',
          tradeoff: 'Maximum transparency but exposes full scope before containment',
          cost: 2,
          consequences: [
            { type: 'stakeholder', target: 'regulators', value: 15, message: 'Regulators appreciate proactive disclosure' },
            { type: 'stakeholder', target: 'board', value: -10, message: 'Board concerned about stock impact' },
            { type: 'exposure', value: 75, message: 'Media coverage amplifies breach scope' },
            { type: 'risk', target: 'reputationalRisk', value: -20, message: 'Reputation takes significant hit' },
            { type: 'narrative', value: 0, message: 'You chose transparency. The market reacts.' },
          ],
        },
        {
          id: 'cyber-staged-disclosure',
          label: 'Staged Disclosure',
          description: 'Disclose minimum required now. Continue investigation. Update as legally required.',
          tradeoff: 'Buys time but risks appearing to hide information',
          cost: 3,
          consequences: [
            { type: 'stakeholder', target: 'regulators', value: -5, message: 'Regulators note limited initial disclosure' },
            { type: 'stakeholder', target: 'board', value: 5, message: 'Board appreciates measured approach' },
            { type: 'risk', target: 'complianceRisk', value: -10, message: 'Compliance risk increases' },
            { type: 'narrative', value: 0, message: 'You disclosed the minimum. Journalists are digging.' },
          ],
        },
        {
          id: 'cyber-investigate-first',
          label: 'Complete Investigation First',
          description: 'Delay disclosure until full scope is known. Risk the deadline.',
          tradeoff: 'Better information but potential regulatory violation',
          cost: 5,
          consequences: [
            { type: 'stakeholder', target: 'regulators', value: -25, message: 'Regulators open investigation into delayed disclosure' },
            { type: 'exposure', value: 120, message: 'Potential fines for notification violations' },
            { type: 'risk', target: 'complianceRisk', value: -25, message: 'Major compliance failure' },
            { type: 'narrative', value: 0, message: 'You missed the deadline. The regulators noticed.' },
          ],
        },
      ],
    },
  },
  2: {
    briefing: `**RISK INTELLIGENCE BRIEFING - WEEK 2**

The cyber incident is being managed, but new fires are starting.

Export Compliance Update:
- New regulations affect 34% of your Asian revenue
- Current compliance gap: 127 products in violation
- Estimated remediation: $45M and 14 months
- Deadline: 90 days (now 83 days remaining)

Your competitors are scrambling too, but intelligence suggests one major competitor found a loophole.

The whistleblower situation is escalating. The audit committee has retained outside counsel. Your procurement VP has hired a lawyer.`,
    crisis: {
      id: 'crisis-2-compliance',
      name: 'Export Compliance Crisis',
      description: `The new export regulations are more restrictive than anyone anticipated. Your international trade counsel has delivered the assessment:

Option A: Full compliance - Stop shipping affected products immediately. Redesign. Recertify. 14-18 months, $45M cost, $180M revenue loss during gap.

Option B: Variance request - Apply for temporary exemption. 60% chance of approval. If denied, penalties double.

Option C: Structural solution - Route products through compliant subsidiary in Ireland. Legal says it's "defensible." Compliance says it's "aggressive."

Your largest Asian distributor is on the phone. They need to know if you can fulfill Q3 orders.`,
      category: 'compliance',
      severity: 'high',
      urgency: '83 days to compliance deadline',
      potentialImpact: '$180M revenue at risk, potential market exit',
      context: 'Competitors are watching. Your response signals market commitment.',
      options: [
        {
          id: 'compliance-full-stop',
          label: 'Full Compliance - Stop Shipments',
          description: 'Immediately halt affected shipments. Begin redesign process.',
          tradeoff: 'Zero regulatory risk but massive revenue impact',
          cost: 8,
          consequences: [
            { type: 'stakeholder', target: 'regulators', value: 20, message: 'Regulators commend compliance posture' },
            { type: 'stakeholder', target: 'board', value: -15, message: 'Board concerned about revenue impact' },
            { type: 'exposure', value: -50, message: 'Revenue loss from compliance gap' },
            { type: 'risk', target: 'complianceRisk', value: 15, message: 'Compliance risk significantly reduced' },
            { type: 'narrative', value: 0, message: 'You chose compliance over revenue. Competitors are watching.' },
          ],
        },
        {
          id: 'compliance-variance',
          label: 'Request Variance',
          description: 'Apply for temporary exemption while working on compliance.',
          tradeoff: 'Balanced approach but outcome uncertain',
          cost: 2,
          consequences: [
            { type: 'stakeholder', target: 'regulators', value: 0, message: 'Variance request under review' },
            { type: 'risk', target: 'complianceRisk', value: -5, message: 'Compliance risk remains elevated' },
            { type: 'narrative', value: 0, message: 'Your variance request is pending. The waiting begins.' },
          ],
        },
        {
          id: 'compliance-restructure',
          label: 'Irish Subsidiary Route',
          description: 'Route products through compliant subsidiary structure.',
          tradeoff: 'Maintains revenue but aggressive interpretation',
          cost: 4,
          consequences: [
            { type: 'stakeholder', target: 'regulators', value: -15, message: 'Regulators scrutinizing structure' },
            { type: 'stakeholder', target: 'board', value: 5, message: 'Board appreciates creative solution' },
            { type: 'risk', target: 'complianceRisk', value: -15, message: 'Compliance risk increases significantly' },
            { type: 'narrative', value: 0, message: 'The Irish route is live. Legal is nervous.' },
          ],
        },
      ],
    },
  },
  3: {
    briefing: `**RISK INTELLIGENCE BRIEFING - WEEK 3**

The whistleblower investigation has expanded. Outside counsel has interviewed 23 employees. Three patterns are emerging:

1. Gift policies were routinely violated
2. Vendor selection documentation is inconsistent
3. Two executives approved contracts with companies they had undisclosed relationships with

The board audit committee meets in 48 hours. They want your risk assessment.

Meanwhile, your cyber insurance carrier has denied 60% of your breach claim, citing "inadequate vendor risk management." Your CFO is not happy.`,
    crisis: {
      id: 'crisis-3-fraud',
      name: 'Procurement Fraud Investigation',
      description: `The investigation findings are worse than expected. Outside counsel's preliminary report indicates:

- $47M in contracts with potential conflicts of interest
- Gift policy violations spanning 4 years
- Two senior procurement executives likely knew
- Potential FCPA implications in three countries

The audit committee chair has asked point-blank: "Did your risk program miss this, or did someone ignore the warnings?"

You check your records. There were warnings. They were in a report. The report was deprioritized.`,
      category: 'compliance',
      severity: 'critical',
      urgency: 'Audit committee meeting in 48 hours',
      potentialImpact: 'DOJ investigation, executive terminations, $100M+ exposure',
      context: 'Your credibility as CRO is now in question.',
      hiddenInfo: 'The deprioritization decision was made by your predecessor. The email chain is unclear about who knew what.',
      options: [
        {
          id: 'fraud-full-transparency',
          label: 'Full Transparency to Board',
          description: 'Present everything, including the missed warnings. Take responsibility for the program.',
          tradeoff: 'Honest but may cost your job',
          cost: 1,
          consequences: [
            { type: 'stakeholder', target: 'board', value: 10, message: 'Board respects honesty' },
            { type: 'stakeholder', target: 'regulators', value: 15, message: 'Proactive disclosure helps' },
            { type: 'risk', target: 'reputationalRisk', value: -10, message: 'Personal reputation hit' },
            { type: 'narrative', value: 0, message: 'You told the truth. The board is deliberating your future.' },
          ],
        },
        {
          id: 'fraud-defensive',
          label: 'Defensive Positioning',
          description: 'Present findings but emphasize inherited issues and resource constraints.',
          tradeoff: 'Protects you but may appear blame-shifting',
          cost: 0,
          consequences: [
            { type: 'stakeholder', target: 'board', value: -5, message: 'Board senses deflection' },
            { type: 'stakeholder', target: 'executives', value: -10, message: 'Executives resent blame-shifting' },
            { type: 'narrative', value: 0, message: 'Your explanation landed poorly. Trust is eroding.' },
          ],
        },
        {
          id: 'fraud-remediation-focus',
          label: 'Forward-Looking Remediation Plan',
          description: 'Acknowledge issues briefly, pivot to comprehensive remediation plan.',
          tradeoff: 'Action-oriented but may seem to minimize past failures',
          cost: 3,
          consequences: [
            { type: 'stakeholder', target: 'board', value: 5, message: 'Board appreciates action orientation' },
            { type: 'budget', value: -3, message: 'Remediation program costs' },
            { type: 'risk', target: 'complianceRisk', value: 10, message: 'New controls reduce risk' },
            { type: 'narrative', value: 0, message: 'Your remediation plan is approved. Implementation begins.' },
          ],
        },
      ],
    },
  },
  4: {
    briefing: `**RISK INTELLIGENCE BRIEFING - WEEK 4**

A new threat has emerged. Your competitive intelligence team has flagged unusual activity:

- A state-sponsored threat actor is targeting your industry
- Three competitors have disclosed breaches in the past 30 days
- Your threat detection systems show increased reconnaissance activity
- The attack pattern matches your infrastructure vulnerabilities

Your CISO wants to implement emergency security protocols. The cost: $8M and significant operational disruption. Your CEO asks: "What's the probability we're actually targeted?"

You don't know. No one does. That's the problem.`,
    crisis: {
      id: 'crisis-4-apt',
      name: 'Advanced Persistent Threat',
      description: `The threat briefing from your CISO is alarming:

"We're seeing the same reconnaissance patterns that preceded the attacks on Meridian and Cornerstone. Same threat actor. Same tactics. We have maybe 2-3 weeks before they attempt breach."

The countermeasures require:
- Network segmentation: $3M, 2 weeks implementation
- Enhanced monitoring: $2M, immediate
- Incident response retainer: $1M
- Employee security training: $500K
- Third-party access audit: $1.5M

Total: $8M. Your remaining budget: $${12 - 0}M.

The CFO asks: "What if we're wrong and they don't target us?"`,
      category: 'cyber',
      severity: 'high',
      urgency: '2-3 weeks before potential attack',
      potentialImpact: 'Potential nation-state breach, IP theft, operational disruption',
      context: 'You cannot prove you will be targeted. You cannot prove you wont.',
      options: [
        {
          id: 'apt-full-defense',
          label: 'Full Defensive Posture',
          description: 'Implement all recommended countermeasures immediately.',
          tradeoff: 'Maximum protection but high cost and disruption',
          cost: 8,
          consequences: [
            { type: 'budget', value: -8, message: 'Security investment depletes budget' },
            { type: 'risk', target: 'cyberRisk', value: 25, message: 'Cyber defenses significantly strengthened' },
            { type: 'stakeholder', target: 'executives', value: -5, message: 'Operations disrupted' },
            { type: 'narrative', value: 0, message: 'Defenses are up. You wait for an attack that may never come.' },
          ],
        },
        {
          id: 'apt-selective',
          label: 'Selective Hardening',
          description: 'Implement critical countermeasures only. Monitoring and segmentation.',
          tradeoff: 'Balanced approach but gaps remain',
          cost: 5,
          consequences: [
            { type: 'budget', value: -5, message: 'Partial security investment' },
            { type: 'risk', target: 'cyberRisk', value: 12, message: 'Cyber defenses moderately improved' },
            { type: 'narrative', value: 0, message: 'Partial defenses deployed. You hope it is enough.' },
          ],
        },
        {
          id: 'apt-monitor',
          label: 'Enhanced Monitoring Only',
          description: 'Increase detection capability but dont change infrastructure.',
          tradeoff: 'Preserves budget but relies on detection over prevention',
          cost: 2,
          consequences: [
            { type: 'budget', value: -2, message: 'Monitoring investment' },
            { type: 'risk', target: 'cyberRisk', value: 5, message: 'Better detection, same vulnerabilities' },
            { type: 'narrative', value: 0, message: 'You will see them coming. Stopping them is another matter.' },
          ],
        },
      ],
    },
  },
  5: {
    briefing: `**RISK INTELLIGENCE BRIEFING - WEEK 5**

The geopolitical situation is deteriorating. New sanctions have been announced affecting your operations in three countries. Your supply chain risk manager is reporting:

- 12% of components now require new export licenses
- Two key suppliers are in affected jurisdictions
- Lead times have doubled for critical materials
- Three customers are demanding supply chain transparency reports

Your head of supply chain wants to dual-source everything. Cost: $25M over two years. Your CFO says the budget isn't there.

Meanwhile, your competitor just announced they're exiting two markets you're in. Opportunity or warning sign?`,
    crisis: {
      id: 'crisis-5-geopolitical',
      name: 'Geopolitical Supply Chain Risk',
      description: `The sanctions analysis is complete. Your exposure:

Critical Dependencies:
- 23% of rare earth elements from affected regions
- Key semiconductor supplier has 40% production in sanctioned area
- Logistics partner may be designated next month

Options:
A) Aggressive dual-sourcing: $25M, 18 months, eliminates 80% of exposure
B) Strategic reserves: $10M, 6 months buffer stock, buys time
C) Customer communication: Manage expectations, pass through costs

The board wants to know your recommendation. The CEO is asking if this is "really a risk issue or a supply chain issue."

It's both. That's what they don't understand about enterprise risk.`,
      category: 'strategic',
      severity: 'high',
      urgency: 'Sanctions effective in 60 days',
      potentialImpact: 'Supply disruption, customer loss, competitive disadvantage',
      context: 'Your competitors are making moves. Inaction is a choice.',
      options: [
        {
          id: 'geo-dual-source',
          label: 'Aggressive Dual-Sourcing',
          description: 'Invest in alternative supply chains. Eliminate dependencies.',
          tradeoff: 'Expensive but builds resilience',
          cost: 6,
          consequences: [
            { type: 'budget', value: -6, message: 'Supply chain investment (first phase)' },
            { type: 'risk', target: 'operationalRisk', value: 20, message: 'Supply chain resilience improved' },
            { type: 'stakeholder', target: 'board', value: 10, message: 'Board impressed by strategic thinking' },
            { type: 'narrative', value: 0, message: 'Supply chain transformation begins. Competitors notice.' },
          ],
        },
        {
          id: 'geo-buffer',
          label: 'Strategic Reserves',
          description: 'Build buffer stock to buy time for longer-term solution.',
          tradeoff: 'Delays decision but ties up capital',
          cost: 3,
          consequences: [
            { type: 'budget', value: -3, message: 'Buffer stock investment' },
            { type: 'risk', target: 'operationalRisk', value: 8, message: 'Temporary risk reduction' },
            { type: 'narrative', value: 0, message: 'Six months of runway. The clock is ticking.' },
          ],
        },
        {
          id: 'geo-wait',
          label: 'Monitor and Wait',
          description: 'Watch situation develop. Prepare plans but dont execute.',
          tradeoff: 'Preserves capital but may miss window',
          cost: 0,
          consequences: [
            { type: 'risk', target: 'operationalRisk', value: -10, message: 'Exposure increasing' },
            { type: 'stakeholder', target: 'board', value: -5, message: 'Board questions risk management' },
            { type: 'narrative', value: 0, message: 'You wait. The world does not.' },
          ],
        },
      ],
    },
  },
};

const INITIAL_STATE: GameState = {
  round: 0,
  phase: 'intro',
  overallRiskScore: 74,
  metrics: {
    cyberRisk: 72,
    operationalRisk: 68,
    complianceRisk: 75,
    reputationalRisk: 80,
    financialExposure: 340,
    riskAppetite: 65,
  },
  stakeholders: {
    board: 75,
    executives: 70,
    regulators: 80,
    insurers: 70,
    employees: 72,
  },
  budget: 15,
  currentCrisis: null,
  decisionHistory: [],
  narrativeLog: [],
  gameOver: false,
  gameOverReason: null,
  endingType: null,
  activeRisks: [],
};

// =============================================================================
// COMPONENTS
// =============================================================================

function RiskDashboard({ state }: { state: GameState }) {
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRiskBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    if (score >= 40) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-cyan-500/20">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-cyan-400" />
        Enterprise Risk Dashboard
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${getRiskBg(state.metrics.cyberRisk)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Bug className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 text-sm">Cyber Risk</span>
          </div>
          <div className={`text-2xl font-bold ${getRiskColor(state.metrics.cyberRisk)}`}>
            {state.metrics.cyberRisk}
          </div>
        </div>

        <div className={`p-4 rounded-xl ${getRiskBg(state.metrics.operationalRisk)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Cog className="w-4 h-4 text-orange-400" />
            <span className="text-slate-400 text-sm">Operational</span>
          </div>
          <div className={`text-2xl font-bold ${getRiskColor(state.metrics.operationalRisk)}`}>
            {state.metrics.operationalRisk}
          </div>
        </div>

        <div className={`p-4 rounded-xl ${getRiskBg(state.metrics.complianceRisk)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 text-sm">Compliance</span>
          </div>
          <div className={`text-2xl font-bold ${getRiskColor(state.metrics.complianceRisk)}`}>
            {state.metrics.complianceRisk}
          </div>
        </div>

        <div className={`p-4 rounded-xl ${getRiskBg(state.metrics.reputationalRisk)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-pink-400" />
            <span className="text-slate-400 text-sm">Reputation</span>
          </div>
          <div className={`text-2xl font-bold ${getRiskColor(state.metrics.reputationalRisk)}`}>
            {state.metrics.reputationalRisk}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
        <span className="text-slate-400">Financial Exposure</span>
        <span className="text-xl font-bold text-red-400">${state.metrics.financialExposure}M</span>
      </div>

      <div className="flex items-center justify-between p-3 mt-2 bg-slate-900/50 rounded-xl">
        <span className="text-slate-400">Risk Mitigation Budget</span>
        <span className="text-xl font-bold text-emerald-400">${state.budget}M</span>
      </div>
    </div>
  );
}

function StakeholderPanel({ state }: { state: GameState }) {
  const getConfidenceColor = (value: number) => {
    if (value >= 70) return 'text-emerald-400';
    if (value >= 50) return 'text-yellow-400';
    if (value >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const stakeholderIcons: Record<string, any> = {
    board: Building2,
    executives: Briefcase,
    regulators: Landmark,
    insurers: Shield,
    employees: Users,
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-cyan-500/20">
      <h3 className="text-lg font-bold text-white mb-4">Stakeholder Confidence</h3>
      <div className="space-y-3">
        {Object.entries(state.stakeholders).map(([key, value]) => {
          const Icon = stakeholderIcons[key] || Users;
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 capitalize">{key}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      value >= 70 ? 'bg-emerald-500' :
                      value >= 50 ? 'bg-yellow-500' :
                      value >= 30 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${getConfidenceColor(value)}`}>
                  {value}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CrisisPanel({ crisis, onDecision, budget }: { crisis: Crisis; onDecision: (optionId: string) => void; budget: number }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-red-500/30">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Siren className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">{crisis.name}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm border ${getSeverityColor(crisis.severity)}`}>
            {crisis.severity.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-sm">Urgency</div>
          <div className="text-orange-400 font-medium">{crisis.urgency}</div>
        </div>
      </div>

      <p className="text-slate-300 mb-4 whitespace-pre-line">{crisis.description}</p>

      <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
        <div className="text-slate-400 text-sm mb-1">Potential Impact</div>
        <div className="text-red-400">{crisis.potentialImpact}</div>
      </div>

      <h4 className="text-lg font-semibold text-white mb-4">Response Options</h4>
      <div className="space-y-3">
        {crisis.options.map((option) => {
          const canAfford = budget >= option.cost;
          return (
            <div
              key={option.id}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedOption === option.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : canAfford
                    ? 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
                    : 'border-slate-700 bg-slate-900/30 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => canAfford && setSelectedOption(option.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-white">{option.label}</h5>
                <span className={`text-sm ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                  Cost: ${option.cost}M
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-2">{option.description}</p>
              <p className="text-yellow-400/80 text-sm italic">Tradeoff: {option.tradeoff}</p>
            </div>
          );
        })}
      </div>

      {selectedOption && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onDecision(selectedOption)}
          className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <CheckCircle className="w-5 h-5" />
          Execute Decision
        </motion.button>
      )}
    </div>
  );
}

function NarrativePanel({ narrative }: { narrative: typeof OPENING_NARRATIVE }) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-8 border border-cyan-500/20">
      <h2 className="text-2xl font-bold text-white mb-2">{narrative.title}</h2>
      <p className="text-cyan-400 mb-6">{narrative.subtitle}</p>
      <div className="text-slate-300 whitespace-pre-line leading-relaxed">
        {narrative.content}
      </div>
    </div>
  );
}

function Cog({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function RiskIntelligenceSimulation() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);

  const startGame = () => {
    setGameState({
      ...INITIAL_STATE,
      round: 1,
      phase: 'briefing',
    });
  };

  const proceedToNextPhase = () => {
    const { phase, round } = gameState;

    if (phase === 'briefing') {
      const scenario = ROUND_SCENARIOS[round];
      if (scenario) {
        setGameState(prev => ({
          ...prev,
          phase: 'crisis',
          currentCrisis: scenario.crisis,
        }));
      }
    } else if (phase === 'consequences') {
      if (round >= 5) {
        // End game
        const avgRisk = (gameState.metrics.cyberRisk + gameState.metrics.operationalRisk +
                        gameState.metrics.complianceRisk + gameState.metrics.reputationalRisk) / 4;
        let endingType: GameState['endingType'] = 'survival';
        let reason = '';

        if (avgRisk < 40) {
          endingType = 'catastrophe';
          reason = 'Multiple risk failures led to catastrophic losses.';
        } else if (avgRisk >= 75) {
          endingType = 'excellence';
          reason = 'Your risk management excellence protected the enterprise.';
        }

        setGameState(prev => ({
          ...prev,
          phase: 'game-over',
          gameOver: true,
          endingType,
          gameOverReason: reason,
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          round: round + 1,
          phase: 'briefing',
          currentCrisis: null,
        }));
      }
    }
  };

  const handleDecision = (optionId: string) => {
    if (!gameState.currentCrisis) return;

    const option = gameState.currentCrisis.options.find(o => o.id === optionId);
    if (!option) return;

    let newState = { ...gameState };

    // Apply consequences
    option.consequences.forEach(consequence => {
      switch (consequence.type) {
        case 'risk':
          if (consequence.target && consequence.target in newState.metrics) {
            (newState.metrics as any)[consequence.target] += consequence.value;
          }
          break;
        case 'stakeholder':
          if (consequence.target && consequence.target in newState.stakeholders) {
            (newState.stakeholders as any)[consequence.target] += consequence.value;
          }
          break;
        case 'budget':
          newState.budget += consequence.value;
          break;
        case 'exposure':
          newState.metrics.financialExposure += consequence.value;
          break;
      }
    });

    // Deduct cost
    newState.budget -= option.cost;

    // Add to history
    newState.decisionHistory.push({
      round: gameState.round,
      crisisId: gameState.currentCrisis.id,
      optionId: option.id,
      label: option.label,
    });

    // Add narrative
    newState.narrativeLog.push({
      round: gameState.round,
      type: 'decision',
      content: `You chose: ${option.label}`,
      tone: 'neutral',
    });

    newState.phase = 'consequences';
    setGameState(newState);
  };

  const resetGame = () => {
    setGameState(INITIAL_STATE);
  };

  // Render based on phase
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-white hover:text-cyan-400 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Simulations</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-slate-400">
              Round <span className="text-cyan-400 font-bold">{gameState.round}</span> / 5
            </div>
            {gameState.round > 0 && (
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Intro Phase */}
        {gameState.phase === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full mb-4">
                <ShieldAlert className="w-5 h-5" />
                Risk Intelligence Simulation
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Navigating Uncertainty</h1>
              <p className="text-slate-400 text-lg">Where prevention is invisible until it fails</p>
            </div>

            <NarrativePanel narrative={OPENING_NARRATIVE} />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startGame}
              className="w-full mt-8 py-5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 font-bold text-xl rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-cyan-500/25 transition-all"
            >
              <Play className="w-6 h-6" />
              Begin Simulation
            </motion.button>
          </motion.div>
        )}

        {/* Briefing Phase */}
        {gameState.phase === 'briefing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-cyan-500/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Week {gameState.round} Briefing
                </h2>
                <div className="text-slate-300 whitespace-pre-line">
                  {ROUND_SCENARIOS[gameState.round]?.briefing}
                </div>
                <button
                  onClick={proceedToNextPhase}
                  className="mt-6 px-6 py-3 bg-cyan-500 text-slate-900 font-semibold rounded-xl hover:bg-cyan-400 transition-colors"
                >
                  Review Crisis →
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <RiskDashboard state={gameState} />
              <StakeholderPanel state={gameState} />
            </div>
          </motion.div>
        )}

        {/* Crisis Phase */}
        {gameState.phase === 'crisis' && gameState.currentCrisis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <CrisisPanel
                crisis={gameState.currentCrisis}
                onDecision={handleDecision}
                budget={gameState.budget}
              />
            </div>
            <div className="space-y-6">
              <RiskDashboard state={gameState} />
              <StakeholderPanel state={gameState} />
            </div>
          </motion.div>
        )}

        {/* Consequences Phase */}
        {gameState.phase === 'consequences' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-cyan-500/20 text-center">
              <CheckCircle className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Decision Executed</h2>
              <p className="text-slate-400 mb-6">
                Your decision has been implemented. The consequences are unfolding...
              </p>
              <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                <p className="text-cyan-400">
                  {gameState.narrativeLog[gameState.narrativeLog.length - 1]?.content}
                </p>
              </div>
              <button
                onClick={proceedToNextPhase}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all"
              >
                {gameState.round >= 5 ? 'View Results' : 'Continue to Next Week'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Game Over Phase */}
        {gameState.phase === 'game-over' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className={`rounded-2xl p-8 border text-center ${
              gameState.endingType === 'excellence'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : gameState.endingType === 'catastrophe'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-slate-800/50 border-cyan-500/20'
            }`}>
              <h2 className="text-3xl font-bold text-white mb-4">
                {gameState.endingType === 'excellence' && '🛡️ Risk Management Excellence'}
                {gameState.endingType === 'catastrophe' && '💥 Catastrophic Failure'}
                {gameState.endingType === 'survival' && '✅ Simulation Complete'}
              </h2>
              <p className="text-slate-300 mb-8">{gameState.gameOverReason}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <div className="text-slate-400 mb-1">Final Risk Score</div>
                  <div className="text-3xl font-bold text-cyan-400">
                    {Math.round((gameState.metrics.cyberRisk + gameState.metrics.operationalRisk +
                                gameState.metrics.complianceRisk + gameState.metrics.reputationalRisk) / 4)}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <div className="text-slate-400 mb-1">Decisions Made</div>
                  <div className="text-3xl font-bold text-cyan-400">
                    {gameState.decisionHistory.length}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="px-8 py-4 bg-cyan-500 text-slate-900 font-bold rounded-xl hover:bg-cyan-400 transition-colors"
                >
                  Play Again
                </button>
                <Link
                  href="/"
                  className="px-8 py-4 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
