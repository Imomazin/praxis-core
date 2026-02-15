'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  TrendingUp,
  DollarSign,
  Cog,
  Target,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Users,
  Clock,
  Play,
  AlertTriangle,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Quote,
  Building2,
  Briefcase,
  Award,
  Globe,
  Flame,
  Eye,
  Sun,
  Moon,
  Sparkles,
  Hexagon,
  Triangle,
  Circle,
  Square,
  Layers,
  Activity,
  ShieldAlert,
  Scale,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// COVER PAGE COMPONENT
// =============================================================================

function CoverPage({ onEnter }: { onEnter: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const taglineTimer = setTimeout(() => setShowTagline(true), 800);
    const buttonTimer = setTimeout(() => setShowButton(true), 1600);
    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden ${
        theme === 'light'
          ? 'bg-gradient-to-br from-[#E8DCFF] via-[#F5F0FF] to-[#E8F0FF]'
          : 'bg-[#050508]'
      }`}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Video Background */}
      {!videoError && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/scenarios/scenario-01.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
        />
      )}
      {/* Video Overlay for readability */}
      <div
        className={`absolute inset-0 ${
          theme === 'light'
            ? 'bg-gradient-to-br from-[#E8DCFF]/80 via-[#F5F0FF]/70 to-[#E8F0FF]/80'
            : 'bg-gradient-to-br from-black/60 via-black/40 to-black/60'
        }`}
      />
      {/* Top Right Actions - Theme Toggle + Sign In */}
      <motion.div
        className="absolute top-8 right-8 flex items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={toggleTheme}
          className={`p-4 rounded-2xl transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white/70 backdrop-blur-sm border border-indigo-200/50 hover:bg-white shadow-sm'
              : 'bg-white/5 backdrop-blur-sm border border-cyan-500/20 hover:bg-white/10'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === 'light' ? (
            <Sun className="w-6 h-6 text-amber-500" />
          ) : (
            <Moon className="w-6 h-6 text-cyan-400" />
          )}
        </motion.button>
        <Link href="/login">
          <motion.div
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              theme === 'light'
                ? 'bg-white/80 backdrop-blur-sm border border-indigo-200/50 text-indigo-700 hover:bg-white shadow-sm'
                : 'bg-white/10 backdrop-blur-sm border border-cyan-500/30 text-cyan-300 hover:bg-white/15'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.div>
        </Link>
      </motion.div>

      {/* Light Theme Background - Clipchamp style */}
      {theme === 'light' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Flowing gradient orbs */}
          <motion.div
            className="absolute -top-1/3 -left-1/4 w-[900px] h-[900px] bg-gradient-to-br from-indigo-300/50 via-purple-200/40 to-violet-200/50 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 30, 0],
              x: [0, 80, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-1/3 -right-1/4 w-[800px] h-[800px] bg-gradient-to-tl from-purple-200/50 via-indigo-100/40 to-blue-200/50 rounded-full blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [30, 0, 30],
              x: [0, -60, 0],
              y: [0, 60, 0],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-100/40 via-indigo-100/30 to-purple-100/40 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating shapes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + (i * 12) % 70}%`,
                top: `${20 + (i * 17) % 60}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            >
              {i % 4 === 0 && <Circle className="w-8 h-8 text-indigo-300/40" strokeWidth={1} />}
              {i % 4 === 1 && <Triangle className="w-10 h-10 text-purple-300/40" strokeWidth={1} />}
              {i % 4 === 2 && <Square className="w-6 h-6 text-indigo-300/40" strokeWidth={1} />}
              {i % 4 === 3 && <Hexagon className="w-12 h-12 text-violet-300/40" strokeWidth={1} />}
            </motion.div>
          ))}
        </div>
      )}

      {/* Dark Theme Background */}
      {theme === 'dark' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Neon orbs */}
          <motion.div
            className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[150px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-fuchsia-500/8 rounded-full blur-[130px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.05, 0.1] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[100px] transform -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 15, repeat: Infinity }}
          />

          {/* Floating particles */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${
                i % 3 === 0 ? 'bg-cyan-400/60' : i % 3 === 1 ? 'bg-fuchsia-400/60' : 'bg-violet-400/60'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -150],
                x: [0, (Math.random() - 0.5) * 50],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 8 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "easeOut"
              }}
            />
          ))}

          {/* Scanning line effect */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center px-8 lg:px-16 max-w-6xl mx-auto">
        {/* Logo/Brand Mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12"
        >
          <div className={`relative inline-flex items-center justify-center w-32 h-32 mx-auto ${
            theme === 'light'
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
              : 'bg-gradient-to-br from-cyan-500 to-violet-600'
          } rounded-3xl shadow-2xl ${
            theme === 'light' ? 'shadow-indigo-500/30' : 'shadow-cyan-500/30'
          }`}>
            <Layers className="w-16 h-16 text-white" strokeWidth={1.5} />

            {/* Orbiting elements */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className={`absolute -top-2 left-1/2 w-4 h-4 -translate-x-1/2 rounded-full ${
                theme === 'light' ? 'bg-purple-400' : 'bg-cyan-400'
              }`} />
            </motion.div>
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <div className={`absolute top-1/2 -right-2 w-3 h-3 -translate-y-1/2 rounded-full ${
                theme === 'light' ? 'bg-indigo-400' : 'bg-fuchsia-400'
              }`} />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight ${
            theme === 'light'
              ? 'text-slate-800'
              : 'text-white'
          }`}
        >
          <span className={`${
            theme === 'light'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 bg-clip-text text-transparent'
          }`}>
            PRAXIS
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={`text-lg md:text-xl font-medium mb-4 tracking-wide ${
            theme === 'light' ? 'text-indigo-600' : 'text-cyan-400'
          }`}
        >
          SIMULATION SUITE
        </motion.p>

        {/* Tagline */}
        <AnimatePresence>
          {showTagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className={`text-base md:text-lg mb-16 max-w-3xl mx-auto leading-relaxed ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Run the company. Feel the consequences.
              <span className={`block mt-2 text-lg ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-500'
              }`}>
                Executive simulations for those who lead—or aspire to.
              </span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Enter Button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
            >
              <motion.button
                onClick={onEnter}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`group relative px-16 py-6 text-lg font-bold rounded-2xl transition-all duration-500 ${
                  theme === 'light'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glow effect */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-indigo-400 to-purple-400'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-400'
                  } opacity-0 blur-xl transition-opacity duration-500 ${isHovering ? 'opacity-50' : ''}`}
                />

                <span className="relative flex items-center gap-4">
                  <Play className="w-7 h-7" />
                  Enter Experience
                  <motion.span
                    animate={{ x: isHovering ? 8 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.span>
                </span>
              </motion.button>

              {/* Pulse rings */}
              <div className="relative mt-8 flex justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-4 h-4 rounded-full ${
                      theme === 'light' ? 'bg-indigo-400' : 'bg-cyan-400'
                    }`}
                    animate={{
                      scale: [1, 3, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Attribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className={`absolute bottom-8 text-center ${
          theme === 'light' ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        <p className="text-sm tracking-wider uppercase">
          Crafted for Executive Education & Leadership Development
        </p>
      </motion.div>

      {/* Activity indicator */}
      <motion.div
        className={`absolute bottom-8 right-8 flex items-center gap-2 ${
          theme === 'light' ? 'text-indigo-500' : 'text-cyan-400'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <Activity className="w-4 h-4" />
        <motion.div
          className={`w-2 h-2 rounded-full ${
            theme === 'light' ? 'bg-indigo-500' : 'bg-cyan-400'
          }`}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// CINEMATIC HERO DATA
// =============================================================================

const HERO_SCENARIOS = [
  {
    title: "The board wants blood.",
    subtitle: "Your stock is down 40%. Activist investors circle. The CFO says cut costs. The CPO says you'll lose your best people. You have 72 hours.",
    lightGradient: "from-[#E8DCFF] via-[#F0E6FF] to-[#E8F0FF]",
    darkGradient: "from-red-950 via-slate-950 to-purple-950",
  },
  {
    title: "Your competitor just blinked.",
    subtitle: "They've slashed prices 30%. Your sales team is panicking. Marketing wants to match. Finance says you'll destroy two years of margin. The clock is ticking.",
    lightGradient: "from-[#E0E8FF] via-[#F0F0FF] to-[#E8ECFF]",
    darkGradient: "from-blue-950 via-slate-950 to-cyan-950",
  },
  {
    title: "Cash runs out in 6 months.",
    subtitle: "The Series C fell through. Your burn rate is $2.3M/month. The team doesn't know. Do you tell them now, or wait until you have a plan?",
    lightGradient: "from-[#E0F0F0] via-[#F0F8FF] to-[#E8F4FF]",
    darkGradient: "from-emerald-950 via-slate-950 to-teal-950",
  },
  {
    title: "The factory just went dark.",
    subtitle: "Your sole supplier in Taiwan stopped shipping. Three weeks of inventory. Q4 commitments to 50 enterprise clients. The COO is calling.",
    lightGradient: "from-[#F0E8E0] via-[#FFF8F0] to-[#FFF0E8]",
    darkGradient: "from-orange-950 via-slate-950 to-amber-950",
  },
];

const SIMULATIONS = [
  {
    id: 'strategic-leadership',
    title: 'Strategic Leadership',
    subtitle: 'Governing Under Uncertainty',
    tagline: 'The boardroom simulation where your job is on the line',
    icon: Crown,
    iconImage: '/assets/icon-sim-strategic-leadership.svg',
    bgImage: '/assets/bg-role-executive-office.png',
    color: 'violet',
    duration: '3-4 hours',
    players: '3-5 players',
    rounds: 8,
    hook: "You are the CEO of a publicly traded company. Board confidence is slipping. An activist investor owns 8% of your shares. Your CFO and COO haven't spoken in weeks. And today, the SEC wants to talk.",
    stakes: [
      "Board can fire you mid-simulation",
      "Every stakeholder has memory",
      "Early compromises haunt late game",
      "No reset. No undo. Consequences stick.",
    ],
    preview: "Experience the isolation of command. Feel the weight of every choice. Learn why good leaders still fail.",
  },
  {
    id: 'market-dynamics',
    title: 'Market Dynamics',
    subtitle: 'Competing in Motion',
    tagline: 'Multiplayer market warfare where survival is optional',
    icon: TrendingUp,
    iconImage: '/assets/icon-sim-market-dynamics.svg',
    bgImage: '/assets/bg-competitive-shock.png',
    color: 'blue',
    duration: '2-3 hours',
    players: '2-6 teams',
    rounds: 10,
    hook: "You are competing against 3-5 other firms. Same market. Same customers. Different strategies. One wrong move and you're bleeding share while your competitor counts their wins.",
    stakes: [
      "Real competitor dashboards",
      "Price wars destroy everyone",
      "Brand equity takes years to build",
      "One quarter can undo five.",
    ],
    preview: "Learn that markets are not spreadsheets. They're battlefields where perception beats reality.",
  },
  {
    id: 'financial-acumen',
    title: 'Financial Acumen',
    subtitle: 'Capital, Risk, and Survival',
    tagline: 'Where CFOs are made—and unmade',
    icon: DollarSign,
    iconImage: '/assets/icon-sim-financial-acumen.svg',
    bgImage: '/assets/bg-enterprise-tech.png',
    color: 'emerald',
    duration: '3-4 hours',
    players: '3-4 players',
    rounds: 12,
    hook: "You have $890M in cash. 18 months of runway if you stop everything. But stopping everything means dying slowly. The question isn't how much to spend. It's what you're willing to lose.",
    stakes: [
      "Cash timing is everything",
      "Credit rating affects your options",
      "Bankruptcy is always an option",
      "Investors don't forget.",
    ],
    preview: "Discover that finance isn't about numbers. It's about survival, timing, and the bets you're willing to make.",
  },
  {
    id: 'operations-excellence',
    title: 'Operations Excellence',
    subtitle: 'Flow, Capacity, and Fragility',
    tagline: 'The supply chain simulation that breaks before you do',
    icon: Cog,
    iconImage: '/assets/icon-sim-operations-excellence.svg',
    bgImage: '/assets/bg-supply-chain-crisis.png',
    color: 'orange',
    duration: '2-3 hours',
    players: '3-4 players',
    rounds: 8,
    hook: "Your operation looks smooth. 98% on-time delivery. Then a single supplier in Malaysia goes dark. Suddenly you see the fragility hiding inside your efficiency.",
    stakes: [
      "Small delays cascade",
      "Quality issues compound",
      "The bullwhip effect is real",
      "Resilience costs money upfront.",
    ],
    preview: "Understand why supply chains that look perfect break catastrophically, and why the fix isn't obvious.",
  },
  {
    id: 'sales-mastery',
    title: 'Sales Mastery',
    subtitle: 'Growth Without Erosion',
    tagline: 'Hit the number—without destroying the future',
    icon: Target,
    iconImage: '/assets/icon-sim-sales-mastery.svg',
    bgImage: '/assets/bg-sales-pressure.png',
    color: 'rose',
    duration: '2-3 hours',
    players: '3-5 players',
    rounds: 8,
    hook: "You're 87% to target with 6 weeks left in Q4. The board expects 100%. Your top rep has a $2M deal that needs 40% discount. Your competitors are whispering to your biggest account.",
    stakes: [
      "Discounting destroys LTV",
      "Sandbagging is detectable",
      "Top performers can be toxic",
      "Short-term wins poison long-term.",
    ],
    preview: "Experience the impossible tradeoffs of sales leadership. Learn why easy wins create hard futures.",
  },
  {
    id: 'innovation-lab',
    title: 'Innovation Lab',
    subtitle: 'Betting on the Future',
    tagline: 'Where R&D leaders learn to kill their darlings',
    icon: Lightbulb,
    iconImage: '/assets/icon-sim-innovation-lab.svg',
    bgImage: '/assets/bg-briefing-gradient.png',
    color: 'yellow',
    duration: '2-3 hours',
    players: '3-4 players',
    rounds: 10,
    hook: "You have 12 projects in your portfolio. 3 are hopeless. 4 are promising. 2 might change the industry. Your budget covers 8. The board wants you to pick 5. Your team created all of them.",
    stakes: [
      "Sunk costs are seductive",
      "Cannibalization is inevitable",
      "Technical debt is invisible",
      "Breakthroughs look like failures early.",
    ],
    preview: "Learn the hardest lesson in innovation: knowing when to kill something you believe in.",
  },
  {
    id: 'risk-intelligence',
    title: 'Risk Intelligence',
    subtitle: 'Navigating Uncertainty',
    tagline: 'Where risk officers learn that prevention is invisible until it fails',
    icon: ShieldAlert,
    iconImage: '/assets/icon-sim-strategic-leadership.svg',
    bgImage: '/assets/bg-regulatory-crisis.png',
    color: 'cyan',
    duration: '3-4 hours',
    players: '3-5 players',
    rounds: 10,
    hook: "Your enterprise risk dashboard shows green across the board. But three seemingly unrelated events are converging: a cyber vulnerability in your supply chain, a geopolitical shift in your key market, and a whistleblower complaint that just landed on your desk. You have 48 hours before the board meeting.",
    stakes: [
      "Black swans hide in plain sight",
      "Risk appetite shifts under pressure",
      "Mitigation costs compete with growth",
      "The risks you ignore choose you.",
    ],
    preview: "Discover why the biggest risks aren't on your radar—and why your risk register is a map of yesterday's threats.",
  },
  {
    id: 'governance-compliance',
    title: 'Governance & Compliance',
    subtitle: 'Ethics Under Fire',
    tagline: 'The GRC simulation where doing the right thing has a price',
    icon: Scale,
    iconImage: '/assets/icon-sim-financial-acumen.svg',
    bgImage: '/assets/bg-boardroom-dark.png',
    color: 'indigo',
    duration: '3-4 hours',
    players: '4-6 players',
    rounds: 8,
    hook: "You're the Chief Compliance Officer. A major revenue stream may violate regulations in three jurisdictions. Sales says it's fine. Legal is hedging. The CEO wants growth. The audit committee meets Friday. And a journalist just called asking about 'irregularities.'",
    stakes: [
      "Compliance is everyone's job—until it isn't",
      "Regulators have long memories",
      "Reputation damage compounds",
      "The cover-up is always worse.",
    ],
    preview: "Experience the tension between growth and governance. Learn why 'technically legal' is the most dangerous phrase in business.",
  },
  {
    id: 'talent-culture',
    title: 'Talent & Culture',
    subtitle: 'The Human Equation',
    tagline: 'Where CHROs learn that culture eats strategy for breakfast',
    icon: Users,
    iconImage: '/assets/icon-sim-sales-mastery.svg',
    bgImage: '/assets/bg-role-executive-office.png',
    color: 'pink',
    duration: '3-4 hours',
    players: '4-5 players',
    rounds: 8,
    hook: "You're the Chief People Officer. Attrition just hit 23%. Your top engineering team is being poached by a competitor offering 40% raises. The CEO wants a RIF of 15% by Q2. Glassdoor reviews are tanking. And the union organizers just showed up at your Austin facility.",
    stakes: [
      "Culture is what happens when you're not looking",
      "Your best people leave first",
      "Layoffs have long shadows",
      "Employer brand takes years to build, days to destroy.",
    ],
    preview: "Discover why people decisions are the hardest ones—and why the 'soft stuff' is actually the hard stuff.",
  },
];

const TESTIMONIALS = [
  {
    quote: "I've done Capsim. I've done Harvard cases. Nothing prepared me for the feeling of watching board confidence tick down while my team argued about priorities. That feeling of dread? That's what leadership actually feels like.",
    author: "Elena Vasquez",
    role: "VP Strategy, Fortune 500 Technology",
    simulation: "Strategic Leadership",
    avatar: "EV",
  },
  {
    quote: "We thought we understood our market. Then we watched three teams destroy each other in a price war while the fourth quietly took share. Same data, same tools. Totally different outcomes.",
    author: "Marcus Chen",
    role: "CMO, Consumer Goods",
    simulation: "Market Dynamics",
    avatar: "MC",
  },
  {
    quote: "Fourteen years in finance. First time I've actually felt the terror of watching cash runway shrink while waiting for a deal to close. The simulation taught me more about capital structure than my MBA.",
    author: "Robert Okonkwo",
    role: "CFO, Healthcare Services",
    simulation: "Financial Acumen",
    avatar: "RO",
  },
];

// =============================================================================
// HEADER WITH THEME TOGGLE AND SIGN IN
// =============================================================================

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3 rounded-2xl ${
        theme === 'light'
          ? 'bg-white/80 backdrop-blur-md border border-indigo-100 shadow-sm'
          : 'bg-slate-900/80 backdrop-blur-md border border-slate-800'
      }`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            theme === 'light'
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
              : 'bg-gradient-to-br from-cyan-500 to-blue-600'
          }`}>
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl font-bold ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            Praxis
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all duration-300 ${
              theme === 'light'
                ? 'bg-indigo-50 hover:bg-indigo-100 text-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <Link href="/login">
            <motion.div
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 hover:shadow-lg hover:shadow-cyan-500/25'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

// =============================================================================
// COMPONENTS
// =============================================================================

function CinematicHero() {
  const { theme } = useTheme();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentScenario((prev) => (prev + 1) % HERO_SCENARIOS.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const scenario = HERO_SCENARIOS[currentScenario];
  const gradient = theme === 'light' ? scenario.lightGradient : scenario.darkGradient;

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} transition-all duration-1000`}>
      {/* Hero background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/hero-abstract-strategy-bg.png"
          alt=""
          className={`w-full h-full object-cover ${theme === 'light' ? 'opacity-60' : 'opacity-70'}`}
        />
      </div>

      {/* Light theme: Flowing ribbon shapes */}
      {theme === 'light' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-purple-300/40 via-pink-200/30 to-blue-200/40 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 45, 0],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-blue-300/40 via-violet-200/30 to-pink-200/40 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [45, 0, 45],
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-r from-pink-200/30 via-purple-200/20 to-cyan-200/30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Dark theme: Neon particles and grid */}
      {theme === 'dark' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 particle-grid opacity-30" />

          {/* Neon orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-fuchsia-500/10 rounded-full blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.1, 0.15] }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/60 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 lg:px-16 text-center">
        {/* Pre-title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <span className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-medium ${
            theme === 'light'
              ? 'bg-white/90 backdrop-blur-sm border border-indigo-200 text-indigo-700 shadow-lg'
              : 'bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 text-cyan-300 shadow-lg'
          }`}>
            {theme === 'light' ? (
              <Sparkles className="w-5 h-5 text-indigo-500" />
            ) : (
              <Flame className="w-5 h-5 text-orange-400" />
            )}
            This is not training. This is rehearsal.
          </span>
        </motion.div>

        {/* Main title */}
        <div className="mb-8 min-h-[140px] md:min-h-[180px]">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentScenario}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -30 : 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className={`text-xl md:text-5xl lg:text-6xl font-bold leading-tight ${
                theme === 'light' ? 'text-slate-900 drop-shadow-lg' : 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]'
              }`}
            >
              {scenario.title}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`subtitle-${currentScenario}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-lg md:text-xl max-w-4xl mx-auto mb-14 leading-relaxed ${
              theme === 'light' ? 'text-slate-800 drop-shadow-md' : 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]'
            }`}
          >
            {scenario.subtitle}
          </motion.p>
        </AnimatePresence>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 justify-center mb-16"
        >
          <Link
            href="#simulations"
            className={`group px-10 py-5 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-xl ${
              theme === 'light'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 neon-glow'
            }`}
          >
            <Play className="w-6 h-6" />
            Enter the Simulations
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#philosophy"
            className={`px-10 py-5 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-xl ${
              theme === 'light'
                ? 'bg-white/70 backdrop-blur-sm text-indigo-700 border-2 border-indigo-200 hover:border-indigo-300 hover:bg-white'
                : 'bg-white/5 backdrop-blur-sm text-white border border-white/20 hover:bg-white/10'
            }`}
          >
            <Eye className="w-6 h-6" />
            Our Philosophy
          </Link>
        </motion.div>

        {/* Scenario indicators */}
        <div className="flex justify-center gap-3">
          {HERO_SCENARIOS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentScenario(i);
                  setIsTransitioning(false);
                }, 500);
              }}
              className={`h-3 rounded-full transition-all duration-300 ${
                i === currentScenario
                  ? theme === 'light'
                    ? 'bg-indigo-500 w-10'
                    : 'bg-cyan-400 w-10'
                  : theme === 'light'
                    ? 'bg-purple-300/50 w-3 hover:bg-purple-400/50'
                    : 'bg-white/30 w-3 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`flex flex-col items-center gap-2 ${
            theme === 'light' ? 'text-indigo-500' : 'text-cyan-400'
          }`}
        >
          <span className="text-sm uppercase tracking-wider font-medium">Scroll to explore</span>
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function PhilosophySection() {
  const { theme } = useTheme();

  return (
    <section id="philosophy" className={`py-36 relative overflow-hidden ${
      theme === 'light' ? 'bg-white/50' : 'bg-slate-950'
    }`}>
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/bg-boardroom-dark.png"
          alt=""
          className={`w-full h-full object-cover ${theme === 'light' ? 'opacity-10' : 'opacity-30'}`}
        />
      </div>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {theme === 'light' ? (
          <div className="absolute top-0 left-1/2 w-[900px] h-[900px] bg-gradient-to-br from-purple-200/30 via-pink-100/20 to-blue-200/30 rounded-full blur-[180px] transform -translate-x-1/2 -translate-y-1/2" />
        ) : (
          <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-violet-900/10 rounded-full blur-[150px] transform -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>

      <div className="relative max-w-[1400px] mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className={`text-base md:text-lg font-bold mb-8 ${
            theme === 'light' ? 'text-slate-900' : 'text-white drop-shadow-lg'
          }`}>
            Most simulations are games.
            <span className={`block mt-3 ${
              theme === 'light' ? 'text-indigo-600' : 'text-cyan-400'
            }`}>This is practice.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Left: What we're not */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className={`text-lg font-bold mb-8 flex items-center gap-3 ${
              theme === 'light' ? 'text-rose-500' : 'text-red-400'
            }`}>
              <AlertTriangle className="w-7 h-7" />
              What we reject
            </h3>
            <ul className="space-y-5">
              {[
                "Simplified models that ignore real complexity",
                "Gamification that rewards clicking over thinking",
                "Safe scenarios where everyone wins",
                "Immediate feedback that removes uncertainty",
                "Solitary experiences without conflict",
              ].map((item, i) => (
                <li key={i} className={`flex items-start gap-4 text-xl ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full mt-3 flex-shrink-0 ${
                    theme === 'light' ? 'bg-rose-500' : 'bg-red-400'
                  }`} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: What we are */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className={`text-lg font-bold mb-8 flex items-center gap-3 ${
              theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'
            }`}>
              <Shield className="w-7 h-7" />
              What we build
            </h3>
            <ul className="space-y-5">
              {[
                "Systems with hidden interdependencies that reveal themselves over time",
                "Decisions that feel impossible because they are",
                "Consequences that compound across rounds",
                "Team dynamics that mirror real organizational friction",
                "Moments of genuine uncertainty and pressure",
              ].map((item, i) => (
                <li key={i} className={`flex items-start gap-4 text-xl ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full mt-3 flex-shrink-0 ${
                    theme === 'light' ? 'bg-emerald-500' : 'bg-emerald-400'
                  }`} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`mt-24 p-10 rounded-3xl ${
            theme === 'light'
              ? 'bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-indigo-100 shadow-xl shadow-indigo-100/50'
              : 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700'
          }`}
        >
          <Quote className={`w-12 h-12 mb-6 ${
            theme === 'light' ? 'text-indigo-400' : 'text-violet-500'
          }`} />
          <blockquote className={`text-base md:text-lg font-medium mb-8 leading-relaxed ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            "The goal isn't to teach you what to decide. It's to make you feel the weight of deciding—so when it's real, you've been here before."
          </blockquote>
          <div className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
            <span className={`font-semibold text-lg ${
              theme === 'light' ? 'text-indigo-600' : 'text-slate-300'
            }`}>Praxis Simulation</span>
            <span className="mx-3">·</span>
            <span className="text-lg">Design Philosophy</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SimulationCard({ sim, index }: { sim: typeof SIMULATIONS[0]; index: number }) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = sim.icon;

  const colorStyles = {
    violet: {
      light: { bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-600', gradient: 'from-violet-500 to-purple-600' },
      dark: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', gradient: 'from-violet-600 to-purple-700' },
    },
    blue: {
      light: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
      dark: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-600 to-cyan-600' },
    },
    emerald: {
      light: { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' },
      dark: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', gradient: 'from-emerald-600 to-teal-600' },
    },
    orange: {
      light: { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-600', gradient: 'from-orange-500 to-amber-500' },
      dark: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', gradient: 'from-orange-500 to-amber-600' },
    },
    rose: {
      light: { bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-600', gradient: 'from-rose-500 to-pink-500' },
      dark: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', gradient: 'from-rose-500 to-pink-600' },
    },
    yellow: {
      light: { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
      dark: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', gradient: 'from-yellow-500 to-orange-500' },
    },
    cyan: {
      light: { bg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-600', gradient: 'from-cyan-500 to-teal-500' },
      dark: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500 to-teal-600' },
    },
    indigo: {
      light: { bg: 'bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-600', gradient: 'from-indigo-500 to-purple-500' },
      dark: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', gradient: 'from-indigo-500 to-purple-600' },
    },
    pink: {
      light: { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-600', gradient: 'from-pink-500 to-rose-500' },
      dark: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', gradient: 'from-pink-500 to-rose-600' },
    },
  };

  const style = colorStyles[sim.color as keyof typeof colorStyles][theme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <div
        className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${
          theme === 'light'
            ? `bg-white/80 backdrop-blur-sm border-2 ${style.border} ${isExpanded ? 'shadow-2xl shadow-indigo-200/50' : 'shadow-lg shadow-indigo-100/30'}`
            : `bg-slate-900/80 backdrop-blur-sm border ${style.border} ${isExpanded ? 'shadow-2xl shadow-violet-500/10' : ''}`
        }`}
      >
        {/* Background Image */}
        {sim.bgImage && (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={sim.bgImage}
              alt=""
              className={`w-full h-full object-cover ${theme === 'light' ? 'opacity-15' : 'opacity-25'}`}
            />
            <div className={`absolute inset-0 ${theme === 'light' ? 'bg-gradient-to-b from-white/80 to-white/95' : 'bg-gradient-to-b from-slate-900/70 to-slate-900/95'}`} />
          </div>
        )}
        {/* Header */}
        <div
          className="p-8 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start gap-5">
            <div className={`w-16 h-16 ${style.bg} rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden`}>
              {sim.iconImage ? (
                <img
                  src={sim.iconImage}
                  alt={sim.title}
                  width={40}
                  height={40}
                  className={`object-contain ${style.text}`}
                  style={{ filter: theme === 'light' ? 'invert(30%) sepia(80%) saturate(500%) hue-rotate(220deg)' : 'invert(70%) sepia(50%) saturate(400%) hue-rotate(180deg)' }}
                />
              ) : (
                <Icon className={`w-8 h-8 ${style.text}`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-bold ${
                  theme === 'light' ? 'text-slate-800' : 'text-white'
                }`}>{sim.title}</h3>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className={`w-6 h-6 ${style.text}`} />
                </motion.div>
              </div>
              <p className={`text-lg ${style.text} font-medium mb-2`}>{sim.subtitle}</p>
              <p className={`text-lg italic ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              }`}>{sim.tagline}</p>
            </div>
          </div>

          {/* Meta */}
          <div className={`flex items-center gap-5 mt-6 text-lg ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {sim.duration}
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {sim.players}
            </span>
            <span className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {sim.rounds} rounds
            </span>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="px-8 pb-8 space-y-8">
                {/* Divider */}
                <div className={`h-px ${
                  theme === 'light' ? 'bg-indigo-100' : 'bg-slate-800'
                }`} />

                {/* The Hook */}
                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${
                    theme === 'light' ? 'text-indigo-600' : 'text-cyan-400'
                  }`}>The Scenario</h4>
                  <p className={`text-xl leading-relaxed ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                  }`}>{sim.hook}</p>
                </div>

                {/* The Stakes */}
                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${
                    theme === 'light' ? 'text-indigo-600' : 'text-cyan-400'
                  }`}>The Stakes</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {sim.stakes.map((stake, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl ${
                          theme === 'light'
                            ? `${style.bg} border ${style.border}`
                            : `${style.bg} border ${style.border}`
                        }`}
                      >
                        <span className={`text-lg ${
                          theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                        }`}>{stake}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className={`p-5 rounded-xl border-l-4 ${style.text} ${
                  theme === 'light'
                    ? 'bg-gradient-to-r from-purple-50 to-transparent'
                    : `bg-gradient-to-r ${style.gradient}/10`
                }`}>
                  <p className={`text-lg leading-relaxed ${
                    theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                  }`}>{sim.preview}</p>
                </div>

                {/* CTA */}
                <Link
                  href={`/simulations/${sim.id}` as `/simulations/strategic-leadership`}
                  className={`w-full py-5 bg-gradient-to-r ${style.gradient} text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-xl ${
                    theme === 'dark' ? 'neon-glow' : ''
                  }`}
                >
                  <Play className="w-6 h-6" />
                  Enter Simulation
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SimulationsSection() {
  const { theme } = useTheme();

  return (
    <section id="simulations" className={`py-36 ${
      theme === 'light'
        ? 'bg-gradient-to-b from-purple-50/50 via-white to-pink-50/30'
        : 'bg-gradient-to-b from-slate-950 to-slate-900'
    }`}>
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className={`text-base md:text-lg font-bold mb-6 ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            Nine Simulations.
            <span className={`block ${
              theme === 'light' ? 'text-indigo-600' : 'text-cyan-400'
            }`}>Infinite Lessons.</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Each simulation is a complete experience—story-driven, consequence-heavy, and designed to reveal how you think under pressure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {SIMULATIONS.map((sim, index) => (
            <SimulationCard key={sim.id} sim={sim} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { theme } = useTheme();

  return (
    <section className={`py-36 relative overflow-hidden ${
      theme === 'light' ? 'bg-white/70' : 'bg-slate-900'
    }`}>
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/bg-briefing-gradient.png"
          alt=""
          className={`w-full h-full object-cover ${theme === 'light' ? 'opacity-20' : 'opacity-30'}`}
        />
        <div className={`absolute inset-0 ${theme === 'light' ? 'bg-white/70' : 'bg-slate-900/80'}`} />
      </div>
      <div className="relative max-w-[1400px] mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className={`text-base md:text-lg font-bold mb-6 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            From the Trenches
          </h2>
          <p className={`text-lg ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            What executives say after they've been through it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-3xl p-10 ${
                theme === 'light'
                  ? 'bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-indigo-100 shadow-xl shadow-indigo-100/30'
                  : 'bg-slate-800/50 backdrop-blur-sm border border-slate-700'
              }`}
            >
              <Quote className={`w-10 h-10 mb-6 ${
                theme === 'light' ? 'text-indigo-400' : 'text-cyan-500'
              }`} />
              <p className={`leading-relaxed mb-8 text-lg ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-200'
              }`}>
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                }`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className={`font-semibold text-lg ${
                    theme === 'light' ? 'text-slate-800' : 'text-white'
                  }`}>{testimonial.author}</div>
                  <div className={`text-base ${
                    theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                  }`}>{testimonial.role}</div>
                  <div className={`text-sm mt-1 ${
                    theme === 'light' ? 'text-indigo-600' : 'text-cyan-400'
                  }`}>{testimonial.simulation}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  const { theme } = useTheme();

  const audiences = [
    {
      icon: Award,
      title: "MBA Capstone",
      description: "The culminating experience that integrates strategy, finance, operations, and leadership into a single high-stakes simulation.",
    },
    {
      icon: Briefcase,
      title: "Executive Education",
      description: "For senior leaders who need safe space to practice dangerous decisions before they become real.",
    },
    {
      icon: Building2,
      title: "Corporate Programs",
      description: "Custom simulations aligned to your organization's context, challenges, and strategic priorities.",
    },
    {
      icon: Globe,
      title: "Leadership Academies",
      description: "Pipeline development for high-potential leaders who need to practice cross-functional thinking.",
    },
  ];

  return (
    <section className={`py-36 relative overflow-hidden ${
      theme === 'light'
        ? 'bg-gradient-to-b from-white to-purple-50/50'
        : 'bg-gradient-to-b from-slate-900 to-slate-950'
    }`}>
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/bg-regulatory-crisis.png"
          alt=""
          className={`w-full h-full object-cover ${theme === 'light' ? 'opacity-10' : 'opacity-20'}`}
        />
      </div>
      <div className="relative max-w-[1400px] mx-auto px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className={`text-base md:text-lg font-bold mb-6 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            Built for Serious Learning
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Designed in partnership with business schools, executive education programs, and Fortune 500 learning organizations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-3xl transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-white/80 border border-indigo-100 shadow-lg shadow-indigo-100/20 hover:shadow-xl hover:shadow-indigo-200/30 hover:border-indigo-200'
                  : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                theme === 'light'
                  ? 'bg-indigo-100'
                  : 'bg-cyan-500/20'
              }`}>
                <audience.icon className={`w-8 h-8 ${
                  theme === 'light' ? 'text-indigo-600' : 'text-cyan-400'
                }`} />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>{audience.title}</h3>
              <p className={`text-lg leading-relaxed ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              }`}>{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const { theme } = useTheme();

  return (
    <section className={`py-36 relative overflow-hidden ${
      theme === 'light'
        ? 'bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100'
        : 'bg-gradient-to-br from-violet-900 via-slate-900 to-slate-950'
    }`}>
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/assets/bg-global-ambient.svg"
          alt=""
          className={`w-full h-full object-cover ${theme === 'light' ? 'opacity-30' : 'opacity-40'}`}
        />
      </div>
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {theme === 'light' ? (
          <>
            <motion.div
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[120px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-300/30 rounded-full blur-[100px]"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 12, repeat: Infinity }}
            />
          </>
        ) : (
          <>
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
          </>
        )}
      </div>

      <div className="relative max-w-[1400px] mx-auto px-8 lg:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={`text-base md:text-lg lg:text-5xl font-bold mb-8 ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            Ready to lead?
          </h2>
          <p className={`text-lg mb-5 max-w-2xl mx-auto ${
            theme === 'light' ? 'text-slate-700' : 'text-slate-300'
          }`}>
            The decisions you make here will feel real because they're designed to.
          </p>
          <p className={`text-xl mb-12 ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            No do-overs. No hints. Just the weight of command.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="#simulations"
              className={`group px-12 py-6 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105'
                  : 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/10'
              }`}
            >
              <Play className="w-7 h-7" />
              Choose Your Simulation
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/facilitator"
              className={`px-12 py-6 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
                theme === 'light'
                  ? 'bg-white/80 backdrop-blur-sm text-indigo-700 border-2 border-indigo-200 hover:border-indigo-300 hover:bg-white'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <Users className="w-7 h-7" />
              Facilitator Access
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const { theme } = useTheme();

  return (
    <footer className={`py-20 border-t ${
      theme === 'light'
        ? 'bg-white/80 border-indigo-100'
        : 'bg-slate-950 border-slate-900'
    }`}>
      <div className="max-w-[1400px] mx-auto px-8 lg:px-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <div className={`text-xl font-bold mb-3 ${
              theme === 'light' ? 'text-slate-800' : 'text-white'
            }`}>Praxis Simulation</div>
            <div className={`text-lg ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>Run the company. Feel the consequences.</div>
          </div>

          <div className={`flex gap-10 text-lg ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            <Link href="#simulations" className={`hover:${theme === 'light' ? 'text-indigo-600' : 'text-white'} transition-colors`}>Simulations</Link>
            <Link href="/facilitator" className={`hover:${theme === 'light' ? 'text-indigo-600' : 'text-white'} transition-colors`}>Facilitator</Link>
            <Link href="/debrief" className={`hover:${theme === 'light' ? 'text-indigo-600' : 'text-white'} transition-colors`}>Debrief</Link>
          </div>
        </div>

        <div className={`mt-14 pt-10 border-t text-center text-lg ${
          theme === 'light' ? 'border-indigo-100 text-slate-500' : 'border-slate-800 text-slate-400'
        }`}>
          <p>Designed for executive education, MBA programs, and leadership development.</p>
          <p className="mt-2">© {new Date().getFullYear()} Praxis Simulation Suite</p>
        </div>
      </div>
    </footer>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in - if not, redirect to login
    const isLoggedIn = sessionStorage.getItem('praxis-logged-in');
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    // Check if user has already seen the cover
    const hasSeenCover = sessionStorage.getItem('praxis-cover-seen');
    if (hasSeenCover) {
      setShowCover(false);
    }
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    sessionStorage.setItem('praxis-cover-seen', 'true');
    setTimeout(() => {
      setShowCover(false);
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {showCover && !isExiting && (
          <CoverPage onEnter={handleEnter} />
        )}
        {showCover && isExiting && (
          <motion.div
            key="cover-exit"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 z-50"
          >
            <CoverPage onEnter={() => {}} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showCover && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Header />
          <CinematicHero />
          <PhilosophySection />
          <SimulationsSection />
          <TestimonialsSection />
          <AudienceSection />
          <FinalCTA />
          <Footer />
        </motion.div>
      )}
    </div>
  );
}
