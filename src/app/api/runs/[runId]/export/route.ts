/**
 * GET /api/runs/[runId]/export - Export run data
 *
 * Supports:
 * - format=json - Full run data with all team states
 * - format=csv - Comparison CSV of all teams
 * - format=replay - Replay data for recreating the run
 * - format=report - Full markdown report
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportRunForReplay, generateBoardMemo, generateLessonsLearned } from '@/domain/engine';
import { loadRun, getRunTeamStates, getRunComparison } from '@/lib/runStore';
import type { GameState } from '@/domain/engine/types';

interface RouteParams {
  params: Promise<{ runId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { runId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    const run = await loadRun(runId);
    if (!run) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }

    const teamStates = await getRunTeamStates(runId);

    switch (format) {
      case 'json':
        return NextResponse.json({
          run,
          teamStates,
          exportedAt: new Date().toISOString(),
        }, {
          headers: {
            'Content-Disposition': `attachment; filename="run-${runId}-export.json"`,
          },
        });

      case 'csv':
        const csv = generateRunCSV(run, teamStates);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="run-${runId}-comparison.csv"`,
          },
        });

      case 'replay':
        const replayData = exportRunForReplay(run);
        return NextResponse.json(replayData, {
          headers: {
            'Content-Disposition': `attachment; filename="run-${runId}-replay.json"`,
          },
        });

      case 'report':
        const report = generateRunReport(run, teamStates);
        return new NextResponse(report, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="run-${runId}-report.md"`,
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid format. Use json, csv, replay, or report.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error exporting run:', error);
    return NextResponse.json(
      { error: 'Failed to export run' },
      { status: 500 }
    );
  }
}

function generateRunCSV(run: any, teamStates: GameState[]): string {
  const rows: string[] = [];

  // Header
  rows.push('Rank,Team,Score,Revenue,Profit,Cash,BrandTrust,ProductQuality,Morale,TechDebt');

  // Sort teams by score
  const sortedStates = [...teamStates].sort(
    (a, b) => b.scorecard.totalScore - a.scorecard.totalScore
  );

  // Data rows
  sortedStates.forEach((state, index) => {
    const team = run.teams.find((t: any) => t.teamId === state.teamId);
    rows.push([
      index + 1,
      team?.name || state.teamId,
      state.scorecard.totalScore,
      state.company.revenue.toFixed(2),
      state.company.profit.toFixed(2),
      state.company.cash.toFixed(2),
      state.company.brandTrust.toFixed(0),
      state.company.productQuality.toFixed(0),
      state.company.morale.toFixed(0),
      state.company.techDebt.toFixed(0),
    ].join(','));
  });

  return rows.join('\n');
}

function generateRunReport(run: any, teamStates: GameState[]): string {
  let report = `# ${run.name} - Simulation Report\n\n`;
  report += `**Run ID:** ${run.runId}\n`;
  report += `**Seed:** ${run.seed}\n`;
  report += `**Status:** ${run.status}\n`;
  report += `**Current Round:** ${run.currentRound}/${run.config.maxRounds}\n`;
  report += `**Teams:** ${run.teams.length}\n`;
  report += `**Started:** ${run.startedAt || 'Not started'}\n`;
  report += `**Completed:** ${run.completedAt || 'In progress'}\n\n`;

  // Configuration
  report += `## Configuration\n\n`;
  report += `- Scenario: ${run.config.scenarioKey}\n`;
  report += `- Difficulty: ${run.config.difficulty}\n`;
  report += `- Event Frequency: ${run.config.eventFrequency}\n`;
  report += `- Competition Mode: ${run.config.competitionMode}\n`;
  report += `- Round Duration: ${run.config.roundDurationMinutes} minutes\n\n`;

  // Leaderboard
  report += `## Final Leaderboard\n\n`;
  report += `| Rank | Team | Score | Revenue | Trust | Quality |\n`;
  report += `|------|------|-------|---------|-------|--------|\n`;

  const sortedStates = [...teamStates].sort(
    (a, b) => b.scorecard.totalScore - a.scorecard.totalScore
  );

  sortedStates.forEach((state, index) => {
    const team = run.teams.find((t: any) => t.teamId === state.teamId);
    report += `| ${index + 1} | ${team?.name || state.teamId} | ${state.scorecard.totalScore}/500 | $${state.company.revenue.toFixed(1)}M | ${state.company.brandTrust}% | ${state.company.productQuality}% |\n`;
  });

  report += '\n';

  // Individual team reports
  report += `## Team Reports\n\n`;

  for (const state of sortedStates) {
    const team = run.teams.find((t: any) => t.teamId === state.teamId);
    report += `### ${team?.name || state.teamId}\n\n`;
    report += generateBoardMemo(state);
    report += '\n\n';

    // Lessons learned
    const lessons = generateLessonsLearned(
      state.decisions.map((_, i) => ({
        round: i + 1,
        scorecard: state.scorecard,
      }))
    );
    if (lessons.length > 0) {
      report += `#### Lessons Learned\n\n`;
      lessons.forEach(l => {
        report += `- ${l}\n`;
      });
      report += '\n';
    }

    report += '---\n\n';
  }

  // Activity log
  if (run.activityLog.length > 0) {
    report += `## Activity Log\n\n`;
    report += `| Time | Team | Action | Details |\n`;
    report += `|------|------|--------|--------|\n`;

    run.activityLog.slice(-20).forEach((log: any) => {
      const time = new Date(log.timestamp).toLocaleString();
      report += `| ${time} | ${log.teamName || '-'} | ${log.action} | ${log.details || '-'} |\n`;
    });
  }

  report += `\n\n---\n*Report generated: ${new Date().toISOString()}*\n`;

  return report;
}
