/**
 * GET /api/runs - List all runs
 * POST /api/runs - Create a new run
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRun, type RunConfig } from '@/domain/engine/runs';
import { listRuns, saveRun } from '@/lib/runStore';
import { recordSimulationCreated } from '@/lib/simulationStore';

export async function GET() {
  try {
    const runs = await listRuns();
    return NextResponse.json({ runs });
  } catch (error) {
    console.error('Error listing runs:', error);
    return NextResponse.json(
      { error: 'Failed to list runs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, seed, config } = body as {
      name: string;
      seed?: number;
      config?: Partial<RunConfig>;
    };

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Run name is required' },
        { status: 400 }
      );
    }

    const run = createRun(name, seed, config);
    await saveRun(run);

    // Persist to simulation tracking (async, non-blocking)
    recordSimulationCreated(run).catch(err =>
      console.error('Failed to record simulation creation:', err)
    );

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error('Error creating run:', error);
    return NextResponse.json(
      { error: 'Failed to create run' },
      { status: 500 }
    );
  }
}
