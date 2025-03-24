import axios from 'axios';
import { mockOrgData, mockTeamData, mockTeamBreakdownData } from './mockData';

const API_BASE_URL = 'https://api.github.com';
const API_VERSION = '2022-11-28';
const USE_MOCK_DATA = false; // Never use mock data

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
    console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);
    console.log('Parameters:', params);
    
    // For client-side calls, use our proxy to avoid CORS issues
    if (typeof window !== 'undefined') {
      const requestUrl = `${API_BASE_URL}${endpoint}`;
      console.log(`Client-side API call through proxy to: ${requestUrl}`);
      
      const response = await axios.post('/api/proxy', {
        url: requestUrl,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': API_VERSION,
        },
        params,
      });
      
      console.log(`API response status: ${response.status}`);
      return response.data;
    } else {
      // For server-side calls, use axios directly
      console.log('Server-side API call');
      const response = await githubApi.get(endpoint, { params });
      console.log(`API response status: ${response.status}`);
      return response.data;
    }
  } catch (error) {
    console.error(`Error calling GitHub API: ${endpoint}`, error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Fetch Copilot usage summary for a team - This is our primary data source
export const getCopilotUsageForTeam = async (org, team, startDate, endDate) => {
  // Use mock data if configured
  if (USE_MOCK_DATA) {
    console.log('Using mock data for team usage');
    return mockTeamData;
  }
  
  try {
    const token = githubApi.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    // This is the exact endpoint specified in requirements
    const endpoint = `/orgs/${org}/team/${team}/copilot/metrics`;
    const params = { start_date: startDate, end_date: endDate };
    
    console.log(`Fetching data from: ${endpoint} for org: ${org}, team: ${team}`);
    
    const metricsData = await callGitHubAPI(endpoint, token, params);
    
    // Process the array of daily metrics into a summary format
    const summary = processMetricsData(metricsData);
    return summary;
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
    const endpoint = `/orgs/${org}/copilot/metrics`;
    const params = { start_date: startDate, end_date: endDate };
    
    const metricsData = await callGitHubAPI(endpoint, token, params);
    
    // Process the array of daily metrics into a summary format
    const summary = processMetricsData(metricsData);
    return summary;
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
    // Note: This endpoint might need to be revised based on GitHub's API for team breakdowns
    const endpoint = `/orgs/${org}/copilot/teams`;
    const params = { start_date: startDate, end_date: endDate };
    
    const teamsData = await callGitHubAPI(endpoint, token, params);
    
    // For team breakdown, we'll need to fetch metrics for each team individually
    // This will depend on the exact API structure GitHub provides
    // For now, we'll return the raw teams data
    return teamsData;
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

// Process the new Copilot metrics data format (array of daily metrics)
export const processMetricsData = (metricsData) => {
  if (!metricsData || !Array.isArray(metricsData) || metricsData.length === 0) {
    return {
      active_users: 0,
      engaged_users: 0,
      total_suggestions: 0,
      accepted_suggestions: 0,
      accepted_lines: 0,
      languages: [],
      editors: []
    };
  }

  // Initialize summary object
  const summary = {
    active_users: 0,
    engaged_users: 0,
    total_suggestions: 0,
    accepted_suggestions: 0,
    accepted_lines: 0,
    languages: {},
    editors: {}
  };

  // Aggregate metrics across all days
  metricsData.forEach(dayData => {
    // Active and engaged users (use max across days to avoid double counting)
    summary.active_users = Math.max(summary.active_users, dayData.total_active_users || 0);
    summary.engaged_users = Math.max(summary.engaged_users, dayData.total_engaged_users || 0);

    // Process IDE code completions data
    if (dayData.copilot_ide_code_completions) {
      const completions = dayData.copilot_ide_code_completions;

      // Process languages data
      if (completions.languages && Array.isArray(completions.languages)) {
        completions.languages.forEach(lang => {
          if (!summary.languages[lang.name]) {
            summary.languages[lang.name] = {
              name: lang.name,
              total_engaged_users: 0,
              total_suggestions: 0,
              total_acceptances: 0,
              total_lines_suggested: 0,
              total_lines_accepted: 0
            };
          }
          
          summary.languages[lang.name].total_engaged_users = Math.max(
            summary.languages[lang.name].total_engaged_users,
            lang.total_engaged_users || 0
          );
        });
      }

      // Process editors data
      if (completions.editors && Array.isArray(completions.editors)) {
        completions.editors.forEach(editor => {
          if (!summary.editors[editor.name]) {
            summary.editors[editor.name] = {
              name: editor.name,
              total_engaged_users: 0,
              total_suggestions: 0,
              total_acceptances: 0,
              total_lines_suggested: 0,
              total_lines_accepted: 0
            };
          }
          
          summary.editors[editor.name].total_engaged_users = Math.max(
            summary.editors[editor.name].total_engaged_users,
            editor.total_engaged_users || 0
          );

          // Aggregate metrics from models and languages within editors
          if (editor.models && Array.isArray(editor.models)) {
            editor.models.forEach(model => {
              if (model.languages && Array.isArray(model.languages)) {
                model.languages.forEach(lang => {
                  // Aggregate code metrics
                  summary.total_suggestions += lang.total_code_suggestions || 0;
                  summary.accepted_suggestions += lang.total_code_acceptances || 0;
                  summary.accepted_lines += lang.total_code_lines_accepted || 0;
                  
                  // Update editor stats
                  summary.editors[editor.name].total_suggestions += lang.total_code_suggestions || 0;
                  summary.editors[editor.name].total_acceptances += lang.total_code_acceptances || 0;
                  summary.editors[editor.name].total_lines_suggested += lang.total_code_lines_suggested || 0;
                  summary.editors[editor.name].total_lines_accepted += lang.total_code_lines_accepted || 0;
                  
                  // Update language stats
                  if (summary.languages[lang.name]) {
                    summary.languages[lang.name].total_suggestions += lang.total_code_suggestions || 0;
                    summary.languages[lang.name].total_acceptances += lang.total_code_acceptances || 0;
                    summary.languages[lang.name].total_lines_suggested += lang.total_code_lines_suggested || 0;
                    summary.languages[lang.name].total_lines_accepted += lang.total_code_lines_accepted || 0;
                  }
                });
              }
            });
          }
        });
      }
    }
  });

  // Convert languages and editors objects to arrays for easier consumption
  summary.languages = Object.values(summary.languages);
  summary.editors = Object.values(summary.editors);

  return summary;
};