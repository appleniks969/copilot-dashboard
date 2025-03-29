/**
 * Environment variable utilities - simplified best practices approach
 */

// Simple access to public environment variables
export const getEnvVar = (key) => {
  // For client-side, we can only access NEXT_PUBLIC_* variables
  // Return undefined if the variable is not set
  return process.env[key];
};

// Get teams list from environment
export const getTeamsList = () => {
  const teamsString = getEnvVar('NEXT_PUBLIC_TEAMS');
  // Return undefined if not set, otherwise return the parsed array
  // No fallback to an empty array
  return teamsString ? teamsString.split(',').map(team => team.trim()) : undefined;
};

// Get organization from environment
export const getOrganization = () => {
  // Return undefined if not set
  // No fallback
  return getEnvVar('NEXT_PUBLIC_ORGANIZATION');
};

// New method to get auth token (server-side only)
export const getAuthToken = () => {
  // This should only be called in server-side code
  if (typeof window !== 'undefined') {
    console.warn('Warning: Attempting to access AUTH_TOKEN from client-side code');
    return undefined;
  }
  return process.env.AUTH_TOKEN;
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
