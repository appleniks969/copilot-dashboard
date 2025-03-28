/**
 * constants.js
 * Application constants and configuration defaults
 */

// Helper to get an env variable directly from process.env
// NEXT_PUBLIC_ variables are automatically loaded by Next.js from .env files
const getEnvVar = (key) => {
  return process.env[key] || null;
};
// Removed DEBUG log

// API configuration
export const API_BASE_URL = 'https://api.github.com';
export const API_VERSION = '2022-11-28';

// Default organization and team
export const DEFAULT_ORG = getEnvVar('NEXT_PUBLIC_ORGANIZATION') || getEnvVar('NEXT_PUBLIC_DEFAULT_ORG') || 'your-organization';
export const DEFAULT_TEAM = getEnvVar('NEXT_PUBLIC_TEAM') || getEnvVar('NEXT_PUBLIC_DEFAULT_TEAM') || 'engineers';

// Failsafe: Hardcoded teams list if environment variables fail to load
const HARDCODED_TEAMS = ['mobile', 'backend', 'frontend'];

// Get teams list from environment variable (comma-separated)
export const TEAMS_LIST = getEnvVar('NEXT_PUBLIC_TEAMS') ? 
  getEnvVar('NEXT_PUBLIC_TEAMS').split(',').map(team => team.trim()) : 
  HARDCODED_TEAMS; // Use hardcoded teams as fallback

// Default selected team (from the teams list if available)
export const DEFAULT_SELECTED_TEAM = TEAMS_LIST.length > 0 ? TEAMS_LIST[0] : DEFAULT_TEAM;

// Log environment variables for debugging
console.log('Environment variables direct access:', {
  NEXT_PUBLIC_TEAMS: process.env.NEXT_PUBLIC_TEAMS,
  NEXT_PUBLIC_ORGANIZATION: process.env.NEXT_PUBLIC_ORGANIZATION
});

if (typeof window !== 'undefined') {
  // Also log the computed constants for client-side verification
  console.log('Computed environment constants:', {
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
