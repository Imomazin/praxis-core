'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, pulse = false, children, ...props }, ref) => {
    const { theme } = useTheme();

    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors';

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    };

    const variantStyles = {
      default:
        theme === 'light'
          ? 'bg-slate-100 text-slate-700 border border-slate-200'
          : 'bg-slate-800 text-slate-300 border border-slate-700',
      success:
        theme === 'light'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      warning:
        theme === 'light'
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      danger:
        theme === 'light'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-red-500/10 text-red-400 border border-red-500/20',
      info:
        theme === 'light'
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      purple:
        theme === 'light'
          ? 'bg-purple-50 text-purple-700 border border-purple-200'
          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    };

    const dotColors = {
      default: theme === 'light' ? 'bg-slate-500' : 'bg-slate-400',
      success: theme === 'light' ? 'bg-emerald-500' : 'bg-emerald-400',
      warning: theme === 'light' ? 'bg-amber-500' : 'bg-amber-400',
      danger: theme === 'light' ? 'bg-red-500' : 'bg-red-400',
      info: theme === 'light' ? 'bg-blue-500' : 'bg-blue-400',
      purple: theme === 'light' ? 'bg-purple-500' : 'bg-purple-400',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {dot && (
          <span className="relative flex h-2 w-2">
            {pulse && (
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  dotColors[variant]
                )}
              />
            )}
            <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColors[variant])} />
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize };
