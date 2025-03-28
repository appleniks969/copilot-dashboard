/**
 * Environment variable utilities - simplified best practices approach
 */

// Simple access to public environment variables
export const getEnvVar = (key) => {
  // For client-side, we can only access NEXT_PUBLIC_* variables
  return process.env[key] || null;
};

// Get teams list from environment with fallback
export const getTeamsList = () => {
  const teamsString = getEnvVar('NEXT_PUBLIC_TEAMS');
  return teamsString ? teamsString.split(',').map(team => team.trim()) : [];
};

// Get organization from environment
export const getOrganization = () => {
  return getEnvVar('NEXT_PUBLIC_ORGANIZATION') || 'my-github-org';
};

// Simplified log function for debugging
export const logEnvState = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[ENV] Values:', {
      ORGANIZATION: getOrganization(),
      TEAMS: getTeamsList()
    });
  }
};
