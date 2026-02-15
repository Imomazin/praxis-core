'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cog,
  Package,
  Truck,
  Factory,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Target,
  Shield,
  Boxes,
  Warehouse,
  AlertCircle,
  CheckCircle,
  XCircle,
  Network,
  Flame,
  Anchor,
  Ship,
  Globe,
  Snowflake,
  Wrench,
  Users,
  Crown,
  Skull,
  LifeBuoy,
  RefreshCw,
  Play,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

type Phase = 'intro' | 'briefing' | 'decision' | 'consequence' | 'monthly-report' | 'ending';
type EndingType = 'plant-closure' | 'customer-exodus' | 'survival' | 'lean-champion' | 'industry-leader';

interface SupplyNode {
  id: string;
  name: string;
  type: 'supplier' | 'plant' | 'warehouse' | 'customer';
  status: 'operational' | 'stressed' | 'disrupted' | 'failed';
  utilization: number;
  reliability: number;
}

interface OperationalCrisis {
  id: string;
  month: number;
  title: string;
  description: string;
  severity: 'moderate' | 'severe' | 'critical';
  category: 'supply' | 'production' | 'quality' | 'demand' | 'logistics';
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
  productionCapacity: number;
  qualityScore: number;
  deliveryPerformance: number;
  operatingCost: number;
  supplierResilience: number;
  customerSatisfaction: number;
  inventoryCost: number;
  specialEffect?: string;
}

interface DecisionRecord {
  month: number;
  crisisId: string;
  choiceId: string;
  choiceLabel: string;
  consequences: ChoiceConsequence;
}

interface GameState {
  month: number;
  phase: Phase;
  // Production metrics
  productionCapacity: number;
  actualOutput: number;
  plantUtilization: number;
  equipmentHealth: number;
  // Quality metrics
  qualityScore: number;
  defectRate: number;
  firstPassYield: number;
  customerComplaints: number;
  // Supply chain metrics
  supplierResilience: number;
  inventoryDays: number;
  inventoryCost: number;
  leadTimeVariability: number;
  // Delivery metrics
  deliveryPerformance: number;
  onTimeInFull: number;
  backlogUnits: number;
  // Financial
  operatingCost: number;
  costPerUnit: number;
  // Stakeholder
  customerSatisfaction: number;
  employeeMorale: number;
  // Game state
  supplyNodes: SupplyNode[];
  currentCrisis: OperationalCrisis | null;
  decisionHistory: DecisionRecord[];
  activeDisruptions: string[];
  gameOver: boolean;
  endingType: EndingType | null;
  endingNarrative: string;
}

// =============================================================================
// NARRATIVE CONTENT
// =============================================================================

const COMPANY_STORY = {
  name: 'Velocity Manufacturing',
  industry: 'Consumer Electronics & Components',
  situation: `You are Sarah Park, newly appointed VP of Operations at Velocity Manufacturing, a $1.2B consumer electronics manufacturer.

The company built its reputation on "good enough" quality at competitive prices. But the market has shifted. Customers now demand premium quality AND fast delivery. Your predecessor ignored the warning signs, and now you're inheriting a creaking operation:

• The main assembly plant is running at 94% utilization—one breakdown away from chaos
• 65% of components come from a single supplier in Shenzhen
• Quality complaints have tripled in the past year
• Your biggest customer, representing 30% of revenue, just put you on "supplier probation"

The board gave you 12 months to turn this around. Your first day? A container ship is stuck in the Suez Canal with $4M of your inventory.`,

  cooBackground: `Former Toyota Production System black belt, you know what operational excellence looks like. You've seen the difference between companies that bend and companies that break. Velocity is bending—badly. Your job is to make it unbreakable.`,
};

const INITIAL_SUPPLY_NODES: SupplyNode[] = [
  { id: 'supplier-primary', name: 'Shenzhen Components', type: 'supplier', status: 'stressed', utilization: 92, reliability: 75 },
  { id: 'supplier-secondary', name: 'Taiwan Precision', type: 'supplier', status: 'operational', utilization: 65, reliability: 88 },
  { id: 'plant-main', name: 'Ohio Assembly', type: 'plant', status: 'stressed', utilization: 94, reliability: 82 },
  { id: 'warehouse-central', name: 'Louisville DC', type: 'warehouse', status: 'operational', utilization: 78, reliability: 95 },
  { id: 'customer-major', name: 'TechMart (30%)', type: 'customer', status: 'stressed', utilization: 100, reliability: 60 },
];

const OPERATIONAL_CRISES: OperationalCrisis[] = [
  // Month 1: The Suez Crisis
  {
    id: 'suez-blockage',
    month: 1,
    title: 'Supply Chain Chokepoint',
    description: `Day one on the job: a container ship is blocking the Suez Canal. Your $4M shipment of display panels is stuck. Without them, production stops in 8 days. Air freight would cost $800K but gets panels here in 3 days. You could also pivot to your secondary supplier in Taiwan, but they're more expensive and have never scaled to this volume.`,
    severity: 'critical',
    category: 'supply',
    choices: [
      {
        id: 'air-freight',
        label: 'Emergency Air Freight',
        description: 'Fly the panels from Egypt once canal clears',
        shortTermImpact: '$800K hit to this quarter',
        longTermRisk: 'Sets precedent for expensive workarounds',
        consequences: {
          productionCapacity: 0,
          qualityScore: 0,
          deliveryPerformance: 5,
          operatingCost: 8,
          supplierResilience: 0,
          customerSatisfaction: 5,
          inventoryCost: 2,
        },
      },
      {
        id: 'taiwan-pivot',
        label: 'Activate Taiwan Supplier',
        description: 'Rush order from secondary supplier at premium',
        shortTermImpact: 'Higher unit costs, but builds resilience',
        longTermRisk: 'Quality untested at volume',
        consequences: {
          productionCapacity: -5,
          qualityScore: -8,
          deliveryPerformance: -5,
          operatingCost: 5,
          supplierResilience: 15,
          customerSatisfaction: -3,
          inventoryCost: 3,
          specialEffect: 'supplier-diversified',
        },
      },
      {
        id: 'wait-it-out',
        label: 'Wait and Ration',
        description: 'Slow production, prioritize key customers',
        shortTermImpact: 'Some orders will be late',
        longTermRisk: 'TechMart may accelerate probation review',
        consequences: {
          productionCapacity: -15,
          qualityScore: 0,
          deliveryPerformance: -20,
          operatingCost: -3,
          supplierResilience: 0,
          customerSatisfaction: -15,
          inventoryCost: -5,
          specialEffect: 'customer-patience-tested',
        },
      },
    ],
  },
  // Month 2: Quality Crisis
  {
    id: 'quality-escape',
    month: 2,
    title: 'Quality Escape',
    description: `Your quality team just discovered that 12,000 units shipped last week have a defective solder joint. The defect causes intermittent failures after 2-3 months of use. Units are already in TechMart stores nationwide. A full recall would cost $3M and make headlines. A "silent fix" program through regular service channels would cost $500K but risks customer discovery.`,
    severity: 'severe',
    category: 'quality',
    choices: [
      {
        id: 'full-recall',
        label: 'Full Product Recall',
        description: 'Public announcement, immediate recall, root cause fix',
        shortTermImpact: '$3M cost, PR crisis',
        longTermRisk: 'Short-term reputation hit, long-term trust building',
        consequences: {
          productionCapacity: -10,
          qualityScore: 10,
          deliveryPerformance: -15,
          operatingCost: 12,
          supplierResilience: 0,
          customerSatisfaction: -10,
          inventoryCost: 5,
          specialEffect: 'recall-announced',
        },
      },
      {
        id: 'silent-fix',
        label: 'Silent Service Program',
        description: 'Fix units through normal service channels',
        shortTermImpact: 'Lower cost, higher risk',
        longTermRisk: 'Could blow up if discovered',
        consequences: {
          productionCapacity: 0,
          qualityScore: -5,
          deliveryPerformance: 0,
          operatingCost: 2,
          supplierResilience: 0,
          customerSatisfaction: 5,
          inventoryCost: 0,
          specialEffect: 'silent-fix-gamble',
        },
      },
      {
        id: 'proactive-exchange',
        label: 'Proactive Customer Exchange',
        description: 'Contact affected customers directly, offer upgrades',
        shortTermImpact: '$1.5M cost, goodwill gesture',
        longTermRisk: 'Acknowledges problem without full recall',
        consequences: {
          productionCapacity: -5,
          qualityScore: 5,
          deliveryPerformance: -8,
          operatingCost: 6,
          supplierResilience: 0,
          customerSatisfaction: 8,
          inventoryCost: 2,
        },
      },
    ],
  },
  // Month 3: Demand Spike
  {
    id: 'demand-surge',
    month: 3,
    title: 'Viral Demand Surge',
    description: `A TikTok influencer featured your product in a viral video. Orders have tripled overnight. TechMart is demanding 40% more units immediately—this could get you off probation. But your plant is already at 94% capacity. You could run overtime (expensive, exhausting), add a night shift (3-month ramp), or partner with a contract manufacturer (quality concerns).`,
    severity: 'severe',
    category: 'demand',
    choices: [
      {
        id: 'overtime-push',
        label: 'Mandatory Overtime',
        description: '60-hour weeks until demand stabilizes',
        shortTermImpact: 'Meet demand, burn out workers',
        longTermRisk: 'Quality drops, turnover spikes',
        consequences: {
          productionCapacity: 25,
          qualityScore: -10,
          deliveryPerformance: 15,
          operatingCost: 8,
          supplierResilience: 0,
          customerSatisfaction: 10,
          inventoryCost: -5,
          specialEffect: 'workforce-stressed',
        },
      },
      {
        id: 'night-shift',
        label: 'Launch Night Shift',
        description: 'Hire and train second shift team',
        shortTermImpact: '3 months to full capacity',
        longTermRisk: 'Significant investment, slower ramp',
        consequences: {
          productionCapacity: 10,
          qualityScore: 0,
          deliveryPerformance: 5,
          operatingCost: 10,
          supplierResilience: 0,
          customerSatisfaction: 5,
          inventoryCost: 0,
          specialEffect: 'capacity-expansion',
        },
      },
      {
        id: 'contract-mfg',
        label: 'Contract Manufacturing',
        description: 'Partner with Foxconn for overflow',
        shortTermImpact: 'Fast capacity, quality risk',
        longTermRisk: 'Dependency on external production',
        consequences: {
          productionCapacity: 30,
          qualityScore: -15,
          deliveryPerformance: 20,
          operatingCost: 5,
          supplierResilience: -10,
          customerSatisfaction: 8,
          inventoryCost: 0,
          specialEffect: 'outsourced-production',
        },
      },
    ],
  },
  // Month 4: Equipment Failure
  {
    id: 'equipment-breakdown',
    month: 4,
    title: 'Critical Equipment Failure',
    description: `Your main SMT (surface mount) line just went down. The pick-and-place machine—a $2M piece of equipment—has a failed servo motor. OEM repair: 6 weeks, $180K. Third-party repair: 2 weeks, $90K but voids warranty. You could also rent a temporary machine for $50K/week while waiting.`,
    severity: 'critical',
    category: 'production',
    choices: [
      {
        id: 'oem-repair',
        label: 'OEM Authorized Repair',
        description: 'Wait 6 weeks, maintain warranty',
        shortTermImpact: 'Major production gap',
        longTermRisk: 'Reliable but slow',
        consequences: {
          productionCapacity: -35,
          qualityScore: 5,
          deliveryPerformance: -30,
          operatingCost: 3,
          supplierResilience: 0,
          customerSatisfaction: -20,
          inventoryCost: 10,
        },
      },
      {
        id: 'third-party',
        label: 'Third-Party Repair',
        description: 'Faster but voids warranty',
        shortTermImpact: '2 weeks downtime',
        longTermRisk: 'No warranty on $2M machine',
        consequences: {
          productionCapacity: -15,
          qualityScore: -3,
          deliveryPerformance: -10,
          operatingCost: 2,
          supplierResilience: 0,
          customerSatisfaction: -8,
          inventoryCost: 3,
          specialEffect: 'warranty-voided',
        },
      },
      {
        id: 'rental-bridge',
        label: 'Rent + OEM Repair',
        description: 'Rent temp machine while waiting for OEM',
        shortTermImpact: 'Expensive but maintains production',
        longTermRisk: 'High cost, but keeps customers happy',
        consequences: {
          productionCapacity: -5,
          qualityScore: -5,
          deliveryPerformance: -5,
          operatingCost: 12,
          supplierResilience: 0,
          customerSatisfaction: -3,
          inventoryCost: 2,
        },
      },
    ],
  },
  // Month 5: Supplier Crisis
  {
    id: 'supplier-bankruptcy',
    month: 5,
    title: 'Supplier Financial Distress',
    description: `Your primary supplier in Shenzhen just missed a payment to their creditors. Industry rumors say they're 60 days from bankruptcy. They supply 65% of your components. You could prepay 3 months to keep them afloat ($8M), accelerate qualification of alternatives (6-month process), or do nothing and hope.`,
    severity: 'critical',
    category: 'supply',
    choices: [
      {
        id: 'supplier-bailout',
        label: 'Emergency Prepayment',
        description: 'Prepay $8M to stabilize supplier',
        shortTermImpact: 'Major cash outflow',
        longTermRisk: 'Throwing good money after bad?',
        consequences: {
          productionCapacity: 0,
          qualityScore: 0,
          deliveryPerformance: 0,
          operatingCost: 15,
          supplierResilience: -10,
          customerSatisfaction: 0,
          inventoryCost: 8,
          specialEffect: 'supplier-lifeline',
        },
      },
      {
        id: 'accelerate-alt',
        label: 'Crash Qualification Program',
        description: 'Fast-track alternative suppliers',
        shortTermImpact: 'Expensive, disruptive',
        longTermRisk: 'Quality validation shortcuts',
        consequences: {
          productionCapacity: -10,
          qualityScore: -8,
          deliveryPerformance: -10,
          operatingCost: 8,
          supplierResilience: 25,
          customerSatisfaction: -5,
          inventoryCost: 5,
          specialEffect: 'supplier-diversification',
        },
      },
      {
        id: 'wait-and-watch',
        label: 'Monitor Situation',
        description: 'Build buffer inventory, watch closely',
        shortTermImpact: 'Lower cost, higher risk',
        longTermRisk: 'Could be catastrophic if they fail',
        consequences: {
          productionCapacity: 0,
          qualityScore: 0,
          deliveryPerformance: 0,
          operatingCost: 3,
          supplierResilience: -5,
          customerSatisfaction: 0,
          inventoryCost: 10,
          specialEffect: 'supplier-risk-unaddressed',
        },
      },
    ],
  },
  // Month 6: Labor Dispute
  {
    id: 'labor-dispute',
    month: 6,
    title: 'Union Negotiations Breakdown',
    description: `Contract negotiations with the plant union have stalled. Workers are demanding a 12% raise and better safety protocols after two minor injuries last month. Management offered 4%. The union is threatening a work slowdown. Peak season is 8 weeks away.`,
    severity: 'severe',
    category: 'production',
    choices: [
      {
        id: 'meet-demands',
        label: 'Accept Union Terms',
        description: '12% raise, enhanced safety program',
        shortTermImpact: '$4M annual labor cost increase',
        longTermRisk: 'Sets precedent for future negotiations',
        consequences: {
          productionCapacity: 5,
          qualityScore: 8,
          deliveryPerformance: 5,
          operatingCost: 8,
          supplierResilience: 0,
          customerSatisfaction: 0,
          inventoryCost: 0,
          specialEffect: 'labor-peace',
        },
      },
      {
        id: 'negotiate-middle',
        label: 'Counter at 8%',
        description: 'Split the difference, add safety investment',
        shortTermImpact: 'May or may not be accepted',
        longTermRisk: 'Prolonged uncertainty',
        consequences: {
          productionCapacity: 0,
          qualityScore: 3,
          deliveryPerformance: 0,
          operatingCost: 5,
          supplierResilience: 0,
          customerSatisfaction: 0,
          inventoryCost: 0,
        },
      },
      {
        id: 'hold-firm',
        label: 'Hold at 4%',
        description: 'Prepare for slowdown, hire temps',
        shortTermImpact: 'Work slowdown likely',
        longTermRisk: 'Quality and morale suffer',
        consequences: {
          productionCapacity: -15,
          qualityScore: -12,
          deliveryPerformance: -10,
          operatingCost: -2,
          supplierResilience: 0,
          customerSatisfaction: -8,
          inventoryCost: 5,
          specialEffect: 'labor-conflict',
        },
      },
    ],
  },
  // Month 7: Customer Ultimatum
  {
    id: 'customer-ultimatum',
    month: 7,
    title: 'TechMart Ultimatum',
    description: `TechMart's Chief Procurement Officer just called. Your on-time delivery has improved, but they've found a cheaper supplier in Vietnam. They're offering to keep you as primary supplier IF you cut prices 15% and guarantee 99% OTIF. Otherwise, they're moving 70% of volume to the competitor starting next quarter.`,
    severity: 'critical',
    category: 'demand',
    choices: [
      {
        id: 'accept-terms',
        label: 'Accept TechMart Terms',
        description: '15% price cut, 99% OTIF guarantee',
        shortTermImpact: 'Margin destruction',
        longTermRisk: 'May not be sustainable',
        consequences: {
          productionCapacity: 0,
          qualityScore: 0,
          deliveryPerformance: 10,
          operatingCost: 0,
          supplierResilience: 0,
          customerSatisfaction: 15,
          inventoryCost: 3,
          specialEffect: 'margin-compression',
        },
      },
      {
        id: 'counter-propose',
        label: 'Counter with Value Add',
        description: '8% cut + exclusive new product features',
        shortTermImpact: 'May lose some volume',
        longTermRisk: 'Differentiation strategy',
        consequences: {
          productionCapacity: 0,
          qualityScore: 5,
          deliveryPerformance: 5,
          operatingCost: 3,
          supplierResilience: 0,
          customerSatisfaction: 5,
          inventoryCost: 0,
        },
      },
      {
        id: 'walk-away',
        label: 'Decline and Diversify',
        description: 'Reduce TechMart dependency, find new customers',
        shortTermImpact: 'Lose 70% of TechMart volume',
        longTermRisk: 'Revenue hit, but healthier mix',
        consequences: {
          productionCapacity: -20,
          qualityScore: 0,
          deliveryPerformance: -5,
          operatingCost: -5,
          supplierResilience: 5,
          customerSatisfaction: -15,
          inventoryCost: -8,
          specialEffect: 'customer-diversification',
        },
      },
    ],
  },
  // Month 8: Final Challenge
  {
    id: 'transformation-decision',
    month: 8,
    title: 'The Transformation Decision',
    description: `Eight months in. The board is reviewing your turnaround progress. You have three paths forward: double down on operational excellence (lean transformation), invest in automation (Industry 4.0), or recommend selling the manufacturing division to focus on design and marketing. Each has profound implications for the next decade.`,
    severity: 'critical',
    category: 'production',
    choices: [
      {
        id: 'lean-transformation',
        label: 'Lean Transformation',
        description: 'Toyota Production System implementation',
        shortTermImpact: '18-month journey, cultural change',
        longTermRisk: 'Requires sustained commitment',
        consequences: {
          productionCapacity: 10,
          qualityScore: 15,
          deliveryPerformance: 10,
          operatingCost: -5,
          supplierResilience: 10,
          customerSatisfaction: 10,
          inventoryCost: -10,
          specialEffect: 'lean-journey',
        },
      },
      {
        id: 'automation-investment',
        label: 'Industry 4.0 Investment',
        description: '$50M automation and digitization',
        shortTermImpact: 'Major CapEx, 2-year payback',
        longTermRisk: 'Technology risk, workforce displacement',
        consequences: {
          productionCapacity: 20,
          qualityScore: 10,
          deliveryPerformance: 15,
          operatingCost: 10,
          supplierResilience: 5,
          customerSatisfaction: 12,
          inventoryCost: -5,
          specialEffect: 'automation-future',
        },
      },
      {
        id: 'asset-light',
        label: 'Asset-Light Model',
        description: 'Sell manufacturing, outsource to partners',
        shortTermImpact: 'Major restructuring, layoffs',
        longTermRisk: 'Lose manufacturing DNA',
        consequences: {
          productionCapacity: -30,
          qualityScore: -10,
          deliveryPerformance: -5,
          operatingCost: -15,
          supplierResilience: -20,
          customerSatisfaction: -5,
          inventoryCost: -20,
          specialEffect: 'strategic-pivot',
        },
      },
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateEnding(state: GameState): { type: EndingType; narrative: string } {
  // Plant closure
  if (state.productionCapacity <= 40 || state.customerSatisfaction <= 15) {
    return {
      type: 'plant-closure',
      narrative: `The Ohio plant closed its doors on a cold November morning. Despite your best efforts, the accumulated problems proved insurmountable. Equipment failures, supplier issues, and customer defections created a death spiral. The 800 workers who lost their jobs will remember Velocity Manufacturing—but not fondly. Sometimes even the best operators can't save a sinking ship.`,
    };
  }

  // Customer exodus
  if (state.deliveryPerformance <= 50 || state.qualityScore <= 55) {
    return {
      type: 'customer-exodus',
      narrative: `TechMart wasn't bluffing. When they moved their volume to Vietnam, other customers followed. Within 18 months, Velocity's revenue had dropped 60%. The plant is still running, but at 40% utilization—a ghost of its former self. Your operational improvements came too late. In manufacturing, timing isn't everything—it's the only thing.`,
    };
  }

  // Industry leader
  if (state.qualityScore >= 90 && state.deliveryPerformance >= 90 && state.productionCapacity >= 100) {
    return {
      type: 'industry-leader',
      narrative: `Harvard Business Review just called. They want to write a case study on "The Velocity Turnaround." Your plant is now a benchmark for the industry—98.5% quality, 99.2% on-time delivery, and cost per unit down 18%. TechMart? They're your second-largest customer now. You found bigger, better partners who value quality over price. This is what operational excellence looks like when leadership commits fully.`,
    };
  }

  // Lean champion
  if (state.qualityScore >= 80 && state.operatingCost <= 90 && state.supplierResilience >= 70) {
    return {
      type: 'lean-champion',
      narrative: `The transformation took 18 months, but it worked. Velocity Manufacturing is now a certified lean enterprise. Defect rates are down 70%. Inventory turns have doubled. The workforce—once skeptical—has become your biggest advocates for continuous improvement. You didn't just save the plant; you created a culture of excellence that will outlast any single leader.`,
    };
  }

  // Survival
  return {
    type: 'survival',
    narrative: `Velocity Manufacturing survived. Not thrived—survived. The plant is still running. TechMart reduced their volume but didn't leave entirely. Quality improved modestly. Costs are under control. It's not the transformation you envisioned, but in manufacturing, survival means you get to fight another day. Many plants don't get that chance.`,
  };
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const INITIAL_STATE: GameState = {
  month: 0,
  phase: 'intro',
  productionCapacity: 100,
  actualOutput: 94,
  plantUtilization: 94,
  equipmentHealth: 72,
  qualityScore: 68,
  defectRate: 3200,
  firstPassYield: 91.5,
  customerComplaints: 145,
  supplierResilience: 45,
  inventoryDays: 42,
  inventoryCost: 100,
  leadTimeVariability: 35,
  deliveryPerformance: 78,
  onTimeInFull: 82,
  backlogUnits: 8500,
  operatingCost: 100,
  costPerUnit: 42.50,
  customerSatisfaction: 55,
  employeeMorale: 62,
  supplyNodes: INITIAL_SUPPLY_NODES,
  currentCrisis: null,
  decisionHistory: [],
  activeDisruptions: [],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/scenarios/scenario-05.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      )}
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-orange-950/80" />

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
            className="w-24 h-24 bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <Factory className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-5xl font-black text-white mb-4">Operations Excellence</h1>
          <p className="text-2xl text-orange-400 font-light">Flow, Capacity, and Fragility</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">{COMPANY_STORY.name}</h2>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line mb-6">
            {COMPANY_STORY.situation}
          </p>
          <div className="p-4 bg-orange-900/30 border border-orange-700/50 rounded-xl">
            <p className="text-orange-300 italic">{COMPANY_STORY.cooBackground}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Clock, label: '8 Months', desc: 'Turnaround Timeline' },
            { icon: AlertTriangle, label: 'On Probation', desc: 'Biggest Customer' },
            { icon: Target, label: 'Your Mission', desc: 'Build Resilience' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-slate-800/50 rounded-xl p-4 text-center"
            >
              <item.icon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="font-bold text-white">{item.label}</p>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xl font-bold rounded-xl flex items-center justify-center gap-3 hover:from-orange-500 hover:to-amber-500 transition-all"
        >
          <Play className="w-6 h-6" />
          Begin Operations Turnaround
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
  crisis: OperationalCrisis;
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
    supply: Ship,
    production: Factory,
    quality: Shield,
    demand: TrendingUp,
    logistics: Truck,
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
                  Month {crisis.month}
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
            { label: 'Production', value: `${state.productionCapacity}%`, color: state.productionCapacity < 70 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Quality', value: `${state.qualityScore}%`, color: state.qualityScore < 70 ? 'text-red-400' : 'text-amber-400' },
            { label: 'Delivery', value: `${state.deliveryPerformance}%`, color: state.deliveryPerformance < 80 ? 'text-red-400' : 'text-emerald-400' },
            { label: 'Customer Sat', value: `${state.customerSatisfaction}%`, color: state.customerSatisfaction < 50 ? 'text-red-400' : 'text-amber-400' },
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
                  ? 'bg-orange-900/30 border-orange-500'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{choice.label}</h3>
                  <p className="text-slate-400 mt-1">{choice.description}</p>
                </div>
                <ChevronRight className={`w-6 h-6 transition-transform ${
                  selectedChoice?.id === choice.id ? 'text-orange-400 rotate-90' : 'text-slate-600'
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
                  You are about to: <span className="text-orange-400 font-semibold">{selectedChoice.label}</span>
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  This decision will affect your production line immediately.
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
                    className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-amber-500 transition-all"
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
  crisis: OperationalCrisis;
  onContinue: () => void;
}) {
  const [revealIndex, setRevealIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevealIndex((i) => Math.min(i + 1, 7));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const consequences = [
    { label: 'Production Capacity', value: choice.consequences.productionCapacity, suffix: '%', positive: choice.consequences.productionCapacity > 0 },
    { label: 'Quality Score', value: choice.consequences.qualityScore, suffix: '%', positive: choice.consequences.qualityScore > 0 },
    { label: 'Delivery Performance', value: choice.consequences.deliveryPerformance, suffix: '%', positive: choice.consequences.deliveryPerformance > 0 },
    { label: 'Operating Cost', value: choice.consequences.operatingCost, suffix: '%', positive: choice.consequences.operatingCost < 0 },
    { label: 'Supplier Resilience', value: choice.consequences.supplierResilience, suffix: '%', positive: choice.consequences.supplierResilience > 0 },
    { label: 'Customer Satisfaction', value: choice.consequences.customerSatisfaction, suffix: '%', positive: choice.consequences.customerSatisfaction > 0 },
    { label: 'Inventory Cost', value: choice.consequences.inventoryCost, suffix: '%', positive: choice.consequences.inventoryCost < 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Impact Assessment</h2>
          <p className="text-slate-400">Month {crisis.month}: {choice.label}</p>
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
            animate={{ opacity: revealIndex >= 7 ? 1 : 0 }}
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
          animate={{ opacity: revealIndex >= 7 ? 1 : 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl"
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}

function MonthlyReportScreen({
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
          <h1 className="text-4xl font-bold text-white mb-2">Monthly Operations Report</h1>
          <p className="text-slate-400">End of Month {state.month}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Production Metrics */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Factory className="w-5 h-5 text-orange-400" />
              Production
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Capacity', value: `${state.productionCapacity}%`, danger: state.productionCapacity < 70 },
                { label: 'Plant Utilization', value: `${state.plantUtilization}%` },
                { label: 'Equipment Health', value: `${state.equipmentHealth}%`, danger: state.equipmentHealth < 70 },
                { label: 'Operating Cost Index', value: `${state.operatingCost}%` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-semibold ${item.danger ? 'text-red-400' : 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality & Delivery */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Quality & Delivery
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Quality Score', value: `${state.qualityScore}%`, danger: state.qualityScore < 70 },
                { label: 'First Pass Yield', value: `${state.firstPassYield}%` },
                { label: 'On-Time Delivery', value: `${state.deliveryPerformance}%`, danger: state.deliveryPerformance < 80 },
                { label: 'Customer Satisfaction', value: `${state.customerSatisfaction}%`, danger: state.customerSatisfaction < 50 },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-semibold ${item.danger ? 'text-red-400' : 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supply Chain Health */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-400" />
            Supply Chain Health
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {state.supplyNodes.map((node) => (
              <div key={node.id} className={`p-3 rounded-xl border ${
                node.status === 'failed' ? 'bg-red-900/30 border-red-700' :
                node.status === 'disrupted' ? 'bg-orange-900/30 border-orange-700' :
                node.status === 'stressed' ? 'bg-amber-900/30 border-amber-700' :
                'bg-slate-800/50 border-slate-700'
              }`}>
                <p className="text-sm font-medium text-white truncate">{node.name}</p>
                <p className="text-xs text-slate-500 capitalize">{node.type}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    node.status === 'operational' ? 'bg-emerald-500/20 text-emerald-400' :
                    node.status === 'stressed' ? 'bg-amber-500/20 text-amber-400' :
                    node.status === 'disrupted' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {node.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Banners */}
        {state.customerSatisfaction < 40 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-900/50 border border-red-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <Skull className="w-6 h-6 text-red-400" />
            <p className="text-red-300">
              <span className="font-bold">CRITICAL:</span> Customer satisfaction dangerously low. TechMart reviewing relationship.
            </p>
          </motion.div>
        )}

        {state.supplierResilience < 30 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-orange-900/50 border border-orange-500 rounded-xl mb-4 flex items-center gap-3"
          >
            <AlertCircle className="w-6 h-6 text-orange-400" />
            <p className="text-orange-300">
              <span className="font-bold">WARNING:</span> Supply chain vulnerability high. Single points of failure detected.
            </p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          {state.month < 8 ? 'Proceed to Next Month' : 'See Final Results'}
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
    'plant-closure': Skull,
    'customer-exodus': TrendingDown,
    'survival': LifeBuoy,
    'lean-champion': Cog,
    'industry-leader': Crown,
  };

  const endingColors: Record<EndingType, string> = {
    'plant-closure': 'from-red-600 to-red-800',
    'customer-exodus': 'from-orange-600 to-red-600',
    'survival': 'from-amber-600 to-orange-600',
    'lean-champion': 'from-blue-600 to-cyan-600',
    'industry-leader': 'from-emerald-600 to-teal-600',
  };

  const endingTitles: Record<EndingType, string> = {
    'plant-closure': 'Plant Closed',
    'customer-exodus': 'Customer Exodus',
    'survival': 'Survived',
    'lean-champion': 'Lean Champion',
    'industry-leader': 'Industry Leader',
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
            { label: 'Production', value: `${state.productionCapacity}%` },
            { label: 'Quality', value: `${state.qualityScore}%` },
            { label: 'Delivery', value: `${state.deliveryPerformance}%` },
            { label: 'Months', value: state.month },
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
          className="py-4 px-8 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto"
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

export default function OperationsExcellencePage() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [lastChoice, setLastChoice] = useState<CrisisChoice | null>(null);

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      month: 1,
      phase: 'decision',
      currentCrisis: OPERATIONAL_CRISES.find((c) => c.month === 1) || null,
    }));
  }, []);

  const handleChoice = useCallback((choice: CrisisChoice) => {
    setLastChoice(choice);

    setGameState((prev) => {
      const newProductionCapacity = Math.max(0, Math.min(150, prev.productionCapacity + choice.consequences.productionCapacity));
      const newQualityScore = Math.max(0, Math.min(100, prev.qualityScore + choice.consequences.qualityScore));
      const newDeliveryPerformance = Math.max(0, Math.min(100, prev.deliveryPerformance + choice.consequences.deliveryPerformance));
      const newOperatingCost = Math.max(50, prev.operatingCost + choice.consequences.operatingCost);
      const newSupplierResilience = Math.max(0, Math.min(100, prev.supplierResilience + choice.consequences.supplierResilience));
      const newCustomerSatisfaction = Math.max(0, Math.min(100, prev.customerSatisfaction + choice.consequences.customerSatisfaction));
      const newInventoryCost = Math.max(50, prev.inventoryCost + choice.consequences.inventoryCost);

      const newDecisionHistory = [...prev.decisionHistory, {
        month: prev.month,
        crisisId: prev.currentCrisis?.id || '',
        choiceId: choice.id,
        choiceLabel: choice.label,
        consequences: choice.consequences,
      }];

      return {
        ...prev,
        productionCapacity: newProductionCapacity,
        qualityScore: newQualityScore,
        deliveryPerformance: newDeliveryPerformance,
        operatingCost: newOperatingCost,
        supplierResilience: newSupplierResilience,
        customerSatisfaction: newCustomerSatisfaction,
        inventoryCost: newInventoryCost,
        decisionHistory: newDecisionHistory,
        phase: 'consequence',
      };
    });
  }, []);

  const handleConsequenceContinue = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      phase: 'monthly-report',
    }));
  }, []);

  const handleMonthlyReportContinue = useCallback(() => {
    setGameState((prev) => {
      // Check for game over
      if (prev.productionCapacity <= 40 || prev.customerSatisfaction <= 15 || prev.month >= 8) {
        const ending = calculateEnding(prev);
        return {
          ...prev,
          phase: 'ending',
          gameOver: true,
          endingType: ending.type,
          endingNarrative: ending.narrative,
        };
      }

      const nextMonth = prev.month + 1;
      const nextCrisis = OPERATIONAL_CRISES.find((c) => c.month === nextMonth) || null;

      // Monthly decay/improvement
      const equipmentDecay = Math.random() * 3;

      return {
        ...prev,
        month: nextMonth,
        phase: 'decision',
        currentCrisis: nextCrisis,
        equipmentHealth: Math.max(50, prev.equipmentHealth - equipmentDecay),
        firstPassYield: Math.min(99, prev.firstPassYield + (prev.qualityScore > 80 ? 0.5 : -0.5)),
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

  if (gameState.phase === 'monthly-report') {
    return (
      <MonthlyReportScreen
        state={gameState}
        onContinue={handleMonthlyReportContinue}
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

  return <IntroScreen onStart={startGame} />;
}
