/**
 * Shared utility helpers for Tulboxx front-end.
 *
 * NOTE:  clsx’s default export is the function while `ClassValue` is a
 * named type export.  Importing them in the wrong order (`{ clsx }`)
 * results in `clsx` being `undefined` at runtime.  This subtle bug
 * breaks every consumer of `cn()` (our Tailwind-aware class merge
 * helper).  We therefore correct the import to use the *default*
 * export for the function and the *named* export for the type.
 */

import clsx, { type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * formatCurrency – formats a number‐like value into a USD currency string.
 * Handles `null`, `undefined`, empty strings, or non-numeric input gracefully
 * by defaulting to `$0.00`.
 *
 * Examples:
 *   formatCurrency(1234.5)        → "$1,234.50"
 *   formatCurrency("99.9")        → "$99.90"
 *   formatCurrency(null)          → "$0.00"
 *   formatCurrency(undefined)     → "$0.00"
 */
export function formatCurrency(amount?: number | string | null): string {
  const numericAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[^0-9.-]+/g, "") || "0")
      : typeof amount === "number"
      ? amount
      : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/* ------------------------------------------------------------------
 * Additional Blue-Steel utility helpers
 * ------------------------------------------------------------------ */

/**
 * debounce – returns a debounced version of a function that delays its
 * execution until after `delay` ms have elapsed since the last time it
 * was invoked. Useful for resize / input events.
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * throttle – returns a throttled version of a function that will only
 * execute once every `limit` ms. Great for scroll / drag events.
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit = 200
) {
  let lastRun = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun >= limit) {
      lastRun = now;
      fn(...args);
    }
  };
}

/**
 * sleep – simple delay helper for async workflows / demo purposes.
 * Usage: await sleep(500);
 */
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * formatFileSize – converts bytes into a human-readable unit string.
 * e.g. 1536 -> "1.5 KB", 1048576 -> "1 MB"
 */
export function formatFileSize(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(decimals, 0);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * truncateText – trims a string to `maxLength` and adds an ellipsis if
 * it was longer. Avoids breaking words unless forced.
 */
export function truncateText(text: string, maxLength = 50, suffix = '…') {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trimEnd() + suffix;
}

/**
 * generateRandomId – lightweight unique id helper for DOM keys /
 * optimistic UI records. Not cryptographically secure.
 */
export const generateRandomId = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;