/**
 * GET /api/runs/[runId]/teams - List teams in a run
 * POST /api/runs/[runId]/teams - Add a team to a run
 */

import { NextRequest, NextResponse } from 'next/server';
import { addTeamToRun, type TeamMember } from '@/domain/engine/runs';
import { createInitialGameState } from '@/domain/engine';
import { loadRun, saveRun, saveTeamGameState, getRunTeamStates } from '@/lib/runStore';
import { recordTeamJoined } from '@/lib/simulationStore';

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

    const teamStates = await getRunTeamStates(runId);
    const teamsWithState = run.teams.map(team => {
      const state = teamStates.find(s => s.teamId === team.teamId);
      return {
        ...team,
        gameState: state ? {
          round: state.round,
          score: state.scorecard.totalScore,
          revenue: state.company.revenue,
          cash: state.company.cash,
          brandTrust: state.company.brandTrust,
        } : null,
      };
    });

    return NextResponse.json({ teams: teamsWithState });
  } catch (error) {
    console.error('Error listing teams:', error);
    return NextResponse.json(
      { error: 'Failed to list teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const { name, members } = body as {
      name: string;
      members?: TeamMember[];
    };

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Team name is required' },
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

    // Add team to run
    run = addTeamToRun(run, name, members);
    const newTeam = run.teams[run.teams.length - 1];

    // Create initial game state for the team (using run's shared seed)
    const gameState = createInitialGameState(
      runId,
      newTeam.teamId,
      run.config.scenarioKey,
      run.seed // Shared seed for fair comparison
    );

    await saveTeamGameState(runId, newTeam.teamId, gameState);
    await saveRun(run);

    // Record team joined checkpoint (async, non-blocking)
    recordTeamJoined(run, newTeam.teamId, newTeam.name).catch(err =>
      console.error('Failed to record team joined:', err)
    );

    return NextResponse.json({
      team: newTeam,
      gameState,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding team:', error);
    return NextResponse.json(
      { error: 'Failed to add team' },
      { status: 500 }
    );
  }
}
