import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [dateRange, setDateRange] = useState(DATE_RANGES.LAST_28_DAYS);
  const [orgData, setOrgData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [teamBreakdownData, setTeamBreakdownData] = useState(null);
  const [multiTeamData, setMultiTeamData] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [authToken, setAuthTokenState] = useState('');

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

  // Fetch data when parameters change
  useEffect(() => {
    if (!authToken) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const days = extractDaysFromDateRange(dateRange);
        const { startDate, endDate } = getDateRange(days);
        const daysCount = getDaysBetween(startDate, endDate);
        
        // Always fetch data for multiple teams if configured
        if (TEAMS_LIST.length > 0) {
          try {
            console.log('Fetching data for multiple teams from configuration');
            const teamsResults = await fetchMultipleTeamsData(organization, TEAMS_LIST, startDate, endDate);
            setMultiTeamData(teamsResults);
            console.log('Successfully fetched data for multiple teams');
          } catch (multiTeamsErr) {
            console.error('Error fetching data for multiple teams:', multiTeamsErr);
            // Don't halt the process if multi-team data fails
            setMultiTeamData([]);
          }
        } else {
          console.log('No teams list configured in environment variables');
          setMultiTeamData([]);
        }
        
        // Prioritize team data when team name is provided
        if (team) {
          // Team name is specified, so prioritize team view
          try {
            console.log(`Prioritizing team data for team: ${team}`);
            const teamResults = await getCopilotUsageForTeam(organization, team, startDate, endDate);
            setTeamData(teamResults);
            
            // Use team data as the primary data source for the dashboard
            setOrgData(teamResults);
            setRawData(teamResults.rawData);
            console.log('Successfully fetched team-level data');
          } catch (teamErr) {
            console.error('Error fetching team data:', teamErr);
            setTeamData(null);
            
            // Try to fall back to org data if team data fails
            try {
              console.log('Falling back to organization data');
              const orgResults = await getCopilotUsageForOrg(organization, startDate, endDate);
              setOrgData(orgResults);
              setRawData(orgResults.rawData);
              console.log('Successfully fetched organization-level data as fallback');
            } catch (orgErr) {
              console.error('Error fetching organization data as fallback:', orgErr);
              setOrgData(null);
              setRawData(null);
              throw new Error('Failed to fetch both team and organization data. Please check your credentials and settings.');
            }
          }
        } else {
          // No team specified, use organization view
          try {
            console.log('No team specified, using organization view');
            const orgResults = await getCopilotUsageForOrg(organization, startDate, endDate);
            setOrgData(orgResults);
            setTeamData(null); // Clear any previous team data
            setRawData(orgResults.rawData);
            console.log('Successfully fetched organization-level data');
          } catch (orgErr) {
            console.error('Error fetching organization data:', orgErr);
            setOrgData(null);
            setRawData(null);
            throw new Error('Failed to fetch organization data. Please check your credentials and settings.');
          }
        }
        
      } catch (err) {
        console.error('Error fetching Copilot data:', err);
        setError('Failed to fetch Copilot usage data. Please check your token and organization settings.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [authToken, organization, team, dateRange]);

  // Calculate metrics and derived data
  const metrics = React.useMemo(() => {
    if (!orgData) return null;
    
    const days = extractDaysFromDateRange(dateRange);
    // Ensure days is a valid number
    const validDays = isNaN(days) || days <= 0 ? 1 : days;
    
    // Safely access data properties with defaults
    const activeUsers = orgData.active_users || 0;
    const engagedUsers = orgData.engaged_users || 0;
    const totalSuggestions = orgData.total_suggestions || 0;
    const acceptedSuggestions = orgData.accepted_suggestions || 0;
    const acceptedLines = orgData.accepted_lines || 0;
    
    // Calculate core metrics - adjust for processed days to avoid inflation
    const processedDays = orgData.processedDays || validDays;
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
      languages: orgData.languages || [],
      editors: orgData.editors || [],
      // Include source information to help with debugging
      dataSource: team ? 'team' : 'organization',
      teamSlug: team
    };
  }, [orgData, dateRange, team]); // Add team as dependency so metrics update when team changes

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
    dateRange,
    setDateRange,
    orgData,
    teamData,
    teamBreakdownData,
    multiTeamData,
    metrics,
    rawData,
    authToken,
    updateAuthToken,
    extractDaysFromDateRange, // Expose the helper function for other components
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