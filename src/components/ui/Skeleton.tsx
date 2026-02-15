'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, animation = 'pulse', style, ...props }, ref) => {
    const { theme } = useTheme();

    const baseStyles = cn(
      'relative overflow-hidden',
      theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'
    );

    const variantStyles = {
      text: 'rounded h-4 w-full',
      circular: 'rounded-full',
      rectangular: '',
      rounded: 'rounded-xl',
    };

    const animationStyles = {
      pulse: 'animate-pulse',
      wave: '',
      none: '',
    };

    const waveOverlay =
      animation === 'wave' ? (
        <div
          className={cn(
            'absolute inset-0 -translate-x-full',
            'bg-gradient-to-r from-transparent via-white/20 to-transparent',
            'animate-[shimmer_2s_infinite]'
          )}
        />
      ) : null;

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], animationStyles[animation], className)}
        style={{
          width: width,
          height: height,
          ...style,
        }}
        {...props}
      >
        {waveOverlay}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Preset skeleton components for common use cases
const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
};

const SkeletonCard = ({ className }: { className?: string }) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'rounded-2xl p-6',
        theme === 'light'
          ? 'bg-white border border-slate-200'
          : 'bg-slate-900/50 border border-slate-700',
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

const SkeletonTable = ({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        theme === 'light' ? 'bg-white border border-slate-200' : 'bg-slate-900/50 border border-slate-700',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'grid gap-4 p-4 border-b',
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'
        )}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width="80%" height={16} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            'grid gap-4 p-4 border-b last:border-b-0',
            theme === 'light' ? 'border-slate-100' : 'border-slate-800'
          )}
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={colIndex === 0 ? '90%' : '70%'} />
          ))}
        </div>
      ))}
    </div>
  );
};

const SkeletonChart = ({ className }: { className?: string }) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'rounded-xl p-6',
        theme === 'light'
          ? 'bg-white border border-slate-200'
          : 'bg-slate-900/50 border border-slate-700',
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" width={150} height={20} />
        <Skeleton variant="rounded" width={100} height={32} />
      </div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            className="flex-1"
            height={`${30 + Math.random() * 70}%`}
          />
        ))}
      </div>
    </div>
  );
};

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonChart, type SkeletonProps };
