/**
 * POST /api/advance
 *
 * Advance the simulation by one round.
 */

import { NextRequest, NextResponse } from 'next/server';
import { advanceRound, AdvanceRequestSchema } from '@/domain/engine';
import { loadGameState, saveGameState } from '@/lib/store';
import { loadRun } from '@/lib/runStore';
import { recordRoundComplete, recordSimulationCompleted } from '@/lib/simulationStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = AdvanceRequestSchema.safeParse(body);
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

    // Check if game is complete
    if (state.round >= state.maxRounds) {
      return NextResponse.json(
        { error: 'Game is complete. Cannot advance further.' },
        { status: 400 }
      );
    }

    // Advance the round
    const updatedState = advanceRound(state);
    await saveGameState(updatedState);

    // Record round completion checkpoint (async, non-blocking)
    // Load run context if available for proper tracking
    loadRun(runId).then(run => {
      if (run) {
        recordRoundComplete(run, teamId, updatedState).catch(err =>
          console.error('Failed to record round complete:', err)
        );
        // Check if simulation completed
        if (updatedState.round >= updatedState.maxRounds) {
          recordSimulationCompleted(run).catch(err =>
            console.error('Failed to record simulation completion:', err)
          );
        }
      }
    }).catch(err => {
      console.error('Failed to load run for checkpoint:', err);
    });

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('Error in /api/advance:', error);
    return NextResponse.json(
      { error: 'Failed to advance round' },
      { status: 500 }
    );
  }
}
