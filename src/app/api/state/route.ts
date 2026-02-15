/**
 * GET /api/state
 *
 * Returns current game state. Creates new game if none exists.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createInitialGameState,
  generateRunId,
  generateTeamId,
} from '@/domain/engine';
import { loadGameState, saveGameState } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const runId = searchParams.get('runId') || generateRunId();
    const teamId = searchParams.get('teamId') || generateTeamId();
    const seedParam = searchParams.get('seed');
    const seed = seedParam ? parseInt(seedParam, 10) : undefined;

    // Try to load existing state
    let state = await loadGameState(runId, teamId);

    // Create new state if none exists
    if (!state) {
      state = createInitialGameState(runId, teamId, 'praxis-assist', seed);
      await saveGameState(state);
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Error in /api/state:', error);
    return NextResponse.json(
      { error: 'Failed to get state' },
      { status: 500 }
    );
  }
}
