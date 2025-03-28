/**
 * Environment variable utility functions
 */

// Direct access to environment variables with multiple fallbacks
export const getEnvVar = (key) => {
  // Try browser-side environment variable
  if (typeof window !== 'undefined') {
    const runtimeValue = window.__NEXT_DATA__?.runtimeConfig?.[key];
    if (runtimeValue) return runtimeValue;
  }
  
  // Try process.env
  if (process.env[key]) return process.env[key];
  
  // Try to get from Next.js runtime config
  try {
    const getConfig = require('next/config').default;
    const { publicRuntimeConfig } = getConfig() || {};
    return publicRuntimeConfig?.[key];
  } catch (e) {
    console.warn('Failed to access runtime config:', e);
  }
  
  return null;
};

// Get teams from environment with direct hardcoded fallback
export const getTeamsList = () => {
  // Get from environment
  const teamsString = getEnvVar('NEXT_PUBLIC_TEAMS');
  
  // Parse if available
  if (teamsString) {
    return teamsString.split(',').map(team => team.trim());
  }
  
  // Hardcoded fallback
  console.warn('Using hardcoded teams list because NEXT_PUBLIC_TEAMS environment variable is not available');
  return ['mobile', 'backend', 'frontend']; // Hardcoded fallback
};

// Get organization from environment with fallback
export const getOrganization = () => {
  // Get from environment
  const org = getEnvVar('NEXT_PUBLIC_ORGANIZATION');
  
  // Return if available
  if (org) {
    return org;
  }
  
  // Hardcoded fallback
  console.warn('Using hardcoded organization because NEXT_PUBLIC_ORGANIZATION environment variable is not available');
  return 'my-github-org'; // Hardcoded fallback
};

// Log environment state (for debugging)
export const logEnvState = () => {
  console.log('[ENV DEBUG] Environment state:', {
    processEnv: {
      NEXT_PUBLIC_TEAMS: process.env.NEXT_PUBLIC_TEAMS,
      NEXT_PUBLIC_ORGANIZATION: process.env.NEXT_PUBLIC_ORGANIZATION
    },
    teams: getTeamsList(),
    organization: getOrganization()
  });
};
