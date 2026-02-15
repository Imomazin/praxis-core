/**
 * GET /api/runs/[runId]/events - List injected events
 * POST /api/runs/[runId]/events - Inject a new event
 */

import { NextRequest, NextResponse } from 'next/server';
import { addInjectedEvent, type InjectedEvent } from '@/domain/engine/runs';
import { injectEvent, applyEventEffects, type EventType } from '@/domain/engine';
import {
  loadRun,
  saveRun,
  loadTeamGameState,
  saveTeamGameState,
} from '@/lib/runStore';

interface RouteParams {
  params: Promise<{ runId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { runId } = await params;
    const run = await loadRun(runId);

    if (!run) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      events: run.injectedEvents,
      activityLog: run.activityLog.filter(
        log => log.action === 'Event injected'
      ),
    });
  } catch (error) {
    console.error('Error listing events:', error);
    return NextResponse.json(
      { error: 'Failed to list events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const { eventType, severity, targetTeams, injectedBy } = body as {
      eventType: EventType;
      severity: 'low' | 'medium' | 'high';
      targetTeams: string[] | 'all';
      injectedBy?: string;
    };

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    let run = await loadRun(runId);
    if (!run) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }

    if (run.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot inject events into inactive run' },
        { status: 400 }
      );
    }

    // Determine which teams to affect
    const affectedTeams = targetTeams === 'all'
      ? run.teams.map(t => t.teamId)
      : targetTeams;

    // Apply event to each affected team's game state
    const event = injectEvent(eventType, run.currentRound, severity || 'medium');

    for (const teamId of affectedTeams) {
      const gameState = await loadTeamGameState(runId, teamId);
      if (gameState) {
        // Apply event effects to game state
        const result = applyEventEffects(
          gameState.company,
          gameState.market,
          gameState.risk,
          event
        );

        const updatedState = {
          ...gameState,
          company: result.company,
          market: result.market,
          risk: result.risk,
          events: [...gameState.events, event],
          updatedAt: new Date().toISOString(),
        };

        await saveTeamGameState(runId, teamId, updatedState);
      }
    }

    // Record the injection in the run
    run = addInjectedEvent(
      run,
      eventType,
      severity || 'medium',
      targetTeams,
      injectedBy || 'facilitator'
    );
    await saveRun(run);

    return NextResponse.json({
      success: true,
      event,
      affectedTeams,
    }, { status: 201 });
  } catch (error) {
    console.error('Error injecting event:', error);
    return NextResponse.json(
      { error: 'Failed to inject event' },
      { status: 500 }
    );
  }
}
