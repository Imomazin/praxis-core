/**
 * Praxis Simulation Engine - Core Types
 *
 * This file defines all TypeScript types for the simulation state,
 * decisions, events, and scoring system.
 */

// =============================================================================
// ROLE TYPES
// =============================================================================

export type Role =
  | 'strategy'
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'rnd'
  | 'legal'
  | 'gm';

export const ROLES: Role[] = [
  'strategy',
  'marketing',
  'sales',
  'operations',
  'rnd',
  'legal',
  'gm'
];

export const ROLE_LABELS: Record<Role, string> = {
  strategy: 'Strategy',
  marketing: 'Marketing',
  sales: 'Sales',
  operations: 'Operations',
  rnd: 'R&D',
  legal: 'Legal & Regulatory',
  gm: 'General Management',
};

// =============================================================================
// DECISION TYPES (per role)
// =============================================================================

export type RiskPosture = 'conservative' | 'balanced' | 'aggressive';
export type MarketRegion = 'regionA' | 'regionB' | 'regionC';
export type Positioning = 'trust-first' | 'value-first' | 'innovation-first';
export type ChannelMix = 'paid' | 'partner' | 'community';
export type SupplierStrategy = 'single-source' | 'dual-source' | 'diversified';
export type DeliverySpeed = 'fast' | 'balanced' | 'stable';
export type RoadmapFocus = 'features' | 'reliability' | 'privacy-security';
export type ReleaseCadence = 'fast' | 'balanced' | 'cautious';
export type PolicyStrictness = 'tight' | 'balanced' | 'loose';
export type DataHandling = 'minimal' | 'standard' | 'expansive';
export type HiringPlan = 'grow' | 'maintain' | 'cut';
export type OrgDesign = 'centralized' | 'hybrid' | 'decentralized';
export type CrisisResponse = 'transparent' | 'defensive' | 'aggressive';

export interface StrategyDecision {
  riskPosture: RiskPosture;
  capitalAllocation: {
    rnd: number;      // percentage 0-100
    marketing: number;
    operations: number;
    compliance: number;
  };
  marketEntry: MarketRegion;
}

export interface MarketingDecision {
  campaignSpend: number;        // in millions
  pricingChangePct: number;     // -50 to +50
  positioning: Positioning;
  channelMix: ChannelMix;
}

export interface SalesDecision {
  enterpriseFocus: number;      // 0-100 (vs SMB)
  discountingPolicy: number;    // 0-30 max discount %
  partnerProgramInvestment: number;
  pipelineHygiene: number;      // 0-100 effort level
}

export interface OperationsDecision {
  capacityInvestment: number;   // in millions
  supplierStrategy: SupplierStrategy;
  qaInvestment: number;         // in millions
  deliverySpeed: DeliverySpeed;
}

export interface RnDDecision {
  roadmapFocus: RoadmapFocus;
  releaseCadence: ReleaseCadence;
  modelQualityInvestment: number;   // in millions
  experimentationBudget: number;    // in millions
}

export interface LegalDecision {
  complianceSpend: number;      // in millions
  policyStrictness: PolicyStrictness;
  auditReadiness: number;       // 0-100 effort
  dataHandling: DataHandling;
}

export interface GMDecision {
  hiringPlan: HiringPlan;
  orgDesign: OrgDesign;
  cultureInvestment: number;    // in millions
  crisisResponse: CrisisResponse;
}

export interface RoundDecisions {
  strategy?: StrategyDecision;
  marketing?: MarketingDecision;
  sales?: SalesDecision;
  operations?: OperationsDecision;
  rnd?: RnDDecision;
  legal?: LegalDecision;
  gm?: GMDecision;
}

// =============================================================================
// STATE TYPES
// =============================================================================

export interface CompanyState {
  cash: number;                 // in millions
  revenue: number;              // in millions per quarter
  costs: number;                // in millions per quarter
  profit: number;               // revenue - costs
  runwayMonths: number;         // cash / monthly burn
  headcount: number;
  morale: number;               // 0-100
  techDebt: number;             // 0-100 (higher = worse)
  productQuality: number;       // 0-100
  brandTrust: number;           // 0-100
  compliancePosture: number;    // 0-100
  salesPipeline: number;        // in millions
  churn: number;                // 0-100 percentage
}

export interface MarketState {
  demandIndex: number;          // 0-200 (100 = baseline)
  priceIndex: number;           // 0-200 (100 = baseline)
  competitionIntensity: number; // 0-100
  regulationScrutiny: number;   // 0-100
  channelFriction: number;      // 0-100
  supplyShockRisk: number;      // 0-100
  sentiment: number;            // -100 to +100
}

export interface RiskProfile {
  operational: number;          // 0-100
  regulatory: number;           // 0-100
  reputational: number;         // 0-100
  financial: number;            // 0-100
}

export interface Scorecard {
  financialHealth: number;      // 0-100
  growth: number;               // 0-100
  trust: number;                // 0-100
  resilience: number;           // 0-100
  execution: number;            // 0-100
  totalScore: number;           // 0-500
  boardConfidence: string;      // narrative
  regulatoryHeat: string;       // narrative
}

// =============================================================================
// EVENT TYPES
// =============================================================================

export type EventType =
  | 'regulator_inquiry'
  | 'competitor_price_war'
  | 'data_incident_rumor'
  | 'supply_disruption'
  | 'viral_positive_review'
  | 'enterprise_rfp'
  | 'macro_downturn';

export interface GameEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  round: number;
  effects: Partial<{
    company: Partial<CompanyState>;
    market: Partial<MarketState>;
    risk: Partial<RiskProfile>;
  }>;
  resolved: boolean;
}

export const EVENT_DEFINITIONS: Record<EventType, { name: string; description: string }> = {
  regulator_inquiry: {
    name: 'Regulatory Inquiry',
    description: 'Regulators have opened an inquiry into your AI practices.'
  },
  competitor_price_war: {
    name: 'Competitor Price War',
    description: 'A major competitor has slashed prices by 30%.'
  },
  data_incident_rumor: {
    name: 'Data Incident Rumor',
    description: 'Social media is buzzing about a potential data breach.'
  },
  supply_disruption: {
    name: 'Supply Chain Disruption',
    description: 'Key infrastructure provider experiencing outages.'
  },
  viral_positive_review: {
    name: 'Viral Positive Review',
    description: 'An influential analyst published a glowing review.'
  },
  enterprise_rfp: {
    name: 'Enterprise RFP Opportunity',
    description: 'Fortune 500 company seeking AI solutions partner.'
  },
  macro_downturn: {
    name: 'Market Downturn',
    description: 'Economic indicators signal reduced enterprise spending.'
  },
};

// =============================================================================
// NARRATIVE TYPES
// =============================================================================

export interface NarrativeEntry {
  id: string;
  round: number;
  category: 'decision' | 'event' | 'outcome' | 'warning' | 'achievement';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  metrics?: string[];  // which metrics were affected
}

// =============================================================================
// GAME STATE
// =============================================================================

export type GamePhase =
  | 'decisions_open'
  | 'decisions_locked'
  | 'resolving'
  | 'report';

export interface GameState {
  // Identity
  runId: string;
  teamId: string;
  scenarioKey: string;
  seed: number;

  // Progress
  round: number;              // 1-8
  maxRounds: number;          // typically 8
  phase: GamePhase;

  // Core state
  company: CompanyState;
  market: MarketState;
  risk: RiskProfile;
  scorecard: Scorecard;

  // History
  decisions: RoundDecisions[];        // index = round - 1
  events: GameEvent[];
  narrative: NarrativeEntry[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface DecideRequest {
  runId: string;
  teamId: string;
  round: number;
  role: Role;
  decision: unknown;  // validated by Zod per role
}

export interface AdvanceRequest {
  runId: string;
  teamId: string;
}

export interface ResetRequest {
  runId: string;
  teamId: string;
}

export interface SeedRequest {
  runId: string;
  seed: number;
}

export interface ExportFormat {
  format: 'json' | 'csv' | 'md';
}
