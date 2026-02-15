'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Route } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Loader2,
  Sun,
  Moon,
  Building2,
  Layers,
  Sparkles,
  Star,
  Zap,
  Crown,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// =============================================================================
// ROTATING 3D GRAPHIC COMPONENT
// =============================================================================

function RotatingGraphic() {
  const { theme } = useTheme();

  // Icon set for orbiting elements
  const orbitIcons = [
    { Icon: Crown, delay: 0 },
    { Icon: Target, delay: 0.5 },
    { Icon: TrendingUp, delay: 1 },
    { Icon: Zap, delay: 1.5 },
    { Icon: Star, delay: 2 },
    { Icon: Sparkles, delay: 2.5 },
  ];

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Outer glow ring */}
      <motion.div
        className={`absolute inset-0 rounded-full ${
          theme === 'light'
            ? 'bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-indigo-400/20'
            : 'bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10'
        }`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating outer ring */}
      <motion.div
        className="absolute inset-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <div className={`w-full h-full rounded-full border-2 border-dashed ${
          theme === 'light' ? 'border-purple-300/50' : 'border-cyan-500/30'
        }`} />

        {/* Orbiting icons on outer ring */}
        {orbitIcons.slice(0, 3).map(({ Icon, delay }, i) => (
          <motion.div
            key={`outer-${i}`}
            className={`absolute w-10 h-10 rounded-xl flex items-center justify-center ${
              theme === 'light'
                ? 'bg-white shadow-lg shadow-purple-200/50'
                : 'bg-slate-800 shadow-lg shadow-cyan-500/20'
            }`}
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 120}deg) translateX(140px) rotate(-${i * 120}deg) translate(-50%, -50%)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, delay }}
          >
            <Icon className={`w-5 h-5 ${
              theme === 'light' ? 'text-purple-500' : 'text-cyan-400'
            }`} />
          </motion.div>
        ))}
      </motion.div>

      {/* Counter-rotating middle ring */}
      <motion.div
        className="absolute inset-12"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className={`w-full h-full rounded-full border ${
          theme === 'light' ? 'border-indigo-200' : 'border-purple-500/30'
        }`} />

        {/* Orbiting icons on middle ring */}
        {orbitIcons.slice(3, 6).map(({ Icon, delay }, i) => (
          <motion.div
            key={`middle-${i}`}
            className={`absolute w-8 h-8 rounded-lg flex items-center justify-center ${
              theme === 'light'
                ? 'bg-gradient-to-br from-pink-100 to-purple-100 shadow-md'
                : 'bg-gradient-to-br from-purple-900/50 to-blue-900/50 shadow-md shadow-purple-500/10'
            }`}
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 120 + 60}deg) translateX(90px) rotate(-${i * 120 + 60}deg) translate(-50%, -50%)`,
            }}
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay }}
          >
            <Icon className={`w-4 h-4 ${
              theme === 'light' ? 'text-indigo-500' : 'text-purple-400'
            }`} />
          </motion.div>
        ))}
      </motion.div>

      {/* Inner rotating ring */}
      <motion.div
        className="absolute inset-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <div className={`w-full h-full rounded-full ${
          theme === 'light'
            ? 'bg-gradient-to-br from-purple-200/50 to-pink-200/50'
            : 'bg-gradient-to-br from-cyan-900/30 to-purple-900/30'
        }`} />
      </motion.div>

      {/* Center logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl ${
            theme === 'light'
              ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-purple-500/40'
              : 'bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 shadow-cyan-500/40'
          }`}
          animate={{
            rotateY: [0, 360],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Layers className="w-14 h-14 text-white" strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute w-2 h-2 rounded-full ${
            theme === 'light'
              ? i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-pink-400' : 'bg-indigo-400'
              : i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-purple-400' : 'bg-blue-400'
          }`}
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, (i % 2 === 0 ? 15 : -15), 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Pulse rings from center */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`pulse-${i}`}
          className={`absolute inset-0 rounded-full border ${
            theme === 'light' ? 'border-purple-400/40' : 'border-cyan-400/30'
          }`}
          animate={{
            scale: [0.3, 1.5],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// =============================================================================
// MICROSOFT ICON COMPONENT
// =============================================================================

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  );
}

// =============================================================================
// GOOGLE ICON COMPONENT
// =============================================================================

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// =============================================================================
// GITHUB ICON COMPONENT
// =============================================================================

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

// =============================================================================
// LOGIN BUTTON COMPONENT
// =============================================================================

interface LoginButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'filled' | 'outlined';
  isLoading?: boolean;
}

function LoginButton({ icon, label, onClick, variant = 'outlined', isLoading }: LoginButtonProps) {
  const { theme } = useTheme();

  const baseStyles = `
    w-full flex items-center gap-4 px-5 py-4 rounded-lg
    font-medium text-base transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variantStyles = {
    filled: theme === 'light'
      ? 'bg-[#2F2F2F] text-white hover:bg-[#1F1F1F] focus:ring-gray-500'
      : 'bg-white text-gray-900 hover:bg-gray-100 focus:ring-white',
    outlined: theme === 'light'
      ? 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-indigo-500'
      : 'bg-transparent text-white border border-gray-600 hover:bg-white/5 hover:border-gray-500 focus:ring-cyan-500',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        icon
      )}
      <span className="flex-1 text-left">{label}</span>
    </motion.button>
  );
}

// =============================================================================
// MAIN LOGIN PAGE
// =============================================================================

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const completeLogin = () => {
    // Set session to indicate user is logged in
    sessionStorage.setItem('praxis-logged-in', 'true');
    // Redirect to home page
    window.location.href = '/';
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    // TODO: Implement Microsoft auth - for now, simulate login
    setTimeout(() => {
      setIsLoading(false);
      completeLogin();
    }, 1500);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // TODO: Implement Google auth - for now, simulate login
    setTimeout(() => {
      setIsLoading(false);
      completeLogin();
    }, 1500);
  };

  const handleEmailLogin = async () => {
    setIsLoading(true);
    // TODO: Navigate to email login flow - for now, simulate login
    setTimeout(() => {
      setIsLoading(false);
      completeLogin();
    }, 1500);
  };

  const handleWorkLogin = async () => {
    setIsLoading(true);
    // TODO: Implement work/school auth - for now, simulate login
    setTimeout(() => {
      setIsLoading(false);
      completeLogin();
    }, 1500);
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    // TODO: Implement GitHub auth - for now, simulate login
    setTimeout(() => {
      setIsLoading(false);
      completeLogin();
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex">
      {/* ===================================================================
          LEFT PANEL - Marketing/Branding (Hidden on mobile)
          =================================================================== */}
      <div
        className={`hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden ${
          theme === 'light'
            ? 'bg-gradient-to-br from-[#E8DCFF] via-[#F0E6FF] to-[#E0E8FF]'
            : 'bg-gradient-to-br from-[#0F0A1A] via-[#1A1025] to-[#0A0F1A]'
        }`}
      >
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/scenarios/scenario-02.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Video Overlay */}
        <div
          className={`absolute inset-0 ${
            theme === 'light'
              ? 'bg-gradient-to-br from-[#E8DCFF]/85 via-[#F0E6FF]/80 to-[#E0E8FF]/85'
              : 'bg-gradient-to-br from-[#0F0A1A]/80 via-[#1A1025]/70 to-[#0A0F1A]/80'
          }`}
        />
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {theme === 'light' ? (
            <>
              <motion.div
                className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-1/3 right-0 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  x: [0, -40, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl"
                animate={{
                  y: [0, -30, 0],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          ) : (
            <>
              <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]"
                animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.1, 0.15] }}
                transition={{ duration: 12, repeat: Infinity }}
              />
              {/* Grid pattern for dark mode */}
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
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                }`}
              >
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-xl font-bold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}
              >
                Praxis
              </span>
            </div>
          </motion.div>

          {/* Rotating Graphic - Center piece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 flex items-center justify-center py-8"
          >
            <RotatingGraphic />
          </motion.div>

          {/* Bottom tagline */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1
              className={`text-3xl xl:text-4xl font-bold mb-4 leading-tight ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            >
              Master Leadership Through Simulation
            </h1>
            <p
              className={`text-lg ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}
            >
              Run the company. Feel the consequences.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ===================================================================
          RIGHT PANEL - Login Form
          =================================================================== */}
      <div
        className={`w-full lg:w-1/2 xl:w-[45%] flex flex-col ${
          theme === 'light'
            ? 'bg-white'
            : 'bg-[#0A0A10]'
        }`}
      >
        {/* Top bar with theme toggle and language (simulated) */}
        <div className="flex items-center justify-end gap-4 p-6">
          <motion.button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              theme === 'light'
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Mobile header with logo and mini graphic */}
        <div className="lg:hidden px-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                }`}
              >
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-xl font-bold ${
                  theme === 'light' ? 'text-gray-900' : 'text-white'
                }`}
              >
                Praxis
              </span>
            </div>
          </div>

          {/* Mini rotating graphic for mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-4"
          >
            <div className="transform scale-50 -my-16">
              <RotatingGraphic />
            </div>
          </motion.div>
        </div>

        {/* Main login content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto w-full"
          >
            {/* Heading */}
            <h1
              className={`text-3xl font-bold mb-2 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            >
              Sign in or create an account
            </h1>
            <p
              className={`mb-10 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              Then start running simulations!
            </p>

            {/* Login buttons */}
            <div className="space-y-3">
              <LoginButton
                icon={<MicrosoftIcon className="w-5 h-5" />}
                label="Continue with Microsoft"
                onClick={handleMicrosoftLogin}
                variant="filled"
              />

              {/* Divider */}
              <div className="flex items-center gap-4 py-3">
                <div
                  className={`flex-1 h-px ${
                    theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                  }`}
                />
                <span
                  className={`text-sm ${
                    theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Or
                </span>
                <div
                  className={`flex-1 h-px ${
                    theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                  }`}
                />
              </div>

              <LoginButton
                icon={<Mail className="w-5 h-5" />}
                label="Continue with email"
                onClick={handleEmailLogin}
                variant="outlined"
              />

              <LoginButton
                icon={<GoogleIcon className="w-5 h-5" />}
                label="Continue with Google"
                onClick={handleGoogleLogin}
                variant="outlined"
              />

              <LoginButton
                icon={<GitHubIcon className="w-5 h-5" />}
                label="Continue with GitHub"
                onClick={handleGitHubLogin}
                variant="outlined"
              />

              <LoginButton
                icon={<Building2 className="w-5 h-5" />}
                label="Sign in to Praxis for work or school accounts"
                onClick={handleWorkLogin}
                variant="outlined"
              />
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-8 lg:px-16 xl:px-20 py-8">
          <div className="max-w-md mx-auto w-full">
            <div
              className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              <Link
                href={'/terms' as Route}
                className={`hover:underline ${
                  theme === 'light'
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                Terms
              </Link>
              <span>|</span>
              <Link
                href={'/privacy' as Route}
                className={`hover:underline ${
                  theme === 'light'
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                Privacy Statement
              </Link>
              <span>|</span>
              <Link
                href={'/data-privacy' as Route}
                className={`hover:underline ${
                  theme === 'light'
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                Data Privacy Policy
              </Link>
            </div>

            <div
              className={`flex items-center justify-center gap-4 mt-4 text-xs ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              <Link
                href={'/support' as Route}
                className={`hover:underline ${
                  theme === 'light'
                    ? 'text-indigo-600 hover:text-indigo-700'
                    : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                Account help
              </Link>
              <span>&copy; {new Date().getFullYear()} Praxis Simulation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
