'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

type CardVariant = 'default' | 'elevated' | 'glass' | 'gradient' | 'outline';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, padding = 'md', children, ...props }, ref) => {
    const { theme } = useTheme();

    const baseStyles = 'rounded-2xl transition-all duration-300';

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantStyles = {
      default:
        theme === 'light'
          ? 'bg-white border border-indigo-100 shadow-sm'
          : 'bg-slate-900/50 border border-cyan-500/10',
      elevated:
        theme === 'light'
          ? 'bg-white border border-indigo-100 shadow-lg shadow-indigo-500/10'
          : 'bg-slate-900/70 border border-cyan-500/20 shadow-lg shadow-cyan-500/5',
      glass:
        theme === 'light'
          ? 'bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg shadow-indigo-500/10'
          : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-cyan-500/5',
      gradient:
        theme === 'light'
          ? 'bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-100 shadow-lg shadow-indigo-500/10'
          : 'bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/20 shadow-lg shadow-cyan-500/10',
      outline:
        theme === 'light'
          ? 'bg-transparent border-2 border-indigo-200 hover:border-indigo-300'
          : 'bg-transparent border-2 border-cyan-500/30 hover:border-cyan-500/50',
    };

    const hoverStyles = hover
      ? theme === 'light'
        ? 'hover:shadow-xl hover:shadow-indigo-500/15 hover:border-indigo-200 hover:-translate-y-1'
        : 'hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/30 hover:-translate-y-1'
      : '';

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, paddingStyles[padding], variantStyles[variant], hoverStyles, className)}
        initial={hover ? { y: 0 } : undefined}
        whileHover={hover ? { y: -4 } : undefined}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, action, icon, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <div ref={ref} className={cn('flex items-start justify-between mb-4', className)} {...props}>
        <div className="flex items-start gap-3">
          {icon && (
            <div
              className={cn(
                'p-2 rounded-xl',
                theme === 'light'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-cyan-500/10 text-cyan-400'
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <h3
              className={cn(
                'font-semibold text-lg',
                theme === 'light' ? 'text-slate-900' : 'text-white'
              )}
            >
              {title}
            </h3>
            {description && (
              <p
                className={cn(
                  'text-sm mt-0.5',
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export { Card, CardHeader, type CardProps, type CardVariant };
