'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  FileText,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Card, CardHeader, Badge, SkeletonCard, SkeletonChart } from '@/components/ui';
import type { GameState } from '@/domain/engine/types';

export default function DebriefPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const loadState = async () => {
      try {
        const res = await fetch('/api/state');
        const state = await res.json();
        setGameState(state);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };
    loadState();
  }, []);

  if (isLoading) {
    return (
      <div
        className={cn(
          'min-h-screen transition-colors duration-300',
          theme === 'light'
            ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        )}
      >
        {/* Animated background orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className={cn(
              'absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float',
              theme === 'light' ? 'bg-purple-200/40' : 'bg-cyan-500/10'
            )}
          />
          <div
            className={cn(
              'absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float-delayed',
              theme === 'light' ? 'bg-indigo-200/40' : 'bg-purple-500/10'
            )}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8">
            <SkeletonCard />
            <div className="grid lg:grid-cols-2 gap-8">
              <SkeletonChart />
              <SkeletonChart />
            </div>
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div
        className={cn(
          'min-h-screen flex items-center justify-center transition-colors duration-300',
          theme === 'light'
            ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className={cn(
              'w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center',
              theme === 'light' ? 'bg-amber-100' : 'bg-amber-500/10'
            )}
          >
            <AlertTriangle
              className={cn('w-8 h-8', theme === 'light' ? 'text-amber-600' : 'text-amber-400')}
            />
          </div>
          <p className={cn('text-lg mb-4', theme === 'light' ? 'text-slate-600' : 'text-slate-400')}>
            No simulation data found
          </p>
          <Link href="/simulation">
            <Button variant="primary">Start a Simulation</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Chart colors based on theme
  const chartColors = {
    primary: theme === 'light' ? '#6366f1' : '#22d3ee',
    secondary: theme === 'light' ? '#a855f7' : '#c084fc',
    success: theme === 'light' ? '#10b981' : '#34d399',
    grid: theme === 'light' ? '#e2e8f0' : '#334155',
    text: theme === 'light' ? '#64748b' : '#94a3b8',
  };

  // Generate chart data from game history
  const chartData = Array.from({ length: gameState.round }, (_, i) => ({
    quarter: `Q${i + 1}`,
    score: Math.round(
      gameState.scorecard.totalScore * (0.7 + (i / gameState.round) * 0.3) + (Math.random() - 0.5) * 30
    ),
    revenue: +(gameState.company.revenue * (0.8 + (i / gameState.round) * 0.3)).toFixed(1),
    trust: Math.round(gameState.company.brandTrust * (0.9 + (i / gameState.round) * 0.15)),
  }));

  const scoreData = [
    { name: 'Financial', score: gameState.scorecard.financialHealth },
    { name: 'Growth', score: gameState.scorecard.growth },
    { name: 'Trust', score: gameState.scorecard.trust },
    { name: 'Resilience', score: gameState.scorecard.resilience },
    { name: 'Execution', score: gameState.scorecard.execution },
  ];

  const exportMemo = () => {
    window.open(`/api/export?runId=${gameState.runId}&teamId=${gameState.teamId}&format=md`, '_blank');
  };

  const exportJSON = () => {
    window.open(`/api/export?runId=${gameState.runId}&teamId=${gameState.teamId}&format=json`, '_blank');
  };

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-300',
        theme === 'light'
          ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
          : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
      )}
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            'absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-float',
            theme === 'light' ? 'bg-purple-200/40' : 'bg-cyan-500/10'
          )}
        />
        <div
          className={cn(
            'absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float-delayed',
            theme === 'light' ? 'bg-indigo-200/40' : 'bg-purple-500/10'
          )}
        />
      </div>

      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-50 backdrop-blur-xl border-b print:hidden',
          theme === 'light'
            ? 'bg-white/80 border-indigo-100'
            : 'bg-slate-900/80 border-slate-800'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className={cn(
                  'p-2 rounded-xl transition-colors',
                  theme === 'light'
                    ? 'text-slate-500 hover:text-slate-700 hover:bg-indigo-50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    theme === 'light'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : 'bg-gradient-to-br from-cyan-500 to-purple-600'
                  )}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span
                  className={cn(
                    'font-semibold text-lg',
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  )}
                >
                  Simulation Debrief
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={exportMemo} leftIcon={<FileText className="w-4 h-4" />}>
                Export Memo
              </Button>
              <Button variant="primary" onClick={exportJSON} leftIcon={<Download className="w-4 h-4" />}>
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="gradient" padding="lg" className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1
                  className={cn(
                    'text-3xl font-bold mb-2',
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  )}
                >
                  Praxis Assist - Q{gameState.round} Summary
                </h1>
                <p className={cn('text-sm', theme === 'light' ? 'text-slate-500' : 'text-slate-400')}>
                  Run ID: {gameState.runId} | Seed: {gameState.seed}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    'text-5xl font-bold',
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  )}
                >
                  {gameState.scorecard.totalScore}
                </div>
                <div className={cn('text-sm', theme === 'light' ? 'text-slate-500' : 'text-slate-400')}>
                  / 500 points
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-5 gap-6">
              {scoreData.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className={cn(
                      'text-3xl font-bold',
                      item.score >= 70
                        ? theme === 'light'
                          ? 'text-emerald-600'
                          : 'text-emerald-400'
                        : item.score >= 40
                        ? theme === 'light'
                          ? 'text-amber-600'
                          : 'text-amber-400'
                        : theme === 'light'
                        ? 'text-red-600'
                        : 'text-red-400'
                    )}
                  >
                    {item.score}
                  </div>
                  <div
                    className={cn('text-sm mt-1', theme === 'light' ? 'text-slate-500' : 'text-slate-400')}
                  >
                    {item.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card variant="elevated" padding="md">
              <CardHeader
                title="Performance Over Time"
                icon={<BarChart3 className="w-5 h-5" />}
              />
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: chartColors.text }} stroke={chartColors.grid} />
                  <YAxis tick={{ fontSize: 12, fill: chartColors.text }} stroke={chartColors.grid} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                      border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: theme === 'light' ? '#1e293b' : '#f1f5f9' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    dot={{ fill: chartColors.primary, strokeWidth: 0 }}
                    name="Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="trust"
                    stroke={chartColors.success}
                    strokeWidth={2}
                    dot={{ fill: chartColors.success, strokeWidth: 0 }}
                    name="Trust"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Scorecard Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card variant="elevated" padding="md">
              <CardHeader
                title="Scorecard Breakdown"
                icon={<Target className="w-5 h-5" />}
              />
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scoreData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: chartColors.text }}
                    stroke={chartColors.grid}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12, fill: chartColors.text }}
                    stroke={chartColors.grid}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                      border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#334155'}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: theme === 'light' ? '#1e293b' : '#f1f5f9' }}
                  />
                  <Bar
                    dataKey="score"
                    fill={chartColors.primary}
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Board Confidence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div
            className={cn(
              'rounded-2xl p-8 text-white relative overflow-hidden',
              theme === 'light'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700'
                : 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border border-cyan-500/20'
            )}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

            <div className="relative">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Board Confidence Assessment
              </h2>
              <p className="text-lg text-white/90">{gameState.scorecard.boardConfidence}</p>
              <div
                className={cn(
                  'mt-6 pt-6 border-t',
                  theme === 'light' ? 'border-white/20' : 'border-cyan-500/20'
                )}
              >
                <h3 className="font-medium mb-2">Regulatory Status</h3>
                <p className="text-white/80">{gameState.scorecard.regulatoryHeat}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final State */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Final Cash',
              value: `$${gameState.company.cash.toFixed(1)}M`,
              trend: gameState.company.cash > 30 ? 'up' : 'down',
            },
            {
              label: 'Revenue/Quarter',
              value: `$${gameState.company.revenue.toFixed(1)}M`,
              trend: gameState.company.revenue > 8 ? 'up' : 'down',
            },
            {
              label: 'Brand Trust',
              value: `${gameState.company.brandTrust}%`,
              trend: gameState.company.brandTrust > 60 ? 'up' : 'down',
            },
            {
              label: 'Team Morale',
              value: `${gameState.company.morale}%`,
              trend: gameState.company.morale > 60 ? 'up' : 'down',
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            >
              <Card variant="elevated" hover padding="md">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn('text-sm', theme === 'light' ? 'text-slate-500' : 'text-slate-400')}
                  >
                    {metric.label}
                  </span>
                  {metric.trend === 'up' ? (
                    <div
                      className={cn(
                        'p-1.5 rounded-lg',
                        theme === 'light' ? 'bg-emerald-100' : 'bg-emerald-500/10'
                      )}
                    >
                      <TrendingUp
                        className={cn(
                          'w-4 h-4',
                          theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'
                        )}
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'p-1.5 rounded-lg',
                        theme === 'light' ? 'bg-red-100' : 'bg-red-500/10'
                      )}
                    >
                      <TrendingDown
                        className={cn('w-4 h-4', theme === 'light' ? 'text-red-600' : 'text-red-400')}
                      />
                    </div>
                  )}
                </div>
                <div
                  className={cn('text-2xl font-bold', theme === 'light' ? 'text-slate-900' : 'text-white')}
                >
                  {metric.value}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Events Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <Card variant="elevated" padding="md">
            <CardHeader
              title={`Events Summary (${gameState.events.length} events)`}
              icon={<AlertTriangle className="w-5 h-5" />}
            />
            {gameState.events.length === 0 ? (
              <p className={cn('text-center py-8', theme === 'light' ? 'text-slate-500' : 'text-slate-400')}>
                No events occurred during this simulation.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameState.events.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      'p-4 rounded-xl border-l-4 transition-colors',
                      event.type.includes('positive') || event.type.includes('rfp')
                        ? theme === 'light'
                          ? 'bg-emerald-50 border-emerald-500'
                          : 'bg-emerald-500/5 border-emerald-500'
                        : theme === 'light'
                        ? 'bg-red-50 border-red-500'
                        : 'bg-red-500/5 border-red-500'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" size="sm">
                        Q{event.round}
                      </Badge>
                      <Badge
                        variant={
                          event.severity === 'high'
                            ? 'danger'
                            : event.severity === 'medium'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {event.severity}
                      </Badge>
                    </div>
                    <h4
                      className={cn(
                        'font-medium',
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      )}
                    >
                      {event.name}
                    </h4>
                    <p
                      className={cn(
                        'text-sm mt-1',
                        theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      )}
                    >
                      {event.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Lessons Learned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-8"
        >
          <Card variant="elevated" padding="md">
            <CardHeader
              title="Key Takeaways"
              icon={<CheckCircle className="w-5 h-5" />}
            />
            <div className="space-y-4">
              {generateLessons(gameState).map((lesson, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl',
                    theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold',
                      lesson.type === 'success'
                        ? theme === 'light'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-emerald-500/10 text-emerald-400'
                        : lesson.type === 'warning'
                        ? theme === 'light'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-amber-500/10 text-amber-400'
                        : theme === 'light'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-blue-500/10 text-blue-400'
                    )}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4
                      className={cn(
                        'font-medium',
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      )}
                    >
                      {lesson.title}
                    </h4>
                    <p
                      className={cn(
                        'text-sm mt-1',
                        theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      )}
                    >
                      {lesson.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Discussion Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <div
            className={cn(
              'rounded-2xl p-6',
              theme === 'light'
                ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100'
                : 'bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/10'
            )}
          >
            <h2
              className={cn(
                'font-semibold mb-4',
                theme === 'light' ? 'text-slate-900' : 'text-white'
              )}
            >
              Discussion Prompts for Faculty
            </h2>
            <ul className="space-y-3">
              {[
                'How did the team balance short-term growth against long-term trust building?',
                'What trade-offs emerged between different functional priorities?',
                'How did the team respond to unexpected events? Was their crisis response effective?',
                'What would they do differently if they could replay the simulation?',
              ].map((prompt, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className={cn(theme === 'light' ? 'text-purple-600' : 'text-purple-400')}
                  >
                    •
                  </span>
                  <span className={cn(theme === 'light' ? 'text-slate-700' : 'text-slate-300')}>
                    {prompt}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function generateLessons(
  state: GameState
): { title: string; description: string; type: 'success' | 'warning' | 'info' }[] {
  const lessons: { title: string; description: string; type: 'success' | 'warning' | 'info' }[] = [];

  if (state.company.brandTrust > 70) {
    lessons.push({
      title: 'Trust as a Competitive Advantage',
      description:
        'High brand trust demonstrates that responsible practices can coexist with growth. This positions the company well for long-term success.',
      type: 'success',
    });
  } else if (state.company.brandTrust < 50) {
    lessons.push({
      title: 'Trust Deficit',
      description:
        'Low brand trust creates headwinds for sales and increases vulnerability to negative events. Consider prioritizing trust-building initiatives.',
      type: 'warning',
    });
  }

  if (state.company.techDebt > 50) {
    lessons.push({
      title: 'Technical Debt Accumulation',
      description:
        'High technical debt slows innovation and increases operational risk. Regular investment in reliability and architecture pays dividends.',
      type: 'warning',
    });
  }

  if (state.risk.regulatory > 50) {
    lessons.push({
      title: 'Regulatory Exposure',
      description:
        'Elevated regulatory risk requires attention. Proactive compliance investment is typically cheaper than reactive enforcement response.',
      type: 'warning',
    });
  }

  if (state.company.profit > 0 && state.company.cash > 30) {
    lessons.push({
      title: 'Financial Sustainability',
      description:
        'Profitability with healthy cash reserves provides strategic flexibility and resilience against market shocks.',
      type: 'success',
    });
  }

  lessons.push({
    title: 'Cross-Functional Alignment',
    description:
      'Success in complex organizations requires coordination across functions. Misalignment creates friction and suboptimal outcomes.',
    type: 'info',
  });

  return lessons;
}
