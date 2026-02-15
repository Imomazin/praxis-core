/**
 * POST /api/seed
 *
 * Set or update the seed for a game run (facilitator use).
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createInitialGameState,
  SeedRequestSchema,
} from '@/domain/engine';
import { loadGameState, saveGameState } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = SeedRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { runId, seed } = parsed.data;
    const teamId = body.teamId || 'team_default';

    // Load existing state or create new one with seed
    let state = await loadGameState(runId, teamId);

    if (state && state.round > 1) {
      return NextResponse.json(
        { error: 'Cannot change seed after game has started' },
        { status: 400 }
      );
    }

    // Create fresh state with the specified seed
    state = createInitialGameState(runId, teamId, 'praxis-assist', seed);
    await saveGameState(state);

    return NextResponse.json({
      message: 'Seed set successfully',
      seed: state.seed,
      runId: state.runId,
      teamId: state.teamId,
    });
  } catch (error) {
    console.error('Error in /api/seed:', error);
    return NextResponse.json(
      { error: 'Failed to set seed' },
      { status: 500 }
    );
  }
}
