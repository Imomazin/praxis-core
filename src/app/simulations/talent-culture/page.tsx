'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface GameState {
  phase: 'intro' | 'briefing' | 'situation' | 'decision' | 'consequence' | 'round-end' | 'game-over';
  round: number;
  totalRounds: number;
  cultureMetrics: CultureMetrics;
  stakeholders: StakeholderState[];
  currentChallenge: TalentChallenge | null;
  selectedOption: ChallengeOption | null;
  narrativeHistory: string[];
  finalScore: number | null;
}

interface CultureMetrics {
  employeeEngagement: number; // 0-100
  talentRetention: number; // 0-100
  diversityInclusion: number; // 0-100
  leadershipTrust: number; // 0-100
  innovationCulture: number; // 0-100
  hrBudget: number; // in millions
}

interface StakeholderState {
  id: string;
  name: string;
  role: string;
  satisfaction: number; // 0-100
  influence: number; // 0-100
  sentiment: 'enthusiastic' | 'positive' | 'neutral' | 'concerned' | 'disengaged';
}

interface TalentChallenge {
  id: string;
  title: string;
  description: string;
  category: 'retention' | 'culture' | 'diversity' | 'leadership' | 'transformation';
  urgency: 'low' | 'moderate' | 'high' | 'critical';
  insights: Insight[];
  options: ChallengeOption[];
  timeframe: string;
}

interface Insight {
  id: string;
  type: 'survey' | 'interview' | 'data' | 'benchmark';
  title: string;
  finding: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface ChallengeOption {
  id: string;
  title: string;
  description: string;
  approach: 'transformative' | 'progressive' | 'conservative' | 'reactive';
  investmentCost: number;
  consequences: Consequence[];
  cultureMessage: string;
}

interface Consequence {
  type: 'engagement' | 'retention' | 'diversity' | 'trust' | 'innovation' | 'budget';
  impact: number;
  description: string;
  delayed?: boolean;
}

// Initial game state
const initialMetrics: CultureMetrics = {
  employeeEngagement: 65,
  talentRetention: 70,
  diversityInclusion: 55,
  leadershipTrust: 60,
  innovationCulture: 58,
  hrBudget: 12,
};

const initialStakeholders: StakeholderState[] = [
  { id: 'executives', name: 'Executive Leadership', role: 'C-Suite', satisfaction: 68, influence: 95, sentiment: 'neutral' },
  { id: 'managers', name: 'Middle Management', role: 'People Leaders', satisfaction: 62, influence: 75, sentiment: 'concerned' },
  { id: 'employees', name: 'Individual Contributors', role: 'Workforce', satisfaction: 58, influence: 60, sentiment: 'concerned' },
  { id: 'highpotential', name: 'High-Potential Talent', role: 'Future Leaders', satisfaction: 55, influence: 50, sentiment: 'concerned' },
  { id: 'ergs', name: 'Employee Resource Groups', role: 'Community', satisfaction: 52, influence: 40, sentiment: 'concerned' },
  { id: 'union', name: 'Employee Representatives', role: 'Labor Relations', satisfaction: 60, influence: 45, sentiment: 'neutral' },
];

// Round scenarios
const ROUND_SCENARIOS: Record<number, { briefing: string; challenge: TalentChallenge }> = {
  1: {
    briefing: `CHIEF PEOPLE OFFICER WEEKLY BRIEFING

Welcome to your first week as CPO of GlobalTech Industries. The company has 25,000 employees across 40 countries, but faces significant people challenges.

Your predecessor departed suddenly after an employee survey revealed historic low engagement scores. Exit interview data shows top talent citing "toxic leadership" and "lack of growth opportunities" as primary departure reasons.

The CEO has given you a mandate: "Transform our culture or we'll lose the talent war."

Current state indicators:
- 32% voluntary turnover (industry avg: 18%)
- Glassdoor rating: 2.8/5.0
- Engagement survey: 42nd percentile
- D&I representation below industry benchmarks`,
    challenge: {
      id: 'challenge-1-exodus',
      title: 'The Talent Exodus',
      description: 'Your top engineering team has received competing offers from a well-funded startup. The team of 8 includes three distinguished engineers and the architect of your flagship product. They\'ve given informal notice they\'re considering leaving together. You have one week before they make final decisions.',
      category: 'retention',
      urgency: 'critical',
      insights: [
        { id: 'i1', type: 'interview', title: 'Exit Intent Conversations', finding: 'Team feels undervalued and frustrated by bureaucracy', sentiment: 'negative' },
        { id: 'i2', type: 'data', title: 'Compensation Analysis', finding: 'Team is 15-20% below market for their skills', sentiment: 'negative' },
        { id: 'i3', type: 'survey', title: 'Recent Pulse Check', finding: 'Team cited lack of autonomy and innovation time', sentiment: 'negative' },
        { id: 'i4', type: 'benchmark', title: 'Industry Standards', finding: 'Competing offer includes equity and flexible work', sentiment: 'neutral' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'Comprehensive Retention Package',
          description: 'Immediate 25% market adjustment, retention bonuses, promotion to principal level for leads, creation of innovation lab with team autonomy, direct CEO sponsorship.',
          approach: 'transformative',
          investmentCost: 3.5,
          consequences: [
            { type: 'retention', impact: 30, description: 'Team likely to stay, sets retention precedent' },
            { type: 'engagement', impact: 15, description: 'Signal that company values talent' },
            { type: 'trust', impact: -10, description: 'Other teams may feel inequitable treatment' },
            { type: 'innovation', impact: 20, description: 'Innovation lab drives new initiatives' },
          ],
          cultureMessage: 'We invest heavily in retaining our best talent',
        },
        {
          id: 'opt2',
          title: 'Structured Counter-Offer',
          description: 'Targeted 15% increases, retention bonus vesting over 2 years, career pathing conversations, promise of future leadership opportunities.',
          approach: 'progressive',
          investmentCost: 1.8,
          consequences: [
            { type: 'retention', impact: 15, description: 'Moderate retention success, some may still leave' },
            { type: 'engagement', impact: 5, description: 'Appreciated but seen as reactive' },
            { type: 'trust', impact: 5, description: 'Fair approach within normal policies' },
            { type: 'budget', impact: -0.5, description: 'Sets precedent for counter-offers' },
          ],
          cultureMessage: 'We\'re willing to compete for talent within reason',
        },
        {
          id: 'opt3',
          title: 'Non-Monetary Engagement',
          description: 'Focus on understanding concerns, offer flexibility improvements, create technical advisory role, promise future comp review in annual cycle.',
          approach: 'conservative',
          investmentCost: 0.3,
          consequences: [
            { type: 'retention', impact: -5, description: 'Team likely interprets as lack of commitment' },
            { type: 'engagement', impact: -10, description: 'Frustration that concerns aren\'t addressed' },
            { type: 'trust', impact: -15, description: 'Word spreads that company won\'t compete' },
            { type: 'innovation', impact: -15, description: 'Loss of key technical capabilities' },
          ],
          cultureMessage: 'We don\'t engage in bidding wars',
        },
        {
          id: 'opt4',
          title: 'Let Them Go Gracefully',
          description: 'Wish them well, focus on knowledge transfer, begin immediate backfill search. Position departure as natural career progression.',
          approach: 'reactive',
          investmentCost: 0.2,
          consequences: [
            { type: 'retention', impact: -25, description: 'Team leaves, triggers additional departures' },
            { type: 'engagement', impact: -20, description: 'Remaining employees question company commitment' },
            { type: 'trust', impact: -25, description: 'Leadership seen as passive' },
            { type: 'innovation', impact: -30, description: 'Critical capability gap created' },
          ],
          cultureMessage: 'Some turnover is natural and healthy',
        },
      ],
      timeframe: 'Decision needed within 7 days',
    },
  },
  2: {
    briefing: `CULTURE CRISIS ALERT

An internal investigation has confirmed widespread concerns about a senior VP known for delivering exceptional business results. Multiple credible reports document:

- Aggressive management style bordering on bullying
- High turnover in his division (45% annually)
- Retaliation concerns from employees who raised issues
- HR complaints dating back 3 years with minimal action

The VP has strong board relationships and delivered 40% of company revenue last year. The CEO asks: "He's difficult, but can we afford to lose him?"

Meanwhile, this has leaked to employee forums. Staff are watching how you respond.`,
    challenge: {
      id: 'challenge-2-toxic',
      title: 'The High-Performer Problem',
      description: 'You must address a toxic senior leader whose business results are exceptional but whose behavior is damaging the organization. The investigation file is substantial, but so is his contribution. Multiple employees are prepared to resign if action isn\'t taken, while the business unit depends on his client relationships.',
      category: 'leadership',
      urgency: 'critical',
      insights: [
        { id: 'i1', type: 'interview', title: 'Employee Testimonies', finding: '14 employees provided documented accounts of hostile behavior', sentiment: 'negative' },
        { id: 'i2', type: 'data', title: 'Division Performance', finding: 'Revenue growth 35% above target, margins 12% higher', sentiment: 'positive' },
        { id: 'i3', type: 'survey', title: 'Division Engagement', finding: 'Lowest engagement scores in company (28th percentile)', sentiment: 'negative' },
        { id: 'i4', type: 'benchmark', title: 'Legal Risk Assessment', finding: 'Potential hostile work environment liability exposure', sentiment: 'negative' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'Immediate Termination',
          description: 'End employment immediately for cause based on investigation findings. Prepare comprehensive transition plan. Communicate zero tolerance message to organization.',
          approach: 'transformative',
          investmentCost: 2.0,
          consequences: [
            { type: 'trust', impact: 35, description: 'Employees see values enforced at all levels' },
            { type: 'engagement', impact: 25, description: 'Major boost to affected team morale' },
            { type: 'retention', impact: 15, description: 'Reduced flight risk from division' },
            { type: 'innovation', impact: -15, description: 'Short-term business disruption' },
          ],
          cultureMessage: 'No one is above our values, regardless of performance',
        },
        {
          id: 'opt2',
          title: 'Performance Improvement Plan',
          description: 'Mandatory executive coaching, 90-day improvement plan, regular check-ins, clear termination triggers if behavior continues. Communicate action is being taken.',
          approach: 'progressive',
          investmentCost: 0.8,
          consequences: [
            { type: 'trust', impact: -5, description: 'Some employees skeptical of half-measures' },
            { type: 'engagement', impact: 5, description: 'At least action is being taken' },
            { type: 'retention', impact: -5, description: 'Some affected employees may leave anyway' },
            { type: 'innovation', impact: 5, description: 'Business continuity maintained' },
          ],
          cultureMessage: 'We believe in giving people chances to change',
        },
        {
          id: 'opt3',
          title: 'Quiet Reassignment',
          description: 'Move VP to strategic advisory role without direct reports. Hire external leader for division. Frame as "strategic evolution" rather than disciplinary action.',
          approach: 'conservative',
          investmentCost: 1.2,
          consequences: [
            { type: 'trust', impact: -20, description: 'Employees see cover-up, not accountability' },
            { type: 'engagement', impact: -15, description: 'Cynicism about leadership commitment' },
            { type: 'retention', impact: -10, description: 'Affected employees don\'t feel heard' },
            { type: 'innovation', impact: 10, description: 'Client relationships preserved' },
          ],
          cultureMessage: 'We protect our business interests while managing issues quietly',
        },
        {
          id: 'opt4',
          title: 'Additional Investigation',
          description: 'Commission external review to ensure thoroughness. Delay action pending complete findings. Implement interim monitoring measures.',
          approach: 'reactive',
          investmentCost: 0.5,
          consequences: [
            { type: 'trust', impact: -30, description: 'Seen as delay tactic and protection of executive' },
            { type: 'engagement', impact: -25, description: 'Employees lose faith in HR process' },
            { type: 'retention', impact: -20, description: 'Key employees begin job searching' },
            { type: 'diversity', impact: -15, description: 'Underrepresented groups particularly impacted' },
          ],
          cultureMessage: 'We need more information before acting',
        },
      ],
      timeframe: 'Board meeting in 10 days',
    },
  },
  3: {
    briefing: `DIVERSITY & INCLUSION CROSSROADS

Your annual diversity report reveals troubling patterns:

- Women represent 47% of entry-level but only 12% of senior leadership
- Underrepresented minorities at 8% vs. 15% industry benchmark
- Pay equity audit shows 7% unexplained gap
- Promotion rates for diverse candidates 40% lower than peers
- ERG feedback indicates "diversity fatigue" with lack of real change

External pressure mounting: ESG investors questioning D&I metrics, potential customer RFPs requiring diversity commitments, social media attention on industry practices.

The board wants a D&I transformation plan. Employee skepticism is high after years of "initiatives" without results.`,
    challenge: {
      id: 'challenge-3-diversity',
      title: 'Beyond Performative D&I',
      description: 'You must develop a credible diversity and inclusion strategy that addresses systemic barriers while managing expectations from skeptical employees, demanding investors, and executives concerned about operational impact. Past initiatives have created cynicism; this time must be different.',
      category: 'diversity',
      urgency: 'high',
      insights: [
        { id: 'i1', type: 'data', title: 'Pipeline Analysis', finding: 'Diverse candidates drop off at each career stage', sentiment: 'negative' },
        { id: 'i2', type: 'interview', title: 'ERG Leader Feedback', finding: '"We\'re tired of being asked for input that goes nowhere"', sentiment: 'negative' },
        { id: 'i3', type: 'benchmark', title: 'Industry Comparison', finding: 'Competitors making visible D&I progress', sentiment: 'negative' },
        { id: 'i4', type: 'survey', title: 'Inclusion Index', finding: '35% of diverse employees don\'t feel they belong', sentiment: 'negative' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'Systemic Transformation',
          description: 'Mandatory diverse slates, sponsorship programs for underrepresented talent, pay equity remediation, leadership accountability metrics tied to bonus, transparent progress reporting.',
          approach: 'transformative',
          investmentCost: 4.0,
          consequences: [
            { type: 'diversity', impact: 35, description: 'Measurable improvement in representation' },
            { type: 'trust', impact: 25, description: 'Employees see real commitment' },
            { type: 'engagement', impact: 20, description: 'Inclusive culture attracts talent' },
            { type: 'retention', impact: 15, description: 'Diverse talent more likely to stay' },
          ],
          cultureMessage: 'D&I is a strategic imperative with real investment',
        },
        {
          id: 'opt2',
          title: 'Phased Improvement Plan',
          description: 'Address pay equity immediately, implement diverse hiring practices, create mentorship programs, set 3-year improvement targets with annual milestones.',
          approach: 'progressive',
          investmentCost: 2.0,
          consequences: [
            { type: 'diversity', impact: 15, description: 'Gradual improvement over time' },
            { type: 'trust', impact: 10, description: 'Cautious optimism from employees' },
            { type: 'engagement', impact: 10, description: 'Progress, but pace may frustrate some' },
            { type: 'budget', impact: -0.5, description: 'Sustainable investment level' },
          ],
          cultureMessage: 'We\'re committed to steady, sustainable progress',
        },
        {
          id: 'opt3',
          title: 'Enhanced Awareness Program',
          description: 'Expand unconscious bias training, celebrate cultural events, increase ERG funding, improve recruitment marketing, track metrics without hard targets.',
          approach: 'conservative',
          investmentCost: 0.8,
          consequences: [
            { type: 'diversity', impact: -5, description: 'Minimal structural change' },
            { type: 'trust', impact: -20, description: 'Seen as more of the same' },
            { type: 'engagement', impact: -10, description: 'Cynicism increases' },
            { type: 'retention', impact: -10, description: 'Diverse talent continues to leave' },
          ],
          cultureMessage: 'Awareness and education are the foundation of change',
        },
        {
          id: 'opt4',
          title: 'Merit-Based Messaging',
          description: 'Emphasize commitment to hiring best candidates regardless of background. Resist quotas or targets. Focus on removing bias from processes.',
          approach: 'reactive',
          investmentCost: 0.3,
          consequences: [
            { type: 'diversity', impact: -15, description: 'Status quo likely to persist' },
            { type: 'trust', impact: -30, description: 'Diverse employees feel abandoned' },
            { type: 'engagement', impact: -20, description: 'ERGs disengage' },
            { type: 'innovation', impact: -10, description: 'Homogeneous teams limit creativity' },
          ],
          cultureMessage: 'We believe in pure meritocracy',
        },
      ],
      timeframe: 'Board presentation in 30 days',
    },
  },
  4: {
    briefing: `WORKFORCE TRANSFORMATION

The CEO has announced a major digital transformation requiring significant workforce restructuring:

- 3,000 roles becoming obsolete over 18 months
- 2,000 new digital/analytics positions being created
- 60% of workforce needs significant reskilling
- Competitor just announced 15% layoffs

You must develop the people strategy for this transformation. The market is watching, employees are anxious, and the transformation timeline is aggressive.

Union representatives have requested urgent meetings. Key technical talent is already receiving recruiter calls.`,
    challenge: {
      id: 'challenge-4-transform',
      title: 'The Great Reskilling',
      description: 'You must navigate a major workforce transformation that will displace thousands while creating new opportunities. The approach you take will define the company\'s employment brand for a generation. Employees are watching whether you prioritize people or pure efficiency.',
      category: 'transformation',
      urgency: 'high',
      insights: [
        { id: 'i1', type: 'data', title: 'Skills Gap Analysis', finding: '42% of affected employees have adjacent skills for reskilling', sentiment: 'positive' },
        { id: 'i2', type: 'interview', title: 'Manager Sentiment', finding: 'Anxiety high but willingness to support transitions', sentiment: 'neutral' },
        { id: 'i3', type: 'benchmark', title: 'Industry Approaches', finding: 'Leaders invest $2,500-5,000 per employee in reskilling', sentiment: 'neutral' },
        { id: 'i4', type: 'survey', title: 'Employee Concerns', finding: 'Top worry: "Will I have a job in 2 years?"', sentiment: 'negative' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'People-First Transformation',
          description: 'Guarantee no involuntary layoffs for employees who engage in reskilling. Invest $5,000/employee in development. Extended transition timelines. Enhanced severance for voluntary departures.',
          approach: 'transformative',
          investmentCost: 5.0,
          consequences: [
            { type: 'trust', impact: 40, description: 'Employees trust company has their back' },
            { type: 'engagement', impact: 30, description: 'Workforce embraces change' },
            { type: 'retention', impact: 25, description: 'Top talent stays through transition' },
            { type: 'innovation', impact: 20, description: 'Engaged workforce drives transformation' },
          ],
          cultureMessage: 'Our people are worth investing in through change',
        },
        {
          id: 'opt2',
          title: 'Balanced Transition Program',
          description: 'Reskilling opportunities for high-potential employees, standard severance for displaced roles, internal job posting preference, 12-month transition support services.',
          approach: 'progressive',
          investmentCost: 2.5,
          consequences: [
            { type: 'trust', impact: 10, description: 'Reasonable approach appreciated' },
            { type: 'engagement', impact: 5, description: 'Uncertainty remains but manageable' },
            { type: 'retention', impact: 5, description: 'Some attrition during transition' },
            { type: 'diversity', impact: -10, description: 'Restructuring may impact diverse employees disproportionately' },
          ],
          cultureMessage: 'We support our people within business constraints',
        },
        {
          id: 'opt3',
          title: 'Efficiency-Focused Restructure',
          description: 'Targeted layoffs for obsolete roles, limited reskilling for critical positions, standard severance, rapid timeline to capture savings.',
          approach: 'conservative',
          investmentCost: 1.0,
          consequences: [
            { type: 'trust', impact: -25, description: 'Employees feel expendable' },
            { type: 'engagement', impact: -30, description: 'Survivors guilt and fear' },
            { type: 'retention', impact: -20, description: 'Top talent accelerates departure' },
            { type: 'innovation', impact: -15, description: 'Risk-averse culture emerges' },
          ],
          cultureMessage: 'Business realities require difficult decisions',
        },
        {
          id: 'opt4',
          title: 'Outsourcing Solution',
          description: 'Transfer affected employees to outsourcing partner who will manage transition. Reduces company liability and complexity. Quick execution.',
          approach: 'reactive',
          investmentCost: 0.5,
          consequences: [
            { type: 'trust', impact: -40, description: 'Seen as abandonment of employees' },
            { type: 'engagement', impact: -35, description: 'Remaining workforce deeply demoralized' },
            { type: 'retention', impact: -30, description: 'Talent exodus accelerates' },
            { type: 'diversity', impact: -20, description: 'Reputation damage affects recruiting' },
          ],
          cultureMessage: 'We\'re optimizing for shareholder value',
        },
      ],
      timeframe: 'Transformation announcement in 21 days',
    },
  },
  5: {
    briefing: `CULTURE AT THE CROSSROADS - ONE YEAR REVIEW

One year into your tenure, the organization has changed significantly. Your decisions have shaped the culture in measurable ways.

Current state:
- Employee engagement trending based on your choices
- Retention metrics reflecting your approach
- D&I progress measured against commitments
- Employment brand reputation evolved

A major industry publication is preparing a feature on workplace culture transformation. They want to interview you about your philosophy and results.

Meanwhile, a top-tier competitor has approached you about their CPO role. Your success (or struggles) haven't gone unnoticed.`,
    challenge: {
      id: 'challenge-5-legacy',
      title: 'Defining Your Legacy',
      description: 'As you reflect on a year of leadership, you must decide how to position your culture transformation journey. The organization is watching whether you\'ll claim credit, acknowledge gaps, or chart a bold vision forward. Your response will set the tone for the next chapter.',
      category: 'culture',
      urgency: 'moderate',
      insights: [
        { id: 'i1', type: 'survey', title: 'Annual Engagement Survey', finding: 'Results reflect the cumulative impact of your decisions', sentiment: 'neutral' },
        { id: 'i2', type: 'data', title: 'Year-over-Year Metrics', finding: 'Quantitative evidence of culture change', sentiment: 'neutral' },
        { id: 'i3', type: 'interview', title: 'Skip-Level Feedback', finding: 'Employees have formed opinions about HR leadership', sentiment: 'neutral' },
        { id: 'i4', type: 'benchmark', title: 'External Recognition', finding: 'Industry observers evaluating your approach', sentiment: 'neutral' },
      ],
      options: [
        {
          id: 'opt1',
          title: 'Bold Vision Commitment',
          description: 'Publicly commit to ambitious 3-year transformation goals. Share lessons learned transparently. Announce expanded investment in people programs. Position as just beginning.',
          approach: 'transformative',
          investmentCost: 2.0,
          consequences: [
            { type: 'trust', impact: 25, description: 'Authenticity and ambition valued' },
            { type: 'engagement', impact: 20, description: 'Employees energized by forward vision' },
            { type: 'retention', impact: 15, description: 'Commitment to stay and see journey through' },
            { type: 'innovation', impact: 15, description: 'Culture enables risk-taking' },
          ],
          cultureMessage: 'We\'re building something meaningful for the long term',
        },
        {
          id: 'opt2',
          title: 'Balanced Progress Report',
          description: 'Share honest assessment of wins and ongoing challenges. Acknowledge employee contributions. Set realistic targets for next phase. Show learning orientation.',
          approach: 'progressive',
          investmentCost: 0.5,
          consequences: [
            { type: 'trust', impact: 15, description: 'Honesty appreciated' },
            { type: 'engagement', impact: 10, description: 'Credibility maintained' },
            { type: 'retention', impact: 10, description: 'Stability signals continuity' },
            { type: 'diversity', impact: 5, description: 'Ongoing commitment acknowledged' },
          ],
          cultureMessage: 'We\'ve made progress and have more work to do',
        },
        {
          id: 'opt3',
          title: 'Victory Lap Narrative',
          description: 'Emphasize positive metrics and successes. Downplay ongoing challenges. Position as transformation leader. Build personal brand.',
          approach: 'conservative',
          investmentCost: 0.2,
          consequences: [
            { type: 'trust', impact: -15, description: 'Employees see disconnect from reality' },
            { type: 'engagement', impact: -10, description: 'Concerns feel dismissed' },
            { type: 'retention', impact: -5, description: 'Credibility questions emerge' },
            { type: 'innovation', impact: -5, description: 'Complacency signals' },
          ],
          cultureMessage: 'We\'ve successfully transformed the culture',
        },
        {
          id: 'opt4',
          title: 'Consider Outside Opportunity',
          description: 'Explore the competitor CPO role. You\'ve established your track record. Maybe fresh start elsewhere makes sense. Start transition planning.',
          approach: 'reactive',
          investmentCost: 0,
          consequences: [
            { type: 'trust', impact: -35, description: 'Seen as abandoning before job is done' },
            { type: 'engagement', impact: -30, description: 'Employees feel leadership is transient' },
            { type: 'retention', impact: -25, description: 'Others may follow example' },
            { type: 'innovation', impact: -20, description: 'Continuity concerns affect programs' },
          ],
          cultureMessage: 'Career advancement is natural',
        },
      ],
      timeframe: 'Media interview scheduled this week',
    },
  },
};

// Helper functions
const calculateOverallScore = (metrics: CultureMetrics): number => {
  return Math.round(
    (metrics.employeeEngagement * 0.25 +
     metrics.talentRetention * 0.20 +
     metrics.diversityInclusion * 0.20 +
     metrics.leadershipTrust * 0.20 +
     metrics.innovationCulture * 0.15)
  );
};

const getSentimentColor = (sentiment: StakeholderState['sentiment']): string => {
  switch (sentiment) {
    case 'enthusiastic': return 'text-emerald-400';
    case 'positive': return 'text-green-400';
    case 'neutral': return 'text-slate-400';
    case 'concerned': return 'text-amber-400';
    case 'disengaged': return 'text-red-400';
  }
};

const getUrgencyColor = (urgency: TalentChallenge['urgency']): string => {
  switch (urgency) {
    case 'low': return 'bg-slate-600';
    case 'moderate': return 'bg-blue-600';
    case 'high': return 'bg-amber-600';
    case 'critical': return 'bg-red-600';
  }
};

const getApproachColor = (approach: ChallengeOption['approach']): string => {
  switch (approach) {
    case 'transformative': return 'border-pink-500 hover:bg-pink-950/50';
    case 'progressive': return 'border-emerald-500 hover:bg-emerald-950/50';
    case 'conservative': return 'border-amber-500 hover:bg-amber-950/50';
    case 'reactive': return 'border-red-500 hover:bg-red-950/50';
  }
};

const getInsightIcon = (type: Insight['type']): JSX.Element => {
  switch (type) {
    case 'survey':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />;
    case 'interview':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />;
    case 'data':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
    case 'benchmark':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;
  }
};

// Components
const CultureDashboard: React.FC<{ metrics: CultureMetrics }> = ({ metrics }) => {
  const overallScore = calculateOverallScore(metrics);

  return (
    <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-4">
      <h3 className="text-pink-400 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Culture Dashboard
      </h3>

      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg text-center">
        <div className="text-3xl font-bold text-pink-400">{overallScore}</div>
        <div className="text-xs text-slate-400">Overall Culture Score</div>
      </div>

      <div className="space-y-3">
        <MetricBar label="Employee Engagement" value={metrics.employeeEngagement} color="pink" />
        <MetricBar label="Talent Retention" value={metrics.talentRetention} color="violet" />
        <MetricBar label="Diversity & Inclusion" value={metrics.diversityInclusion} color="blue" />
        <MetricBar label="Leadership Trust" value={metrics.leadershipTrust} color="emerald" />
        <MetricBar label="Innovation Culture" value={metrics.innovationCulture} color="amber" />
      </div>

      <div className="mt-4 p-2 bg-pink-900/30 rounded text-center">
        <span className="text-slate-400 text-sm">HR Investment Budget: </span>
        <span className="text-pink-300 font-semibold">${metrics.hrBudget.toFixed(1)}M</span>
      </div>
    </div>
  );
};

const MetricBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={`text-${color}-400`}>{value}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`bg-${color}-500`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
};

const StakeholderPanel: React.FC<{ stakeholders: StakeholderState[] }> = ({ stakeholders }) => {
  return (
    <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-4">
      <h3 className="text-pink-400 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Workforce Stakeholders
      </h3>

      <div className="space-y-2">
        {stakeholders.map((stakeholder) => (
          <div key={stakeholder.id} className="p-2 bg-slate-900/50 rounded">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-slate-200">{stakeholder.name}</div>
                <div className="text-xs text-slate-500">{stakeholder.role}</div>
              </div>
              <span className={`text-xs capitalize ${getSentimentColor(stakeholder.sentiment)}`}>
                {stakeholder.sentiment}
              </span>
            </div>
            <div className="mt-1 flex gap-4 text-xs">
              <span className="text-slate-500">Satisfaction: <span className="text-pink-400">{stakeholder.satisfaction}%</span></span>
              <span className="text-slate-500">Influence: <span className="text-violet-400">{stakeholder.influence}%</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InsightPanel: React.FC<{ insights: Insight[] }> = ({ insights }) => {
  return (
    <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-4">
      <h3 className="text-pink-400 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        People Insights
      </h3>

      <div className="space-y-2">
        {insights.map((insight) => (
          <div key={insight.id} className="p-2 bg-slate-900/50 rounded">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getInsightIcon(insight.type)}
              </svg>
              <div className="flex-1">
                <div className="text-sm text-slate-200">{insight.title}</div>
                <div className="text-xs text-slate-400 mt-1">{insight.finding}</div>
                <div className={`text-xs mt-1 capitalize ${
                  insight.sentiment === 'positive' ? 'text-emerald-400' :
                  insight.sentiment === 'negative' ? 'text-red-400' : 'text-slate-500'
                }`}>
                  {insight.sentiment} indicator
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChallengePanel: React.FC<{
  challenge: TalentChallenge;
  onSelectOption: (option: ChallengeOption) => void;
  budget: number;
}> = ({ challenge, onSelectOption, budget }) => {
  return (
    <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-pink-400 font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          People Challenge
        </h3>
        <span className={`px-2 py-1 rounded text-xs text-white ${getUrgencyColor(challenge.urgency)}`}>
          {challenge.urgency.toUpperCase()}
        </span>
      </div>

      <div className="mb-4">
        <h4 className="text-lg text-slate-100 font-medium mb-2">{challenge.title}</h4>
        <p className="text-sm text-slate-300 mb-2">{challenge.description}</p>
        <div className="flex gap-4 text-xs">
          <span className="text-slate-500">Category: <span className="text-pink-400 capitalize">{challenge.category}</span></span>
          <span className="text-slate-500">Timeline: <span className="text-amber-400">{challenge.timeframe}</span></span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm text-slate-400 font-medium">Response Options:</h4>
        {challenge.options.map((option) => {
          const canAfford = budget >= option.investmentCost;
          return (
            <motion.button
              key={option.id}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${getApproachColor(option.approach)} ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => canAfford && onSelectOption(option)}
              whileHover={canAfford ? { scale: 1.01 } : {}}
              whileTap={canAfford ? { scale: 0.99 } : {}}
              disabled={!canAfford}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-slate-100 font-medium">{option.title}</span>
                <span className="text-xs text-pink-400">${option.investmentCost}M</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{option.description}</p>
              <div className="text-xs text-slate-500 italic">{option.cultureMessage}</div>
              {!canAfford && (
                <div className="mt-1 text-xs text-red-400">Insufficient HR budget</div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const NarrativePanel: React.FC<{ history: string[] }> = ({ history }) => {
  return (
    <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-4 max-h-64 overflow-y-auto">
      <h3 className="text-pink-400 font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Journey Log
      </h3>

      <div className="space-y-2">
        {history.map((entry, index) => (
          <motion.div
            key={index}
            className="text-xs text-slate-400 p-2 bg-slate-900/50 rounded"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {entry}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main component
export default function TalentCultureSimulation() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'intro',
    round: 1,
    totalRounds: 5,
    cultureMetrics: { ...initialMetrics },
    stakeholders: initialStakeholders.map(s => ({ ...s })),
    currentChallenge: null,
    selectedOption: null,
    narrativeHistory: [],
    finalScore: null,
  });

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Typewriter effect
  const typeText = (text: string, callback?: () => void) => {
    setIsTyping(true);
    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        callback?.();
      }
    }, 15);
  };

  // Start game
  const startGame = () => {
    setGameState(prev => ({ ...prev, phase: 'briefing' }));
  };

  // Begin round briefing
  useEffect(() => {
    if (gameState.phase === 'briefing') {
      const scenario = ROUND_SCENARIOS[gameState.round];
      if (scenario) {
        typeText(scenario.briefing, () => {
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              phase: 'situation',
              currentChallenge: scenario.challenge,
              narrativeHistory: [...prev.narrativeHistory, `Quarter ${prev.round}: ${scenario.challenge.title}`]
            }));
          }, 1000);
        });
      }
    }
  }, [gameState.phase, gameState.round]);

  // Handle option selection
  const handleOptionSelect = (option: ChallengeOption) => {
    setGameState(prev => ({
      ...prev,
      selectedOption: option,
      phase: 'decision'
    }));
  };

  // Confirm decision
  const confirmDecision = () => {
    if (!gameState.selectedOption) return;

    const option = gameState.selectedOption;
    const newMetrics = { ...gameState.cultureMetrics };
    const newStakeholders = gameState.stakeholders.map(s => ({ ...s }));
    const narrativeUpdates: string[] = [];

    // Apply consequences
    option.consequences.forEach(consequence => {
      switch (consequence.type) {
        case 'engagement':
          newMetrics.employeeEngagement = Math.max(0, Math.min(100, newMetrics.employeeEngagement + consequence.impact));
          break;
        case 'retention':
          newMetrics.talentRetention = Math.max(0, Math.min(100, newMetrics.talentRetention + consequence.impact));
          break;
        case 'diversity':
          newMetrics.diversityInclusion = Math.max(0, Math.min(100, newMetrics.diversityInclusion + consequence.impact));
          break;
        case 'trust':
          newMetrics.leadershipTrust = Math.max(0, Math.min(100, newMetrics.leadershipTrust + consequence.impact));
          // Also affect stakeholder satisfaction
          newStakeholders.forEach(s => {
            s.satisfaction = Math.max(0, Math.min(100, s.satisfaction + Math.round(consequence.impact * 0.6)));
            // Update sentiment based on satisfaction
            if (s.satisfaction >= 75) s.sentiment = 'enthusiastic';
            else if (s.satisfaction >= 60) s.sentiment = 'positive';
            else if (s.satisfaction >= 45) s.sentiment = 'neutral';
            else if (s.satisfaction >= 30) s.sentiment = 'concerned';
            else s.sentiment = 'disengaged';
          });
          break;
        case 'innovation':
          newMetrics.innovationCulture = Math.max(0, Math.min(100, newMetrics.innovationCulture + consequence.impact));
          break;
        case 'budget':
          newMetrics.hrBudget = Math.max(0, newMetrics.hrBudget + consequence.impact);
          break;
      }
      narrativeUpdates.push(consequence.description);
    });

    // Deduct investment cost
    newMetrics.hrBudget = Math.max(0, newMetrics.hrBudget - option.investmentCost);

    setGameState(prev => ({
      ...prev,
      cultureMetrics: newMetrics,
      stakeholders: newStakeholders,
      narrativeHistory: [...prev.narrativeHistory, `Decision: ${option.title}`, ...narrativeUpdates],
      phase: 'consequence'
    }));

    // Show consequences then move to round end
    setTimeout(() => {
      setGameState(prev => ({ ...prev, phase: 'round-end' }));
    }, 2000);
  };

  // Advance to next round or end game
  const advanceRound = () => {
    if (gameState.round >= gameState.totalRounds) {
      const finalScore = calculateOverallScore(gameState.cultureMetrics);
      setGameState(prev => ({
        ...prev,
        phase: 'game-over',
        finalScore
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        round: prev.round + 1,
        phase: 'briefing',
        currentChallenge: null,
        selectedOption: null
      }));
    }
  };

  // Restart game
  const restartGame = () => {
    setGameState({
      phase: 'intro',
      round: 1,
      totalRounds: 5,
      cultureMetrics: { ...initialMetrics },
      stakeholders: initialStakeholders.map(s => ({ ...s })),
      currentChallenge: null,
      selectedOption: null,
      narrativeHistory: [],
      finalScore: null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-pink-950/30 to-slate-950">
      {/* Header */}
      <header className="border-b border-pink-900/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back to Simulations</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-slate-500">Quarter </span>
              <span className="text-pink-400 font-semibold">{gameState.round}</span>
              <span className="text-slate-500"> of </span>
              <span className="text-pink-400 font-semibold">{gameState.totalRounds}</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <div className="text-sm">
              <span className="text-slate-500">Culture Score: </span>
              <span className="text-pink-400 font-semibold">{calculateOverallScore(gameState.cultureMetrics)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Intro Phase */}
          {gameState.phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-pink-900/50 flex items-center justify-center">
                <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              <h1 className="text-4xl font-bold text-slate-100 mb-4">Talent & Culture</h1>
              <p className="text-xl text-pink-400 mb-8">Shape the Future of Work and Build Winning Organizations</p>

              <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-6 mb-8 text-left">
                <h2 className="text-lg text-slate-200 font-semibold mb-4">Your Role: Chief People Officer</h2>
                <p className="text-slate-400 mb-4">
                  You are the newly appointed CPO of GlobalTech Industries, a company facing a culture crisis.
                  Engagement is at historic lows, top talent is fleeing, and diversity goals remain unmet. The
                  CEO has given you a mandate: transform the culture or risk losing the talent war.
                </p>

                <h3 className="text-md text-slate-300 font-medium mb-2">Your Responsibilities:</h3>
                <ul className="text-slate-400 space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span>Drive employee engagement and build a high-performance culture</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span>Retain and develop top talent in a competitive market</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span>Champion diversity, equity, and inclusion with real results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 mt-1">•</span>
                    <span>Navigate workforce transformation while maintaining trust</span>
                  </li>
                </ul>

                <div className="p-3 bg-pink-900/30 rounded-lg">
                  <p className="text-sm text-pink-300 italic">
                    "Culture is not just one aspect of the game - it is the game. In the end, an organization
                    is nothing more than the collective capacity of its people to create value."
                  </p>
                </div>
              </div>

              <motion.button
                onClick={startGame}
                className="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Begin Your Journey
              </motion.button>
            </motion.div>
          )}

          {/* Briefing Phase */}
          {gameState.phase === 'briefing' && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-pink-900/50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg text-slate-200 font-semibold">CPO Briefing</h2>
                    <p className="text-xs text-slate-500">Quarter {gameState.round} Situation Report</p>
                  </div>
                </div>

                <div className="font-mono text-sm text-pink-300 whitespace-pre-wrap leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">▋</span>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Situation & Decision Phases */}
          {(gameState.phase === 'situation' || gameState.phase === 'decision') && gameState.currentChallenge && (
            <motion.div
              key="situation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left column - Metrics & Stakeholders */}
              <div className="space-y-6">
                <CultureDashboard metrics={gameState.cultureMetrics} />
                <StakeholderPanel stakeholders={gameState.stakeholders} />
              </div>

              {/* Center column - Challenge */}
              <div className="lg:col-span-1">
                {gameState.phase === 'situation' && (
                  <ChallengePanel
                    challenge={gameState.currentChallenge}
                    onSelectOption={handleOptionSelect}
                    budget={gameState.cultureMetrics.hrBudget}
                  />
                )}

                {gameState.phase === 'decision' && gameState.selectedOption && (
                  <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-4">
                    <h3 className="text-pink-400 font-semibold mb-3">Confirm Decision</h3>
                    <div className="p-4 bg-slate-900/50 rounded-lg mb-4">
                      <h4 className="text-lg text-slate-100 font-medium mb-2">{gameState.selectedOption.title}</h4>
                      <p className="text-sm text-slate-400 mb-3">{gameState.selectedOption.description}</p>
                      <div className="text-xs text-slate-500">
                        Investment: <span className="text-pink-400">${gameState.selectedOption.investmentCost}M</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm text-slate-400 mb-2">Expected Impact:</h4>
                      <ul className="space-y-1">
                        {gameState.selectedOption.consequences.map((c, i) => (
                          <li key={i} className={`text-xs ${c.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {c.impact >= 0 ? '+' : ''}{c.impact}% {c.type}: {c.description}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setGameState(prev => ({ ...prev, phase: 'situation', selectedOption: null }))}
                        className="flex-1 py-2 border border-slate-600 text-slate-400 rounded hover:bg-slate-700 transition-colors"
                      >
                        Reconsider
                      </button>
                      <button
                        onClick={confirmDecision}
                        className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Insights & Narrative */}
              <div className="space-y-6">
                <InsightPanel insights={gameState.currentChallenge.insights} />
                <NarrativePanel history={gameState.narrativeHistory} />
              </div>
            </motion.div>
          )}

          {/* Consequence Phase */}
          {gameState.phase === 'consequence' && (
            <motion.div
              key="consequence"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto text-center py-12"
            >
              <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-900/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-pink-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl text-slate-200 font-semibold mb-2">Implementing Changes...</h2>
                <p className="text-slate-400">Measuring workforce impact and cultural shifts</p>
              </div>
            </motion.div>
          )}

          {/* Round End Phase */}
          {gameState.phase === 'round-end' && (
            <motion.div
              key="round-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto py-12"
            >
              <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-8 text-center">
                <h2 className="text-2xl text-slate-200 font-semibold mb-4">Quarter {gameState.round} Complete</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="text-3xl font-bold text-pink-400">{calculateOverallScore(gameState.cultureMetrics)}</div>
                    <div className="text-xs text-slate-500">Culture Score</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="text-3xl font-bold text-emerald-400">${gameState.cultureMetrics.hrBudget.toFixed(1)}M</div>
                    <div className="text-xs text-slate-500">Remaining Budget</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm text-slate-400 mb-2">Metrics Summary:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-left">
                      <span className="text-slate-500">Engagement:</span>
                      <span className="text-pink-400 ml-2">{gameState.cultureMetrics.employeeEngagement}%</span>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500">Retention:</span>
                      <span className="text-violet-400 ml-2">{gameState.cultureMetrics.talentRetention}%</span>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500">D&I Progress:</span>
                      <span className="text-blue-400 ml-2">{gameState.cultureMetrics.diversityInclusion}%</span>
                    </div>
                    <div className="text-left">
                      <span className="text-slate-500">Leadership Trust:</span>
                      <span className="text-emerald-400 ml-2">{gameState.cultureMetrics.leadershipTrust}%</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={advanceRound}
                  className="px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {gameState.round >= gameState.totalRounds ? 'View Final Assessment' : 'Continue to Next Quarter'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Game Over Phase */}
          {gameState.phase === 'game-over' && (
            <motion.div
              key="game-over"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto py-12"
            >
              <div className="bg-slate-800/80 rounded-lg border border-pink-900/50 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl text-slate-200 font-bold mb-2">Culture Transformation Complete</h2>
                  <p className="text-slate-400">Your leadership has shaped the organization's future</p>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-600 to-violet-600 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">{gameState.finalScore}</div>
                      <div className="text-xs text-pink-200">Final Score</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-pink-400">{gameState.cultureMetrics.employeeEngagement}%</div>
                    <div className="text-xs text-slate-500">Employee Engagement</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-violet-400">{gameState.cultureMetrics.talentRetention}%</div>
                    <div className="text-xs text-slate-500">Talent Retention</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{gameState.cultureMetrics.diversityInclusion}%</div>
                    <div className="text-xs text-slate-500">Diversity & Inclusion</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-emerald-400">{gameState.cultureMetrics.leadershipTrust}%</div>
                    <div className="text-xs text-slate-500">Leadership Trust</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-amber-400">{gameState.cultureMetrics.innovationCulture}%</div>
                    <div className="text-xs text-slate-500">Innovation Culture</div>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-rose-400">${gameState.cultureMetrics.hrBudget.toFixed(1)}M</div>
                    <div className="text-xs text-slate-500">Budget Remaining</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/50 rounded-lg mb-6">
                  <h3 className="text-sm text-pink-400 font-semibold mb-2">Leadership Assessment:</h3>
                  <p className="text-sm text-slate-300">
                    {gameState.finalScore !== null && gameState.finalScore >= 80
                      ? "Exceptional people leadership. You've built a culture where employees thrive, diversity flourishes, and trust enables innovation. Your organization is now an employer of choice, attracting top talent and outperforming competitors through engaged, committed teams."
                      : gameState.finalScore !== null && gameState.finalScore >= 60
                      ? "Solid culture-building with clear progress. Your balanced approach has improved engagement and retention while making meaningful strides on inclusion. The organization is healthier than when you started, though continued investment will be needed to sustain gains."
                      : gameState.finalScore !== null && gameState.finalScore >= 40
                      ? "Mixed results with concerning gaps. While some initiatives succeeded, inconsistent commitment to people has created skepticism. Employee trust is fragile, and competitors are actively recruiting your talent. A renewed focus on culture is urgently needed."
                      : "Significant culture challenges remain. Decisions that prioritized short-term efficiency over people investment have damaged trust and engagement. The organization faces a talent crisis that will require substantial effort to reverse. Consider whether your approach aligns with sustainable success."}
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={restartGame}
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Try Different Approach
                  </motion.button>
                  <Link href="/">
                    <motion.button
                      className="px-6 py-3 border border-pink-600 text-pink-400 hover:bg-pink-950 font-semibold rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Return to Simulations
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
