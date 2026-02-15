'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Clock,
  Target,
  Zap,
  Globe,
  FileText,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Play,
  Shield,
  Award,
  Crosshair,
  Flame,
  Eye,
  PieChart,
  Activity,
  Swords,
  Flag,
  Crown,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

type Phase = 'intro' | 'market-briefing' | 'competitor-intel' | 'decisions' | 'market-resolution' | 'round-end' | 'game-over';
type Segment = 'enterprise' | 'mid-market' | 'smb' | 'consumer';
type CompetitorStrategy = 'aggressive' | 'defensive' | 'niche' | 'disruptive' | 'premium';

interface Competitor {
  id: string;
  name: string;
  color: string;
  strategy: CompetitorStrategy;
  marketShare: number;
  brandEquity: number;
  pricePosition: number;
  resources: number;
  aggressiveness: number;
  isPlayer: boolean;
  recentMoves: string[];
}

interface MarketSegment {
  id: Segment;
  name: string;
  size: number;
  growth: number;
  priceElasticity: number;
  shares: Record<string, number>;
  loyalty: number;
}

interface MarketEvent {
  id: string;
  title: string;
  description: string;
  type: 'disruption' | 'regulation' | 'trend' | 'competitor' | 'economic';
  impact: string;
  duration: number;
  effects: MarketEffect[];
}

interface MarketEffect {
  type: 'segment-growth' | 'price-sensitivity' | 'competitor-boost' | 'brand-impact';
  target?: string;
  value: number;
}

interface PlayerDecision {
  pricing: 'aggressive-cut' | 'slight-cut' | 'hold' | 'slight-raise' | 'premium';
  marketing: 'heavy-investment' | 'moderate' | 'maintenance' | 'cut-back';
  segmentFocus: Segment;
  competitiveResponse: 'attack-leader' | 'defend-position' | 'flank-niche' | 'avoid-conflict';
  productInnovation: 'major-launch' | 'incremental' | 'none';
}

interface GameState {
  round: number;
  maxRounds: number;
  phase: Phase;
  totalMarketSize: number;
  marketGrowth: number;
  competitors: Competitor[];
  segments: MarketSegment[];
  activeEvents: MarketEvent[];
  currentEvent: MarketEvent | null;
  priceWarIntensity: number;
  priceWarRounds: number;
  playerCash: number;
  playerRevenue: number;
  playerProfit: number;
  decisionHistory: PlayerDecision[];
  marketNarrative: string[];
  gameOver: boolean;
  endingType: 'dominance' | 'survival' | 'acquired' | 'bankrupt' | null;
}

// =============================================================================
// SCENARIO DATA
// =============================================================================

const OPENING_NARRATIVE = {
  title: "Velocity Software",
  subtitle: "The Market Awaits No One",
  content: `You are the CEO of Velocity Software, a mid-sized enterprise software company.

For three years, you've held steady at 18% market share—respectable, but not dominant. NexTech leads with 31%. Two other players, Pinnacle and Crest, hold 22% and 15% respectively. A scrappy startup called Disrupt.io has been gaining ground with aggressive pricing.

The enterprise software market is worth $4.2 billion annually and growing 8% per year. But growth is slowing, and competition is intensifying. Every point of market share you gain comes from someone else's pocket.

Your board has made their expectations clear: grow share to 25% within two years, or they'll consider "strategic alternatives." Translation: they'll sell the company.

Your competitors are watching. Your customers are negotiating. Your salesforce is hungry.

Welcome to market warfare.`,
};

const INITIAL_COMPETITORS: Competitor[] = [
  {
    id: 'nextech',
    name: 'NexTech',
    color: 'blue',
    strategy: 'premium',
    marketShare: 31,
    brandEquity: 85,
    pricePosition: 15,
    resources: 100,
    aggressiveness: 40,
    isPlayer: false,
    recentMoves: [],
  },
  {
    id: 'pinnacle',
    name: 'Pinnacle Systems',
    color: 'purple',
    strategy: 'defensive',
    marketShare: 22,
    brandEquity: 70,
    pricePosition: 5,
    resources: 75,
    aggressiveness: 30,
    isPlayer: false,
    recentMoves: [],
  },
  {
    id: 'velocity',
    name: 'Velocity Software',
    color: 'emerald',
    strategy: 'aggressive',
    marketShare: 18,
    brandEquity: 65,
    pricePosition: 0,
    resources: 60,
    aggressiveness: 50,
    isPlayer: true,
    recentMoves: [],
  },
  {
    id: 'crest',
    name: 'Crest Technologies',
    color: 'amber',
    strategy: 'niche',
    marketShare: 15,
    brandEquity: 55,
    pricePosition: -10,
    resources: 45,
    aggressiveness: 35,
    isPlayer: false,
    recentMoves: [],
  },
  {
    id: 'disrupt',
    name: 'Disrupt.io',
    color: 'rose',
    strategy: 'disruptive',
    marketShare: 8,
    brandEquity: 40,
    pricePosition: -25,
    resources: 30,
    aggressiveness: 85,
    isPlayer: false,
    recentMoves: [],
  },
];

const INITIAL_SEGMENTS: MarketSegment[] = [
  {
    id: 'enterprise',
    name: 'Enterprise',
    size: 1800,
    growth: 5,
    priceElasticity: 0.6,
    shares: { nextech: 42, pinnacle: 28, velocity: 18, crest: 8, disrupt: 4 },
    loyalty: 80,
  },
  {
    id: 'mid-market',
    name: 'Mid-Market',
    size: 1400,
    growth: 10,
    priceElasticity: 1.2,
    shares: { nextech: 28, pinnacle: 22, velocity: 22, crest: 18, disrupt: 10 },
    loyalty: 60,
  },
  {
    id: 'smb',
    name: 'SMB',
    size: 700,
    growth: 15,
    priceElasticity: 1.8,
    shares: { nextech: 15, pinnacle: 12, velocity: 18, crest: 25, disrupt: 30 },
    loyalty: 40,
  },
  {
    id: 'consumer',
    name: 'Prosumer',
    size: 300,
    growth: 20,
    priceElasticity: 2.2,
    shares: { nextech: 10, pinnacle: 8, velocity: 12, crest: 20, disrupt: 50 },
    loyalty: 25,
  },
];

const MARKET_EVENTS: MarketEvent[] = [
  {
    id: 'ai-wave',
    title: 'AI Integration Wave',
    description: 'Enterprise buyers are demanding AI-powered features. Companies without them are being excluded from RFPs.',
    type: 'trend',
    impact: 'Premium for AI capabilities; commoditization of basic features',
    duration: 3,
    effects: [
      { type: 'segment-growth', target: 'enterprise', value: 5 },
      { type: 'brand-impact', target: 'disrupt', value: 15 },
    ],
  },
  {
    id: 'nextech-stumble',
    title: 'NexTech Security Breach',
    description: 'The market leader has disclosed a significant data breach affecting 200+ enterprise customers. Trust is shaken.',
    type: 'competitor',
    impact: 'NexTech vulnerable; opportunity for share capture',
    duration: 2,
    effects: [
      { type: 'brand-impact', target: 'nextech', value: -25 },
      { type: 'competitor-boost', target: 'velocity', value: 10 },
    ],
  },
  {
    id: 'price-war-trigger',
    title: 'Disrupt.io Launches "Free Tier"',
    description: 'The upstart competitor has launched a free version of their core product. SMB and prosumer segments are in turmoil.',
    type: 'disruption',
    impact: 'Price war imminent in lower segments',
    duration: 3,
    effects: [
      { type: 'price-sensitivity', value: 50 },
      { type: 'competitor-boost', target: 'disrupt', value: 20 },
    ],
  },
];

const ROUND_NARRATIVES: Record<number, { briefing: string; competitorMoves: string }> = {
  1: {
    briefing: `**QUARTER 1: THE OPENING MOVES**

The fiscal year begins. Your sales pipeline is healthy but competitive pressure is rising.

Market intelligence reports:
• NexTech is doubling down on enterprise, hiring 50 new sales reps
• Pinnacle appears defensive, focused on retention
• Disrupt.io is burning cash to acquire SMB customers at any cost

Your CFO reminds you: "Market share gains that destroy margin aren't wins. They're slow-motion suicide."

How will you compete?`,
    competitorMoves: `NexTech increased enterprise sales investment. Pinnacle launched customer success initiative. Disrupt.io cut prices by 15% in SMB.`,
  },
  2: {
    briefing: `**QUARTER 2: PRESSURE BUILDS**

Last quarter's moves are showing results—some good, some concerning.

Your largest customer's contract is up for renewal in Q3, and Pinnacle is circling. Sales reports: "Deals are getting harder. Win rates are down 8 points."

The board wants an update on your path to 25% share.`,
    competitorMoves: `NexTech held pricing but increased service levels. Crest launched vertical-specific product. Disrupt.io raised $50M in new funding.`,
  },
  3: {
    briefing: `**QUARTER 3: THE FIRST CRISIS**

A market event has reshaped the landscape. Your assumptions from Q1 may no longer hold.

Your head of sales reports: "A major RFP has landed—$5M deal that could shift share by a full point. But winning requires aggressive pricing."

Every competitor is watching what you do next.`,
    competitorMoves: `All competitors responding to market disruption. Strategies in flux.`,
  },
  4: {
    briefing: `**QUARTER 4: YEAR-END PRESSURE**

Q4. Deals need to close. Numbers need to hit.

Your CFO: "We're tracking to plan, but share gains are modest. The board expected more."

Intelligence suggests NexTech is preparing a major product announcement for next quarter.`,
    competitorMoves: `NexTech focusing on closing enterprise deals. Everyone pushing for Q4 numbers.`,
  },
  5: {
    briefing: `**QUARTER 5: YEAR TWO BEGINS**

Year two of your mandate. The board's patience is wearing thin.

A private equity firm has reached out to your board. "Exploratory," they said. But nothing is exploratory at this stage.

You need a breakthrough quarter.`,
    competitorMoves: `Competitors sense blood in the water. Aggressive moves across the board.`,
  },
  6: {
    briefing: `**QUARTER 6: THE COUNTERSTRIKE**

Your competitors have responded to your year-two push. The market is more competitive than ever.

Disrupt.io is moving upmarket—targeting your mid-market stronghold. NexTech has launched a competitive displacement program targeting Velocity customers.

This is the quarter where strategies either succeed or collapse.`,
    competitorMoves: `Full competitive assault from multiple directions.`,
  },
  7: {
    briefing: `**QUARTER 7: THE RECKONING**

Seven quarters in. The board meets next month for final assessment.

One major customer has churned. Two more are "evaluating options." But you've also won three significant new logos.

The narrative could go either way.`,
    competitorMoves: `Competitors consolidating positions. Some winning; others wounded.`,
  },
  8: {
    briefing: `**QUARTER 8: FINAL QUARTER**

The final quarter. The board meets in 90 days to decide Velocity's future.

Market share, profitability, competitive position—it all comes down to this.

What's your final move?`,
    competitorMoves: `End-game positioning by all competitors.`,
  },
};

// =============================================================================
// GAME LOGIC
// =============================================================================

function calculateMarketShare(state: GameState): Competitor[] {
  return state.competitors.map(c => {
    let totalShare = 0;
    state.segments.forEach(seg => {
      const segmentShare = seg.shares[c.id] || 0;
      const segmentWeight = seg.size / state.totalMarketSize;
      totalShare += segmentShare * segmentWeight;
    });
    return { ...c, marketShare: Math.round(totalShare * 10) / 10 };
  });
}

function simulateCompetitorMove(competitor: Competitor, state: GameState): Competitor {
  const moves: string[] = [];
  let newPricePosition = competitor.pricePosition;
  let newBrandEquity = competitor.brandEquity;

  switch (competitor.strategy) {
    case 'aggressive':
      if (state.priceWarIntensity > 50) {
        newPricePosition = Math.max(-30, competitor.pricePosition - 5);
        moves.push('Cut prices to match competition');
      }
      break;
    case 'defensive':
      newBrandEquity = Math.min(100, competitor.brandEquity + 2);
      moves.push('Invested in customer retention');
      break;
    case 'premium':
      if (state.priceWarIntensity < 30) {
        newPricePosition = Math.min(30, competitor.pricePosition + 3);
        moves.push('Maintained premium positioning');
      }
      break;
    case 'disruptive':
      newPricePosition = Math.max(-30, competitor.pricePosition - 8);
      moves.push('Aggressive price cuts to gain share');
      break;
    case 'niche':
      moves.push('Focused on vertical specialization');
      break;
  }

  return { ...competitor, pricePosition: newPricePosition, brandEquity: newBrandEquity, recentMoves: moves };
}

function applyPlayerDecision(state: GameState, decision: PlayerDecision): GameState {
  const player = state.competitors.find(c => c.isPlayer)!;
  const newSegments = [...state.segments];
  const targetSegment = newSegments.find(s => s.id === decision.segmentFocus)!;

  let shareChange = 0;
  let brandChange = 0;
  let priceChange = 0;
  let cashChange = 0;

  switch (decision.pricing) {
    case 'aggressive-cut': priceChange = -15; shareChange += targetSegment.priceElasticity * 3; cashChange -= 50; break;
    case 'slight-cut': priceChange = -5; shareChange += targetSegment.priceElasticity * 1; cashChange -= 20; break;
    case 'hold': break;
    case 'slight-raise': priceChange = 5; shareChange -= targetSegment.priceElasticity * 0.5; cashChange += 30; break;
    case 'premium': priceChange = 10; shareChange -= targetSegment.priceElasticity * 1; cashChange += 50; brandChange += 5; break;
  }

  switch (decision.marketing) {
    case 'heavy-investment': brandChange += 8; shareChange += 2; cashChange -= 80; break;
    case 'moderate': brandChange += 3; shareChange += 1; cashChange -= 40; break;
    case 'maintenance': brandChange += 1; cashChange -= 20; break;
    case 'cut-back': brandChange -= 3; cashChange += 20; break;
  }

  switch (decision.productInnovation) {
    case 'major-launch': brandChange += 10; shareChange += 3; cashChange -= 100; break;
    case 'incremental': brandChange += 3; shareChange += 1; cashChange -= 30; break;
    case 'none': break;
  }

  switch (decision.competitiveResponse) {
    case 'attack-leader': shareChange += 2; brandChange -= 2; break;
    case 'defend-position': shareChange += 0.5; brandChange += 2; break;
    case 'flank-niche': shareChange += 1.5; break;
    case 'avoid-conflict': brandChange += 3; break;
  }

  const currentShare = targetSegment.shares['velocity'] || 0;
  const newShare = Math.max(0, Math.min(100, currentShare + shareChange));
  const shareDelta = newShare - currentShare;
  const otherCompetitors = Object.keys(targetSegment.shares).filter(k => k !== 'velocity');
  otherCompetitors.forEach(comp => {
    targetSegment.shares[comp] = Math.max(0, targetSegment.shares[comp] - (shareDelta / otherCompetitors.length));
  });
  targetSegment.shares['velocity'] = newShare;

  const updatedPlayer: Competitor = {
    ...player,
    pricePosition: Math.max(-30, Math.min(30, player.pricePosition + priceChange)),
    brandEquity: Math.max(0, Math.min(100, player.brandEquity + brandChange)),
    recentMoves: [`${decision.pricing} pricing`, `${decision.marketing} marketing`, decision.productInnovation !== 'none' ? `${decision.productInnovation} launch` : ''].filter(Boolean),
  };

  const updatedCompetitors = state.competitors.map(c => c.isPlayer ? updatedPlayer : simulateCompetitorMove(c, state));

  let newPriceWarIntensity = state.priceWarIntensity;
  if (decision.pricing === 'aggressive-cut') newPriceWarIntensity = Math.min(100, newPriceWarIntensity + 20);
  else if (decision.pricing === 'premium') newPriceWarIntensity = Math.max(0, newPriceWarIntensity - 10);

  return {
    ...state,
    segments: newSegments,
    competitors: updatedCompetitors,
    playerCash: state.playerCash + cashChange,
    priceWarIntensity: newPriceWarIntensity,
    decisionHistory: [...state.decisionHistory, decision],
  };
}

function calculateEnding(state: GameState): { type: 'dominance' | 'survival' | 'acquired' | 'bankrupt'; message: string } {
  const player = state.competitors.find(c => c.isPlayer)!;

  if (state.playerCash <= 0) {
    return {
      type: 'bankrupt',
      message: `The cash ran out. Your aggressive strategy gained share but the cost was unsustainable.

The board has accepted a distressed acquisition offer. Velocity Software will become a product line within NexTech's portfolio.

The market doesn't reward courage. It rewards results.`,
    };
  }

  if (player.marketShare >= 28) {
    return {
      type: 'dominance',
      message: `You've done it. Velocity Software now commands ${player.marketShare.toFixed(1)}% of the market—beyond the board's target, beyond anyone's expectations.

NexTech is scrambling. Pinnacle is "exploring strategic options." Disrupt.io's growth story has stalled.

You've proven that a mid-market player can take on the giants—and win. The playbook you've written will be studied in business schools.

For now, you've earned the right to call yourself a market leader.`,
    };
  }

  if (player.marketShare >= 22) {
    return {
      type: 'survival',
      message: `You survived. Velocity ends at ${player.marketShare.toFixed(1)}% share—short of 25%, but real growth from 18%.

The board meeting was tense. "You didn't hit the number. But you didn't blow up the company trying."

The PE firm's offer is still on the table. Your fate is in the board's hands now.

You've proven you can compete. Whether you get the chance to prove more remains to be seen.`,
    };
  }

  return {
    type: 'acquired',
    message: `The board has decided. At ${player.marketShare.toFixed(1)}% share, Velocity has failed to achieve the growth mandate.

The acquisition will be announced tomorrow. NexTech is paying a 15% premium—fair, but not what the company was worth three years ago.

This is how market wars end for most combatants. Not with a bang, but with a term sheet.

You fought. You just didn't win.`,
    };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function IntroScreen({ onStart }: { onStart: () => void }) {
  const [step, setStep] = useState(0);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/scenarios/scenario-03.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      )}
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-blue-950/60 to-slate-950/80" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full relative z-10">
        {step === 0 && (
          <div className="text-center space-y-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
              <TrendingUp className="w-20 h-20 text-blue-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">Market Dynamics</h1>
            <p className="text-xl text-blue-400">Competing in Motion</p>
            <p className="text-slate-400 max-w-xl mx-auto">
              A competitive simulation where every market share point is contested, every pricing decision ripples through the industry, and survival is never guaranteed.
            </p>
            <button onClick={() => setStep(1)} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all inline-flex items-center gap-2">
              Begin Simulation <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        {step === 1 && (
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{OPENING_NARRATIVE.title}</h2>
                <p className="text-blue-400">{OPENING_NARRATIVE.subtitle}</p>
              </div>
            </div>
            <div className="prose prose-invert prose-lg max-w-none mb-8">
              {OPENING_NARRATIVE.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-slate-300 leading-relaxed whitespace-pre-line">{para}</p>
              ))}
            </div>
            <button onClick={onStart} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
              <Swords className="w-5 h-5" /> Enter the Market
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function GameOverScreen({ state }: { state: GameState }) {
  const ending = calculateEnding(state);
  const colorScheme = { dominance: 'from-emerald-950', survival: 'from-blue-950', acquired: 'from-amber-950', bankrupt: 'from-red-950' };
  const icons = { dominance: <Crown className="w-20 h-20 text-emerald-500" />, survival: <Shield className="w-20 h-20 text-blue-500" />, acquired: <Flag className="w-20 h-20 text-amber-500" />, bankrupt: <AlertTriangle className="w-20 h-20 text-red-500" /> };
  const titles = { dominance: 'Market Leader', survival: 'Survived', acquired: 'Acquired', bankrupt: 'Bankrupt' };
  const player = state.competitors.find(c => c.isPlayer)!;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colorScheme[ending.type]} via-slate-950 to-slate-950 flex items-center justify-center p-6`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            {icons[ending.type]}
          </motion.div>
          <h1 className="text-5xl font-bold text-white mt-6">{titles[ending.type]}</h1>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-800 mb-8">
          <div className="prose prose-invert prose-lg max-w-none">
            {ending.message.split('\n\n').map((para, i) => <p key={i} className="text-slate-300 leading-relaxed">{para}</p>)}
          </div>
        </div>
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Final Market Position</h3>
          <div className="space-y-3">
            {state.competitors.sort((a, b) => b.marketShare - a.marketShare).map((comp, i) => (
              <div key={comp.id} className="flex items-center gap-3">
                <span className="w-6 text-slate-500 text-sm">#{i + 1}</span>
                <span className={`flex-1 font-medium ${comp.isPlayer ? 'text-emerald-400' : 'text-slate-300'}`}>{comp.name} {comp.isPlayer && '(You)'}</span>
                <span className="font-bold text-white">{comp.marketShare.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/80 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-white">{player.marketShare.toFixed(1)}%</div><div className="text-sm text-slate-400">Final Share</div></div>
          <div className="bg-slate-900/80 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-white">{player.brandEquity}</div><div className="text-sm text-slate-400">Brand Equity</div></div>
          <div className="bg-slate-900/80 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-white">${state.playerCash}M</div><div className="text-sm text-slate-400">Cash Remaining</div></div>
        </div>
        <Link href="/" className="block w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-center transition-colors">Return to Simulations</Link>
      </motion.div>
    </div>
  );
}

function MarketShareChart({ competitors }: { competitors: Competitor[] }) {
  const sorted = [...competitors].sort((a, b) => b.marketShare - a.marketShare);
  const colors: Record<string, string> = { nextech: 'bg-blue-500', pinnacle: 'bg-purple-500', velocity: 'bg-emerald-500', crest: 'bg-amber-500', disrupt: 'bg-rose-500' };
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Market Share</h3>
      <div className="space-y-3">
        {sorted.map((comp) => (
          <div key={comp.id}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={comp.isPlayer ? 'text-emerald-400 font-medium' : 'text-slate-400'}>{comp.name} {comp.isPlayer && '(You)'}</span>
              <span className="text-white font-bold">{comp.marketShare.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${comp.marketShare}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${colors[comp.id]}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorCard({ competitor }: { competitor: Competitor }) {
  const strategyLabels: Record<CompetitorStrategy, string> = { aggressive: 'Aggressive Pricing', defensive: 'Customer Retention', premium: 'Premium Positioning', disruptive: 'Market Disruption', niche: 'Vertical Focus' };
  const colors: Record<string, string> = { nextech: 'border-blue-500/30 bg-blue-500/5', pinnacle: 'border-purple-500/30 bg-purple-500/5', velocity: 'border-emerald-500/30 bg-emerald-500/5', crest: 'border-amber-500/30 bg-amber-500/5', disrupt: 'border-rose-500/30 bg-rose-500/5' };
  return (
    <div className={`p-4 rounded-xl border ${colors[competitor.id]}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-bold ${competitor.isPlayer ? 'text-emerald-400' : 'text-white'}`}>{competitor.name} {competitor.isPlayer && '(You)'}</h4>
        <span className="text-xs text-slate-500">{strategyLabels[competitor.strategy]}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div><div className="text-lg font-bold text-white">{competitor.marketShare.toFixed(1)}%</div><div className="text-xs text-slate-500">Share</div></div>
        <div><div className="text-lg font-bold text-white">{competitor.brandEquity}</div><div className="text-xs text-slate-500">Brand</div></div>
        <div><div className={`text-lg font-bold ${competitor.pricePosition > 0 ? 'text-emerald-400' : competitor.pricePosition < 0 ? 'text-rose-400' : 'text-white'}`}>{competitor.pricePosition > 0 ? '+' : ''}{competitor.pricePosition}%</div><div className="text-xs text-slate-500">Price</div></div>
      </div>
      {competitor.recentMoves.length > 0 && <div className="mt-3 pt-3 border-t border-slate-700/50"><p className="text-xs text-slate-500 mb-1">Recent:</p><p className="text-xs text-slate-400 italic">{competitor.recentMoves[0]}</p></div>}
    </div>
  );
}

function PriceWarIndicator({ intensity }: { intensity: number }) {
  const getColor = () => intensity >= 70 ? 'from-red-600 to-red-400' : intensity >= 40 ? 'from-amber-600 to-amber-400' : 'from-emerald-600 to-emerald-400';
  const getStatus = () => intensity >= 70 ? 'Active Price War' : intensity >= 40 ? 'Elevated Competition' : 'Stable Pricing';
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Market Temperature</h3>
        <Flame className={`w-5 h-5 ${intensity >= 70 ? 'text-red-400' : intensity >= 40 ? 'text-amber-400' : 'text-slate-500'}`} />
      </div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
        <motion.div initial={{ width: 0 }} animate={{ width: `${intensity}%` }} className={`h-full rounded-full bg-gradient-to-r ${getColor()}`} />
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${intensity >= 70 ? 'text-red-400' : intensity >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{getStatus()}</span>
        <span className="text-sm text-slate-400">{intensity}%</span>
      </div>
    </div>
  );
}

function DecisionPanel({ onSubmit, playerCash }: { onSubmit: (decision: PlayerDecision) => void; playerCash: number }) {
  const [decision, setDecision] = useState<Partial<PlayerDecision>>({});
  const isComplete = decision.pricing && decision.marketing && decision.segmentFocus && decision.competitiveResponse && decision.productInnovation;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Quarterly Decisions</h2>
        <div className="text-sm text-slate-400">Cash: <span className="text-emerald-400 font-bold">${playerCash}M</span></div>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Pricing Strategy</h3>
          <div className="grid grid-cols-5 gap-2">
            {[{ id: 'aggressive-cut', label: 'Aggressive Cut', cost: '-$50M' }, { id: 'slight-cut', label: 'Slight Cut', cost: '-$20M' }, { id: 'hold', label: 'Hold', cost: '$0' }, { id: 'slight-raise', label: 'Slight Raise', cost: '+$30M' }, { id: 'premium', label: 'Premium', cost: '+$50M' }].map(opt => (
              <button key={opt.id} onClick={() => setDecision({ ...decision, pricing: opt.id as PlayerDecision['pricing'] })} className={`p-3 rounded-lg text-center transition-all border ${decision.pricing === opt.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                <div className="text-xs font-medium">{opt.label}</div><div className="text-[10px] mt-1 opacity-70">{opt.cost}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Marketing Investment</h3>
          <div className="grid grid-cols-4 gap-2">
            {[{ id: 'heavy-investment', label: 'Heavy', cost: '-$80M' }, { id: 'moderate', label: 'Moderate', cost: '-$40M' }, { id: 'maintenance', label: 'Maintenance', cost: '-$20M' }, { id: 'cut-back', label: 'Cut Back', cost: '+$20M' }].map(opt => (
              <button key={opt.id} onClick={() => setDecision({ ...decision, marketing: opt.id as PlayerDecision['marketing'] })} className={`p-3 rounded-lg text-center transition-all border ${decision.marketing === opt.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                <div className="text-xs font-medium">{opt.label}</div><div className="text-[10px] mt-1 opacity-70">{opt.cost}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Segment Focus</h3>
          <div className="grid grid-cols-4 gap-2">
            {[{ id: 'enterprise', label: 'Enterprise', desc: 'Stable, high value' }, { id: 'mid-market', label: 'Mid-Market', desc: 'Growing, competitive' }, { id: 'smb', label: 'SMB', desc: 'Fast growth, price sensitive' }, { id: 'consumer', label: 'Prosumer', desc: 'Volatile, high growth' }].map(opt => (
              <button key={opt.id} onClick={() => setDecision({ ...decision, segmentFocus: opt.id as Segment })} className={`p-3 rounded-lg text-center transition-all border ${decision.segmentFocus === opt.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                <div className="text-xs font-medium">{opt.label}</div><div className="text-[10px] mt-1 opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Competitive Posture</h3>
          <div className="grid grid-cols-4 gap-2">
            {[{ id: 'attack-leader', label: 'Attack Leader', desc: 'Go after NexTech' }, { id: 'defend-position', label: 'Defend', desc: 'Protect current share' }, { id: 'flank-niche', label: 'Flank', desc: 'Target weak spots' }, { id: 'avoid-conflict', label: 'Avoid', desc: 'Focus on differentiation' }].map(opt => (
              <button key={opt.id} onClick={() => setDecision({ ...decision, competitiveResponse: opt.id as PlayerDecision['competitiveResponse'] })} className={`p-3 rounded-lg text-center transition-all border ${decision.competitiveResponse === opt.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                <div className="text-xs font-medium">{opt.label}</div><div className="text-[10px] mt-1 opacity-70">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Product Innovation</h3>
          <div className="grid grid-cols-3 gap-2">
            {[{ id: 'major-launch', label: 'Major Launch', cost: '-$100M' }, { id: 'incremental', label: 'Incremental', cost: '-$30M' }, { id: 'none', label: 'None', cost: '$0' }].map(opt => (
              <button key={opt.id} onClick={() => setDecision({ ...decision, productInnovation: opt.id as PlayerDecision['productInnovation'] })} className={`p-3 rounded-lg text-center transition-all border ${decision.productInnovation === opt.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                <div className="text-xs font-medium">{opt.label}</div><div className="text-[10px] mt-1 opacity-70">{opt.cost}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => isComplete && onSubmit(decision as PlayerDecision)} disabled={!isComplete} className={`w-full mt-6 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${isComplete ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
        <Target className="w-5 h-5" /> Execute Strategy
      </button>
    </div>
  );
}

function MarketEventDisplay({ event, onContinue }: { event: MarketEvent; onContinue: () => void }) {
  const typeColors = { disruption: 'border-rose-500/30 bg-rose-500/5', regulation: 'border-amber-500/30 bg-amber-500/5', trend: 'border-blue-500/30 bg-blue-500/5', competitor: 'border-purple-500/30 bg-purple-500/5', economic: 'border-slate-500/30 bg-slate-500/5' };
  const typeIcons = { disruption: <Zap className="w-6 h-6 text-rose-400" />, regulation: <Shield className="w-6 h-6 text-amber-400" />, trend: <TrendingUp className="w-6 h-6 text-blue-400" />, competitor: <Target className="w-6 h-6 text-purple-400" />, economic: <Activity className="w-6 h-6 text-slate-400" /> };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-slate-900 rounded-2xl p-6 border-2 ${typeColors[event.type]}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">{typeIcons[event.type]}</div>
        <div><span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Market Event</span><h3 className="text-xl font-bold text-white">{event.title}</h3></div>
      </div>
      <p className="text-slate-300 mb-4">{event.description}</p>
      <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
        <p className="text-sm text-slate-400"><span className="text-white font-medium">Impact:</span> {event.impact}</p>
        <p className="text-xs text-slate-500 mt-1">Duration: {event.duration} quarters</p>
      </div>
      <button onClick={onContinue} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">Continue</button>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MarketDynamicsPage() {
  const [gameState, setGameState] = useState<GameState>({
    round: 0, maxRounds: 8, phase: 'intro', totalMarketSize: 4200, marketGrowth: 8,
    competitors: INITIAL_COMPETITORS, segments: INITIAL_SEGMENTS,
    activeEvents: [], currentEvent: null, priceWarIntensity: 20, priceWarRounds: 0,
    playerCash: 250, playerRevenue: 0, playerProfit: 0, decisionHistory: [],
    marketNarrative: [], gameOver: false, endingType: null,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const startGame = useCallback(() => setGameState(prev => ({ ...prev, round: 1, phase: 'market-briefing' })), []);

  const advancePhase = useCallback(() => {
    setGameState(prev => {
      switch (prev.phase) {
        case 'market-briefing':
          if (prev.round === 3 || prev.round === 5) return { ...prev, phase: 'competitor-intel', currentEvent: MARKET_EVENTS[prev.round === 3 ? 0 : 2] };
          return { ...prev, phase: 'competitor-intel' };
        case 'competitor-intel':
          if (prev.currentEvent) return { ...prev, phase: 'decisions', currentEvent: null };
          return { ...prev, phase: 'decisions' };
        case 'market-resolution': return { ...prev, phase: 'round-end' };
        case 'round-end':
          const player = prev.competitors.find(c => c.isPlayer)!;
          if (prev.playerCash <= 0 || prev.round >= prev.maxRounds || player.marketShare >= 28) return { ...prev, phase: 'game-over', gameOver: true };
          return { ...prev, round: prev.round + 1, phase: 'market-briefing' };
        default: return prev;
      }
    });
  }, []);

  const handleDecision = useCallback((decision: PlayerDecision) => {
    setGameState(prev => {
      const newState = applyPlayerDecision(prev, decision);
      const updatedCompetitors = calculateMarketShare(newState);
      return { ...newState, competitors: updatedCompetitors, phase: 'market-resolution' as Phase };
    });
  }, []);

  if (!mounted) return null;
  if (gameState.phase === 'intro') return <IntroScreen onStart={startGame} />;
  if (gameState.phase === 'game-over') return <GameOverScreen state={gameState} />;

  const roundNarrative = ROUND_NARRATIVES[gameState.round] || ROUND_NARRATIVES[1];
  const player = gameState.competitors.find(c => c.isPlayer)!;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-white" /></div>
                <div><h1 className="text-lg font-bold text-white">Market Dynamics</h1><p className="text-xs text-slate-400">Velocity Software</p></div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right"><div className="text-xs text-slate-500">Your Share</div><div className="text-lg font-bold text-emerald-400">{player.marketShare.toFixed(1)}%</div></div>
              <div className="text-right"><div className="text-xs text-slate-500">Target</div><div className="text-lg font-bold text-white">25%</div></div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg"><Clock className="w-4 h-4 text-slate-500" /><span className="text-sm text-slate-400">Q{gameState.round}</span><span className="text-sm text-slate-500">/ {gameState.maxRounds}</span></div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {gameState.phase === 'market-briefing' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center"><FileText className="w-6 h-6 text-blue-400" /></div>
                  <div><h2 className="text-xl font-bold text-white">Market Briefing</h2><p className="text-sm text-slate-400">Quarter {gameState.round}</p></div>
                </div>
                <div className="prose prose-invert prose-sm max-w-none mb-6">
                  {roundNarrative.briefing.split('\n\n').map((para, i) => (
                    <p key={i} className="text-slate-300 leading-relaxed whitespace-pre-line">{para.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}</p>
                  ))}
                </div>
                <button onClick={advancePhase} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors">Review Competitive Intelligence</button>
              </motion.div>
            )}
            {gameState.phase === 'competitor-intel' && gameState.currentEvent && <MarketEventDisplay event={gameState.currentEvent} onContinue={advancePhase} />}
            {gameState.phase === 'competitor-intel' && !gameState.currentEvent && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-4">Competitive Intelligence</h2>
                <p className="text-slate-400 mb-6">{roundNarrative.competitorMoves}</p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">{gameState.competitors.filter(c => !c.isPlayer).map(comp => <CompetitorCard key={comp.id} competitor={comp} />)}</div>
                <button onClick={advancePhase} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors">Make Your Decisions</button>
              </motion.div>
            )}
            {gameState.phase === 'decisions' && <DecisionPanel onSubmit={handleDecision} playerCash={gameState.playerCash} />}
            {gameState.phase === 'market-resolution' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <h2 className="text-xl font-bold text-white mb-4">Market Resolution</h2>
                <div className="space-y-4 mb-6">
                  {gameState.competitors.map((comp, i) => (
                    <motion.div key={comp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`p-4 rounded-lg ${comp.isPlayer ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700'} border`}>
                      <div className="flex items-center justify-between">
                        <span className={comp.isPlayer ? 'text-emerald-400 font-medium' : 'text-slate-300'}>{comp.name}</span>
                        <div className="flex items-center gap-4"><span className="text-white font-bold">{comp.marketShare.toFixed(1)}%</span>{comp.recentMoves[0] && <span className="text-xs text-slate-500">{comp.recentMoves[0]}</span>}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button onClick={advancePhase} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors">End Quarter</button>
              </motion.div>
            )}
            {gameState.phase === 'round-end' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Quarter {gameState.round} Complete</h2>
                <p className="text-slate-400 mb-4">Your market share: <span className="text-emerald-400 font-bold">{player.marketShare.toFixed(1)}%</span></p>
                <p className="text-slate-500 mb-6">{player.marketShare >= 25 ? "You're hitting your targets!" : player.marketShare >= 20 ? "Progress, but the board wants more." : "The gap to 25% remains significant."}</p>
                <button onClick={advancePhase} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">{gameState.round < gameState.maxRounds ? 'Continue to Next Quarter' : 'See Final Results'}</button>
              </motion.div>
            )}
          </div>
          <div className="space-y-4">
            <MarketShareChart competitors={gameState.competitors} />
            <PriceWarIndicator intensity={gameState.priceWarIntensity} />
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Your Position</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-slate-400">Cash Reserves</span><span className={`font-bold ${gameState.playerCash > 100 ? 'text-emerald-400' : gameState.playerCash > 50 ? 'text-amber-400' : 'text-red-400'}`}>${gameState.playerCash}M</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Brand Equity</span><span className="text-white font-bold">{player.brandEquity}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Price Position</span><span className={`font-bold ${player.pricePosition > 0 ? 'text-emerald-400' : player.pricePosition < 0 ? 'text-rose-400' : 'text-white'}`}>{player.pricePosition > 0 ? '+' : ''}{player.pricePosition}%</span></div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Target Progress</h3>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2"><span className="text-xs text-slate-500">18% (Start)</span><span className="text-xs text-emerald-400 font-bold">25% (Target)</span></div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden"><div className="h-full flex"><div className="bg-emerald-600 rounded-l-full" style={{ width: `${Math.max(0, ((player.marketShare - 18) / 7) * 100)}%` }} /></div></div>
                <div className="text-center mt-2"><span className="text-lg font-bold text-white">{player.marketShare.toFixed(1)}%</span><span className="text-slate-500 text-sm ml-2">({(player.marketShare - 18) >= 0 ? '+' : ''}{(player.marketShare - 18).toFixed(1)}pp)</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
