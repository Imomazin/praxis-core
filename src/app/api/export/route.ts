/**
 * GET /api/export
 *
 * Export game state in various formats.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBoardMemo, generateLessonsLearned } from '@/domain/engine';
import { loadGameState } from '@/lib/store';
import type { GameState } from '@/domain/engine/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const runId = searchParams.get('runId');
    const teamId = searchParams.get('teamId');
    const format = searchParams.get('format') || 'json';

    if (!runId || !teamId) {
      return NextResponse.json(
        { error: 'runId and teamId are required' },
        { status: 400 }
      );
    }

    // Load game state
    const state = await loadGameState(runId, teamId);
    if (!state) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    switch (format) {
      case 'json':
        return NextResponse.json(state, {
          headers: {
            'Content-Disposition': `attachment; filename="praxis-export-${runId}.json"`,
          },
        });

      case 'csv':
        const csv = generateCSVExport(state);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="praxis-export-${runId}.csv"`,
          },
        });

      case 'md':
        const memo = generateBoardMemo(state);
        const lessons = generateLessonsLearned(
          state.decisions.map((_, i) => ({
            round: i + 1,
            scorecard: state.scorecard, // simplified
          }))
        );

        const markdown = `${memo}\n\n## Lessons Learned\n\n${lessons.map(l => `- ${l}`).join('\n')}`;

        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="praxis-memo-${runId}.md"`,
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid format. Use json, csv, or md.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in /api/export:', error);
    return NextResponse.json(
      { error: 'Failed to export' },
      { status: 500 }
    );
  }
}

function generateCSVExport(state: GameState): string {
  const rows: string[] = [];

  // Header
  rows.push('Round,Revenue,Costs,Profit,Cash,BrandTrust,ProductQuality,Morale,Score');

  // Data rows - one per round of decisions made
  for (let i = 0; i < state.decisions.length; i++) {
    const round = i + 1;
    // For simplicity, use current state values (in a real implementation, you'd track history)
    rows.push([
      round,
      state.company.revenue.toFixed(2),
      state.company.costs.toFixed(2),
      state.company.profit.toFixed(2),
      state.company.cash.toFixed(2),
      state.company.brandTrust.toFixed(0),
      state.company.productQuality.toFixed(0),
      state.company.morale.toFixed(0),
      state.scorecard.totalScore,
    ].join(','));
  }

  // Add current state as final row if no decisions yet
  if (state.decisions.length === 0) {
    rows.push([
      state.round,
      state.company.revenue.toFixed(2),
      state.company.costs.toFixed(2),
      state.company.profit.toFixed(2),
      state.company.cash.toFixed(2),
      state.company.brandTrust.toFixed(0),
      state.company.productQuality.toFixed(0),
      state.company.morale.toFixed(0),
      state.scorecard.totalScore,
    ].join(','));
  }

  return rows.join('\n');
}
