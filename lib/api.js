import axios from 'axios';
import { mockOrgData, mockTeamData, mockTeamBreakdownData } from './mockData';

const API_BASE_URL = 'https://api.github.com';
const API_VERSION = '2022-11-28';
const USE_MOCK_DATA = false; // Set to false to use the actual GitHub API

// Configure the axios instance
const githubApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
  }
});

// Set the authentication token
export const setAuthToken = (token) => {
  if (token) {
    githubApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete githubApi.defaults.headers.common['Authorization'];
  }
};

// Helper function to make API calls through our proxy
const callGitHubAPI = async (endpoint, token, params) => {
  try {
    // For client-side calls, use our proxy to avoid CORS issues
    if (typeof window !== 'undefined') {
      const response = await axios.post('/api/proxy', {
        url: `${API_BASE_URL}${endpoint}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params,
      });
      return response.data;
    } else {
      // For server-side calls, use axios directly
      const response = await githubApi.get(endpoint, { params });
      return response.data;
    }
  } catch (error) {
    console.error(`Error calling GitHub API: ${endpoint}`, error);
    throw error;
  }
};

// Fetch Copilot usage summary for a team
export const getCopilotUsageForTeam = async (org, team, startDate, endDate) => {
  // Use mock data if configured
  if (USE_MOCK_DATA) {
    console.log('Using mock data for team usage');
    return mockTeamData;
  }
  
  try {
    const token = githubApi.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const endpoint = `/orgs/${org}/copilot/usage/teams/${team}`;
    const params = { start_date: startDate, end_date: endDate };
    
    return await callGitHubAPI(endpoint, token, params);
  } catch (error) {
    console.error('Error fetching Copilot team usage:', error);
    throw error;
  }
};

// Fetch Copilot usage summary for an organization
export const getCopilotUsageForOrg = async (org, startDate, endDate) => {
  // Use mock data if configured
  if (USE_MOCK_DATA) {
    console.log('Using mock data for org usage');
    return mockOrgData;
  }
  
  try {
    const token = githubApi.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const endpoint = `/orgs/${org}/copilot/usage`;
    const params = { start_date: startDate, end_date: endDate };
    
    return await callGitHubAPI(endpoint, token, params);
  } catch (error) {
    console.error('Error fetching Copilot org usage:', error);
    throw error;
  }
};

// Fetch Copilot usage breakdown by team for an organization
export const getCopilotBreakdownByTeam = async (org, startDate, endDate) => {
  // Use mock data if configured
  if (USE_MOCK_DATA) {
    console.log('Using mock data for team breakdown');
    return mockTeamBreakdownData;
  }
  
  try {
    const token = githubApi.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    const endpoint = `/orgs/${org}/copilot/usage/breakdown/teams`;
    const params = { start_date: startDate, end_date: endDate };
    
    return await callGitHubAPI(endpoint, token, params);
  } catch (error) {
    console.error('Error fetching Copilot team breakdown:', error);
    throw error;
  }
};

// Helper function to calculate daily average for metrics
export const calculateDailyAverage = (data, metric, days) => {
  if (!data || !data[metric]) return 0;
  return Math.round(data[metric] / days);
};

// Helper function to calculate adoption rate
export const calculateAdoptionRate = (activeUsers, totalLicensed) => {
  if (!totalLicensed || totalLicensed === 0) return 0;
  return (activeUsers / totalLicensed) * 100;
};

// Helper function to calculate ROI
export const calculateROI = (linesAccepted, avgLinesPerHour, avgHourlyRate, licenseCost) => {
  const hoursSaved = linesAccepted / avgLinesPerHour;
  const moneySaved = hoursSaved * avgHourlyRate;
  return {
    hoursSaved,
    moneySaved,
    roi: (moneySaved / licenseCost) - 1, // ROI as a decimal
  };
};