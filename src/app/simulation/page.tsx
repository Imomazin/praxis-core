'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Target,
  BarChart3,
  Settings,
  Lightbulb,
  Scale,
  Trophy,
  Briefcase,
  LineChart,
  Layers,
  Calendar,
  Zap,
  AlertCircle,
  Activity,
  PieChart,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
  Heart,
  Cpu,
  Globe,
} from 'lucide-react';
import { useSimulationStore } from '@/store/simulation';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import type { Role, GameState } from '@/domain/engine/types';

const ROLE_CONFIG: Record<Role, { icon: typeof Target; label: string; color: string; bgColor: string; gradient: string }> = {
  strategy: { icon: Briefcase, label: 'CEO / Strategy', color: 'text-primary-600', bgColor: 'bg-primary-50', gradient: 'from-primary-500 to-primary-600' },
  marketing: { icon: TrendingUp, label: 'CMO / Marketing', color: 'text-accent-600', bgColor: 'bg-accent-50', gradient: 'from-accent-500 to-accent-600' },
  sales: { icon: BarChart3, label: 'VP Sales', color: 'text-orange-600', bgColor: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
  operations: { icon: Settings, label: 'COO / Operations', color: 'text-warning-600', bgColor: 'bg-warning-50', gradient: 'from-warning-500 to-warning-600' },
  rnd: { icon: Lightbulb, label: 'CTO / R&D', color: 'text-purple-600', bgColor: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
  legal: { icon: Scale, label: 'CLO / Legal', color: 'text-slate-600', bgColor: 'bg-slate-50', gradient: 'from-slate-500 to-slate-600' },
  gm: { icon: Heart, label: 'CPO / People', color: 'text-pink-600', bgColor: 'bg-pink-50', gradient: 'from-pink-500 to-pink-600' },
};

// Animated Background Orb
function AnimatedOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// Floating Particle
function FloatingParticle({ delay, x, y, color }: { delay: number; x: number; y: number; color: string }) {
  return (
    <motion.div
      className={`absolute w-2 h-2 rounded-full ${color} pointer-events-none`}
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function SimulationPage() {
  const {
    gameState,
    isLoading,
    error,
    selectedRole,
    demoMode,
    initializeGame,
    setSelectedRole,
    advanceRound,
    resetGame,
    submitDecision,
  } = useSimulationStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'decisions' | 'reports'>('dashboard');

  useEffect(() => {
    if (!gameState) {
      initializeGame();
    }
  }, [gameState, initializeGame]);

  if (isLoading && !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-silver-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <div className="w-full h-full rounded-full border-4 border-silver-200 border-t-primary-500" />
          </motion.div>
          <p className="text-silver-600 font-medium">Initializing simulation...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-silver-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-danger-500" />
          </div>
          <h2 className="text-xl font-bold text-silver-900 mb-2">Error</h2>
          <p className="text-silver-600 mb-6">{error}</p>
          <button onClick={() => initializeGame()} className="btn-primary">
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!gameState) return null;

  const sharePrice = calculateSharePrice(gameState);
  const yearLabel = `Year ${gameState.round}`;

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-white via-silver-50 to-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AnimatedOrb className="w-96 h-96 bg-primary-200 -top-48 -right-48" />
        <AnimatedOrb className="w-80 h-80 bg-accent-200 top-1/2 -left-40" delay={2} />
        <AnimatedOrb className="w-64 h-64 bg-gold-200 bottom-20 right-1/4" delay={4} />
        <FloatingParticle delay={0} x={10} y={30} color="bg-primary-300" />
        <FloatingParticle delay={1} x={85} y={20} color="bg-accent-300" />
        <FloatingParticle delay={2} x={30} y={70} color="bg-gold-300" />
        <FloatingParticle delay={3} x={70} y={60} color="bg-success-300" />
      </div>

      {/* Top Navigation Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Left: Logo & Back */}
            <div className="flex items-center gap-4">
              <Link href="/" className="text-silver-400 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow-purple"
                >
                  <Layers className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <span className="font-bold text-silver-800">Praxis</span>
                  <span className="font-bold gradient-text">Sim</span>
                </div>
              </div>
            </div>

            {/* Center: Round & Year Info */}
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white shadow-luxury border border-silver-100"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <span className="font-bold text-silver-900">{yearLabel}</span>
                  <span className="text-silver-400 ml-1">of {gameState.maxRounds}</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-semibold shadow-luxury',
                  gameState.phase === 'decisions_open'
                    ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-700 border border-success-200'
                    : gameState.phase === 'decisions_locked'
                    ? 'bg-gradient-to-r from-warning-50 to-warning-100 text-warning-700 border border-warning-200'
                    : 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200'
                )}
              >
                {gameState.phase === 'decisions_open' ? 'Decisions Open' :
                 gameState.phase === 'decisions_locked' ? 'Locked' : 'Processing'}
              </motion.div>

              <StockTicker price={sharePrice} change={sharePrice - 100} />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {demoMode && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => advanceRound()}
                  disabled={isLoading || gameState.round >= gameState.maxRounds}
                  className={cn(
                    'btn-primary gap-2',
                    (isLoading || gameState.round >= gameState.maxRounds) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Play className="w-4 h-4" />
                  Advance Year
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => resetGame()}
                disabled={isLoading}
                className="btn-secondary gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-6 relative">
        <div className="max-w-[1600px] mx-auto">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-8"
          >
            {[
              { id: 'dashboard', label: 'Dashboard', icon: PieChart },
              { id: 'decisions', label: 'Decisions', icon: Target },
              { id: 'reports', label: 'Reports & Events', icon: Activity },
            ].map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow-purple'
                    : 'bg-white text-silver-600 hover:text-primary-600 shadow-luxury border border-silver-100 hover:border-primary-200'
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Dashboard View */}
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DashboardView gameState={gameState} sharePrice={sharePrice} />
              </motion.div>
            )}

            {/* Decisions View */}
            {activeTab === 'decisions' && (
              <motion.div
                key="decisions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DecisionsView
                  gameState={gameState}
                  selectedRole={selectedRole}
                  setSelectedRole={setSelectedRole}
                  submitDecision={submitDecision}
                  isLoading={isLoading}
                />
              </motion.div>
            )}

            {/* Reports View */}
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ReportsView gameState={gameState} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Stock Ticker Component
function StockTicker({ price, change }: { price: number; change: number }) {
  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white shadow-luxury border border-silver-100"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: isPositive ? [0, 10, 0] : [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            isPositive ? 'bg-success-50' : 'bg-danger-50'
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-success-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-danger-600" />
          )}
        </motion.div>
        <div>
          <div className="text-xs text-silver-500 uppercase tracking-wider">Stock</div>
          <div className="font-bold text-silver-900">${price.toFixed(2)}</div>
        </div>
      </div>
      <div className={cn(
        'px-2.5 py-1 rounded-lg text-sm font-bold',
        isPositive ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
      )}>
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </div>
    </motion.div>
  );
}

// Dashboard View Component
function DashboardView({ gameState, sharePrice }: { gameState: GameState; sharePrice: number }) {
  const company = gameState.company;
  const scorecard = gameState.scorecard;

  const kpis = [
    {
      label: 'Revenue',
      value: formatCurrency(company.revenue),
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      gradient: 'from-success-400 to-success-500',
    },
    {
      label: 'Market Growth',
      value: formatPercent(scorecard.growth / 100),
      change: '+3.2%',
      trend: 'up' as const,
      icon: PieChart,
      gradient: 'from-primary-400 to-primary-500',
    },
    {
      label: 'Brand Trust',
      value: formatPercent(company.brandTrust / 100),
      change: company.brandTrust >= 70 ? '+2.5%' : '-1.5%',
      trend: company.brandTrust >= 70 ? 'up' as const : 'down' as const,
      icon: Heart,
      gradient: 'from-accent-400 to-accent-500',
    },
    {
      label: 'Stock Price',
      value: `$${sharePrice.toFixed(2)}`,
      change: `${sharePrice >= 100 ? '+' : ''}${(sharePrice - 100).toFixed(1)}%`,
      trend: sharePrice >= 100 ? 'up' as const : 'down' as const,
      icon: TrendingUp,
      gradient: 'from-gold-400 to-gold-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-luxury group"
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}
              >
                <kpi.icon className="w-6 h-6 text-white" />
              </motion.div>
              <div className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold',
                kpi.trend === 'up' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
              )}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {kpi.change}
              </div>
            </div>
            <div className="text-sm text-silver-500 mb-1">{kpi.label}</div>
            <div className="text-3xl font-bold text-silver-900">{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 card-luxury"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-silver-900">Performance Trend</h3>
            <div className="flex items-center gap-2">
              {['Revenue', 'Profit', 'Growth'].map((item, i) => (
                <span key={item} className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium',
                  i === 0 ? 'bg-primary-50 text-primary-600' : 'bg-silver-100 text-silver-500'
                )}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="h-64 flex items-end justify-center gap-3 px-4">
            {[40, 55, 45, 65, 58, 72, 80, 75, 88, 85, 92, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.8, ease: "easeOut" }}
                whileHover={{ scale: 1.1 }}
                className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg cursor-pointer shadow-sm hover:shadow-glow-purple transition-shadow"
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-silver-400 px-4">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </motion.div>

        {/* Balanced Scorecard */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-luxury"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-silver-900">Balanced Scorecard</h3>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-5 h-5 text-gold-500" />
            </motion.div>
          </div>
          <div className="space-y-5">
            {[
              { name: 'Financial Health', value: 78, gradient: 'from-success-400 to-success-500' },
              { name: 'Market Growth', value: 65, gradient: 'from-primary-400 to-primary-500' },
              { name: 'Brand Trust', value: 82, gradient: 'from-accent-400 to-accent-500' },
              { name: 'Operations', value: 71, gradient: 'from-warning-400 to-warning-500' },
              { name: 'Execution', value: 88, gradient: 'from-purple-400 to-purple-500' },
            ].map((item, index) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-silver-700 font-medium">{item.name}</span>
                  <span className="font-bold text-silver-900">{item.value}%</span>
                </div>
                <div className="h-2.5 bg-silver-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Team Status & Leaderboard */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Roles Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-silver-900">Team Roles</h3>
            <span className="px-3 py-1 rounded-lg bg-success-50 text-success-600 text-sm font-medium">
              All Ready
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(ROLE_CONFIG).slice(0, 6).map(([key, config], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-silver-100 shadow-sm hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                  <config.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-silver-900 truncate">{config.label}</div>
                  <div className="text-xs text-success-600">Submitted</div>
                </div>
                <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-silver-900">Leaderboard</h3>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Award className="w-5 h-5 text-gold-500" />
            </motion.div>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Team Alpha', score: 428, rank: 1 },
              { name: 'Your Team', score: 412, rank: 2, isYou: true },
              { name: 'Team Delta', score: 395, rank: 3 },
              { name: 'Team Sigma', score: 378, rank: 4 },
            ].map((team, index) => (
              <motion.div
                key={team.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl transition-all',
                  team.isYou
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200 shadow-glow-purple'
                    : team.rank === 1
                    ? 'bg-gradient-to-r from-gold-50 to-gold-100 border border-gold-200'
                    : 'bg-silver-50 hover:bg-silver-100'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg',
                  team.rank === 1 ? 'bg-gradient-to-br from-gold-400 to-gold-500' :
                  team.rank === 2 ? 'bg-gradient-to-br from-silver-400 to-silver-500' :
                  team.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                  'bg-silver-300'
                )}>
                  {team.rank}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-silver-900">{team.name}</div>
                  <div className="text-xs text-silver-500">Rank #{team.rank}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-silver-900">{team.score}</div>
                  <div className="text-xs text-silver-500">points</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Decisions View Component
function DecisionsView({
  gameState,
  selectedRole,
  setSelectedRole,
  submitDecision,
  isLoading,
}: {
  gameState: GameState;
  selectedRole: Role | null;
  setSelectedRole: (role: Role | null) => void;
  submitDecision: (role: Role, decision: Record<string, number | string>) => void;
  isLoading: boolean;
}) {
  const [decisions, setDecisions] = useState<Record<string, number | string>>({});

  const handleSubmit = () => {
    if (selectedRole) {
      submitDecision(selectedRole, decisions);
      setDecisions({});
    }
  };

  return (
    <div className="space-y-8">
      {/* Role Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-luxury"
      >
        <h3 className="text-lg font-bold text-silver-900 mb-6">Select Your Role</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(ROLE_CONFIG).map(([key, config], index) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRole(key as Role)}
              className={cn(
                'flex flex-col items-center gap-3 p-4 rounded-xl transition-all',
                selectedRole === key
                  ? 'bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300 shadow-glow-purple'
                  : 'bg-white border border-silver-200 hover:border-primary-200 hover:shadow-lg'
              )}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                <config.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-silver-800 text-center">{config.label.split(' / ')[0]}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Decision Panel */}
      <AnimatePresence>
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-luxury"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${ROLE_CONFIG[selectedRole].gradient} flex items-center justify-center shadow-lg`}>
                  {(() => {
                    const Icon = ROLE_CONFIG[selectedRole].icon;
                    return <Icon className="w-7 h-7 text-white" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-silver-900">{ROLE_CONFIG[selectedRole].label}</h3>
                  <p className="text-silver-500">Make your decisions for Year {gameState.round}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-silver-400 hover:text-silver-600"
              >
                <ChevronRight className="w-6 h-6 rotate-90" />
              </button>
            </div>

            {/* Decision Form */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {getDecisionFields(selectedRole).map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-silver-800">{field.label}</span>
                    <span className="text-sm font-bold text-primary-600">
                      {field.type === 'slider' ? `${decisions[field.id] || field.default}%` : decisions[field.id] || field.default}
                    </span>
                  </label>
                  {field.type === 'slider' ? (
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      value={decisions[field.id] as number || field.default}
                      onChange={(e) => setDecisions({ ...decisions, [field.id]: Number(e.target.value) })}
                      className="w-full"
                    />
                  ) : (
                    <select
                      value={decisions[field.id] as string || field.default}
                      onChange={(e) => setDecisions({ ...decisions, [field.id]: e.target.value })}
                      className="input-field"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-silver-500">{field.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary w-full py-4 text-lg gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Submit Decisions
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reports View Component
function ReportsView({ gameState }: { gameState: GameState }) {
  return (
    <div className="space-y-8">
      {/* Events Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-luxury"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-silver-900">Market Events</h3>
          <span className="px-3 py-1 rounded-lg bg-accent-50 text-accent-600 text-sm font-medium">
            Year {gameState.round}
          </span>
        </div>
        <div className="space-y-4">
          {gameState.events.length > 0 ? (
            gameState.events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-4 rounded-xl bg-silver-50 border border-silver-100"
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  event.severity === 'high' ? 'bg-danger-100 text-danger-600' :
                  event.severity === 'medium' ? 'bg-warning-100 text-warning-600' :
                  'bg-info-100 text-info-600'
                )}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-silver-900">{event.name}</div>
                  <div className="text-sm text-silver-600 mt-1">{event.description}</div>
                  <div className="flex gap-2 mt-3">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs font-medium border",
                      event.severity === 'high' ? 'bg-danger-50 text-danger-600 border-danger-200' :
                      event.severity === 'medium' ? 'bg-warning-50 text-warning-600 border-warning-200' :
                      'bg-info-50 text-info-600 border-info-200'
                    )}>
                      {event.severity} severity
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-white text-xs font-medium text-silver-600 border border-silver-200">
                      Round {event.round}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-silver-500">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No market events this round</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Round Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-luxury"
      >
        <h3 className="text-lg font-bold text-silver-900 mb-6">Round Summary</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-xl bg-success-50 border border-success-100">
            <div className="text-4xl font-bold text-success-600 mb-2">+12%</div>
            <div className="text-sm text-success-700">Revenue Growth</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-primary-50 border border-primary-100">
            <div className="text-4xl font-bold text-primary-600 mb-2">+5%</div>
            <div className="text-sm text-primary-700">Market Share</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-gold-50 border border-gold-100">
            <div className="text-4xl font-bold text-gold-600 mb-2">#2</div>
            <div className="text-sm text-gold-700">Leaderboard Rank</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper function to calculate share price
function calculateSharePrice(gameState: GameState): number {
  const company = gameState.company;
  const scorecard = gameState.scorecard;
  const basePrice = 100;
  const revenueMultiplier = company.revenue / 100 * 0.5;
  const growthBonus = scorecard.growth * 0.8;
  const trustBonus = company.brandTrust * 0.3;
  const profitFactor = Math.max(0, company.profit / company.revenue) * 20;

  return basePrice + revenueMultiplier + growthBonus + trustBonus + profitFactor;
}

// Helper function to get decision fields for each role
type DecisionField = {
  id: string;
  label: string;
  type: 'slider' | 'select';
  min?: number;
  max?: number;
  default: number | string;
  description: string;
  options?: Array<{ value: string; label: string }>;
};

function getDecisionFields(role: Role): DecisionField[] {
  const fields: Record<Role, DecisionField[]> = {
    strategy: [
      { id: 'riskAppetite', label: 'Risk Appetite', type: 'slider', min: 0, max: 100, default: 50, description: 'Higher risk can lead to higher rewards but also bigger losses' },
      { id: 'growthFocus', label: 'Growth Focus', type: 'select', default: 'balanced', description: 'Choose your strategic growth direction', options: [
        { value: 'aggressive', label: 'Aggressive Expansion' },
        { value: 'balanced', label: 'Balanced Growth' },
        { value: 'conservative', label: 'Conservative/Consolidate' },
      ]},
      { id: 'capitalAllocation', label: 'Capital Allocation', type: 'slider', min: 0, max: 100, default: 60, description: 'Percentage of capital allocated to growth initiatives' },
      { id: 'innovation', label: 'Innovation Investment', type: 'slider', min: 0, max: 100, default: 40, description: 'Investment in new products and services' },
    ],
    marketing: [
      { id: 'marketingBudget', label: 'Marketing Budget', type: 'slider', min: 0, max: 100, default: 50, description: 'Percentage of revenue allocated to marketing' },
      { id: 'pricingStrategy', label: 'Pricing Strategy', type: 'select', default: 'competitive', description: 'Your pricing approach', options: [
        { value: 'premium', label: 'Premium Pricing' },
        { value: 'competitive', label: 'Competitive Pricing' },
        { value: 'penetration', label: 'Penetration Pricing' },
      ]},
      { id: 'brandInvestment', label: 'Brand Investment', type: 'slider', min: 0, max: 100, default: 45, description: 'Investment in brand building and awareness' },
      { id: 'channelMix', label: 'Digital Channel Focus', type: 'slider', min: 0, max: 100, default: 60, description: 'Percentage of marketing through digital channels' },
    ],
    sales: [
      { id: 'salesTargets', label: 'Sales Targets', type: 'slider', min: 0, max: 100, default: 70, description: 'Aggressiveness of sales targets' },
      { id: 'discountPolicy', label: 'Discount Policy', type: 'select', default: 'moderate', description: 'Your discounting approach', options: [
        { value: 'none', label: 'No Discounts' },
        { value: 'moderate', label: 'Moderate Discounts' },
        { value: 'aggressive', label: 'Aggressive Discounts' },
      ]},
      { id: 'territoryExpansion', label: 'Territory Expansion', type: 'slider', min: 0, max: 100, default: 40, description: 'Investment in new market territories' },
      { id: 'partnerPrograms', label: 'Partner Programs', type: 'slider', min: 0, max: 100, default: 35, description: 'Investment in partner and reseller programs' },
    ],
    operations: [
      { id: 'capacity', label: 'Capacity Investment', type: 'slider', min: 0, max: 100, default: 55, description: 'Investment in production capacity' },
      { id: 'quality', label: 'Quality Focus', type: 'slider', min: 0, max: 100, default: 70, description: 'Investment in quality control and assurance' },
      { id: 'efficiency', label: 'Efficiency Programs', type: 'slider', min: 0, max: 100, default: 60, description: 'Investment in operational efficiency' },
      { id: 'supplyChain', label: 'Supply Chain Resilience', type: 'slider', min: 0, max: 100, default: 50, description: 'Investment in supply chain diversification' },
    ],
    rnd: [
      { id: 'rndBudget', label: 'R&D Budget', type: 'slider', min: 0, max: 100, default: 65, description: 'Percentage of revenue allocated to R&D' },
      { id: 'innovationFocus', label: 'Innovation Focus', type: 'select', default: 'balanced', description: 'Your R&D strategy', options: [
        { value: 'incremental', label: 'Incremental Improvements' },
        { value: 'balanced', label: 'Balanced Portfolio' },
        { value: 'breakthrough', label: 'Breakthrough Innovation' },
      ]},
      { id: 'techStack', label: 'Technology Investment', type: 'slider', min: 0, max: 100, default: 55, description: 'Investment in core technology infrastructure' },
      { id: 'security', label: 'Security & Privacy', type: 'slider', min: 0, max: 100, default: 70, description: 'Investment in security and data privacy' },
    ],
    legal: [
      { id: 'compliance', label: 'Compliance Investment', type: 'slider', min: 0, max: 100, default: 60, description: 'Investment in regulatory compliance' },
      { id: 'riskManagement', label: 'Risk Management', type: 'slider', min: 0, max: 100, default: 55, description: 'Investment in risk assessment and mitigation' },
      { id: 'dataGovernance', label: 'Data Governance', type: 'slider', min: 0, max: 100, default: 65, description: 'Investment in data governance and protection' },
      { id: 'auditReadiness', label: 'Audit Readiness', type: 'slider', min: 0, max: 100, default: 50, description: 'Investment in audit preparation' },
    ],
    gm: [
      { id: 'hiring', label: 'Hiring Investment', type: 'slider', min: 0, max: 100, default: 50, description: 'Investment in recruiting and hiring' },
      { id: 'compensation', label: 'Compensation Level', type: 'select', default: 'competitive', description: 'Your compensation strategy', options: [
        { value: 'below', label: 'Below Market' },
        { value: 'competitive', label: 'Market Competitive' },
        { value: 'above', label: 'Above Market' },
      ]},
      { id: 'culture', label: 'Culture Investment', type: 'slider', min: 0, max: 100, default: 60, description: 'Investment in company culture and engagement' },
      { id: 'development', label: 'Talent Development', type: 'slider', min: 0, max: 100, default: 55, description: 'Investment in training and development' },
    ],
  };

  return fields[role] || [];
}
