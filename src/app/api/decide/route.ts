/**
 * POST /api/decide
 *
 * Submit a role decision for the current round.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  applyRoleDecision,
  DecideRequestSchema,
  validateDecisionForRole,
} from '@/domain/engine';
import { loadGameState, saveGameState } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const parsed = DecideRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { runId, teamId, round, role, decision } = parsed.data;

    // Load current state
    const state = await loadGameState(runId, teamId);
    if (!state) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check round matches
    if (state.round !== round) {
      return NextResponse.json(
        { error: `Round mismatch: game is at round ${state.round}, you submitted for round ${round}` },
        { status: 400 }
      );
    }

    // Check phase allows decisions
    if (state.phase !== 'decisions_open') {
      return NextResponse.json(
        { error: `Decisions are not open. Current phase: ${state.phase}` },
        { status: 400 }
      );
    }

    // Validate decision for the specific role
    try {
      validateDecisionForRole(role, decision);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid decision', details: (validationError as Error).message },
        { status: 400 }
      );
    }

    // Apply the decision
    const updatedState = applyRoleDecision(state, role, decision);
    await saveGameState(updatedState);

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('Error in /api/decide:', error);
    return NextResponse.json(
      { error: 'Failed to process decision' },
      { status: 500 }
    );
  }
}
