import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in millions
 */
export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1) {
    return `$${value.toFixed(1)}M`;
  }
  return `$${(value * 1000).toFixed(0)}K`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

/**
 * Format delta with sign
 */
export function formatDelta(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}`;
}

/**
 * Get color class based on value and thresholds
 */
export function getValueColor(
  value: number,
  goodThreshold: number = 70,
  badThreshold: number = 30,
  inverse: boolean = false
): string {
  if (inverse) {
    if (value <= badThreshold) return 'text-emerald-600';
    if (value >= goodThreshold) return 'text-red-600';
    return 'text-amber-600';
  }

  if (value >= goodThreshold) return 'text-emerald-600';
  if (value <= badThreshold) return 'text-red-600';
  return 'text-amber-600';
}

/**
 * Get background color class based on value
 */
export function getValueBgColor(
  value: number,
  goodThreshold: number = 70,
  badThreshold: number = 30,
  inverse: boolean = false
): string {
  if (inverse) {
    if (value <= badThreshold) return 'bg-emerald-500';
    if (value >= goodThreshold) return 'bg-red-500';
    return 'bg-amber-500';
  }

  if (value >= goodThreshold) return 'bg-emerald-500';
  if (value <= badThreshold) return 'bg-red-500';
  return 'bg-amber-500';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
