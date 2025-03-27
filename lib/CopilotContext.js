import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  getCopilotUsageForOrg, 
  getCopilotUsageForTeam, 
  getCopilotBreakdownByTeam,
  fetchMultipleTeamsData,
  setAuthToken,
  calculateDailyAverage,
  calculateROI
} from './api';
import { getDateRange, getDaysBetween } from './utils';
import { DEFAULT_ORG, DEFAULT_SELECTED_TEAM, DATE_RANGES, ROI_DEFAULTS, TEAMS_LIST } from './config';

const CopilotContext = createContext();

export function CopilotProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [organization, setOrganization] = useState(DEFAULT_ORG);
  const [team, setTeam] = useState(DEFAULT_SELECTED_TEAM);
  
  // Keep track of which reports have already loaded data for specific date ranges
  const [loadedReports, setLoadedReports] = useState({});
  
  // Per-report date ranges with default values
  const [globalDateRange, setGlobalDateRange] = useState(DATE_RANGES.LAST_28_DAYS);
  const [dateRanges, setDateRanges] = useState({
    userEngagement: DATE_RANGES.LAST_28_DAYS,
    productivity: DATE_RANGES.LAST_28_DAYS,
    roi: DATE_RANGES.LAST_28_DAYS,
    languageEditor: DATE_RANGES.LAST_28_DAYS,
    teamComparison: DATE_RANGES.LAST_28_DAYS,
    rawData: DATE_RANGES.LAST_28_DAYS
  });
  
  // Data states per report
  const [reportData, setReportData] = useState({
    userEngagement: null,
    productivity: null,
    roi: null,
    languageEditor: null,
    teamComparison: null,
    rawData: null
  });
  
  const [orgData, setOrgData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [teamBreakdownData, setTeamBreakdownData] = useState(null);
  const [multiTeamData, setMultiTeamData] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [authToken, setAuthTokenState] = useState('');
  
  // Use a ref to track pending API calls and avoid duplicate/redundant requests
  const pendingRequests = useRef({});
  const requestDebounceTimers = useRef({});
  
  // Handle authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('github_token');
      if (token) {
        setAuthTokenState(token);
        setAuthToken(token);
      }
    }
  }, []);
  
  // Save token to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && authToken) {
      localStorage.setItem('github_token', authToken);
      setAuthToken(authToken);
    }
  }, [authToken]);
  
  // Extract the number of days from the dateRange string (e.g., "28 days" -> 28)
  const extractDaysFromDateRange = (rangeString) => {
    const match = rangeString.match(/^(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 28; // Default to 28 days if parsing fails
  };
  
  // Helper function to fetch data for a specific report
  const fetchReportData = async (reportId, dateRangeValue) => {
    if (!authToken) return null;
    
    // Create a unique key for this request to track duplicates
    const requestKey = `${reportId}-${dateRangeValue}-${organization}-${team}`;
    
    // If this exact request is already in progress, don't duplicate it
    if (pendingRequests.current[requestKey]) {
      console.log(`Request already in progress for ${requestKey}, skipping duplicate`);
      return pendingRequests.current[requestKey];
    }
    
    try {
      // Set up promise to track this request
      const requestPromise = (async () => {
        // Use the specified date range for this report
        const days = extractDaysFromDateRange(dateRangeValue);
        const { startDate, endDate } = getDateRange(days);
        
        // Fetch data based on the current organization and team settings
        if (team) {
          try {
            const teamResults = await getCopilotUsageForTeam(organization, team, startDate, endDate);
            return teamResults;
          } catch (teamErr) {
            console.error(`Error fetching team data for ${reportId}:`, teamErr);
            
            // Fall back to org data
            try {
              const orgResults = await getCopilotUsageForOrg(organization, startDate, endDate);
              return orgResults;
            } catch (orgErr) {
              console.error(`Error fetching org data for ${reportId}:`, orgErr);
              throw new Error('Failed to fetch data for this report.');
            }
          }
        } else {
          // No team specified, use organization data
          const orgResults = await getCopilotUsageForOrg(organization, startDate, endDate);
          return orgResults;
        }
      })();
      
      // Store promise in pending requests
      pendingRequests.current[requestKey] = requestPromise;
      
      // Wait for result
      const result = await requestPromise;
      
      // Request completed, remove from pending list
      delete pendingRequests.current[requestKey];
      
      return result;
    } catch (err) {
      console.error(`Error fetching data for report ${reportId}:`, err);
      // Clean up the pending request on error
      delete pendingRequests.current[requestKey];
      return null;
    }
  };
  
  // Update a specific report's date range
  const updateReportDateRange = async (reportId, newDateRange) => {
    // Skip if the date range hasn't changed
    if (dateRanges[reportId] === newDateRange) {
      console.log(`Date range for ${reportId} already set to ${newDateRange}, skipping update`);
      return;
    }
    
    // Update the date range state immediately
    setDateRanges(prev => ({
      ...prev,
      [reportId]: newDateRange
    }));
    
    // Clear any existing debounce timer for this report
    if (requestDebounceTimers.current[reportId]) {
      clearTimeout(requestDebounceTimers.current[reportId]);
    }
    
    // Set a debounce timer to avoid rapid successive API calls
    requestDebounceTimers.current[reportId] = setTimeout(async () => {
      setIsLoading(true);
      
      try {
        // Always fetch fresh data when date range changes
        const reportResult = await fetchReportData(reportId, newDateRange);
        
        // Update the report's data
        if (reportResult) {
          setReportData(prev => ({
            ...prev,
            [reportId]: reportResult
          }));
          
          // Also update global data if this is the main report
          if (reportId === 'userEngagement') {
            setOrgData(reportResult);
            setRawData(reportResult?.rawData);
          }
          
          // Mark this report/date range combination as loaded
          const loadedKey = `${reportId}-${newDateRange}-${organization}-${team}`;
          setLoadedReports(prev => ({
            ...prev,
            [loadedKey]: true
          }));
        }
      } catch (error) {
        console.error(`Error updating report ${reportId}:`, error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  };
  
  // Reset loaded reports when organization or team changes
  useEffect(() => {
    setLoadedReports({});
  }, [organization, team]);
  
  // Fetch data for all reports when organization or team changes
  useEffect(() => {
    if (!authToken) return;
    
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch data for multiple teams if configured
        if (TEAMS_LIST.length > 0) {
          try {
            // Use global date range for team comparison
            const days = extractDaysFromDateRange(dateRanges.teamComparison);
            const { startDate, endDate } = getDateRange(days);
            const teamsResults = await fetchMultipleTeamsData(organization, TEAMS_LIST, startDate, endDate);
            setMultiTeamData(teamsResults);
          } catch (multiTeamsErr) {
            console.error('Error fetching data for multiple teams:', multiTeamsErr);
            setMultiTeamData([]);
          }
        }
        
        // Fetch data for each report based on their individual date ranges
        const reportIds = Object.keys(dateRanges);
        const reportPromises = reportIds.map(reportId => 
          fetchReportData(reportId, dateRanges[reportId])
        );
        
        const results = await Promise.allSettled(reportPromises);
        
        // Process results and update each report's data
        results.forEach((result, index) => {
          const reportId = reportIds[index];
          if (result.status === 'fulfilled' && result.value) {
            setReportData(prev => ({
              ...prev,
              [reportId]: result.value
            }));
            
            // Mark this report/date range combination as loaded
            const loadedKey = `${reportId}-${dateRanges[reportId]}-${organization}-${team}`;
            setLoadedReports(prev => ({
              ...prev,
              [loadedKey]: true
            }));
            
            // Also use the first successfully loaded report for global data
            if (result.value && !orgData) {
              setOrgData(result.value);
              setRawData(result.value?.rawData);
            }
          } else {
            console.error(`Failed to fetch data for ${reportId}:`, result.reason || 'No data returned');
          }
        });
        
        // Ensure we have some data set for the global context
        if (!orgData && Object.values(reportData).some(data => data !== null)) {
          const firstValidReport = Object.values(reportData).find(data => data !== null);
          setOrgData(firstValidReport);
          setRawData(firstValidReport?.rawData);
        }
        
      } catch (err) {
        console.error('Error fetching Copilot data:', err);
        setError('Failed to fetch Copilot usage data. Please check your token and organization settings.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, [authToken, organization, team]); // Only refetch when auth, org, or team changes
  
  // Calculate metrics for a specific report
  const getMetricsForReport = (reportId) => {
    const data = reportData[reportId] || orgData;
    if (!data) return null;
    
    const days = extractDaysFromDateRange(dateRanges[reportId] || globalDateRange);
    const validDays = isNaN(days) || days <= 0 ? 1 : days;
    
    // Safely access data properties with defaults
    // 'active_users' from processMetricsData is the average daily active users
    const avgDailyActiveUsers = data.active_users || 0; 
    // 'engaged_users' from processMetricsData is the average daily engaged users
    const avgDailyEngagedUsers = data.engaged_users || 0; 
    const totalSuggestions = data.total_suggestions || 0;
    const acceptedSuggestions = data.accepted_suggestions || 0;
    const acceptedLines = data.accepted_lines || 0;
    
    // Calculate core metrics - adjust for processed days to avoid inflation
    const processedDays = data.processedDays || validDays;
    // Removed redundant dailyActiveUsers calculation
    
    // Calculate acceptance rate with null checks
    const acceptanceRate = totalSuggestions > 0 
      ? (acceptedSuggestions / totalSuggestions) * 100 
      : 0;
    
    // Calculate ROI with safer values
    // Use avgDailyActiveUsers for license cost calculation
    const { hoursSaved, moneySaved, roi } = calculateROI(
      acceptedLines,
      ROI_DEFAULTS.avgLinesPerHour,
      ROI_DEFAULTS.avgHourlyRate,
      // Estimate total unique users for cost (approximate by avg * days, capped by licenses if available)
      // This is still an estimate; a unique user count isn't directly available.
      avgDailyActiveUsers * ROI_DEFAULTS.licenseCostPerMonth 
    );
    
    return {
      // Renamed for clarity
      avgDailyActiveUsers: avgDailyActiveUsers, 
      avgDailyEngagedUsers: avgDailyEngagedUsers, 
      // Removed dailyActiveUsers
      totalSuggestions,
      acceptedSuggestions,
      acceptanceRate,
      acceptedLines,
      roi: {
        hoursSaved,
        moneySaved,
        roiPercentage: roi * 100,
      },
      languages: data.languages || [],
      editors: data.editors || [],
      // Pass rawData through for detailed reports
      rawData: data.rawData || [], 
      processedDays: processedDays, // Pass processedDays for potential use
      // Include source information to help with debugging
      dataSource: team ? 'team' : 'organization',
      teamSlug: team
    };
  };
  
  // Legacy metrics calculation for backward compatibility
  const metrics = React.useMemo(() => {
    if (!orgData) return null;
    
    const days = extractDaysFromDateRange(globalDateRange);
    // Ensure days is a valid number
    const validDays = isNaN(days) || days <= 0 ? 1 : days;
    
    // Safely access data properties with defaults
    // 'active_users' from processMetricsData is the average daily active users
    const avgDailyActiveUsers = orgData.active_users || 0; 
    // 'engaged_users' from processMetricsData is the average daily engaged users
    const avgDailyEngagedUsers = orgData.engaged_users || 0; 
    const totalSuggestions = orgData.total_suggestions || 0;
    const acceptedSuggestions = orgData.accepted_suggestions || 0;
    const acceptedLines = orgData.accepted_lines || 0;
    
    // Calculate core metrics - adjust for processed days to avoid inflation
    const processedDays = orgData.processedDays || validDays;
    
    // Calculate acceptance rate with null checks
    const acceptanceRate = totalSuggestions > 0 
      ? (acceptedSuggestions / totalSuggestions) * 100 
      : 0;
    
    // Calculate ROI with safer values
    const { hoursSaved, moneySaved, roi } = calculateROI(
      acceptedLines,
      ROI_DEFAULTS.avgLinesPerHour,
      ROI_DEFAULTS.avgHourlyRate,
      // Use avgDailyActiveUsers for license cost calculation (see notes above)
      avgDailyActiveUsers * ROI_DEFAULTS.licenseCostPerMonth 
    );
    
    return {
      // Keep original property names for backward compatibility
      totalActiveUsers: avgDailyActiveUsers,
      totalEngagedUsers: avgDailyEngagedUsers,
      // Add new properties for clarity
      avgDailyActiveUsers: avgDailyActiveUsers, 
      avgDailyEngagedUsers: avgDailyEngagedUsers,
      // Keep existing properties
      totalSuggestions,
      acceptedSuggestions,
      acceptanceRate,
      acceptedLines,
      roi: {
        hoursSaved,
        moneySaved,
        roiPercentage: roi * 100,
      },
      languages: orgData.languages || [],
      editors: orgData.editors || [],
      rawData: orgData.rawData || [], // Pass rawData
      processedDays: processedDays, // Pass processedDays
      // Include source information to help with debugging
      dataSource: team ? 'team' : 'organization',
      teamSlug: team
    };
  }, [orgData, globalDateRange, team]);
  
  // Set auth token
  const updateAuthToken = (token) => {
    setAuthTokenState(token);
  };
  
  const value = {
    isLoading,
    error,
    organization,
    setOrganization,
    team,
    setTeam,
    // Legacy API for backward compatibility
    dateRange: globalDateRange,
    setDateRange: setGlobalDateRange,
    // New API for per-report date ranges
    dateRanges,
    updateReportDateRange,
    getMetricsForReport,
    orgData,
    teamData,
    teamBreakdownData,
    multiTeamData,
    // Legacy metrics for backward compatibility
    metrics,
    rawData,
    authToken,
    updateAuthToken,
    extractDaysFromDateRange,
  };
  
  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilot() {
  const context = useContext(CopilotContext);
  if (context === undefined) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
}