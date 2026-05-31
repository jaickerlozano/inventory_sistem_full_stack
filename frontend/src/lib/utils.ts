/**
 * Utility to merge class names conditionally.
 * Simple implementation — no external dependencies needed.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * API endpoint paths (relative to API_BASE_URL).
 * These match the DRF router registration in backend/core/urls.py.
 */
export const ENDPOINTS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SUPPLIERS: 'suppliers',
  STOCK_MOVEMENTS: 'stock-movements',
  DASHBOARD: 'dashboard',
  ALERTS: 'alerts',
  TOTAL_PRODUCTS: 'products',
  LOW_STOCK_PRODUCTS: 'alerts',
} as const;
