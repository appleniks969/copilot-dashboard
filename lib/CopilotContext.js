import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
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
  
  // Always use all available days (28 days) for all reports
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
        
        // Always require a team to be specified
        if (!team) {
          throw new Error('No team specified. Please select a team to view data.');
        }
        
        // Fetch data for the specified team
        const teamResults = await getCopilotUsageForTeam(organization, team, startDate, endDate);
        return teamResults;
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
  
  // Update a specific report's date range (always uses 28 days)
  const updateReportDateRange = async (reportId, newDateRange) => {
    // Always use the 28-day range regardless of passed parameter
    newDateRange = DATE_RANGES.LAST_28_DAYS;
    
    // Skip if the date range hasn't changed (which it shouldn't)
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
    if (!authToken || !team) return;
    
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
        
        // Fetch data for the current team for all reports
        try {
          const days = extractDaysFromDateRange(globalDateRange);
          const { startDate, endDate } = getDateRange(days);
          const teamResult = await getCopilotUsageForTeam(organization, team, startDate, endDate);
          
          // Set team data for the context
          setTeamData(teamResult);
          // Set the raw data from the team data
          setRawData(teamResult?.rawData);
        } catch (teamErr) {
          console.error('Error fetching data for team:', teamErr);
          setTeamData(null);
          setRawData(null);
          setError('Failed to fetch data for the selected team. Please check your permissions and settings.');
          setIsLoading(false);
          return;
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
          } else {
            console.error(`Failed to fetch data for ${reportId}:`, result.reason || 'No data returned');
          }
        });
        
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
    const data = reportData[reportId] || teamData;
    if (!data) return null;
    
    const days = extractDaysFromDateRange(dateRanges[reportId] || globalDateRange);
    const validDays = isNaN(days) || days <= 0 ? 1 : days;
    
    // Safely access data properties with defaults
    const activeUsers = data.active_users || 0;
    const engagedUsers = data.engaged_users || 0;
    const totalSuggestions = data.total_suggestions || 0;
    const acceptedSuggestions = data.accepted_suggestions || 0;
    const acceptedLines = data.accepted_lines || 0;
    
    // Calculate core metrics - adjust for processed days to avoid inflation
    const processedDays = data.processedDays || validDays;
    const dailyActiveUsers = Math.round(activeUsers / processedDays);
    
    // Calculate acceptance rate with null checks
    const acceptanceRate = totalSuggestions > 0 
      ? (acceptedSuggestions / totalSuggestions) * 100 
      : 0;
    
    // Calculate ROI with safer values
    const { hoursSaved, moneySaved, roi } = calculateROI(
      acceptedLines,
      ROI_DEFAULTS.avgLinesPerHour,
      ROI_DEFAULTS.avgHourlyRate,
      activeUsers * ROI_DEFAULTS.licenseCostPerMonth
    );
    
    return {
      totalActiveUsers: activeUsers,
      totalEngagedUsers: engagedUsers,
      dailyActiveUsers,
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
      // Include source information to help with debugging
      dataSource: team ? 'team' : 'organization',
      teamSlug: team
    };
  };
  
  // Legacy metrics calculation for backward compatibility
  const metrics = React.useMemo(() => {
    if (!teamData) return null;
    
    const days = extractDaysFromDateRange(globalDateRange);
    // Ensure days is a valid number
    const validDays = isNaN(days) || days <= 0 ? 1 : days;
    
    // Safely access data properties with defaults
    const activeUsers = teamData.active_users || 0;
    const engagedUsers = teamData.engaged_users || 0;
    const totalSuggestions = teamData.total_suggestions || 0;
    const acceptedSuggestions = teamData.accepted_suggestions || 0;
    const acceptedLines = teamData.accepted_lines || 0;
    
    // Calculate core metrics - adjust for processed days to avoid inflation
    const processedDays = teamData.processedDays || validDays;
    const dailyActiveUsers = Math.round(activeUsers / processedDays);
    
    // Calculate acceptance rate with null checks
    const acceptanceRate = totalSuggestions > 0 
      ? (acceptedSuggestions / totalSuggestions) * 100 
      : 0;
    
    // Calculate ROI with safer values
    const { hoursSaved, moneySaved, roi } = calculateROI(
      acceptedLines,
      ROI_DEFAULTS.avgLinesPerHour,
      ROI_DEFAULTS.avgHourlyRate,
      activeUsers * ROI_DEFAULTS.licenseCostPerMonth
    );
    
    return {
      totalActiveUsers: activeUsers,
      totalEngagedUsers: engagedUsers,
      dailyActiveUsers,
      totalSuggestions,
      acceptedSuggestions,
      acceptanceRate,
      acceptedLines,
      roi: {
        hoursSaved,
        moneySaved,
        roiPercentage: roi * 100,
      },
      languages: teamData.languages || [],
      editors: teamData.editors || [],
      // Include source information to help with debugging
      dataSource: 'team',
      teamSlug: team
    };
  }, [teamData, globalDateRange, team]);
  
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