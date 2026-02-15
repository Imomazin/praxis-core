'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
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
  ThumbsUp,
  ThumbsDown,
  Gavel,
  Newspaper,
  Eye,
  Lock,
  Flame,
  Phone,
  Mail,
  Video,
  X,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

type Role = 'ceo' | 'cfo' | 'coo' | 'chief-legal' | 'chief-people';
type Phase = 'intro' | 'briefing' | 'crisis' | 'decisions' | 'consequences' | 'board-reaction' | 'round-end' | 'game-over';
type BoardMood = 'supportive' | 'neutral' | 'concerned' | 'hostile';
type Archetype = 'activist' | 'conservative' | 'growth-focused' | 'governance-hawk' | 'founder-ally';

interface BoardMember {
  id: string;
  name: string;
  title: string;
  avatar: string;
  archetype: Archetype;
  patience: number;
  mood: BoardMood;
  concerns: string[];
  votingPower: number;
  memory: string[]; // Tracks decisions they remember
}

interface StakeholderState {
  investors: number;
  employees: number;
  customers: number;
  regulators: number;
  media: number;
}

interface CompanyMetrics {
  marketCap: number; // in billions
  revenue: number; // quarterly, in millions
  operatingMargin: number; // percentage
  cashReserves: number; // in millions
  stockPrice: number;
  stockChange: number;
}

interface GameState {
  round: number;
  phase: Phase;
  boardConfidence: number;
  internalAlignment: number;
  reputation: number;
  stakeholders: StakeholderState;
  metrics: CompanyMetrics;
  board: BoardMember[];
  currentCrisis: Crisis | null;
  currentEvent: NarrativeEvent | null;
  decisionHistory: DecisionRecord[];
  narrativeLog: NarrativeEntry[];
  gameOver: boolean;
  gameOverReason: string | null;
  endingType: 'termination' | 'resignation' | 'survival' | 'triumph' | null;
}

interface Crisis {
  id: string;
  name: string;
  description: string;
  severity: 'moderate' | 'severe' | 'existential';
  urgency: string;
  stakeholderPressure: Partial<StakeholderState>;
  boardPressure: number;
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
  boardReactions: Record<Archetype, { mood: number; message: string }>;
  requiresAlignment?: number;
  lockedReason?: string;
}

interface Consequence {
  type: 'boardConfidence' | 'stakeholder' | 'metric' | 'reputation' | 'alignment' | 'narrative';
  target?: string;
  value: number;
  delay?: number; // rounds until this takes effect
  message?: string;
}

interface NarrativeEvent {
  id: string;
  title: string;
  content: string;
  type: 'news' | 'internal' | 'board' | 'market' | 'personal';
  tone: 'positive' | 'negative' | 'neutral' | 'urgent';
  sender?: string;
  timestamp?: string;
}

interface NarrativeEntry {
  round: number;
  type: 'decision' | 'event' | 'consequence' | 'board' | 'crisis';
  content: string;
  tone: 'positive' | 'negative' | 'neutral';
}

interface DecisionRecord {
  round: number;
  crisisId: string;
  optionId: string;
  label: string;
}

// =============================================================================
// SCENARIO DATA - THE HEART OF THE SIMULATION
// =============================================================================

const OPENING_NARRATIVE = {
  title: "Meridian Technologies",
  subtitle: "Day One of the Rest of Your Career",
  content: `You are Alexandra Chen, CEO of Meridian Technologies.

Three years ago, you led this company through a successful IPO. The stock doubled in year one. Analysts called you "the next great enterprise leader." Magazine covers. Conference keynotes. The works.

That was then.

Today, Meridian's stock is down 34% from its peak. Your largest product line is losing share to a startup that didn't exist two years ago. An activist investor—Castlebridge Capital—has quietly accumulated 8.2% of your shares. They haven't made demands yet. They will.

Your CFO, Marcus Webb, believes aggressive cost cuts are the only path forward. Your COO, Diana Reyes, says the problem is innovation, not costs. They've barely spoken in three weeks.

The board meets in six hours. Chair Victoria Sterling has requested a "candid conversation" beforehand.

Your phone buzzes. It's your Chief Legal Officer. The SEC has questions about last quarter's revenue recognition.

Welcome to leadership.`,
};

const ROUND_SCENARIOS: Record<number, { briefing: string; crisis: Crisis; events: NarrativeEvent[] }> = {
  1: {
    briefing: `**QUARTER 1 STRATEGIC BRIEFING**

Market Position: Meridian holds 23% market share, down from 28% eighteen months ago. NexGen Systems, your primary competitor, is gaining ground with aggressive pricing.

Financial Snapshot:
- Revenue: $385M (flat YoY)
- Operating Margin: 18.5% (down from 22%)
- Cash Reserves: $890M
- Stock: $47.23 (-2.3% this week)

The activist situation is escalating. Castlebridge hasn't gone public, but our IR team has intercepted communications suggesting they're building a coalition with two other funds.

Internal pulse surveys show employee confidence at 67%, the lowest since the IPO. The rumor mill is active.

You have critical decisions to make.`,
    crisis: {
      id: 'crisis-1-sec',
      name: 'SEC Revenue Recognition Inquiry',
      description: `The SEC's Division of Enforcement has sent a formal inquiry regarding Q3 revenue recognition practices. Specifically, they're questioning $47M in software license revenue recognized in the final week of the quarter.

Your Chief Legal Officer, Sandra Park, has reviewed the contracts. "Technically defensible," she says, "but the optics are terrible. Three of those deals had unusual terms—extended payment windows, unlimited support promises. The kind of things that make auditors nervous."`,
      severity: 'severe',
      urgency: 'Response required within 72 hours',
      stakeholderPressure: { regulators: -20, investors: -10 },
      boardPressure: -8,
      context: 'This inquiry comes at the worst possible time. If Castlebridge learns about it before resolution, they have ammunition.',
      hiddenInfo: 'One of the deals in question was pushed through by your VP of Sales, who has since left for a competitor.',
      options: [
        {
          id: 'sec-aggressive',
          label: 'Aggressive Defense',
          description: 'Challenge the inquiry aggressively. Hire white-shoe law firm. Signal we will fight.',
          tradeoff: 'Shows strength but risks escalation and extends timeline',
          consequences: [
            { type: 'metric', target: 'cashReserves', value: -15, message: 'Legal fees: $15M' },
            { type: 'stakeholder', target: 'regulators', value: -15, message: 'SEC views resistance negatively' },
            { type: 'boardConfidence', value: 5, message: 'Board appreciates decisive stance' },
            { type: 'narrative', value: 0, message: 'You chose to fight. The SEC does not forget.' },
          ],
          boardReactions: {
            'activist': { mood: 1, message: 'Finally, some backbone.' },
            'conservative': { mood: -1, message: 'This could backfire spectacularly.' },
            'growth-focused': { mood: 0, message: 'Just make it go away.' },
            'governance-hawk': { mood: -2, message: 'We should cooperate with regulators, not antagonize them.' },
            'founder-ally': { mood: 1, message: 'The SEC is overreaching. Push back.' },
          },
        },
        {
          id: 'sec-cooperative',
          label: 'Full Cooperation',
          description: 'Cooperate fully. Provide all documentation. Accept findings if warranted.',
          tradeoff: 'Faster resolution but may require restatement',
          consequences: [
            { type: 'stakeholder', target: 'regulators', value: 10, message: 'SEC appreciates cooperation' },
            { type: 'metric', target: 'cashReserves', value: -8, message: 'Legal fees: $8M' },
            { type: 'reputation', value: -5, message: 'Market interprets cooperation as admission' },
            { type: 'narrative', value: 0, delay: 2, message: 'Your cooperation will be remembered—for better or worse.' },
          ],
          boardReactions: {
            'activist': { mood: -1, message: 'Weak. You\'re inviting more scrutiny.' },
            'conservative': { mood: 1, message: 'Prudent. Let\'s get this behind us.' },
            'growth-focused': { mood: -1, message: 'This is a distraction from real issues.' },
            'governance-hawk': { mood: 2, message: 'This is exactly right. Transparency builds trust.' },
            'founder-ally': { mood: 0, message: 'Do what you have to do.' },
          },
        },
        {
          id: 'sec-internal-first',
          label: 'Internal Investigation First',
          description: 'Launch internal investigation before responding. Know exactly what happened.',
          tradeoff: 'Buys information but delays response',
          consequences: [
            { type: 'alignment', value: -5, message: 'Finance team feels blamed' },
            { type: 'metric', target: 'cashReserves', value: -12, message: 'Investigation costs: $12M' },
            { type: 'narrative', value: 0, message: 'You will learn the truth. Not everyone will like it.' },
          ],
          boardReactions: {
            'activist': { mood: 0, message: 'Fine, but move fast.' },
            'conservative': { mood: 1, message: 'Smart. Know the facts before committing.' },
            'growth-focused': { mood: -1, message: 'We\'re navel-gazing while competitors advance.' },
            'governance-hawk': { mood: 1, message: 'Thorough. I appreciate the diligence.' },
            'founder-ally': { mood: 0, message: 'Find out who\'s responsible.' },
          },
        },
      ],
    },
    events: [
      {
        id: 'event-1-1',
        title: 'Email from Board Chair',
        content: `Alexandra,

Before the board meeting, I wanted to connect privately. Marcus Sterling from Castlebridge called me yesterday. He was... probing. Asked about "leadership transitions" and "strategic alternatives."

I deflected, but you should know: if they go public with a campaign, we need a unified board. Right now, I'm not certain we have one.

Sarah Williams has been asking pointed questions about Q3 numbers. James Morrison wants to discuss "governance enhancements."

We need to talk.

—Victoria`,
        type: 'board',
        tone: 'urgent',
        sender: 'Victoria Sterling, Board Chair',
        timestamp: '7:42 AM',
      },
      {
        id: 'event-1-2',
        title: 'WSJ TechWatch Alert',
        content: `BREAKING: Sources say activist investor Castlebridge Capital has taken a significant position in Meridian Technologies (MRDN). The fund, known for pushing operational changes at underperforming tech companies, declined to comment. Meridian shares down 3% in pre-market trading.`,
        type: 'news',
        tone: 'negative',
        sender: 'Wall Street Journal',
        timestamp: '8:15 AM',
      },
    ],
  },
  2: {
    briefing: `**QUARTER 2 STRATEGIC BRIEFING**

The Castlebridge situation has escalated. They've filed a 13D, officially declaring their 8.2% stake and "intention to engage with management regarding strategic alternatives and operational improvements."

Translation: They're coming for you.

Their public letter arrives tomorrow. Your IR team has obtained a draft:
- Calls for "refreshed leadership perspective"
- Demands three board seats
- Proposes spinning off the legacy hardware division
- Questions your capital allocation decisions

Financial Update:
- Revenue: $372M (down 3.4% QoQ)
- Operating Margin: 17.2%
- Stock: $43.18 (down 8.6% since last quarter)
- Cash Reserves: $847M

Employee morale has dropped further. Two senior VPs have quietly updated their LinkedIn profiles. Your head of AI research was spotted having coffee with NexGen's CEO.`,
    crisis: {
      id: 'crisis-2-activist',
      name: 'Castlebridge Goes Public',
      description: `The letter dropped this morning. It's worse than expected.

Marcus Sterling isn't just demanding board seats. He's demanding your head. Buried in page 7: "We believe shareholder value would be maximized under fresh executive leadership with a proven track record of operational discipline."

The stock is down 6% and falling. Your phone won't stop buzzing. CNBC wants a comment. Your CFO is asking if he should "prepare for transition." Your head of HR wants to know what to tell employees.

The board is watching how you respond.`,
      severity: 'existential',
      urgency: 'Market expects response within 24 hours',
      stakeholderPressure: { investors: -25, employees: -15, media: -20 },
      boardPressure: -15,
      context: 'This is the moment your leadership is defined. Fight, negotiate, or fold.',
      options: [
        {
          id: 'activist-fight',
          label: 'Public Fight',
          description: 'Issue aggressive response. Challenge their track record. Rally shareholders.',
          tradeoff: 'Energizes supporters but makes compromise impossible',
          consequences: [
            { type: 'boardConfidence', value: -5, message: 'Some board members prefer diplomacy' },
            { type: 'stakeholder', target: 'media', value: -10, message: 'Media loves conflict—but you\'re the story' },
            { type: 'stakeholder', target: 'investors', value: 5, message: 'Long-term holders appreciate strength' },
            { type: 'alignment', value: 10, message: 'Employees rally behind a fighter' },
            { type: 'narrative', value: 0, message: 'You chose war. There is no going back.' },
          ],
          boardReactions: {
            'activist': { mood: -2, message: 'You\'re making this personal. That\'s a mistake.' },
            'conservative': { mood: -2, message: 'This is reckless. We should be negotiating.' },
            'growth-focused': { mood: 1, message: 'Show them we won\'t be pushed around.' },
            'governance-hawk': { mood: -1, message: 'Shareholders deserve dialogue, not warfare.' },
            'founder-ally': { mood: 2, message: 'This is YOUR company. Don\'t let them take it.' },
          },
        },
        {
          id: 'activist-negotiate',
          label: 'Private Negotiation',
          description: 'Reach out directly to Sterling. Find common ground. Offer one board seat.',
          tradeoff: 'May preserve your position but signals weakness',
          consequences: [
            { type: 'boardConfidence', value: 5, message: 'Board appreciates pragmatism' },
            { type: 'stakeholder', target: 'investors', value: -5, message: 'Some investors wanted you to fight' },
            { type: 'reputation', value: -8, message: 'Market sees negotiation as capitulation' },
            { type: 'narrative', value: 0, message: 'You extended an olive branch. Sterling is deciding whether to accept.' },
          ],
          boardReactions: {
            'activist': { mood: 1, message: 'Progress. But I want to see the terms.' },
            'conservative': { mood: 2, message: 'This is the right approach. Preserve optionality.' },
            'growth-focused': { mood: 0, message: 'Just don\'t give away too much.' },
            'governance-hawk': { mood: 1, message: 'Constructive engagement is appropriate.' },
            'founder-ally': { mood: -2, message: 'You\'re negotiating with terrorists.' },
          },
        },
        {
          id: 'activist-transform',
          label: 'Announce Transformation Plan',
          description: 'Pre-empt with your own bold plan. Major restructuring. Beat them to the narrative.',
          tradeoff: 'Seizes initiative but commits you to painful changes',
          consequences: [
            { type: 'metric', target: 'operatingMargin', value: -4, delay: 1, message: 'Restructuring costs hit margins' },
            { type: 'stakeholder', target: 'employees', value: -20, message: 'Employees fear layoffs' },
            { type: 'stakeholder', target: 'investors', value: 15, message: 'Wall Street loves transformation stories' },
            { type: 'boardConfidence', value: 10, message: 'Board sees proactive leadership' },
            { type: 'narrative', value: 0, message: 'You\'ve promised transformation. Now you have to deliver.' },
          ],
          boardReactions: {
            'activist': { mood: 1, message: 'Interesting. Let\'s see the details.' },
            'conservative': { mood: -1, message: 'This feels rushed. Have we thought this through?' },
            'growth-focused': { mood: 2, message: 'Finally. This is what I\'ve been waiting for.' },
            'governance-hawk': { mood: 0, message: 'Bold. But execution risk is significant.' },
            'founder-ally': { mood: 1, message: 'Take the fight to them. Good.' },
          },
        },
      ],
    },
    events: [
      {
        id: 'event-2-1',
        title: 'Resignation Letter',
        content: `Alex,

This is the hardest email I've ever written. After 11 years at Meridian, I've decided to accept an opportunity elsewhere.

I still believe in what we're building. But the last six months have been... difficult. The constant conflict between Marcus and Diana, the board tensions, the uncertainty—it's affecting my team and my own effectiveness.

I hope you understand. I'll stay through transition.

—Jennifer Walsh, SVP Engineering`,
        type: 'internal',
        tone: 'negative',
        sender: 'Jennifer Walsh',
        timestamp: '11:23 PM (last night)',
      },
    ],
  },
  3: {
    briefing: `**QUARTER 3 STRATEGIC BRIEFING**

The transformation plan you announced (or the battle you chose) is playing out. But new challenges emerge.

NexGen has announced they're acquiring CloudMatrix, a mid-sized competitor. The combined entity will control 31% of the market—larger than Meridian for the first time.

Your head of M&A is asking if we should counter-bid. The price would be $2.1B—possible with debt, but it would change Meridian fundamentally.

Meanwhile, Castlebridge has gone quiet. Too quiet. They're either planning something or waiting for you to fail.

Financial Update:
- Revenue: $358M (down 3.8% QoQ)
- Operating Margin: 15.8%
- Stock: $41.52
- Cash Reserves: $812M`,
    crisis: {
      id: 'crisis-3-ma',
      name: 'The CloudMatrix Decision',
      description: `NexGen's acquisition of CloudMatrix closes in 30 days unless someone outbids them.

CloudMatrix has technology you need—their AI inference engine is two years ahead of your internal development. Their customer base overlaps 40% with yours, meaning synergies but also meaning you'd be buying customers you're already losing to NexGen.

Your CFO has modeled it: $2.1B acquisition, $400M synergies over 3 years, but $180M in integration costs and significant execution risk.

The board is divided. Some see this as your last chance to remain competitive. Others see it as a desperate gamble.

You have 48 hours before NexGen's deal becomes irrevocable.`,
      severity: 'severe',
      urgency: '48 hours to decision',
      stakeholderPressure: { investors: -10 },
      boardPressure: -5,
      context: 'This decision will define Meridian for a decade. There are no small moves from here.',
      options: [
        {
          id: 'ma-acquire',
          label: 'Launch Counter-Bid',
          description: 'Bid $2.3B for CloudMatrix. Go all-in on strategic acquisition.',
          tradeoff: 'Transforms Meridian but risks financial stability',
          consequences: [
            { type: 'metric', target: 'cashReserves', value: -400, message: 'Cash deployed for acquisition' },
            { type: 'metric', target: 'marketCap', value: 0.8, delay: 2, message: 'Market rewards bold strategy' },
            { type: 'stakeholder', target: 'investors', value: -15, message: 'Investors nervous about leverage' },
            { type: 'stakeholder', target: 'employees', value: -10, message: 'Integration anxiety' },
            { type: 'narrative', value: 0, message: 'You bet the company. The integration begins.' },
          ],
          boardReactions: {
            'activist': { mood: -1, message: 'The price is too high. You\'re destroying value.' },
            'conservative': { mood: -2, message: 'This is exactly the kind of overreach that worries me.' },
            'growth-focused': { mood: 2, message: 'Finally! This is how you win markets.' },
            'governance-hawk': { mood: -1, message: 'Have we done proper due diligence?' },
            'founder-ally': { mood: 1, message: 'Go big or go home. I support this.' },
          },
        },
        {
          id: 'ma-partner',
          label: 'Propose Partnership',
          description: 'Approach CloudMatrix about strategic partnership instead of acquisition.',
          tradeoff: 'Lower risk but may not prevent NexGen deal',
          consequences: [
            { type: 'metric', target: 'cashReserves', value: -50, message: 'Partnership investment' },
            { type: 'boardConfidence', value: -5, message: 'Board wanted decisive action' },
            { type: 'narrative', value: 0, message: 'CloudMatrix is listening, but NexGen\'s offer is on the table.' },
          ],
          boardReactions: {
            'activist': { mood: 0, message: 'Half measures won\'t save us.' },
            'conservative': { mood: 1, message: 'Prudent. Test the waters first.' },
            'growth-focused': { mood: -2, message: 'Partnerships are what losers propose.' },
            'governance-hawk': { mood: 1, message: 'A measured approach. I can support this.' },
            'founder-ally': { mood: -1, message: 'This feels like we\'re playing not to lose.' },
          },
        },
        {
          id: 'ma-internal',
          label: 'Double Down on Internal R&D',
          description: 'Let NexGen have CloudMatrix. Invest $300M in accelerating internal AI development.',
          tradeoff: 'Maintains independence but cedes strategic ground',
          consequences: [
            { type: 'metric', target: 'cashReserves', value: -300, message: 'R&D investment' },
            { type: 'metric', target: 'operatingMargin', value: -3, message: 'Higher R&D spend' },
            { type: 'stakeholder', target: 'employees', value: 10, message: 'Technical teams energized' },
            { type: 'alignment', value: 8, message: 'R&D feels valued' },
            { type: 'narrative', value: 0, delay: 3, message: 'Your technology bet will take time to pay off—if it does.' },
          ],
          boardReactions: {
            'activist': { mood: -2, message: 'You\'re ceding the market to competitors.' },
            'conservative': { mood: 0, message: 'Risky either way. At least this preserves balance sheet.' },
            'growth-focused': { mood: -1, message: 'NexGen will be unstoppable.' },
            'governance-hawk': { mood: 0, message: 'Organic growth has merit, but timing is concerning.' },
            'founder-ally': { mood: 2, message: 'We built this company on innovation. Let\'s keep building.' },
          },
        },
      ],
    },
    events: [
      {
        id: 'event-3-1',
        title: 'Anonymous Tip to Board',
        content: `[Forwarded by Board Chair Victoria Sterling]

Alexandra, I received this anonymously. I don't know what to make of it, but you should see it.

---

"Ask the CEO about the side letter on the Nexus Federal contract. Ask why the General Counsel's office wasn't consulted. The SEC inquiry is just the beginning."

---

What is this about?`,
        type: 'board',
        tone: 'urgent',
        sender: 'Victoria Sterling',
        timestamp: '6:15 AM',
      },
    ],
  },
  4: {
    briefing: `**QUARTER 4 STRATEGIC BRIEFING**

The anonymous letter has created a crisis of trust. Victoria Sterling wants answers. Your General Counsel is asking pointed questions. Someone is leaking—but who?

The Nexus Federal contract was signed 18 months ago. It included a "side letter" with additional terms that weren't fully documented in the main agreement. You inherited this situation; the deal was signed by your predecessor. But you knew about it and didn't disclose.

Meanwhile, your strategic decision from last quarter is playing out:

Financial Update:
- Revenue: $341M (down 4.7% QoQ)
- Operating Margin: 14.2%
- Stock: $38.91
- Cash Reserves: Varies based on prior decisions

The board meets in 48 hours. Victoria has scheduled a private executive session—without you present. This is unprecedented.`,
    crisis: {
      id: 'crisis-4-trust',
      name: 'The Nexus Letter Crisis',
      description: `The side letter is real. It promised Nexus Federal preferential pricing on future contracts in exchange for accelerating the original deal to hit Q4 numbers two years ago.

It's not illegal—probably—but it's the kind of thing that makes auditors, regulators, and board members very uncomfortable. Especially when combined with the existing SEC inquiry.

Victoria Sterling has asked for a complete explanation before the board meeting. Your General Counsel is furious she wasn't consulted when you discovered this. Your CFO is asking if this affects the financials.

The anonymous source is still unknown. It could be a disgruntled employee, a competitor, or someone on your own team positioning for your job.`,
      severity: 'existential',
      urgency: 'Board meeting in 48 hours',
      stakeholderPressure: { regulators: -15, investors: -10 },
      boardPressure: -20,
      context: 'Trust, once lost, is almost impossible to rebuild. How you handle this defines your character.',
      options: [
        {
          id: 'trust-full-disclosure',
          label: 'Full Disclosure',
          description: 'Tell the board everything. The letter, when you learned about it, why you didn\'t disclose.',
          tradeoff: 'Maximum honesty but maximum vulnerability',
          consequences: [
            { type: 'boardConfidence', value: -15, message: 'Board shaken but respects transparency' },
            { type: 'stakeholder', target: 'regulators', value: 5, message: 'Proactive disclosure viewed favorably' },
            { type: 'narrative', value: 0, message: 'You chose truth. The consequences are out of your hands now.' },
          ],
          boardReactions: {
            'activist': { mood: -2, message: 'This is exactly why we need new leadership.' },
            'conservative': { mood: -1, message: 'I wish you had told us sooner.' },
            'growth-focused': { mood: -1, message: 'How does this help us compete?' },
            'governance-hawk': { mood: 1, message: 'Thank you for your candor. Let\'s fix this together.' },
            'founder-ally': { mood: 0, message: 'I appreciate the honesty. What\'s the path forward?' },
          },
        },
        {
          id: 'trust-legal-defense',
          label: 'Legal Firewall',
          description: 'Have legal review everything. Only disclose what\'s legally required. Control the narrative.',
          tradeoff: 'Protects you legally but erodes trust further',
          consequences: [
            { type: 'metric', target: 'cashReserves', value: -20, message: 'Legal fees' },
            { type: 'boardConfidence', value: -25, message: 'Board senses you\'re hiding something' },
            { type: 'alignment', value: -15, message: 'Legal team uncomfortable with approach' },
            { type: 'narrative', value: 0, message: 'You chose protection over transparency. The board noticed.' },
          ],
          boardReactions: {
            'activist': { mood: -2, message: 'Lawyers? Really? What are you hiding?' },
            'conservative': { mood: -2, message: 'This is making me very uncomfortable.' },
            'growth-focused': { mood: -1, message: 'Just tell us what\'s going on.' },
            'governance-hawk': { mood: -3, message: 'This is a serious breach of board trust.' },
            'founder-ally': { mood: -1, message: 'I\'ve always trusted you. Don\'t make me regret it.' },
          },
        },
        {
          id: 'trust-find-leaker',
          label: 'Find the Leaker',
          description: 'Focus on identifying who sent the anonymous tip. Someone is trying to destroy you.',
          tradeoff: 'Might find your enemy but looks like deflection',
          consequences: [
            { type: 'alignment', value: -20, message: 'Witch hunt destroys morale' },
            { type: 'boardConfidence', value: -10, message: 'Board sees deflection' },
            { type: 'narrative', value: 0, delay: 1, message: 'The investigation reveals uncomfortable truths about loyalty.' },
          ],
          boardReactions: {
            'activist': { mood: -1, message: 'The leaker isn\'t the issue. Your judgment is.' },
            'conservative': { mood: -1, message: 'This feels like you\'re avoiding the question.' },
            'growth-focused': { mood: 0, message: 'Fine, but we still need answers about the letter.' },
            'governance-hawk': { mood: -2, message: 'Focus on governance, not blame.' },
            'founder-ally': { mood: 1, message: 'Someone is out to get you. Find them.' },
          },
        },
      ],
    },
    events: [
      {
        id: 'event-4-1',
        title: 'Private Message from CFO',
        content: `Alex,

I need you to know something. Victoria called me yesterday. She asked about "succession readiness." She asked if I would consider an interim role "if circumstances required."

I told her my loyalty is to the company, which I hope was the right answer.

I'm telling you this because you deserve to know. They're preparing for the possibility you won't survive this.

—Marcus`,
        type: 'internal',
        tone: 'urgent',
        sender: 'Marcus Webb, CFO',
        timestamp: '11:47 PM',
      },
    ],
  },
  5: {
    briefing: `**QUARTER 5 STRATEGIC BRIEFING**

You survived the executive session. Barely.

The board voted 4-1 to retain you, but with conditions: monthly governance reviews, an independent investigation into contracting practices, and a formal performance improvement framework.

Sarah Williams voted against you. She's now openly aligned with Castlebridge.

The good news: Your strategic decisions are showing early results. The bad news: The market hasn't noticed. Stock continues to drift lower.

Financial Update:
- Revenue: $347M (up 1.8% QoQ—first increase in five quarters)
- Operating Margin: 13.1%
- Stock: $35.42
- Cash Reserves: Varies

A new crisis emerges: Your Chief Technology Officer has received an offer from Google. She's the architect of your AI strategy—the one thing analysts still praise about Meridian.`,
    crisis: {
      id: 'crisis-5-talent',
      name: 'The CTO Ultimatum',
      description: `Dr. Priya Sharma has been your CTO for four years. She turned down Google twice before. This time is different.

"I'm tired, Alex," she told you this morning. "Tired of fighting for resources. Tired of the board drama. Tired of watching talented engineers leave because they don't see a future here. Google is offering me $12 million guaranteed over four years, plus the chance to build something at scale."

She's willing to stay—but she has conditions:
- Full autonomy over technical decisions
- $50M additional R&D budget commitment
- A seat at executive team meetings (she's been excluded recently)
- A public statement about Meridian's technology commitment

If she leaves, your AI strategy dies. Your best engineers will follow her out the door. Analysts will downgrade. Castlebridge will pounce.`,
      severity: 'severe',
      urgency: 'She needs an answer in 24 hours',
      stakeholderPressure: { employees: -15 },
      boardPressure: -5,
      context: 'Talent is everything. But so is principle. And so is precedent.',
      options: [
        {
          id: 'talent-full-accept',
          label: 'Accept All Terms',
          description: 'Give Priya everything she\'s asking for. She\'s too important to lose.',
          tradeoff: 'Keeps your best asset but sets dangerous precedent',
          consequences: [
            { type: 'metric', target: 'cashReserves', value: -50, message: 'Additional R&D commitment' },
            { type: 'stakeholder', target: 'employees', value: 15, message: 'Engineers see leadership values tech' },
            { type: 'alignment', value: -10, message: 'Other executives resent special treatment' },
            { type: 'boardConfidence', value: -5, message: 'Board worries about governance' },
            { type: 'narrative', value: 0, message: 'Priya stays. But everyone now knows they can negotiate.' },
          ],
          boardReactions: {
            'activist': { mood: -1, message: 'You just created a culture of ultimatums.' },
            'conservative': { mood: -1, message: 'Giving in to demands under pressure is concerning.' },
            'growth-focused': { mood: 1, message: 'Keep the talent. Everything else is secondary.' },
            'governance-hawk': { mood: -2, message: 'This undermines executive team cohesion.' },
            'founder-ally': { mood: 1, message: 'Engineers are everything. Good call.' },
          },
        },
        {
          id: 'talent-counter',
          label: 'Counter-Propose',
          description: 'Offer $30M budget increase, exec team inclusion, but no public statement or full autonomy.',
          tradeoff: 'Balanced approach but may not be enough',
          consequences: [
            { type: 'metric', target: 'cashReserves', value: -30, message: 'Partial R&D increase' },
            { type: 'narrative', value: 0, message: 'Priya is considering. The next 24 hours will tell.' },
          ],
          boardReactions: {
            'activist': { mood: 0, message: 'Reasonable. But will it work?' },
            'conservative': { mood: 1, message: 'A measured response. Well done.' },
            'growth-focused': { mood: 0, message: 'I hope it\'s enough.' },
            'governance-hawk': { mood: 1, message: 'Appropriate balance of retention and principle.' },
            'founder-ally': { mood: 0, message: 'Don\'t lose her.' },
          },
        },
        {
          id: 'talent-let-go',
          label: 'Let Her Go',
          description: 'Thank her for her service. Don\'t negotiate under ultimatum. Promote from within.',
          tradeoff: 'Maintains principle but risks exodus',
          consequences: [
            { type: 'stakeholder', target: 'employees', value: -25, message: 'Engineers devastated' },
            { type: 'stakeholder', target: 'investors', value: -20, message: 'Market loses confidence' },
            { type: 'metric', target: 'stockPrice', value: -5, message: 'Stock drops on departure' },
            { type: 'alignment', value: 5, message: 'Remaining team appreciates principled stance' },
            { type: 'narrative', value: 0, message: 'Priya is gone. The rebuilding begins.' },
          ],
          boardReactions: {
            'activist': { mood: 0, message: 'Bold. Possibly foolish. We\'ll see.' },
            'conservative': { mood: 0, message: 'Principled, but at what cost?' },
            'growth-focused': { mood: -2, message: 'You just killed our technology story.' },
            'governance-hawk': { mood: 1, message: 'You can\'t lead by ultimatum. Correct decision.' },
            'founder-ally': { mood: -1, message: 'I hope you know what you\'re doing.' },
          },
        },
      ],
    },
    events: [
      {
        id: 'event-5-1',
        title: 'Analyst Downgrade',
        content: `MORGAN STANLEY DOWNGRADES MERIDIAN TO "UNDERWEIGHT"

"Management credibility has eroded significantly. The SEC overhang, activist pressure, and now questions about strategic direction create a risk profile we can't recommend. While Q5 results showed improvement, we see this as temporary. Price target reduced to $28."`,
        type: 'market',
        tone: 'negative',
        sender: 'Bloomberg Terminal',
        timestamp: '6:00 AM ET',
      },
    ],
  },
  6: {
    briefing: `**QUARTER 6 STRATEGIC BRIEFING**

The SEC inquiry has concluded. The finding: "Insufficient documentation of revenue recognition practices, but no evidence of intentional fraud." You've been cleared, mostly.

But the damage is done. Meridian's reputation has suffered. Recruiting is harder. Deals take longer. Customers ask more questions.

Castlebridge has made its move: They're proposing a full slate of four directors at the annual meeting in 90 days. If they win, you're out.

The proxy fight begins now.

Financial Update:
- Revenue: $352M (flat QoQ)
- Operating Margin: 13.8%
- Stock: $33.17
- Castlebridge coalition now controls 14.3% of shares`,
    crisis: {
      id: 'crisis-6-proxy',
      name: 'The Proxy War',
      description: `Castlebridge has gone nuclear. Their proxy filing landed this morning:

"Meridian Technologies has underperformed peers by 47% over the past three years. Management has failed to adapt to market realities. The board has failed in its oversight responsibilities. It is time for change."

They're proposing four new directors—all with operational turnaround experience. Their slate includes a former competitor CEO, a cost-cutting specialist, and two finance executives known for "unlocking value" (read: selling companies for parts).

ISS, the proxy advisory firm, has indicated they're "reviewing the situation." Glass Lewis is expected to issue a recommendation next week.

You have 90 days to convince shareholders you deserve to keep your job.`,
      severity: 'existential',
      urgency: 'Annual meeting in 90 days',
      stakeholderPressure: { investors: -20 },
      boardPressure: -15,
      context: 'This is the final battle. Win the proxy fight or lose everything.',
      options: [
        {
          id: 'proxy-campaign',
          label: 'Full Campaign War',
          description: 'Hire top proxy solicitors. Launch shareholder outreach. Fight for every vote.',
          tradeoff: 'Shows commitment but expensive and distracting',
          consequences: [
            { type: 'metric', target: 'cashReserves', value: -40, message: 'Proxy fight costs' },
            { type: 'stakeholder', target: 'investors', value: 10, message: 'Institutional investors respect the fight' },
            { type: 'alignment', value: -15, message: 'Company focused on politics, not business' },
            { type: 'narrative', value: 0, message: 'The war for Meridian has begun.' },
          ],
          boardReactions: {
            'activist': { mood: -1, message: 'Wasting shareholder money on politics.' },
            'conservative': { mood: 0, message: 'Necessary, I suppose.' },
            'growth-focused': { mood: -1, message: 'Every dollar spent here is a dollar not invested in growth.' },
            'governance-hawk': { mood: 0, message: 'Shareholders will decide. That\'s how it should be.' },
            'founder-ally': { mood: 2, message: 'Fight with everything you have.' },
          },
        },
        {
          id: 'proxy-settlement',
          label: 'Negotiate Settlement',
          description: 'Offer Castlebridge two board seats in exchange for dropping the full campaign.',
          tradeoff: 'Preserves capital but gives activists power',
          consequences: [
            { type: 'boardConfidence', value: -20, message: 'Board sees capitulation' },
            { type: 'stakeholder', target: 'investors', value: 5, message: 'Some prefer stability' },
            { type: 'narrative', value: 0, message: 'You gave ground. Castlebridge now has a voice in your future.' },
          ],
          boardReactions: {
            'activist': { mood: 2, message: 'Finally, you\'re listening to shareholders.' },
            'conservative': { mood: 1, message: 'Pragmatic. I can work with this.' },
            'growth-focused': { mood: -1, message: 'We\'re inviting the enemy inside.' },
            'governance-hawk': { mood: 0, message: 'Board refreshment isn\'t always bad.' },
            'founder-ally': { mood: -2, message: 'You\'re surrendering.' },
          },
        },
        {
          id: 'proxy-transform-2',
          label: 'Announce Strategic Alternative Review',
          description: 'Pre-empt by announcing the board is reviewing "strategic alternatives" including potential sale.',
          tradeoff: 'Changes the narrative but may end with you selling the company',
          consequences: [
            { type: 'metric', target: 'stockPrice', value: 15, message: 'Stock pops on sale speculation' },
            { type: 'stakeholder', target: 'employees', value: -30, message: 'Employees fear for their jobs' },
            { type: 'alignment', value: -25, message: 'Uncertainty paralyzes the organization' },
            { type: 'narrative', value: 0, message: 'You put the company in play. Anything can happen now.' },
          ],
          boardReactions: {
            'activist': { mood: 2, message: 'This is what we\'ve been asking for.' },
            'conservative': { mood: -1, message: 'Are we sure we want to go down this path?' },
            'growth-focused': { mood: -2, message: 'You\'re giving up on the future.' },
            'governance-hawk': { mood: 0, message: 'Fiduciary duty requires exploring all options.' },
            'founder-ally': { mood: -3, message: 'This is a betrayal of everything we built.' },
          },
        },
      ],
    },
    events: [
      {
        id: 'event-6-1',
        title: 'Personal Message from Marcus Sterling',
        content: `Alexandra,

We've never met, but I feel like I know you. I've studied your career. The IPO. The European expansion. The AI pivot. You're good. Maybe great.

But greatness isn't enough when the numbers don't work.

Here's my offer: Support our slate publicly. Announce you'll resign after a transition period. We'll make sure you're taken care of—$20 million severance, positive press release, your legacy protected.

Fight us, and I'll spend whatever it takes to destroy your reputation. Every mistake you've made will be front-page news. Every failure magnified.

This doesn't have to be ugly.

—Marcus Sterling
Managing Partner, Castlebridge Capital`,
        type: 'personal',
        tone: 'urgent',
        sender: 'Marcus Sterling',
        timestamp: 'Private Email',
      },
    ],
  },
  7: {
    briefing: `**QUARTER 7 STRATEGIC BRIEFING**

The proxy battle is in full swing. Every day brings new developments:

- ISS has recommended shareholders vote for two Castlebridge candidates but retain the majority of existing directors. A split decision.
- Your top two institutional shareholders (representing 18% of shares combined) have requested private meetings.
- The stock has stabilized at $36—the market is pricing in uncertainty.

Your decisions over the past six quarters are now your record. Shareholders are evaluating everything: the SEC handling, the activist response, the strategic moves, the talent decisions.

The annual meeting is in 30 days.

Financial Update:
- Revenue: $359M (up 2% QoQ—trend is positive)
- Operating Margin: 14.5%
- Stock: $36.12
- Proxy likely outcome: Too close to call`,
    crisis: {
      id: 'crisis-7-final-push',
      name: 'The Final Push',
      description: `Thirty days until the annual meeting. The vote is too close to call.

Your IR team has segmented shareholders:
- 28% firmly supportive (mostly index funds and long-term holders)
- 24% firmly against (Castlebridge coalition + momentum traders)
- 48% undecided

The undecided block includes your two largest active institutional holders. They've each requested meetings this week.

"They want to hear your vision," your IR head says. "But mostly, they want to look you in the eye and decide if you still have what it takes."

These meetings will determine your fate.`,
      severity: 'existential',
      urgency: '30 days to annual meeting',
      stakeholderPressure: { investors: -10 },
      boardPressure: -10,
      context: 'This is the closing argument. Everything you\'ve done leads to this moment.',
      options: [
        {
          id: 'final-vision',
          label: 'Bold Vision Presentation',
          description: 'Present an ambitious three-year plan. New markets. New products. Renewed growth.',
          tradeoff: 'Inspiring but requires credibility you may have lost',
          consequences: [
            { type: 'boardConfidence', value: 10, message: 'Board rallies behind renewed vision' },
            { type: 'stakeholder', target: 'investors', value: 15, message: 'Institutions respond to conviction' },
            { type: 'narrative', value: 0, message: 'You laid out your vision. Now they decide if they believe you.' },
          ],
          boardReactions: {
            'activist': { mood: -1, message: 'Words are easy. Results are hard.' },
            'conservative': { mood: 0, message: 'Ambitious. Can we deliver?' },
            'growth-focused': { mood: 2, message: 'This is the leader I signed up for.' },
            'governance-hawk': { mood: 0, message: 'Vision is necessary but not sufficient.' },
            'founder-ally': { mood: 2, message: 'This is who you are. Show them.' },
          },
        },
        {
          id: 'final-humble',
          label: 'Humble Accountability',
          description: 'Acknowledge mistakes openly. Present a realistic improvement plan. Ask for another chance.',
          tradeoff: 'Authentic but may reinforce narrative of failure',
          consequences: [
            { type: 'boardConfidence', value: 5, message: 'Some appreciate humility' },
            { type: 'stakeholder', target: 'investors', value: 5, message: 'Mixed response to humility' },
            { type: 'narrative', value: 0, message: 'You asked for forgiveness. Whether you receive it is uncertain.' },
          ],
          boardReactions: {
            'activist': { mood: 0, message: 'Accountability is a start. But actions matter more.' },
            'conservative': { mood: 1, message: 'Mature response. I respect this.' },
            'growth-focused': { mood: -1, message: 'We need confidence, not apologies.' },
            'governance-hawk': { mood: 1, message: 'Self-reflection is a leadership quality.' },
            'founder-ally': { mood: 0, message: 'Don\'t apologize too much. You fought hard.' },
          },
        },
        {
          id: 'final-deal',
          label: 'Announce Major Win',
          description: 'Accelerate the announcement of a major contract you\'ve been negotiating. Change the narrative.',
          tradeoff: 'Strong if real but risky if deal falls through',
          consequences: [
            { type: 'metric', target: 'revenue', value: 40, delay: 1, message: 'Major contract signed' },
            { type: 'stakeholder', target: 'investors', value: 20, message: 'Market loves concrete wins' },
            { type: 'boardConfidence', value: 15, message: 'Board sees execution' },
            { type: 'narrative', value: 0, message: 'The deal lands. For once, timing worked in your favor.' },
          ],
          boardReactions: {
            'activist': { mood: 0, message: 'One deal doesn\'t change the fundamentals.' },
            'conservative': { mood: 1, message: 'Good news at the right time.' },
            'growth-focused': { mood: 2, message: 'This is what matters. Results.' },
            'governance-hawk': { mood: 1, message: 'Execution over promises. Well done.' },
            'founder-ally': { mood: 2, message: 'You still know how to win.' },
          },
        },
      ],
    },
    events: [
      {
        id: 'event-7-1',
        title: 'Note from Board Chair',
        content: `Alex,

Whatever happens at the annual meeting, I want you to know: you've handled an impossible situation with grace under pressure.

Not everyone on this board agrees with every decision you've made. I don't even agree with all of them. But I've watched you lead through crisis after crisis without losing your integrity or your vision.

That counts for something.

Win or lose, you should be proud of how you've conducted yourself.

—Victoria`,
        type: 'board',
        tone: 'positive',
        sender: 'Victoria Sterling',
        timestamp: '9:15 PM',
      },
    ],
  },
  8: {
    briefing: `**QUARTER 8 STRATEGIC BRIEFING - FINAL ROUND**

The annual meeting is tomorrow.

Proxy votes are still being counted, but your IR team's latest estimate:
- Management slate: 47-52%
- Castlebridge slate: 43-48%
- Undecided/Broker non-votes: 5-10%

It's genuinely too close to call.

In the final hours before the meeting, you have one last opportunity to influence the outcome—but every move has risks.

The past eight quarters have led to this moment. Every decision you made, every crisis you navigated, every relationship you built or broke—it all comes down to tomorrow.`,
    crisis: {
      id: 'crisis-8-final',
      name: 'The Night Before',
      description: `Tomorrow at 9 AM, the annual meeting begins. By noon, you'll know if you're still CEO of Meridian Technologies.

Your team has prepared three options for the final hours:

1. A last-minute media blitz to control the narrative
2. A quiet dinner with your most important undecided shareholder
3. A company-wide town hall to rally employees (who also own shares)

You can only do one. The others will have to wait—and waiting may be too late.

Or you could do nothing. Accept that you've done everything you can. Let the chips fall where they may.

This is your last decision as the unchallenged CEO of Meridian Technologies.`,
      severity: 'existential',
      urgency: 'Hours remaining',
      stakeholderPressure: {},
      boardPressure: 0,
      context: 'After everything, it comes down to this.',
      options: [
        {
          id: 'final-media',
          label: 'Media Blitz',
          description: 'Give interviews to CNBC, Bloomberg, and the Wall Street Journal. Make your case publicly.',
          tradeoff: 'Maximum visibility but could backfire',
          consequences: [
            { type: 'stakeholder', target: 'media', value: 15, message: 'You controlled the final narrative' },
            { type: 'stakeholder', target: 'investors', value: 5, message: 'Some undecideds persuaded' },
            { type: 'narrative', value: 0, message: 'You went public with your case. Now everyone knows where you stand.' },
          ],
          boardReactions: {
            'activist': { mood: -1, message: 'Grandstanding.' },
            'conservative': { mood: 0, message: 'Bold.' },
            'growth-focused': { mood: 1, message: 'Never stop fighting.' },
            'governance-hawk': { mood: 0, message: 'Unusual, but not inappropriate.' },
            'founder-ally': { mood: 1, message: 'Make them see you.' },
          },
        },
        {
          id: 'final-dinner',
          label: 'Private Dinner',
          description: 'Meet personally with the CIO of your largest undecided institutional holder. One conversation.',
          tradeoff: 'High-value but everything on one relationship',
          consequences: [
            { type: 'stakeholder', target: 'investors', value: 10, message: 'The meeting went well' },
            { type: 'narrative', value: 0, message: 'You made your case personally. The rest is up to them.' },
          ],
          boardReactions: {
            'activist': { mood: 0, message: 'Retail politics.' },
            'conservative': { mood: 1, message: 'Personal touch matters.' },
            'growth-focused': { mood: 0, message: 'Hope it works.' },
            'governance-hawk': { mood: 1, message: 'Direct engagement is appropriate.' },
            'founder-ally': { mood: 1, message: 'Look them in the eye.' },
          },
        },
        {
          id: 'final-townhall',
          label: 'Employee Town Hall',
          description: 'Address all 4,000 employees. Rally the troops. Remind them they\'re shareholders too.',
          tradeoff: 'Energizes base but employees are small voting block',
          consequences: [
            { type: 'stakeholder', target: 'employees', value: 20, message: 'Employees feel seen' },
            { type: 'alignment', value: 15, message: 'Team rallies behind you' },
            { type: 'narrative', value: 0, message: 'Your people stand with you. That matters—maybe not enough, but it matters.' },
          ],
          boardReactions: {
            'activist': { mood: 0, message: 'Employee votes won\'t save you.' },
            'conservative': { mood: 0, message: 'Nice gesture.' },
            'growth-focused': { mood: 0, message: 'Culture matters, but so do votes.' },
            'governance-hawk': { mood: 1, message: 'Internal alignment is valuable.' },
            'founder-ally': { mood: 2, message: 'These are your people. Let them know.' },
          },
        },
        {
          id: 'final-nothing',
          label: 'Do Nothing',
          description: 'Go home. Sleep. You\'ve done everything you can. Accept what comes.',
          tradeoff: 'Peace of mind but no last effort',
          consequences: [
            { type: 'narrative', value: 0, message: 'You chose peace. Tomorrow will bring what it brings.' },
          ],
          boardReactions: {
            'activist': { mood: 0, message: 'Giving up?' },
            'conservative': { mood: 1, message: 'Wisdom in knowing when to stop.' },
            'growth-focused': { mood: -1, message: 'Fighters fight.' },
            'governance-hawk': { mood: 1, message: 'Dignity in acceptance.' },
            'founder-ally': { mood: 0, message: 'Rest. You\'ve earned it.' },
          },
        },
      ],
    },
    events: [
      {
        id: 'event-8-1',
        title: 'The Final Tally',
        content: `[This message appears after your final decision]

The meeting is over. The votes have been counted.

Your fate has been decided.`,
        type: 'board',
        tone: 'neutral',
        sender: 'System',
        timestamp: 'End of Simulation',
      },
    ],
  },
};

// =============================================================================
// INITIAL STATE
// =============================================================================

const INITIAL_BOARD: BoardMember[] = [
  {
    id: 'victoria',
    name: 'Victoria Sterling',
    title: 'Board Chair',
    avatar: 'VS',
    archetype: 'conservative',
    patience: 70,
    mood: 'neutral',
    concerns: ['Long-term sustainability', 'Risk management'],
    votingPower: 25,
    memory: [],
  },
  {
    id: 'marcus-c',
    name: 'Marcus Chen',
    title: 'Independent Director',
    avatar: 'MC',
    archetype: 'growth-focused',
    patience: 50,
    mood: 'supportive',
    concerns: ['Growth trajectory', 'Innovation'],
    votingPower: 20,
    memory: [],
  },
  {
    id: 'sarah',
    name: 'Sarah Williams',
    title: 'Activist Representative',
    avatar: 'SW',
    archetype: 'activist',
    patience: 30,
    mood: 'concerned',
    concerns: ['Shareholder returns', 'Cost efficiency'],
    votingPower: 25,
    memory: [],
  },
  {
    id: 'james',
    name: 'Dr. James Morrison',
    title: 'Governance Expert',
    avatar: 'JM',
    archetype: 'governance-hawk',
    patience: 60,
    mood: 'neutral',
    concerns: ['Compliance', 'Board effectiveness'],
    votingPower: 15,
    memory: [],
  },
  {
    id: 'elena',
    name: 'Elena Rodriguez',
    title: 'Founder Representative',
    avatar: 'ER',
    archetype: 'founder-ally',
    patience: 65,
    mood: 'supportive',
    concerns: ['Company mission', 'Long-term vision'],
    votingPower: 15,
    memory: [],
  },
];

const INITIAL_STATE: GameState = {
  round: 0,
  phase: 'intro',
  boardConfidence: 65,
  internalAlignment: 68,
  reputation: 70,
  stakeholders: {
    investors: 10,
    employees: 15,
    customers: 20,
    regulators: 0,
    media: 5,
  },
  metrics: {
    marketCap: 4.2,
    revenue: 385,
    operatingMargin: 18.5,
    cashReserves: 890,
    stockPrice: 47.23,
    stockChange: -2.3,
  },
  board: INITIAL_BOARD,
  currentCrisis: null,
  currentEvent: null,
  decisionHistory: [],
  narrativeLog: [],
  gameOver: false,
  gameOverReason: null,
  endingType: null,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getMoodColor(mood: BoardMood): string {
  switch (mood) {
    case 'supportive': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    case 'neutral': return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    case 'concerned': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    case 'hostile': return 'text-red-400 border-red-500/30 bg-red-500/10';
  }
}

function getMoodIcon(mood: BoardMood) {
  switch (mood) {
    case 'supportive': return <ThumbsUp className="w-4 h-4" />;
    case 'neutral': return <Minus className="w-4 h-4" />;
    case 'concerned': return <AlertCircle className="w-4 h-4" />;
    case 'hostile': return <ThumbsDown className="w-4 h-4" />;
  }
}

function calculateBoardMood(member: BoardMember, moodChange: number): BoardMood {
  const moodOrder: BoardMood[] = ['hostile', 'concerned', 'neutral', 'supportive'];
  const currentIndex = moodOrder.indexOf(member.mood);
  const newIndex = Math.max(0, Math.min(3, currentIndex + Math.sign(moodChange)));
  return moodOrder[newIndex];
}

function calculateEnding(state: GameState): { type: 'termination' | 'resignation' | 'survival' | 'triumph'; message: string } {
  const { boardConfidence, stakeholders, metrics, decisionHistory } = state;

  // Calculate proxy vote result based on all factors
  let voteScore = 50; // Start at 50-50

  // Board confidence is the primary factor
  voteScore += (boardConfidence - 50) * 0.5;

  // Stakeholder sentiment
  voteScore += stakeholders.investors * 0.3;
  voteScore += stakeholders.employees * 0.1;

  // Financial performance
  if (metrics.stockPrice > 40) voteScore += 5;
  if (metrics.stockPrice < 35) voteScore -= 5;
  if (metrics.revenue > 360) voteScore += 5;

  // Check for automatic termination conditions
  if (boardConfidence < 25) {
    return {
      type: 'termination',
      message: `The board has lost confidence in your leadership. At an emergency session held last night, a motion of no confidence passed 4-1.

Your tenure as CEO of Meridian Technologies is over.

You will be remembered for fighting hard—but in the end, you couldn't hold the coalition together. The activist won.

The board has appointed Marcus Webb as interim CEO. Castlebridge released a statement calling this "a victory for shareholder value."

You gave everything. It wasn't enough.`,
    };
  }

  // Check vote result
  if (voteScore >= 65) {
    return {
      type: 'triumph',
      message: `The votes are in. You've won decisively—58% of shareholders voted to retain the existing board.

Castlebridge's campaign has failed. Marcus Sterling called to concede personally. "You're tougher than I expected," he said. "I may disagree with how you run the company, but I respect how you fought."

The stock is up 8% on the news. Your team is celebrating. Victoria Sterling shook your hand after the meeting: "You've earned this. Now deliver on what you promised."

You're still CEO. More than that—you've proven you can survive anything.

Now comes the hard part: living up to the expectations you've set.`,
    };
  } else if (voteScore >= 50) {
    return {
      type: 'survival',
      message: `The votes are in. You've survived—barely. 51.3% of shareholders voted to retain the existing board.

Castlebridge has secured two board seats. Sarah Williams will now be joined by two new directors from the activist slate. You'll be answering to them.

The stock is flat. The market isn't sure what to think. Neither are you.

Victoria Sterling pulled you aside after the meeting: "You won today. But this isn't over. You have maybe six months to show results. Don't waste them."

You're still CEO. For now.`,
    };
  } else {
    return {
      type: 'termination',
      message: `The votes are in. Castlebridge has won. 54% of shareholders voted for the activist slate.

The new board will convene tomorrow. Your resignation letter is already drafted—your lawyer advised you to get ahead of the inevitable termination.

Marcus Sterling released a statement thanking shareholders for their "courage to demand change." He didn't mention your name.

Victoria Sterling called you personally: "I'm sorry, Alex. You deserved better. But this is how it ends sometimes."

Your tenure as CEO of Meridian Technologies is over.

You gave everything. The market decided it wasn't enough.`,
    };
  }
}

// =============================================================================
// COMPONENTS
// =============================================================================

function IntroScreen({ onStart }: { onStart: () => void }) {
  const [step, setStep] = useState(0);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/scenarios/scenario-02.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      )}
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-violet-950/60 to-slate-950/80" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full relative z-10"
      >
        {step === 0 && (
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Crown className="w-20 h-20 text-violet-500 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">Strategic Leadership</h1>
            <p className="text-xl text-violet-400">Governing Under Uncertainty</p>
            <p className="text-slate-400 max-w-xl mx-auto">
              A simulation where every decision has consequences, every stakeholder has memory, and your job is always on the line.
            </p>
            <button
              onClick={() => setStep(1)}
              className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all inline-flex items-center gap-2"
            >
              Begin Simulation
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{OPENING_NARRATIVE.title}</h2>
                <p className="text-violet-400">{OPENING_NARRATIVE.subtitle}</p>
              </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none mb-8">
              {OPENING_NARRATIVE.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-slate-300 leading-relaxed whitespace-pre-line">{para}</p>
              ))}
            </div>

            <button
              onClick={onStart}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Enter the Boardroom
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function GameOverScreen({ state }: { state: GameState }) {
  const ending = calculateEnding(state);

  const colorScheme = {
    termination: 'from-red-950 via-slate-950 to-slate-950',
    resignation: 'from-amber-950 via-slate-950 to-slate-950',
    survival: 'from-blue-950 via-slate-950 to-slate-950',
    triumph: 'from-emerald-950 via-slate-950 to-slate-950',
  };

  const icons = {
    termination: <XCircle className="w-20 h-20 text-red-500" />,
    resignation: <AlertCircle className="w-20 h-20 text-amber-500" />,
    survival: <Shield className="w-20 h-20 text-blue-500" />,
    triumph: <Crown className="w-20 h-20 text-emerald-500" />,
  };

  const titles = {
    termination: 'Terminated',
    resignation: 'Resigned',
    survival: 'Survived',
    triumph: 'Triumphant',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colorScheme[ending.type]} flex items-center justify-center p-6`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {icons[ending.type]}
          </motion.div>
          <h1 className="text-5xl font-bold text-white mt-6">{titles[ending.type]}</h1>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-800 mb-8">
          <div className="prose prose-invert prose-lg max-w-none">
            {ending.message.split('\n\n').map((para, i) => (
              <p key={i} className="text-slate-300 leading-relaxed">{para}</p>
            ))}
          </div>
        </div>

        {/* Decision Summary */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-800 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Your Decisions</h3>
          <div className="space-y-2">
            {state.decisionHistory.map((decision, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">Q{decision.round}:</span>
                <span className="text-slate-300">{decision.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/80 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{state.boardConfidence}%</div>
            <div className="text-sm text-slate-400">Board Confidence</div>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">${state.metrics.stockPrice.toFixed(2)}</div>
            <div className="text-sm text-slate-400">Final Stock Price</div>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{state.round}</div>
            <div className="text-sm text-slate-400">Quarters Survived</div>
          </div>
        </div>

        <Link
          href="/"
          className="block w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-center transition-colors"
        >
          Return to Simulations
        </Link>
      </motion.div>
    </div>
  );
}

function NarrativeEventDisplay({ event, onContinue }: { event: NarrativeEvent; onContinue: () => void }) {
  const iconMap = {
    news: <Newspaper className="w-6 h-6" />,
    internal: <Mail className="w-6 h-6" />,
    board: <Gavel className="w-6 h-6" />,
    market: <TrendingUp className="w-6 h-6" />,
    personal: <Phone className="w-6 h-6" />,
  };

  const toneColors = {
    positive: 'border-emerald-500/30 bg-emerald-500/5',
    negative: 'border-red-500/30 bg-red-500/5',
    neutral: 'border-slate-500/30 bg-slate-500/5',
    urgent: 'border-amber-500/30 bg-amber-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-900 rounded-2xl p-6 border-2 ${toneColors[event.tone]}`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          event.tone === 'urgent' ? 'bg-amber-500/20 text-amber-400' :
          event.tone === 'negative' ? 'bg-red-500/20 text-red-400' :
          event.tone === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
          'bg-slate-500/20 text-slate-400'
        }`}>
          {iconMap[event.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{event.title}</h3>
            {event.timestamp && (
              <span className="text-xs text-slate-500">{event.timestamp}</span>
            )}
          </div>
          {event.sender && (
            <p className="text-sm text-slate-400">{event.sender}</p>
          )}
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none mb-6">
        {event.content.split('\n\n').map((para, i) => (
          <p key={i} className="text-slate-300 leading-relaxed whitespace-pre-line">{para}</p>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        Continue
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function CrisisDisplay({
  crisis,
  gameState,
  onDecision
}: {
  crisis: Crisis;
  gameState: GameState;
  onDecision: (optionId: string) => void;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const severityColors = {
    moderate: 'from-amber-900/50 to-slate-900',
    severe: 'from-red-900/50 to-slate-900',
    existential: 'from-red-950/80 to-slate-900',
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onDecision(selectedOption);
    }
  };

  return (
    <div className="space-y-6">
      {/* Crisis Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${severityColors[crisis.severity]} rounded-2xl p-6 border border-red-500/30`}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                crisis.severity === 'existential' ? 'bg-red-500/30 text-red-300' :
                crisis.severity === 'severe' ? 'bg-red-500/20 text-red-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {crisis.severity}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{crisis.name}</h2>
            <p className="text-sm text-red-300 mt-1">{crisis.urgency}</p>
          </div>
        </div>

        <div className="prose prose-invert prose-sm max-w-none mb-4">
          {crisis.description.split('\n\n').map((para, i) => (
            <p key={i} className="text-slate-300 leading-relaxed">{para}</p>
          ))}
        </div>

        {crisis.context && (
          <div className="p-4 bg-black/30 rounded-xl border-l-4 border-amber-500">
            <p className="text-sm text-amber-200">{crisis.context}</p>
          </div>
        )}
      </motion.div>

      {/* Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Your Options</h3>

        {crisis.options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => {
                setSelectedOption(option.id);
                setShowConfirm(true);
              }}
              disabled={!!option.lockedReason}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                selectedOption === option.id
                  ? 'border-violet-500 bg-violet-500/10'
                  : option.lockedReason
                  ? 'border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">{option.label}</h4>
                  <p className="text-sm text-slate-400 mb-2">{option.description}</p>
                  <p className="text-xs text-amber-400 italic">{option.tradeoff}</p>
                </div>
                {option.lockedReason ? (
                  <Lock className="w-5 h-5 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                    selectedOption === option.id ? 'text-violet-400' : 'text-slate-500'
                  }`} />
                )}
              </div>
              {option.lockedReason && (
                <p className="text-xs text-red-400 mt-2">{option.lockedReason}</p>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && selectedOption && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-2">Confirm Decision</h3>
              <p className="text-slate-400 mb-6">
                You are about to choose: <span className="text-white font-semibold">
                  {crisis.options.find(o => o.id === selectedOption)?.label}
                </span>
              </p>
              <p className="text-amber-400 text-sm mb-6">
                This decision cannot be undone. Consequences will unfold over the coming rounds.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                >
                  Reconsider
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BoardPanel({ board, showDetails = false }: { board: BoardMember[]; showDetails?: boolean }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
      <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Board of Directors</h3>
      <div className="space-y-3">
        {board.map((member) => (
          <div
            key={member.id}
            className={`p-3 rounded-xl border ${getMoodColor(member.mood)} transition-all`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white text-sm truncate">{member.name}</h4>
                  {getMoodIcon(member.mood)}
                </div>
                <p className="text-xs text-slate-500 truncate">{member.title}</p>
              </div>
            </div>

            {showDetails && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Voting Power</span>
                  <span className="text-slate-300">{member.votingPower}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Patience</span>
                  <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all"
                      style={{ width: `${member.patience}%` }}
                    />
                  </div>
                </div>
                {member.memory.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 mb-1">Remembers:</p>
                    <p className="text-xs text-slate-400 italic">{member.memory[member.memory.length - 1]}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricsPanel({ metrics, stakeholders }: { metrics: CompanyMetrics; stakeholders: StakeholderState }) {
  return (
    <div className="space-y-4">
      {/* Financial Metrics */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Financials</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Stock Price</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">${metrics.stockPrice.toFixed(2)}</span>
              <span className={`text-xs ${metrics.stockChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {metrics.stockChange >= 0 ? '+' : ''}{metrics.stockChange.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Market Cap</div>
            <div className="text-lg font-bold text-white">${metrics.marketCap.toFixed(1)}B</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Revenue (Q)</div>
            <div className="text-lg font-bold text-white">${metrics.revenue}M</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs text-slate-500 mb-1">Cash</div>
            <div className="text-lg font-bold text-white">${metrics.cashReserves}M</div>
          </div>
        </div>
      </div>

      {/* Stakeholder Sentiment */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Stakeholders</h3>
        <div className="space-y-3">
          {Object.entries(stakeholders).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-slate-400 capitalize w-20">{key}</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    value > 10 ? 'bg-emerald-500' :
                    value < -10 ? 'bg-red-500' :
                    'bg-slate-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, value + 50))}%` }}
                />
              </div>
              <span className={`text-sm font-medium w-10 text-right ${
                value > 10 ? 'text-emerald-400' :
                value < -10 ? 'text-red-400' :
                'text-slate-400'
              }`}>
                {value > 0 ? '+' : ''}{value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardConfidenceGauge({ value }: { value: number }) {
  const getColor = () => {
    if (value >= 70) return 'from-emerald-600 to-emerald-400';
    if (value >= 50) return 'from-amber-600 to-amber-400';
    if (value >= 30) return 'from-orange-600 to-orange-400';
    return 'from-red-600 to-red-400';
  };

  const getStatus = () => {
    if (value >= 70) return 'Strong Support';
    if (value >= 50) return 'Cautious';
    if (value >= 30) return 'Concerned';
    return 'CRITICAL';
  };

  const getTextColor = () => {
    if (value >= 70) return 'text-emerald-400';
    if (value >= 50) return 'text-amber-400';
    if (value >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Board Confidence</h3>
        <Gavel className="w-5 h-5 text-slate-500" />
      </div>

      <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${getColor()}`}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-2xl font-bold ${getTextColor()}`}>{value}%</span>
        <span className={`text-sm font-medium ${getTextColor()}`}>{getStatus()}</span>
      </div>

      {value < 30 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-2 bg-red-900/30 border border-red-700 rounded-lg"
        >
          <p className="text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Termination risk is high
          </p>
        </motion.div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN GAME COMPONENT
// =============================================================================

export default function StrategicLeadershipPage() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [eventQueue, setEventQueue] = useState<NarrativeEvent[]>([]);
  const [showBoardDetails, setShowBoardDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      round: 1,
      phase: 'briefing',
    }));
  }, []);

  const advancePhase = useCallback(() => {
    setGameState(prev => {
      const scenario = ROUND_SCENARIOS[prev.round];

      switch (prev.phase) {
        case 'briefing':
          // Show events first if there are any
          if (scenario?.events && scenario.events.length > 0) {
            setEventQueue(scenario.events);
            return { ...prev, phase: 'crisis', currentEvent: scenario.events[0] };
          }
          // Otherwise go straight to crisis
          return { ...prev, phase: 'crisis', currentCrisis: scenario?.crisis || null };

        case 'crisis':
          // If we have events to show, show them
          if (eventQueue.length > 0) {
            const [, ...remaining] = eventQueue;
            if (remaining.length > 0) {
              setEventQueue(remaining);
              return { ...prev, currentEvent: remaining[0] };
            } else {
              setEventQueue([]);
              return { ...prev, currentEvent: null, currentCrisis: scenario?.crisis || null };
            }
          }
          return prev;

        case 'decisions':
          return { ...prev, phase: 'consequences' };

        case 'consequences':
          return { ...prev, phase: 'board-reaction' };

        case 'board-reaction':
          return { ...prev, phase: 'round-end' };

        case 'round-end':
          // Check for game over conditions
          if (prev.boardConfidence < 25) {
            return { ...prev, phase: 'game-over', gameOver: true };
          }
          if (prev.round >= 8) {
            return { ...prev, phase: 'game-over', gameOver: true };
          }
          // Advance to next round
          return {
            ...prev,
            round: prev.round + 1,
            phase: 'briefing',
            currentCrisis: null,
            currentEvent: null,
          };

        default:
          return prev;
      }
    });
  }, [eventQueue]);

  const handleDecision = useCallback((optionId: string) => {
    setGameState(prev => {
      const crisis = prev.currentCrisis;
      if (!crisis) return prev;

      const option = crisis.options.find(o => o.id === optionId);
      if (!option) return prev;

      // Apply immediate consequences
      let newState = { ...prev };
      let newMetrics = { ...prev.metrics };
      let newStakeholders = { ...prev.stakeholders };
      let newBoard = prev.board.map(m => ({ ...m, memory: [...m.memory] }));

      for (const consequence of option.consequences) {
        if (consequence.delay && consequence.delay > 0) continue; // Skip delayed consequences for now

        switch (consequence.type) {
          case 'boardConfidence':
            newState.boardConfidence = Math.max(0, Math.min(100, newState.boardConfidence + consequence.value));
            break;
          case 'stakeholder':
            if (consequence.target && consequence.target in newStakeholders) {
              newStakeholders[consequence.target as keyof StakeholderState] += consequence.value;
            }
            break;
          case 'metric':
            if (consequence.target && consequence.target in newMetrics) {
              (newMetrics as Record<string, number>)[consequence.target] += consequence.value;
            }
            break;
          case 'reputation':
            newState.reputation = Math.max(0, Math.min(100, newState.reputation + consequence.value));
            break;
          case 'alignment':
            newState.internalAlignment = Math.max(0, Math.min(100, newState.internalAlignment + consequence.value));
            break;
        }
      }

      // Apply board reactions
      newBoard = newBoard.map(member => {
        const reaction = option.boardReactions[member.archetype];
        if (reaction) {
          const newMood = calculateBoardMood(member, reaction.mood);
          const newPatience = Math.max(0, Math.min(100, member.patience + reaction.mood * 5));
          return {
            ...member,
            mood: newMood,
            patience: newPatience,
            memory: [...member.memory, reaction.message].slice(-3), // Keep last 3 memories
          };
        }
        return member;
      });

      // Record decision
      const newDecisionHistory: DecisionRecord[] = [
        ...prev.decisionHistory,
        {
          round: prev.round,
          crisisId: crisis.id,
          optionId: option.id,
          label: option.label,
        },
      ];

      // Add to narrative log
      const newNarrativeLog: NarrativeEntry[] = [
        ...prev.narrativeLog,
        {
          round: prev.round,
          type: 'decision',
          content: `You chose: ${option.label}`,
          tone: 'neutral',
        },
      ];

      return {
        ...newState,
        metrics: newMetrics,
        stakeholders: newStakeholders,
        board: newBoard,
        decisionHistory: newDecisionHistory,
        narrativeLog: newNarrativeLog,
        phase: 'consequences' as Phase,
      };
    });
  }, []);

  if (!mounted) return null;

  // Intro screen
  if (gameState.phase === 'intro') {
    return <IntroScreen onStart={startGame} />;
  }

  // Game over screen
  if (gameState.phase === 'game-over') {
    return <GameOverScreen state={gameState} />;
  }

  const scenario = ROUND_SCENARIOS[gameState.round];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Strategic Leadership</h1>
                  <p className="text-xs text-slate-400">Meridian Technologies</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-400">Quarter</span>
                <span className="text-lg font-bold text-white">{gameState.round}</span>
                <span className="text-sm text-slate-500">/ 8</span>
              </div>

              <div className={`px-3 py-1.5 rounded-lg ${
                gameState.phase === 'crisis' || gameState.phase === 'decisions'
                  ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                  : 'bg-violet-500/20 border border-violet-500/30 text-violet-300'
              }`}>
                <span className="text-sm font-medium capitalize">{gameState.phase.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Briefing Phase */}
            {gameState.phase === 'briefing' && scenario && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-violet-600/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Strategic Briefing</h2>
                    <p className="text-sm text-slate-400">Quarter {gameState.round}</p>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none mb-6">
                  {scenario.briefing.split('\n\n').map((para, i) => (
                    <p key={i} className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {para.split('**').map((part, j) =>
                        j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
                      )}
                    </p>
                  ))}
                </div>

                <button
                  onClick={advancePhase}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Event Display */}
            {gameState.phase === 'crisis' && gameState.currentEvent && (
              <NarrativeEventDisplay
                event={gameState.currentEvent}
                onContinue={advancePhase}
              />
            )}

            {/* Crisis Phase */}
            {gameState.phase === 'crisis' && !gameState.currentEvent && gameState.currentCrisis && (
              <CrisisDisplay
                crisis={gameState.currentCrisis}
                gameState={gameState}
                onDecision={handleDecision}
              />
            )}

            {/* Consequences Phase */}
            {gameState.phase === 'consequences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800"
              >
                <h2 className="text-xl font-bold text-white mb-4">Consequences Unfold</h2>

                <div className="space-y-3 mb-6">
                  {gameState.currentCrisis?.options
                    .find(o => o.id === gameState.decisionHistory[gameState.decisionHistory.length - 1]?.optionId)
                    ?.consequences
                    .filter(c => !c.delay)
                    .map((consequence, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className={`p-3 rounded-lg ${
                          consequence.value > 0 ? 'bg-emerald-500/10 border-emerald-500/30' :
                          consequence.value < 0 ? 'bg-red-500/10 border-red-500/30' :
                          'bg-slate-800 border-slate-700'
                        } border`}
                      >
                        <p className="text-sm text-slate-300">{consequence.message}</p>
                      </motion.div>
                    ))
                  }
                </div>

                <button
                  onClick={advancePhase}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Board Reaction Phase */}
            {gameState.phase === 'board-reaction' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800"
              >
                <h2 className="text-xl font-bold text-white mb-4">Board Reactions</h2>

                <div className="space-y-4 mb-6">
                  {gameState.board.map((member, i) => {
                    const lastMemory = member.memory[member.memory.length - 1];
                    if (!lastMemory) return null;

                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className={`p-4 rounded-xl border ${getMoodColor(member.mood)}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {member.avatar}
                          </div>
                          <span className="font-medium text-white">{member.name}</span>
                          {getMoodIcon(member.mood)}
                        </div>
                        <p className="text-sm text-slate-300 italic">"{lastMemory}"</p>
                      </motion.div>
                    );
                  })}
                </div>

                <button
                  onClick={advancePhase}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                >
                  End Quarter
                </button>
              </motion.div>
            )}

            {/* Round End Phase */}
            {gameState.phase === 'round-end' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-2">Quarter {gameState.round} Complete</h2>
                <p className="text-slate-400 mb-6">
                  {gameState.round < 8
                    ? 'The next quarter brings new challenges.'
                    : 'The annual meeting is upon you.'}
                </p>

                <button
                  onClick={advancePhase}
                  className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors"
                >
                  {gameState.round < 8 ? 'Continue to Next Quarter' : 'Face the Vote'}
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            <BoardConfidenceGauge value={gameState.boardConfidence} />

            {/* Internal Alignment */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Internal Alignment</h3>
                <Users className="w-5 h-5 text-slate-500" />
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gameState.internalAlignment}%` }}
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">{gameState.internalAlignment}%</span>
                <span className="text-xs text-slate-400">
                  {gameState.internalAlignment > 70 ? 'Aligned' :
                   gameState.internalAlignment > 50 ? 'Friction' : 'Tension'}
                </span>
              </div>
            </div>

            <MetricsPanel metrics={gameState.metrics} stakeholders={gameState.stakeholders} />

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowBoardDetails(!showBoardDetails)}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                {showBoardDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            <BoardPanel board={gameState.board} showDetails={showBoardDetails} />
          </div>
        </div>
      </main>
    </div>
  );
}
