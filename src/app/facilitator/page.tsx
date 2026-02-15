'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Play,
  Pause,
  Settings,
  BarChart3,
  Trophy,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Zap,
  Eye,
  Download,
  Layers,
  Activity,
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Award,
  Sparkles,
  Globe,
  Send,
  MessageSquare,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function FacilitatorPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'events' | 'settings'>('overview');
  const [simulationActive, setSimulationActive] = useState(true);

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-white via-silver-50 to-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <AnimatedOrb className="w-96 h-96 bg-primary-200 -top-48 -left-48" />
        <AnimatedOrb className="w-80 h-80 bg-gold-200 top-1/3 -right-40" delay={2} />
        <AnimatedOrb className="w-64 h-64 bg-success-200 bottom-20 left-1/4" delay={4} />
      </div>

      {/* Header */}
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
                  <span className="text-silver-400 text-sm ml-2">Facilitator</span>
                </div>
              </div>
            </div>

            {/* Center: Simulation Status */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: simulationActive ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  'flex items-center gap-3 px-5 py-2.5 rounded-xl shadow-luxury',
                  simulationActive
                    ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-700 border border-success-200'
                    : 'bg-gradient-to-r from-silver-50 to-silver-100 text-silver-600 border border-silver-200'
                )}
              >
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  simulationActive ? 'bg-success-500 animate-pulse' : 'bg-silver-400'
                )} />
                <span className="font-semibold">{simulationActive ? 'Simulation Active' : 'Simulation Paused'}</span>
              </motion.div>

              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white shadow-luxury border border-silver-100">
                <Calendar className="w-4 h-4 text-primary-600" />
                <span className="font-bold text-silver-900">Round 5</span>
                <span className="text-silver-400">of 8</span>
              </div>

              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white shadow-luxury border border-silver-100">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="font-bold text-silver-900">6 Teams</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSimulationActive(!simulationActive)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-luxury',
                  simulationActive
                    ? 'bg-warning-50 text-warning-700 border border-warning-200 hover:bg-warning-100'
                    : 'bg-success-50 text-success-700 border border-success-200 hover:bg-success-100'
                )}
              >
                {simulationActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {simulationActive ? 'Pause' : 'Resume'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Advance Round
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
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'teams', label: 'Teams', icon: Users },
              { id: 'events', label: 'Events', icon: Zap },
              { id: 'settings', label: 'Settings', icon: Settings },
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

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <OverviewTab />
              </motion.div>
            )}

            {activeTab === 'teams' && (
              <motion.div
                key="teams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TeamsTab />
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EventsTab />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <SettingsTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Overview Tab Component
function OverviewTab() {
  const teams = [
    { name: 'Team Alpha', score: 428, revenue: 24500000, marketShare: 34, trend: 'up', decisions: 'submitted' },
    { name: 'Team Omega', score: 412, revenue: 21800000, marketShare: 29, trend: 'up', decisions: 'submitted' },
    { name: 'Team Delta', score: 395, revenue: 19200000, marketShare: 25, trend: 'down', decisions: 'pending' },
    { name: 'Team Sigma', score: 378, revenue: 17600000, marketShare: 22, trend: 'up', decisions: 'submitted' },
    { name: 'Team Beta', score: 356, revenue: 15400000, marketShare: 18, trend: 'down', decisions: 'pending' },
    { name: 'Team Gamma', score: 342, revenue: 14200000, marketShare: 16, trend: 'up', decisions: 'submitted' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Teams', value: '6', icon: Users, gradient: 'from-primary-400 to-primary-500', change: 'All connected' },
          { label: 'Current Round', value: '5/8', icon: Target, gradient: 'from-accent-400 to-accent-500', change: '62.5% complete' },
          { label: 'Decisions Pending', value: '2', icon: Clock, gradient: 'from-warning-400 to-warning-500', change: '4 submitted' },
          { label: 'Avg. Score', value: '385', icon: Trophy, gradient: 'from-gold-400 to-gold-500', change: '+12 this round' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-luxury group"
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <div className="text-sm text-silver-500 mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-silver-900 mb-1">{stat.value}</div>
            <div className="text-sm text-silver-400">{stat.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 card-luxury"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-silver-900">Team Leaderboard</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-silver-50 text-silver-600 text-sm font-medium hover:bg-silver-100"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-silver-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-silver-500 uppercase tracking-wider">Rank</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-silver-500 uppercase tracking-wider">Team</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-silver-500 uppercase tracking-wider">Score</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-silver-500 uppercase tracking-wider">Revenue</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-silver-500 uppercase tracking-wider">Market Share</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-silver-500 uppercase tracking-wider">Decisions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => (
                  <motion.tr
                    key={team.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-silver-50 hover:bg-silver-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg',
                        index === 0 ? 'bg-gradient-to-br from-gold-400 to-gold-500' :
                        index === 1 ? 'bg-gradient-to-br from-silver-400 to-silver-500' :
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                        'bg-silver-300'
                      )}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-silver-900">{team.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-silver-900">{team.score}</span>
                        {team.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-success-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-danger-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-silver-700">
                      ${(team.revenue / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-silver-100 rounded-full max-w-[80px]">
                          <div
                            className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                            style={{ width: `${team.marketShare}%` }}
                          />
                        </div>
                        <span className="text-silver-700">{team.marketShare}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        team.decisions === 'submitted'
                          ? 'bg-success-50 text-success-600'
                          : 'bg-warning-50 text-warning-600'
                      )}>
                        {team.decisions === 'submitted' ? 'Submitted' : 'Pending'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-luxury"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-silver-900">Activity Feed</h3>
            <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold">Live</span>
          </div>
          <div className="space-y-4">
            {[
              { team: 'Team Alpha', action: 'submitted decisions', time: '2m ago', icon: CheckCircle, color: 'text-success-500' },
              { team: 'Team Sigma', action: 'submitted decisions', time: '5m ago', icon: CheckCircle, color: 'text-success-500' },
              { team: 'Team Gamma', action: 'submitted decisions', time: '8m ago', icon: CheckCircle, color: 'text-success-500' },
              { team: 'Team Omega', action: 'submitted decisions', time: '12m ago', icon: CheckCircle, color: 'text-success-500' },
              { team: 'System', action: 'Round 5 started', time: '15m ago', icon: Play, color: 'text-primary-500' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-silver-50 transition-colors"
              >
                <div className={cn('w-8 h-8 rounded-lg bg-silver-100 flex items-center justify-center', item.color)}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-silver-800">
                    <span className="font-semibold">{item.team}</span> {item.action}
                  </p>
                  <p className="text-xs text-silver-400">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Teams Tab Component
function TeamsTab() {
  const teams = [
    { name: 'Team Alpha', members: ['Alice Chen (CEO)', 'Bob Smith (CFO)', 'Carol Davis (CMO)', 'Dan Wilson (COO)'], score: 428, status: 'active' },
    { name: 'Team Omega', members: ['Eve Brown (CEO)', 'Frank Lee (CFO)', 'Grace Kim (CMO)', 'Henry Park (COO)'], score: 412, status: 'active' },
    { name: 'Team Delta', members: ['Ivy Johnson (CEO)', 'Jack White (CFO)', 'Kate Moore (CMO)', 'Leo Taylor (COO)'], score: 395, status: 'pending' },
    { name: 'Team Sigma', members: ['Mike Garcia (CEO)', 'Nina Patel (CFO)', 'Oscar Rivera (CMO)', 'Paula Adams (COO)'], score: 378, status: 'active' },
    { name: 'Team Beta', members: ['Quinn Foster (CEO)', 'Rosa Martinez (CFO)', 'Sam Thomas (CMO)', 'Tina Clark (COO)'], score: 356, status: 'pending' },
    { name: 'Team Gamma', members: ['Uma Shah (CEO)', 'Victor Nguyen (CFO)', 'Wendy Hall (CMO)', 'Xavier Lopez (COO)'], score: 342, status: 'active' },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team, index) => (
        <motion.div
          key={team.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card-luxury group"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-silver-900">{team.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                  team.status === 'active'
                    ? 'bg-success-50 text-success-600'
                    : 'bg-warning-50 text-warning-600'
                )}>
                  {team.status === 'active' ? 'Submitted' : 'Pending'}
                </span>
                <span className="text-sm text-silver-500">Rank #{index + 1}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-silver-900">{team.score}</div>
              <div className="text-xs text-silver-500">points</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {team.members.map((member) => (
              <div key={member} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center text-white text-xs font-semibold">
                  {member.charAt(0)}
                </div>
                <span className="text-silver-700">{member}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-silver-50 text-silver-700 text-sm font-medium hover:bg-silver-100"
            >
              <Eye className="w-4 h-4" />
              View
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-50 text-primary-600 text-sm font-medium hover:bg-primary-100"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Events Tab Component
function EventsTab() {
  const availableEvents = [
    { id: 1, name: 'Market Crash', description: 'A sudden 20% drop in market demand', severity: 'high', impact: { revenue: -20, trust: -10 } },
    { id: 2, name: 'New Regulation', description: 'Government introduces compliance requirements', severity: 'medium', impact: { costs: 15, trust: 5 } },
    { id: 3, name: 'Competitor Entry', description: 'A major competitor enters the market', severity: 'medium', impact: { marketShare: -10 } },
    { id: 4, name: 'Economic Boom', description: 'Strong economic growth increases demand', severity: 'low', impact: { revenue: 15, marketShare: 5 } },
    { id: 5, name: 'Supply Chain Crisis', description: 'Global supply chain disruption', severity: 'high', impact: { costs: 25, quality: -15 } },
    { id: 6, name: 'Tech Breakthrough', description: 'New technology enables cost savings', severity: 'low', impact: { costs: -20, quality: 10 } },
  ];

  return (
    <div className="space-y-8">
      {/* Event Injection Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-luxury"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-silver-900">Inject Market Event</h3>
            <p className="text-sm text-silver-500 mt-1">Select an event to inject into the simulation</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 text-primary-600 text-sm font-medium hover:bg-primary-100"
          >
            <Plus className="w-4 h-4" />
            Custom Event
          </motion.button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={cn(
                'p-4 rounded-xl border-2 cursor-pointer transition-all',
                event.severity === 'high'
                  ? 'border-danger-200 bg-danger-50 hover:border-danger-300'
                  : event.severity === 'medium'
                  ? 'border-warning-200 bg-warning-50 hover:border-warning-300'
                  : 'border-success-200 bg-success-50 hover:border-success-300'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-silver-900">{event.name}</h4>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold uppercase',
                  event.severity === 'high' ? 'bg-danger-100 text-danger-700' :
                  event.severity === 'medium' ? 'bg-warning-100 text-warning-700' :
                  'bg-success-100 text-success-700'
                )}>
                  {event.severity}
                </span>
              </div>
              <p className="text-sm text-silver-600 mb-3">{event.description}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(event.impact).map(([key, value]) => (
                  <span
                    key={key}
                    className={cn(
                      'px-2 py-1 rounded-lg text-xs font-medium',
                      value > 0 ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                    )}
                  >
                    {key}: {value > 0 ? '+' : ''}{value}%
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Event History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-luxury"
      >
        <h3 className="text-lg font-bold text-silver-900 mb-6">Event History</h3>
        <div className="space-y-3">
          {[
            { name: 'Regulatory Change', round: 4, teams: 'All teams', status: 'resolved' },
            { name: 'Market Boom', round: 3, teams: 'All teams', status: 'resolved' },
            { name: 'Supply Disruption', round: 2, teams: 'All teams', status: 'resolved' },
          ].map((event, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-silver-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Zap className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <div className="font-semibold text-silver-900">{event.name}</div>
                  <div className="text-sm text-silver-500">Round {event.round} • {event.teams}</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-silver-200 text-silver-600 text-xs font-semibold">
                {event.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-luxury"
      >
        <h3 className="text-lg font-bold text-silver-900 mb-6">Simulation Settings</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-silver-800 mb-2">Round Duration</label>
              <select className="input-field">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-silver-800 mb-2">Total Rounds</label>
              <select className="input-field">
                <option>6 rounds</option>
                <option>8 rounds</option>
                <option>10 rounds</option>
                <option>12 rounds</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-silver-800 mb-2">Event Frequency</label>
              <select className="input-field">
                <option>Low (1-2 per simulation)</option>
                <option>Medium (3-4 per simulation)</option>
                <option>High (5-6 per simulation)</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-silver-800 mb-2">Competition Mode</label>
              <select className="input-field">
                <option>Head-to-Head</option>
                <option>Market Competition</option>
                <option>Cooperative</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-silver-800 mb-2">Difficulty Level</label>
              <select className="input-field">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-silver-800 mb-2">Auto-advance Rounds</label>
              <select className="input-field">
                <option>Disabled</option>
                <option>After all submissions</option>
                <option>After timeout</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-silver-100 flex justify-end gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary"
          >
            Reset to Defaults
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary"
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-luxury"
      >
        <h3 className="text-lg font-bold text-silver-900 mb-6">Export & Reports</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Export Leaderboard', icon: Trophy, desc: 'Download current rankings as CSV' },
            { label: 'Export Decisions', icon: Target, desc: 'Download all team decisions' },
            { label: 'Export Analytics', icon: BarChart3, desc: 'Download comprehensive report' },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-silver-50 hover:bg-silver-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm mb-3">
                <item.icon className="w-5 h-5 text-primary-500" />
              </div>
              <div className="font-semibold text-silver-900">{item.label}</div>
              <div className="text-sm text-silver-500 mt-1">{item.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
