/**
 * Scenario Video Mapping
 *
 * Maps scenario IDs to their intro video paths.
 * Videos should be placed in /public/scenarios/ as scenario-01.mp4 through scenario-07.mp4
 *
 * TODO: Update mapping when scenario IDs are finalized or when order changes.
 */

// Scenario IDs in the order they appear in the SIMULATIONS array on the landing page
export const SCENARIO_IDS = [
  'strategic-leadership',
  'market-dynamics',
  'financial-acumen',
  'operations-excellence',
  'sales-mastery',
  'innovation-lab',
  'risk-intelligence',
  'governance-compliance',
  'talent-culture',
] as const;

export type ScenarioId = typeof SCENARIO_IDS[number];

/**
 * Maps scenario IDs to their intro video paths.
 * Currently we have 7 videos for the first 7 scenarios.
 */
export const SCENARIO_VIDEO_MAP: Record<string, string> = {
  'strategic-leadership': '/scenarios/scenario-01.mp4',
  'market-dynamics': '/scenarios/scenario-02.mp4',
  'financial-acumen': '/scenarios/scenario-03.mp4',
  'operations-excellence': '/scenarios/scenario-04.mp4',
  'sales-mastery': '/scenarios/scenario-05.mp4',
  'innovation-lab': '/scenarios/scenario-06.mp4',
  'risk-intelligence': '/scenarios/scenario-07.mp4',
  // governance-compliance and talent-culture don't have videos yet
};

/**
 * Get the video path for a scenario by ID.
 * Returns undefined if no video exists for that scenario.
 */
export function getScenarioVideoPath(scenarioId: string): string | undefined {
  return SCENARIO_VIDEO_MAP[scenarioId];
}

/**
 * Check if a scenario has an intro video.
 */
export function hasScenarioVideo(scenarioId: string): boolean {
  return scenarioId in SCENARIO_VIDEO_MAP;
}

/**
 * Get video path by index (0-based).
 * Useful when mapping by array position instead of ID.
 */
export function getScenarioVideoByIndex(index: number): string | undefined {
  if (index < 0 || index >= 7) return undefined;
  return `/scenarios/scenario-0${index + 1}.mp4`;
}
