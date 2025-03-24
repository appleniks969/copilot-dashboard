// Default organization and team
export const DEFAULT_ORG = process.env.NEXT_PUBLIC_ORGANIZATION || process.env.NEXT_PUBLIC_DEFAULT_ORG || 'your-organization';
export const DEFAULT_TEAM = process.env.NEXT_PUBLIC_DEFAULT_TEAM || 'engineers';

// Default date ranges
export const DATE_RANGES = {
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

// ROI Calculation defaults
export const ROI_DEFAULTS = {
  avgLinesPerHour: 30, // Average lines of code a developer writes per hour
  avgHourlyRate: 75, // Average hourly rate for a developer in USD
  licenseCostPerMonth: 19, // Monthly cost of a Copilot license per user in USD
};

// Features list for feature-specific usage tracking
export const COPILOT_FEATURES = [
  'Code Completion',
  'Copilot Chat',
  'Code Explanation',
  'Test Generation',
];

// Programming languages for language-specific usage tracking
export const PROGRAMMING_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'C#',
  'Ruby',
  'PHP',
  'C++',
  'Other',
];

// Editors for editor-specific usage tracking
export const EDITORS = [
  'VS Code',
  'JetBrains',
  'Visual Studio',
  'Vim/Neovim',
  'Other',
];