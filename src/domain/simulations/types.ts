/**
 * Praxis Business Simulation Suite - Comprehensive Type Definitions
 *
 * Six flagship simulations benchmarked against:
 * - Advantex/Capsim (financial realism)
 * - Edumundo/Marketplace (competitive dynamics)
 * - Harvard Business Publishing (narrative rigor)
 * - McKinsey war-gaming (strategic tradeoffs)
 */

// =============================================================================
// SHARED TYPES
// =============================================================================

export type SimulationId =
  | 'strategic-leadership'
  | 'market-dynamics'
  | 'financial-acumen'
  | 'operations-excellence'
  | 'sales-mastery'
  | 'innovation-lab';

export type Difficulty = 'standard' | 'advanced' | 'expert';
export type GamePhase = 'briefing' | 'decisions' | 'processing' | 'debrief' | 'complete';

export interface SimulationMeta {
  id: SimulationId;
  title: string;
  subtitle: string;
  coreFantasy: string;
  narrativeWorld: string[];
  difficulty: Difficulty;
  estimatedDuration: string;
  minPlayers: number;
  maxPlayers: number;
  rounds: number;
  targetAudience: string[];
  learningOutcomes: string[];
  tags: string[];
}

export interface BaseGameState {
  simulationId: SimulationId;
  sessionId: string;
  teamId: string;
  round: number;
  maxRounds: number;
  phase: GamePhase;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// SIMULATION 1: STRATEGIC LEADERSHIP
// =============================================================================

export type StrategicLeadershipRole =
  | 'ceo'
  | 'cfo'
  | 'coo'
  | 'chief-legal'
  | 'chief-people';

export const STRATEGIC_LEADERSHIP_ROLES: Record<StrategicLeadershipRole, { title: string; description: string }> = {
  'ceo': {
    title: 'CEO / Strategy Lead',
    description: 'Sets corporate direction, manages board relations, and owns the narrative'
  },
  'cfo': {
    title: 'Chief Financial Officer',
    description: 'Controls capital allocation, investor relations, and financial sustainability'
  },
  'coo': {
    title: 'Chief Operating Officer',
    description: 'Oversees execution, operational efficiency, and cross-functional alignment'
  },
  'chief-legal': {
    title: 'Chief Legal & Compliance',
    description: 'Manages regulatory risk, governance posture, and ethical boundaries'
  },
  'chief-people': {
    title: 'Chief People Officer',
    description: 'Owns talent strategy, culture, and organizational health'
  },
};

export interface BoardMember {
  id: string;
  name: string;
  archetype: 'activist' | 'conservative' | 'growth-focused' | 'governance-hawk';
  patience: number; // 0-100
  concerns: string[];
  votingPower: number;
}

export interface StrategicLeadershipState extends BaseGameState {
  simulationId: 'strategic-leadership';

  // Core metrics
  boardConfidence: number; // 0-100, below 30 = CEO fired
  internalAlignment: number; // 0-100, political friction
  reputationScore: number; // 0-100, with memory decay
  shareholderValue: number; // indexed to 100

  // Financial position
  marketCap: number; // in billions
  revenue: number; // quarterly in millions
  operatingMargin: number; // percentage
  cashReserves: number; // in millions
  debtRatio: number; // percentage

  // Stakeholder health
  employeeMorale: number; // 0-100
  investorSentiment: number; // -100 to +100
  regulatorScrutiny: number; // 0-100
  mediaPerception: number; // -100 to +100

  // Strategic position
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  innovationIndex: number; // 0-100
  sustainabilityRating: string; // A+ to F

  // Board dynamics
  board: BoardMember[];
  pendingBoardMotions: string[];

  // Memory/consequences
  reputationMemory: Array<{
    round: number;
    event: string;
    impact: number;
    decayRate: number;
  }>;

  // Crisis state
  activeCrisis: {
    id: string;
    name: string;
    severity: 'minor' | 'moderate' | 'severe' | 'existential';
    roundsActive: number;
    mediaAttention: number;
  } | null;
}

export interface StrategicLeadershipDecision {
  role: StrategicLeadershipRole;

  // CEO decisions
  strategicDirection?: 'growth' | 'consolidation' | 'transformation' | 'harvest';
  capitalAllocation?: {
    rnd: number;
    marketing: number;
    operations: number;
    mna: number;
    dividends: number;
  };
  riskAppetite?: 'conservative' | 'moderate' | 'aggressive';
  crisisResponse?: 'transparent' | 'defensive' | 'aggressive' | 'silent';

  // CFO decisions
  financingStrategy?: 'equity' | 'debt' | 'hybrid' | 'organic';
  costReduction?: number; // percentage target
  investorMessaging?: 'optimistic' | 'measured' | 'cautious';
  dividendPolicy?: 'increase' | 'maintain' | 'reduce' | 'suspend';

  // COO decisions
  operationalFocus?: 'efficiency' | 'quality' | 'speed' | 'flexibility';
  restructuring?: 'none' | 'minor' | 'major' | 'transformation';
  supplierStrategy?: 'consolidate' | 'diversify' | 'insource';

  // Legal decisions
  compliancePosture?: 'minimum' | 'standard' | 'proactive' | 'industry-leading';
  regulatoryEngagement?: 'reactive' | 'cooperative' | 'proactive';
  litigationApproach?: 'settle' | 'defend' | 'countersue';

  // People decisions
  talentStrategy?: 'acquire' | 'develop' | 'retain' | 'restructure';
  compensationPhilosophy?: 'below-market' | 'market' | 'above-market';
  cultureInitiative?: string;
}

// =============================================================================
// SIMULATION 2: MARKET DYNAMICS
// =============================================================================

export type MarketDynamicsRole =
  | 'marketing-lead'
  | 'sales-lead'
  | 'strategy-lead'
  | 'product-lead';

export const MARKET_DYNAMICS_ROLES: Record<MarketDynamicsRole, { title: string; description: string }> = {
  'marketing-lead': {
    title: 'Marketing Lead',
    description: 'Owns brand positioning, campaigns, and market perception'
  },
  'sales-lead': {
    title: 'Sales Lead',
    description: 'Drives revenue, manages channels, and owns customer relationships'
  },
  'strategy-lead': {
    title: 'Strategy Lead',
    description: 'Sets competitive direction, market entry, and portfolio decisions'
  },
  'product-lead': {
    title: 'Product Lead',
    description: 'Manages product roadmap, features, and market fit'
  },
};

export interface MarketSegment {
  id: string;
  name: string;
  size: number; // total addressable market
  growthRate: number;
  priceElasticity: number;
  brandSensitivity: number;
  qualitySensitivity: number;
  loyaltyFactor: number;
}

export interface Competitor {
  id: string;
  name: string;
  marketShare: number;
  brandStrength: number;
  pricePosition: 'premium' | 'value' | 'budget';
  aggressiveness: number; // 0-100
  financialStrength: number;
}

export interface MarketDynamicsState extends BaseGameState {
  simulationId: 'market-dynamics';

  // Market position
  marketShare: number; // percentage
  brandEquity: number; // 0-100, slow-moving
  mindShare: number; // 0-100, awareness
  pricePosition: number; // index vs market average (100 = market)

  // Revenue metrics
  revenue: number; // quarterly
  unitsSold: number;
  averageSellingPrice: number;
  grossMargin: number;

  // Customer metrics
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  netPromoterScore: number; // -100 to +100
  churnRate: number; // percentage

  // Market dynamics
  marketSegments: MarketSegment[];
  competitors: Competitor[];
  totalMarketSize: number;
  marketGrowthRate: number;

  // Price war detection
  priceWarActive: boolean;
  priceWarIntensity: number; // 0-100
  priceWarRoundsRemaining: number;

  // Channel health
  channels: {
    direct: { share: number; margin: number; satisfaction: number };
    retail: { share: number; margin: number; satisfaction: number };
    online: { share: number; margin: number; satisfaction: number };
    partner: { share: number; margin: number; satisfaction: number };
  };
}

export interface MarketDynamicsDecision {
  role: MarketDynamicsRole;

  // Pricing
  priceChange?: number; // percentage -50 to +50
  promotionalDiscount?: number; // percentage
  bundlingStrategy?: 'none' | 'value' | 'premium';

  // Marketing
  marketingBudget?: number; // in millions
  campaignFocus?: 'awareness' | 'consideration' | 'conversion' | 'retention';
  positioning?: 'trust-first' | 'value-first' | 'innovation-first' | 'service-first';
  channelMix?: {
    digital: number;
    traditional: number;
    partner: number;
    events: number;
  };

  // Sales
  salesInvestment?: number;
  territoryExpansion?: string[];
  channelPriority?: 'direct' | 'retail' | 'online' | 'partner';
  accountFocus?: 'enterprise' | 'mid-market' | 'smb' | 'balanced';

  // Product
  featureInvestment?: number;
  qualityFocus?: number; // 0-100
  newProductLaunch?: boolean;
  productRetirement?: string[];

  // Strategy
  competitiveResponse?: 'ignore' | 'match' | 'undercut' | 'differentiate';
  marketEntryDecision?: string; // segment ID
  segmentExit?: string; // segment ID
}

// =============================================================================
// SIMULATION 3: FINANCIAL ACUMEN
// =============================================================================

export type FinancialAcumenRole =
  | 'cfo'
  | 'finance-director'
  | 'strategy-lead'
  | 'risk-officer';

export const FINANCIAL_ACUMEN_ROLES: Record<FinancialAcumenRole, { title: string; description: string }> = {
  'cfo': {
    title: 'Chief Financial Officer',
    description: 'Owns financial strategy, capital structure, and investor relations'
  },
  'finance-director': {
    title: 'Finance Director',
    description: 'Manages working capital, treasury, and financial operations'
  },
  'strategy-lead': {
    title: 'Strategy Lead',
    description: 'Drives investment decisions, M&A, and portfolio strategy'
  },
  'risk-officer': {
    title: 'Chief Risk Officer',
    description: 'Manages financial risk, hedging, and stress testing'
  },
};

export interface InvestmentProject {
  id: string;
  name: string;
  type: 'expansion' | 'maintenance' | 'innovation' | 'acquisition';
  requiredCapital: number;
  expectedNPV: number;
  irr: number;
  paybackPeriod: number; // years
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  probabilityOfSuccess: number;
  cashFlowProfile: number[]; // by year
}

export interface FinancialAcumenState extends BaseGameState {
  simulationId: 'financial-acumen';

  // Balance sheet
  totalAssets: number;
  currentAssets: number;
  fixedAssets: number;
  totalLiabilities: number;
  currentLiabilities: number;
  longTermDebt: number;
  shareholderEquity: number;

  // Cash position (CRITICAL)
  cashBalance: number;
  cashBurnRate: number; // monthly
  cashRunway: number; // months
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;

  // Profitability
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  ebitda: number;

  // Capital structure
  debtToEquity: number;
  interestCoverage: number;
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D';
  costOfDebt: number; // percentage
  costOfEquity: number; // percentage
  wacc: number; // weighted average cost of capital

  // Investor metrics
  earningsPerShare: number;
  priceToEarnings: number;
  dividendYield: number;
  bookValue: number;
  marketCap: number;

  // Risk metrics
  valueAtRisk: number; // 95% confidence
  currencyExposure: number;
  commodityExposure: number;
  interestRateExposure: number;

  // Available projects
  investmentPipeline: InvestmentProject[];
  activeInvestments: Array<InvestmentProject & { yearStarted: number; actualProgress: number }>;

  // Economic environment
  economicCycle: 'expansion' | 'peak' | 'contraction' | 'trough';
  inflationRate: number;
  interestRateEnvironment: number;
  currencyStrength: number; // index

  // Stress indicators
  bankruptcyRisk: number; // 0-100
  liquidityStress: boolean;
  covenantBreach: boolean;
}

export interface FinancialAcumenDecision {
  role: FinancialAcumenRole;

  // Capital structure
  debtIssuance?: number;
  equityIssuance?: number;
  debtRepayment?: number;
  shareRepurchase?: number;

  // Investment
  projectApprovals?: string[]; // project IDs
  projectCancellations?: string[];
  capitalExpenditureLimit?: number;

  // Working capital
  inventoryTarget?: number; // days
  receivablesTarget?: number; // days
  payablesTarget?: number; // days
  cashReserveTarget?: number;

  // Risk management
  currencyHedgeRatio?: number;
  commodityHedgeRatio?: number;
  interestRateHedge?: 'fixed' | 'floating' | 'mixed';

  // Dividend/returns
  dividendPerShare?: number;
  dividendChange?: 'increase' | 'maintain' | 'decrease' | 'suspend';

  // Cost management
  costReductionTarget?: number; // percentage
  headcountChange?: number;
  capexFreeze?: boolean;
}

// =============================================================================
// SIMULATION 4: OPERATIONS EXCELLENCE
// =============================================================================

export type OperationsRole =
  | 'operations-lead'
  | 'supply-chain-manager'
  | 'quality-director'
  | 'finance-liaison';

export const OPERATIONS_ROLES: Record<OperationsRole, { title: string; description: string }> = {
  'operations-lead': {
    title: 'Operations Lead',
    description: 'Owns production capacity, efficiency, and operational strategy'
  },
  'supply-chain-manager': {
    title: 'Supply Chain Manager',
    description: 'Manages suppliers, logistics, and inventory'
  },
  'quality-director': {
    title: 'Quality Director',
    description: 'Ensures product quality, compliance, and continuous improvement'
  },
  'finance-liaison': {
    title: 'Finance Liaison',
    description: 'Manages operational budgets and cost optimization'
  },
};

export interface ProductionNode {
  id: string;
  name: string;
  type: 'manufacturing' | 'assembly' | 'warehouse' | 'distribution';
  capacity: number; // units per period
  utilization: number; // percentage
  efficiency: number; // percentage
  qualityRate: number; // percentage
  leadTime: number; // days
  fixedCosts: number;
  variableCostPerUnit: number;
  maintenanceBacklog: number;
}

export interface Supplier {
  id: string;
  name: string;
  reliability: number; // 0-100
  qualityRating: number; // 0-100
  priceCompetitiveness: number; // 0-100
  leadTime: number; // days
  capacity: number;
  concentration: number; // percentage of our spend
  geographicRisk: 'low' | 'medium' | 'high';
  financialHealth: 'strong' | 'stable' | 'weak' | 'distressed';
}

export interface OperationsState extends BaseGameState {
  simulationId: 'operations-excellence';

  // Production network
  productionNodes: ProductionNode[];
  totalCapacity: number;
  totalDemand: number;
  capacityUtilization: number;

  // Inventory
  rawMaterialInventory: number; // days of supply
  wipInventory: number;
  finishedGoodsInventory: number;
  inventoryTurnover: number;
  inventoryCarryingCost: number;

  // Quality
  firstPassYield: number; // percentage
  defectRate: number; // ppm
  customerComplaints: number;
  warrantyClaimRate: number;
  qualityIncidents: Array<{
    id: string;
    severity: 'minor' | 'major' | 'critical';
    roundDetected: number;
    costImpact: number;
    reputationImpact: number;
  }>;

  // Supply chain
  suppliers: Supplier[];
  supplierConcentration: number; // top supplier percentage
  supplyChainResilience: number; // 0-100
  inboundLeadTime: number; // average days
  onTimeDeliveryRate: number;

  // Cost structure
  totalOperatingCost: number;
  costPerUnit: number;
  laborCost: number;
  materialCost: number;
  overheadCost: number;
  logisticsCost: number;

  // Bottleneck dynamics
  activeBottlenecks: Array<{
    nodeId: string;
    severity: number; // 0-100
    throughputLoss: number;
    duration: number;
  }>;

  // Bullwhip effect tracking
  demandVariability: number;
  orderVariability: number;
  bullwhipRatio: number;

  // Disruption state
  activeDisruptions: Array<{
    id: string;
    type: 'supplier' | 'logistics' | 'production' | 'demand';
    severity: 'minor' | 'moderate' | 'severe';
    nodesAffected: string[];
    roundsRemaining: number;
  }>;
}

export interface OperationsDecision {
  role: OperationsRole;

  // Capacity
  capacityInvestment?: number;
  capacityExpansion?: { nodeId: string; amount: number }[];
  maintenanceSpend?: number;
  automationInvestment?: number;

  // Inventory
  safetyStockPolicy?: 'lean' | 'standard' | 'buffer' | 'high-buffer';
  reorderPoint?: number;
  orderQuantity?: number;
  inventoryReductionTarget?: number;

  // Quality
  qualityInvestment?: number;
  inspectionFrequency?: 'minimal' | 'standard' | 'enhanced' | 'full';
  sixSigmaInitiative?: boolean;
  supplierQualityProgram?: boolean;

  // Supplier management
  supplierConsolidation?: string[]; // supplier IDs to drop
  supplierDiversification?: boolean;
  dualSourcing?: boolean;
  supplierDevelopment?: { supplierId: string; investment: number }[];

  // Process improvement
  leanInitiative?: boolean;
  processReengineering?: string; // node ID
  technologyUpgrade?: string; // node ID

  // Resilience
  bufferStockInvestment?: number;
  alternativeSupplierSetup?: boolean;
  geographicDiversification?: boolean;
}

// =============================================================================
// SIMULATION 5: SALES MASTERY
// =============================================================================

export type SalesRole =
  | 'head-of-sales'
  | 'regional-manager-north'
  | 'regional-manager-south'
  | 'marketing-liaison'
  | 'finance-liaison';

export const SALES_ROLES: Record<SalesRole, { title: string; description: string }> = {
  'head-of-sales': {
    title: 'Head of Sales',
    description: 'Owns revenue targets, sales strategy, and team leadership'
  },
  'regional-manager-north': {
    title: 'Regional Manager - North',
    description: 'Drives performance in northern territories'
  },
  'regional-manager-south': {
    title: 'Regional Manager - South',
    description: 'Drives performance in southern territories'
  },
  'marketing-liaison': {
    title: 'Marketing Liaison',
    description: 'Aligns sales and marketing, manages lead generation'
  },
  'finance-liaison': {
    title: 'Finance Liaison',
    description: 'Manages pricing authority, deal desk, and revenue recognition'
  },
};

export interface Territory {
  id: string;
  name: string;
  region: 'north' | 'south' | 'east' | 'west';
  marketPotential: number;
  currentPenetration: number;
  competitiveIntensity: number;
  headcount: number;
  quotaAttainment: number;
  pipelineValue: number;
  avgDealSize: number;
}

export interface SalesRep {
  id: string;
  name: string;
  territory: string;
  tenure: number; // months
  skillLevel: number; // 0-100
  motivation: number; // 0-100
  quotaAttainment: number;
  pipelineHealth: number;
  attritionRisk: 'low' | 'medium' | 'high';
}

export interface SalesMasteryState extends BaseGameState {
  simulationId: 'sales-mastery';

  // Revenue metrics
  revenue: number;
  revenueGrowth: number;
  bookings: number;
  pipeline: number;
  pipelineCoverage: number; // vs quota

  // Margin health
  grossMargin: number;
  averageDiscount: number;
  discountTrend: 'improving' | 'stable' | 'eroding';
  pricingPower: number; // 0-100

  // Customer metrics
  newCustomerAcquisition: number;
  customerRetention: number;
  netRevenueRetention: number;
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
  ltcCacRatio: number;

  // Territory performance
  territories: Territory[];
  territoryImbalance: number; // standard deviation of performance

  // Sales team
  salesReps: SalesRep[];
  totalHeadcount: number;
  attrition: number;
  avgRampTime: number; // months
  repProductivity: number;
  burnoutIndex: number; // 0-100

  // Pipeline dynamics
  pipelineVelocity: number;
  winRate: number;
  avgDealSize: number;
  salesCycleLength: number; // days
  pipelineStages: {
    prospecting: number;
    qualification: number;
    proposal: number;
    negotiation: number;
    closed: number;
  };

  // Channel health
  directRevenue: number;
  partnerRevenue: number;
  channelConflict: number; // 0-100
  partnerSatisfaction: number;

  // Incentive effects
  sandbagging: number; // 0-100 (gaming behavior)
  dealPulling: number; // 0-100 (accelerating deals)
  churningRisk: number; // customers signed that will churn

  // Long-term erosion indicators
  customerTrustIndex: number;
  brandImpactFromSales: number; // can be negative
  sustainabilityScore: number; // 0-100
}

export interface SalesMasteryDecision {
  role: SalesRole;

  // Quotas and targets
  quotaChange?: number; // percentage
  quotaDistribution?: 'equal' | 'potential-weighted' | 'historical';
  stretchTargetMultiplier?: number;

  // Incentives
  baseVsVariable?: number; // percentage variable
  accelerators?: { threshold: number; multiplier: number }[];
  spiffProgram?: { product: string; bonus: number };
  clubThreshold?: number;

  // Discounting
  discountAuthority?: 'tight' | 'moderate' | 'loose';
  maxDiscount?: number;
  dealDeskRequired?: number; // threshold for approval

  // Territory
  territoryRebalance?: boolean;
  territoryExpansion?: string[];
  headcountChange?: { territory: string; change: number }[];

  // Channel
  partnerInvestment?: number;
  partnerRecruitment?: number;
  channelConflictResolution?: 'favor-direct' | 'favor-partner' | 'balanced';

  // Training and development
  trainingInvestment?: number;
  coachingIntensity?: 'light' | 'moderate' | 'intensive';
  salesEnablement?: boolean;

  // Key accounts
  keyAccountInvestment?: number;
  enterpriseFocus?: number; // percentage vs SMB
  customerSuccessIntegration?: boolean;
}

// =============================================================================
// SIMULATION 6: INNOVATION LAB
// =============================================================================

export type InnovationRole =
  | 'head-of-rnd'
  | 'product-strategy-lead'
  | 'finance-liaison'
  | 'operations-liaison';

export const INNOVATION_ROLES: Record<InnovationRole, { title: string; description: string }> = {
  'head-of-rnd': {
    title: 'Head of R&D',
    description: 'Owns the innovation portfolio, technology roadmap, and research direction'
  },
  'product-strategy-lead': {
    title: 'Product Strategy Lead',
    description: 'Bridges innovation and market, manages product-market fit'
  },
  'finance-liaison': {
    title: 'Finance Liaison',
    description: 'Manages R&D budget allocation and ROI tracking'
  },
  'operations-liaison': {
    title: 'Operations Liaison',
    description: 'Ensures manufacturability and operational readiness'
  },
};

export interface InnovationProject {
  id: string;
  name: string;
  type: 'incremental' | 'adjacent' | 'breakthrough';
  stage: 'ideation' | 'research' | 'development' | 'testing' | 'launch' | 'scale' | 'killed';
  timeHorizon: 'H1' | 'H2' | 'H3'; // horizon 1-3

  // Technical
  technicalReadiness: number; // 1-9 TRL
  technicalRisk: number; // 0-100
  technicalDebt: number;

  // Commercial
  marketPotential: number;
  adoptionRisk: number; // 0-100
  cannibalizationRisk: number; // 0-100

  // Investment
  totalInvestment: number;
  burnRate: number;
  remainingBudget: number;
  expectedROI: number;
  optionValue: number; // strategic option value

  // Progress
  completion: number; // percentage
  velocity: number; // progress per round
  surpriseFactor: number; // accumulated positive/negative surprises

  // Team
  teamSize: number;
  talentQuality: number; // 0-100
  morale: number;
}

export interface InnovationLabState extends BaseGameState {
  simulationId: 'innovation-lab';

  // Portfolio overview
  totalRndBudget: number;
  totalRndSpend: number;
  projects: InnovationProject[];

  // Portfolio balance
  incrementalShare: number; // percentage of budget
  adjacentShare: number;
  breakthroughShare: number;
  horizonBalance: {
    H1: number;
    H2: number;
    H3: number;
  };

  // Performance metrics
  innovationPipelineValue: number;
  patentsGranted: number;
  patentsPending: number;
  timeToMarket: number; // average months
  successRate: number; // percentage of projects reaching market

  // Technical health
  technicalDebtTotal: number;
  platformHealth: number; // 0-100
  techStackModernity: number; // 0-100

  // Market impact
  revenueFromNewProducts: number;
  percentRevenueFromInnovation: number;
  marketLeadership: number; // 0-100 perception

  // Learning effects
  learningCurveProgress: number;
  failureLearnings: number; // accumulated learning from failed projects
  knowledgeBase: number; // 0-100

  // Internal dynamics
  creativityIndex: number; // 0-100
  riskTolerance: number; // organizational 0-100
  internalResistance: number; // 0-100
  crossFunctionalAlignment: number;

  // Competitive position
  technologyGap: number; // vs competitors, positive = ahead
  firstMoverOpportunities: number;
  fastFollowerThreats: number;
}

export interface InnovationLabDecision {
  role: InnovationRole;

  // Portfolio allocation
  budgetAllocation?: {
    incremental: number;
    adjacent: number;
    breakthrough: number;
  };
  horizonAllocation?: {
    H1: number;
    H2: number;
    H3: number;
  };

  // Project decisions
  projectApprovals?: string[];
  projectKills?: string[];
  projectPivots?: { projectId: string; newDirection: string }[];
  projectAccelerations?: { projectId: string; additionalBudget: number }[];

  // Stage gate
  stageGateCriteria?: 'strict' | 'moderate' | 'flexible';
  failFastPolicy?: boolean;
  pivotThreshold?: number; // technical readiness level to pivot

  // Platform vs features
  platformInvestment?: number;
  featureVsPlatform?: number; // percentage to features
  techDebtPaydown?: number;

  // Talent
  hiringPlan?: number;
  talentAcquisition?: 'internal' | 'external' | 'acqui-hire';
  trainingInvestment?: number;

  // External
  partnershipInvestment?: number;
  openInnovation?: boolean;
  acquisitionTarget?: string;
  licensingStrategy?: 'in' | 'out' | 'both' | 'none';

  // Risk management
  optionValueFocus?: boolean;
  hedgingBets?: number; // number of parallel bets
  experimentationBudget?: number;
}

// =============================================================================
// SIMULATION CATALOG
// =============================================================================

export const SIMULATION_CATALOG: SimulationMeta[] = [
  {
    id: 'strategic-leadership',
    title: 'Strategic Leadership',
    subtitle: 'Governing Under Uncertainty',
    coreFantasy: 'You are the executive leadership team of a complex enterprise operating under extreme uncertainty, conflicting stakeholder demands, and incomplete information.',
    narrativeWorld: [
      'Publicly listed multinational corporation',
      'Board pressure and investor activism',
      'Media scrutiny and public perception',
      'Internal politics and talent dynamics',
      'Regulatory uncertainty and compliance demands'
    ],
    difficulty: 'expert',
    estimatedDuration: '3-4 hours',
    minPlayers: 3,
    maxPlayers: 5,
    rounds: 8,
    targetAudience: [
      'Senior executives',
      'MBA capstone students',
      'High-potential leadership programs',
      'Board development programs'
    ],
    learningOutcomes: [
      'Strategic coherence under ambiguity',
      'Leadership and governance tradeoffs',
      'Stakeholder management at executive level',
      'Crisis decision-making',
      'Ethical leadership under pressure'
    ],
    tags: ['Leadership', 'Strategy', 'Governance', 'Crisis Management']
  },
  {
    id: 'market-dynamics',
    title: 'Market Dynamics',
    subtitle: 'Competing in Motion',
    coreFantasy: 'You are competing firms in a volatile market where customer behavior, pricing, brand perception, and competitor moves constantly shift.',
    narrativeWorld: [
      'Fast-moving competitive market',
      'Aggressive competitors with varying strategies',
      'Shifting consumer preferences',
      'Platform and ecosystem effects',
      'Price war dynamics'
    ],
    difficulty: 'advanced',
    estimatedDuration: '2-3 hours',
    minPlayers: 2,
    maxPlayers: 6,
    rounds: 10,
    targetAudience: [
      'Marketing executives',
      'Strategy professionals',
      'MBA students',
      'Competitive intelligence teams'
    ],
    learningOutcomes: [
      'Competitive strategy formulation',
      'Market sensing and response',
      'Pricing discipline and dynamics',
      'Cross-functional go-to-market coordination',
      'Brand equity management'
    ],
    tags: ['Competition', 'Marketing', 'Pricing', 'Strategy']
  },
  {
    id: 'financial-acumen',
    title: 'Financial Acumen',
    subtitle: 'Capital, Risk, and Survival',
    coreFantasy: 'You are running the financial backbone of a company where liquidity, investment timing, and risk decisions determine survival.',
    narrativeWorld: [
      'Capital-intensive business environment',
      'External financing pressures',
      'Economic shocks and market volatility',
      'Investor scrutiny and rating agency pressure',
      'Bankruptcy risk if mismanaged'
    ],
    difficulty: 'expert',
    estimatedDuration: '3-4 hours',
    minPlayers: 3,
    maxPlayers: 4,
    rounds: 12,
    targetAudience: [
      'Finance professionals',
      'CFO development programs',
      'Investment analysts',
      'MBA finance concentrations'
    ],
    learningOutcomes: [
      'Financial decision-making under uncertainty',
      'Capital structure optimization',
      'Risk-return tradeoff management',
      'Cash flow management and timing',
      'Long-term financial sustainability'
    ],
    tags: ['Finance', 'Risk Management', 'Capital Markets', 'Treasury']
  },
  {
    id: 'operations-excellence',
    title: 'Operations Excellence',
    subtitle: 'Flow, Capacity, and Fragility',
    coreFantasy: 'You are running an operational system where small inefficiencies cascade into major failures.',
    narrativeWorld: [
      'Multi-node supply chain network',
      'Capacity constraints and bottlenecks',
      'Quality risk and defect propagation',
      'Supplier dependency and concentration',
      'Demand variability and bullwhip effects'
    ],
    difficulty: 'advanced',
    estimatedDuration: '2-3 hours',
    minPlayers: 3,
    maxPlayers: 4,
    rounds: 8,
    targetAudience: [
      'Operations executives',
      'Supply chain professionals',
      'Manufacturing leaders',
      'MBA operations concentrations'
    ],
    learningOutcomes: [
      'Systems thinking in operations',
      'Bottleneck identification and management',
      'Quality-cost-speed tradeoffs',
      'Supply chain resilience building',
      'Lean and continuous improvement'
    ],
    tags: ['Operations', 'Supply Chain', 'Quality', 'Systems Thinking']
  },
  {
    id: 'sales-mastery',
    title: 'Sales Mastery',
    subtitle: 'Growth Without Erosion',
    coreFantasy: 'You are scaling revenue while trying not to destroy margin, culture, or customer trust.',
    narrativeWorld: [
      'High-growth sales organization',
      'Territory battles and competition',
      'Channel conflict dynamics',
      'Customer churn and retention pressure',
      'Compensation and incentive politics'
    ],
    difficulty: 'advanced',
    estimatedDuration: '2-3 hours',
    minPlayers: 3,
    maxPlayers: 5,
    rounds: 8,
    targetAudience: [
      'Sales leaders',
      'Revenue operations professionals',
      'Go-to-market executives',
      'MBA sales concentrations'
    ],
    learningOutcomes: [
      'Sustainable revenue growth strategy',
      'Incentive design and unintended consequences',
      'Territory and channel optimization',
      'Customer lifetime value management',
      'Sales team health and retention'
    ],
    tags: ['Sales', 'Revenue', 'Incentives', 'Customer Success']
  },
  {
    id: 'innovation-lab',
    title: 'Innovation Lab',
    subtitle: 'Betting on the Future',
    coreFantasy: 'You are managing innovation under uncertainty, balancing exploration and exploitation.',
    narrativeWorld: [
      'Technology uncertainty and disruption',
      'Market adoption and timing risk',
      'Internal resistance and politics',
      'Portfolio allocation tradeoffs',
      'Platform vs product decisions'
    ],
    difficulty: 'advanced',
    estimatedDuration: '2-3 hours',
    minPlayers: 3,
    maxPlayers: 4,
    rounds: 10,
    targetAudience: [
      'R&D executives',
      'Innovation leaders',
      'Product strategy professionals',
      'MBA innovation concentrations'
    ],
    learningOutcomes: [
      'Innovation portfolio management',
      'Stage-gate and kill decisions',
      'Option value thinking',
      'Exploration vs exploitation balance',
      'Technical debt management'
    ],
    tags: ['Innovation', 'R&D', 'Product Strategy', 'Portfolio Management']
  }
];

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type SimulationState =
  | StrategicLeadershipState
  | MarketDynamicsState
  | FinancialAcumenState
  | OperationsState
  | SalesMasteryState
  | InnovationLabState;

export type SimulationDecision =
  | StrategicLeadershipDecision
  | MarketDynamicsDecision
  | FinancialAcumenDecision
  | OperationsDecision
  | SalesMasteryDecision
  | InnovationLabDecision;
