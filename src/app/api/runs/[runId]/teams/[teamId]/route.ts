/**
 * GET /api/runs/[runId]/teams/[teamId] - Get team details and game state
 * DELETE /api/runs/[runId]/teams/[teamId] - Remove team from run
 */

import { NextRequest, NextResponse } from 'next/server';
import { removeTeamFromRun } from '@/domain/engine/runs';
import {
  loadRun,
  saveRun,
  loadTeamGameState,
  deleteTeamGameState,
} from '@/lib/runStore';

interface RouteParams {
  params: Promise<{ runId: string; teamId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { runId, teamId } = await params;
    const run = await loadRun(runId);

    if (!run) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }

    const team = run.teams.find(t => t.teamId === teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    const gameState = await loadTeamGameState(runId, teamId);

    return NextResponse.json({
      team,
      gameState,
      run: {
        runId: run.runId,
        name: run.name,
        currentRound: run.currentRound,
        status: run.status,
        config: run.config,
      },
    });
  } catch (error) {
    console.error('Error getting team:', error);
    return NextResponse.json(
      { error: 'Failed to get team' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { runId, teamId } = await params;
    let run = await loadRun(runId);

    if (!run) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }

    const team = run.teams.find(t => t.teamId === teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    run = removeTeamFromRun(run, teamId);
    await deleteTeamGameState(runId, teamId);
    await saveRun(run);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team:', error);
    return NextResponse.json(
      { error: 'Failed to remove team' },
      { status: 500 }
    );
  }
}
