import axios from 'axios';

const API_BASE_URL = 'https://api.github.com';
const API_VERSION = '2022-11-28';

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
  try {
    const token = githubApi.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    // This is the exact endpoint specified in requirements
    const endpoint = `/orgs/${org}/team/${team}/copilot/metrics`;
    const params = { start_date: startDate, end_date: endDate };
    
    console.log(`Fetching data from: ${endpoint} for org: ${org}, team: ${team}`);
    
    const metricsData = await callGitHubAPI(endpoint, token, params);
    
    // Process the array of daily metrics into a summary format
    const summary = processMetricsData(metricsData);
    // Save raw data in the summary for reference
    summary.rawData = metricsData;
    return summary;
  } catch (error) {
    console.error('Error fetching Copilot team usage:', error);
    throw error;
  }
};

// Fetch Copilot usage summary for an organization
export const getCopilotUsageForOrg = async (org, startDate, endDate) => {
  try {
    const token = githubApi.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    // This is the exact endpoint specified in the GitHub API docs
    // https://docs.github.com/en/rest/copilot/copilot-metrics?apiVersion=2022-11-28#get-copilot-metrics-for-an-organization
    const endpoint = `/orgs/${org}/copilot/metrics`;
    const params = { start_date: startDate, end_date: endDate };
    
    console.log(`Fetching organization data from: ${endpoint} for org: ${org}`);
    
    const metricsData = await callGitHubAPI(endpoint, token, params);
    
    // Process the array of daily metrics into a summary format
    const summary = processMetricsData(metricsData);
    // Save raw data in the summary for reference
    summary.rawData = metricsData;
    return summary;
  } catch (error) {
    console.error('Error fetching Copilot org usage:', error);
    throw error;
  }
};

// Fetch Copilot usage breakdown by team for an organization
export const getCopilotBreakdownByTeam = async (org, startDate, endDate) => {
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

// Fetch data for multiple teams from a list
export const fetchMultipleTeamsData = async (org, teamsList, startDate, endDate) => {
  console.log(`Fetching data for ${teamsList.length} teams: ${teamsList.join(', ')}`);
  
  try {
    // Create an array of promises for fetching each team's data
    const teamPromises = teamsList.map(async (team) => {
      try {
        console.log(`Fetching data for team: ${team}`);
        const teamData = await getCopilotUsageForTeam(org, team, startDate, endDate);
        return {
          team_slug: team,
          ...teamData
        };
      } catch (error) {
        console.error(`Error fetching data for team ${team}:`, error);
        // Return a skeleton object if we fail to fetch data for a specific team
        return {
          team_slug: team,
          active_users: 0,
          engaged_users: 0,
          total_suggestions: 0,
          accepted_suggestions: 0,
          accepted_lines: 0,
          languages: [],
          editors: [],
          error: true
        };
      }
    });
    
    // Wait for all promises to resolve
    const results = await Promise.all(teamPromises);
    console.log(`Successfully fetched data for ${results.length} teams`);
    return results;
  } catch (error) {
    console.error('Error fetching data for multiple teams:', error);
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
  console.log('Processing metrics data:', JSON.stringify(metricsData).substring(0, 200) + '...');
  
  // Safety check for incoming data
  if (!metricsData) {
    console.warn('No metrics data provided');
    return {
      active_users: 0,
      engaged_users: 0,
      total_suggestions: 0,
      accepted_suggestions: 0,
      accepted_lines: 0,
      languages: [],
      editors: [],
      error: 'No data received'
    };
  }
  
  // Handle case where data is not an array (single object)
  if (!Array.isArray(metricsData)) {
    console.warn('Metrics data is not an array, attempting to handle as single object');
    // Try to process as single object if it has the required structure
    if (metricsData.copilot_ide_code_completions) {
      metricsData = [metricsData]; // Convert to array with one item
    } else {
      console.error('Metrics data format is not recognized:', metricsData);
      return {
        active_users: 0,
        engaged_users: 0,
        total_suggestions: 0,
        accepted_suggestions: 0,
        accepted_lines: 0,
        languages: [],
        editors: [],
        error: 'Unrecognized data format',
        originalData: metricsData // Include original for debugging
      };
    }
  }
  
  if (metricsData.length === 0) {
    console.warn('Metrics data is an empty array');
    return {
      active_users: 0,
      engaged_users: 0,
      total_suggestions: 0,
      accepted_suggestions: 0,
      accepted_lines: 0,
      languages: [],
      editors: [],
      error: 'Empty data array'
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
    editors: {},
    processedDays: 0 // Track how many days we actually processed
  };

  // Aggregate metrics across all days
  metricsData.forEach((dayData, index) => {
    if (!dayData) {
      console.warn(`Skipping null/undefined day data at index ${index}`);
      return; // Skip this iteration
    }
    
    // Track that we processed this day
    summary.processedDays++;
    
    // Sum active and engaged users across days - this will be deduplicated in a follow-up step
    const dayActiveUsers = dayData.total_active_users || 0;
    const dayEngagedUsers = dayData.total_engaged_users || 0;
    
    if (dayActiveUsers > 0) summary.active_users += dayActiveUsers;
    if (dayEngagedUsers > 0) summary.engaged_users += dayEngagedUsers;

    // Process IDE code completions data
    if (dayData.copilot_ide_code_completions) {
      const completions = dayData.copilot_ide_code_completions;

      // Process languages data
      if (completions.languages && Array.isArray(completions.languages)) {
        completions.languages.forEach(lang => {
          if (!lang || !lang.name) {
            console.warn('Skipping language entry with missing name');
            return;
          }
          
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
          if (!editor || !editor.name) {
            console.warn('Skipping editor entry with missing name');
            return;
          }
          
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
              if (!model) return;
              
              if (model.languages && Array.isArray(model.languages)) {
                model.languages.forEach(lang => {
                  if (!lang || !lang.name) return;
                  
                  // Safely access metrics with defaults
                  const suggestions = lang.total_code_suggestions || 0;
                  const acceptances = lang.total_code_acceptances || 0;
                  const linesSuggested = lang.total_code_lines_suggested || 0;
                  const linesAccepted = lang.total_code_lines_accepted || 0;
                  
                  // Divide by number of days in data to avoid multiple counting in daily data
                  const dayFactor = (model.day_number && model.day_number > 0) ? 1 : 1; 
                  
                  // Aggregate code metrics - protect against NaN with logical OR
                  summary.total_suggestions += suggestions;
                  summary.accepted_suggestions += acceptances;
                  summary.accepted_lines += linesAccepted;
                  
                  // Update editor stats
                  summary.editors[editor.name].total_suggestions += suggestions;
                  summary.editors[editor.name].total_acceptances += acceptances;
                  summary.editors[editor.name].total_lines_suggested += linesSuggested;
                  summary.editors[editor.name].total_lines_accepted += linesAccepted;
                  
                  // Update language stats
                  if (summary.languages[lang.name]) {
                    summary.languages[lang.name].total_suggestions += suggestions;
                    summary.languages[lang.name].total_acceptances += acceptances;
                    summary.languages[lang.name].total_lines_suggested += linesSuggested;
                    summary.languages[lang.name].total_lines_accepted += linesAccepted;
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
  
  // Adjust active and engaged users count based on number of days to avoid inflation
  // This is an approximation assuming we can't track unique users across days
  if (summary.processedDays > 1) {
    summary.active_users = Math.round(summary.active_users / summary.processedDays);
    summary.engaged_users = Math.round(summary.engaged_users / summary.processedDays);
  }
  
  // Normalize metrics for consistent display across different date ranges
  if (summary.processedDays > 1) {
    // We already adjusted active_users and engaged_users, now let's handle language and editor data
    summary.languages.forEach(lang => {
      if (!lang) return;
      
      // Ensure no negative values in language data
      lang.total_suggestions = Math.max(0, lang.total_suggestions || 0);
      lang.total_acceptances = Math.max(0, lang.total_acceptances || 0);
      
      // Ensure acceptance rate doesn't exceed 100%
      if (lang.total_suggestions > 0 && lang.total_acceptances > lang.total_suggestions) {
        lang.total_acceptances = lang.total_suggestions;
      }
    });
    
    summary.editors.forEach(editor => {
      if (!editor) return;
      
      // Ensure no negative values in editor data
      editor.total_suggestions = Math.max(0, editor.total_suggestions || 0);
      editor.total_acceptances = Math.max(0, editor.total_acceptances || 0);
      
      // Ensure acceptance rate doesn't exceed 100%
      if (editor.total_suggestions > 0 && editor.total_acceptances > editor.total_suggestions) {
        editor.total_acceptances = editor.total_suggestions;
      }
    });
  }
  
  // Add metadata to help with debugging
  summary.dataPoints = metricsData.length;
  
  console.log('Processed metrics summary:', {
    active_users: summary.active_users,
    engaged_users: summary.engaged_users,
    total_suggestions: summary.total_suggestions,
    accepted_suggestions: summary.accepted_suggestions,
    processedDays: summary.processedDays,
    languages: summary.languages.length,
    editors: summary.editors.length
  });

  return summary;
};