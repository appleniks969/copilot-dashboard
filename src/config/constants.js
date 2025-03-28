/**
 * constants.js
 * Application constants and configuration defaults
 */

// Import Next.js config if needed
import getConfig from 'next/config';

// Get the environment variables from Next.js config
let publicRuntimeConfig = {};
try {
  const nextConfig = getConfig() || {};
  publicRuntimeConfig = nextConfig.publicRuntimeConfig || {};
} catch (e) {
  console.warn('Failed to get Next.js config:', e.message);
}

// Helper to get an env variable from multiple possible sources
const getEnvVar = (key) => {
  // Try in this order: process.env directly, publicRuntimeConfig, then fallback
  return process.env[key] || publicRuntimeConfig[key] || null;
};

// API configuration
export const API_BASE_URL = 'https://api.github.com';
export const API_VERSION = '2022-11-28';

// Default organization and team
export const DEFAULT_ORG = getEnvVar('NEXT_PUBLIC_ORGANIZATION') || getEnvVar('NEXT_PUBLIC_DEFAULT_ORG') || 'your-organization';
export const DEFAULT_TEAM = getEnvVar('NEXT_PUBLIC_TEAM') || getEnvVar('NEXT_PUBLIC_DEFAULT_TEAM') || 'engineers';

// Get teams list from environment variable (comma-separated)
export const TEAMS_LIST = getEnvVar('NEXT_PUBLIC_TEAMS') ? 
  getEnvVar('NEXT_PUBLIC_TEAMS').split(',').map(team => team.trim()) : 
  [];

// Default selected team (from the teams list if available)
export const DEFAULT_SELECTED_TEAM = TEAMS_LIST.length > 0 ? TEAMS_LIST[0] : DEFAULT_TEAM;

// Log the environment variables to help debug
if (typeof window !== 'undefined') {
  console.log('Environment variables loaded:', {
    DEFAULT_ORG,
    DEFAULT_TEAM,
    TEAMS_LIST,
    DEFAULT_SELECTED_TEAM,
  });
}

// Default date ranges
export const DATE_RANGES = {
  LAST_1_DAY: '1 day',
  LAST_7_DAYS: '7 days',
  LAST_14_DAYS: '14 days',
  LAST_28_DAYS: '28 days',
};

// Chart colors
export const CHART_COLORS = {
  primary: '#2563EB',
  secondary: '#10B981',
  tertiary: '#F59E0B',
  quaternary: '#EF4444',
  gray: '#6B7280',
};

// Standard chart color array for consistent visualizations across reports
export const CHART_COLORS_ARRAY = [
  '#2563EB', // primary blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#0EA5E9', // sky blue
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#64748B', // slate
  '#84CC16', // lime
];

// ROI Calculation defaults
export const ROI_DEFAULTS = {
  avgLinesPerHour: 30, // Average lines of code a developer writes per hour
  avgHourlyRate: 75, // Average hourly rate for a developer in USD
  licenseCostPerMonth: 19, // Monthly cost of a Copilot license per user in USD
};