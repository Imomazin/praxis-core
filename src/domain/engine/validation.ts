/**
 * Zod Validation Schemas
 *
 * All incoming API requests are validated using these schemas.
 */

import { z } from 'zod';

// =============================================================================
// DECISION SCHEMAS
// =============================================================================

export const RiskPostureSchema = z.enum(['conservative', 'balanced', 'aggressive']);
export const MarketRegionSchema = z.enum(['regionA', 'regionB', 'regionC']);
export const PositioningSchema = z.enum(['trust-first', 'value-first', 'innovation-first']);
export const ChannelMixSchema = z.enum(['paid', 'partner', 'community']);
export const SupplierStrategySchema = z.enum(['single-source', 'dual-source', 'diversified']);
export const DeliverySpeedSchema = z.enum(['fast', 'balanced', 'stable']);
export const RoadmapFocusSchema = z.enum(['features', 'reliability', 'privacy-security']);
export const ReleaseCadenceSchema = z.enum(['fast', 'balanced', 'cautious']);
export const PolicyStrictnessSchema = z.enum(['tight', 'balanced', 'loose']);
export const DataHandlingSchema = z.enum(['minimal', 'standard', 'expansive']);
export const HiringPlanSchema = z.enum(['grow', 'maintain', 'cut']);
export const OrgDesignSchema = z.enum(['centralized', 'hybrid', 'decentralized']);
export const CrisisResponseSchema = z.enum(['transparent', 'defensive', 'aggressive']);

export const CapitalAllocationSchema = z.object({
  rnd: z.number().min(0).max(100),
  marketing: z.number().min(0).max(100),
  operations: z.number().min(0).max(100),
  compliance: z.number().min(0).max(100),
}).refine(
  (data) => data.rnd + data.marketing + data.operations + data.compliance === 100,
  { message: 'Capital allocation must sum to 100%' }
);

export const StrategyDecisionSchema = z.object({
  riskPosture: RiskPostureSchema,
  capitalAllocation: CapitalAllocationSchema,
  marketEntry: MarketRegionSchema,
});

export const MarketingDecisionSchema = z.object({
  campaignSpend: z.number().min(0).max(20),
  pricingChangePct: z.number().min(-50).max(50),
  positioning: PositioningSchema,
  channelMix: ChannelMixSchema,
});

export const SalesDecisionSchema = z.object({
  enterpriseFocus: z.number().min(0).max(100),
  discountingPolicy: z.number().min(0).max(30),
  partnerProgramInvestment: z.number().min(0).max(5),
  pipelineHygiene: z.number().min(0).max(100),
});

export const OperationsDecisionSchema = z.object({
  capacityInvestment: z.number().min(0).max(15),
  supplierStrategy: SupplierStrategySchema,
  qaInvestment: z.number().min(0).max(5),
  deliverySpeed: DeliverySpeedSchema,
});

export const RnDDecisionSchema = z.object({
  roadmapFocus: RoadmapFocusSchema,
  releaseCadence: ReleaseCadenceSchema,
  modelQualityInvestment: z.number().min(0).max(10),
  experimentationBudget: z.number().min(0).max(5),
});

export const LegalDecisionSchema = z.object({
  complianceSpend: z.number().min(0).max(5),
  policyStrictness: PolicyStrictnessSchema,
  auditReadiness: z.number().min(0).max(100),
  dataHandling: DataHandlingSchema,
});

export const GMDecisionSchema = z.object({
  hiringPlan: HiringPlanSchema,
  orgDesign: OrgDesignSchema,
  cultureInvestment: z.number().min(0).max(3),
  crisisResponse: CrisisResponseSchema,
});

export const RoundDecisionsSchema = z.object({
  strategy: StrategyDecisionSchema.optional(),
  marketing: MarketingDecisionSchema.optional(),
  sales: SalesDecisionSchema.optional(),
  operations: OperationsDecisionSchema.optional(),
  rnd: RnDDecisionSchema.optional(),
  legal: LegalDecisionSchema.optional(),
  gm: GMDecisionSchema.optional(),
});

// =============================================================================
// API REQUEST SCHEMAS
// =============================================================================

export const RoleSchema = z.enum([
  'strategy',
  'marketing',
  'sales',
  'operations',
  'rnd',
  'legal',
  'gm'
]);

export const DecideRequestSchema = z.object({
  runId: z.string().min(1),
  teamId: z.string().min(1),
  round: z.number().int().min(1).max(8),
  role: RoleSchema,
  decision: z.unknown(),  // validated separately based on role
});

export const AdvanceRequestSchema = z.object({
  runId: z.string().min(1),
  teamId: z.string().min(1),
});

export const ResetRequestSchema = z.object({
  runId: z.string().min(1),
  teamId: z.string().min(1),
});

export const SeedRequestSchema = z.object({
  runId: z.string().min(1),
  seed: z.number().int().min(0),
});

export const ExportQuerySchema = z.object({
  runId: z.string().min(1),
  teamId: z.string().min(1),
  format: z.enum(['json', 'csv', 'md']).optional().default('json'),
});

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function validateDecisionForRole(role: string, decision: unknown) {
  const schemas: Record<string, z.ZodSchema> = {
    strategy: StrategyDecisionSchema,
    marketing: MarketingDecisionSchema,
    sales: SalesDecisionSchema,
    operations: OperationsDecisionSchema,
    rnd: RnDDecisionSchema,
    legal: LegalDecisionSchema,
    gm: GMDecisionSchema,
  };

  const schema = schemas[role];
  if (!schema) {
    throw new Error(`Unknown role: ${role}`);
  }

  return schema.parse(decision);
}

/**
 * Get default decision for a role
 */
export function getDefaultDecision(role: string) {
  const defaults: Record<string, unknown> = {
    strategy: {
      riskPosture: 'balanced',
      capitalAllocation: { rnd: 30, marketing: 25, operations: 25, compliance: 20 },
      marketEntry: 'regionA',
    },
    marketing: {
      campaignSpend: 2,
      pricingChangePct: 0,
      positioning: 'value-first',
      channelMix: 'paid',
    },
    sales: {
      enterpriseFocus: 50,
      discountingPolicy: 10,
      partnerProgramInvestment: 1,
      pipelineHygiene: 50,
    },
    operations: {
      capacityInvestment: 2,
      supplierStrategy: 'dual-source',
      qaInvestment: 1,
      deliverySpeed: 'balanced',
    },
    rnd: {
      roadmapFocus: 'features',
      releaseCadence: 'balanced',
      modelQualityInvestment: 2,
      experimentationBudget: 1,
    },
    legal: {
      complianceSpend: 1,
      policyStrictness: 'balanced',
      auditReadiness: 50,
      dataHandling: 'standard',
    },
    gm: {
      hiringPlan: 'maintain',
      orgDesign: 'hybrid',
      cultureInvestment: 0.5,
      crisisResponse: 'transparent',
    },
  };

  return defaults[role];
}
