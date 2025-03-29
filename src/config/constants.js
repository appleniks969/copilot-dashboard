/**
 * constants.js
 * Application constants and configuration defaults
 */

// API configuration
export const API_BASE_URL = 'https://api.github.com';
export const API_VERSION = '2022-11-28';

// Environment variables - Directly read without fallbacks
export const DEFAULT_ORG = process.env.NEXT_PUBLIC_ORGANIZATION; 

// Get teams list from environment variable (comma-separated)
export const TEAMS_LIST = process.env.NEXT_PUBLIC_TEAMS 
  ? process.env.NEXT_PUBLIC_TEAMS.split(',').map(team => team.trim()) 
  : []; // Use empty array if not set, as downstream code might expect an array

// Default selected team - Use the first team from the list if available
export const DEFAULT_SELECTED_TEAM = TEAMS_LIST.length > 0 ? TEAMS_LIST[0] : undefined;

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