/**
 * POST /api/reset
 *
 * Reset the simulation to initial state.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resetGameState, ResetRequestSchema } from '@/domain/engine';
import { loadGameState, saveGameState } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = ResetRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { runId, teamId } = parsed.data;

    // Load current state
    const state = await loadGameState(runId, teamId);
    if (!state) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Reset to initial state (preserving runId, teamId, seed)
    const freshState = resetGameState(state);
    await saveGameState(freshState);

    return NextResponse.json(freshState);
  } catch (error) {
    console.error('Error in /api/reset:', error);
    return NextResponse.json(
      { error: 'Failed to reset game' },
      { status: 500 }
    );
  }
}
