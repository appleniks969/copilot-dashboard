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
  : []; 

// Default selected team - Use the first team from the list if available
export const DEFAULT_SELECTED_TEAM = TEAMS_LIST.length > 0 ? TEAMS_LIST[0] : undefined;