import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCopilotUsageForOrg, 
  getCopilotUsageForTeam, 
  getCopilotBreakdownByTeam,
  fetchMultipleTeamsData,
  setAuthToken,
  calculateDailyAverage,
  calculateAdoptionRate,
  calculateROI
} from './api';
import { getDateRange, getDaysBetween } from './utils';
import { DEFAULT_ORG, DEFAULT_TEAM, DATE_RANGES, ROI_DEFAULTS, TEAMS_LIST } from './config';

const CopilotContext = createContext();

export function CopilotProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [organization, setOrganization] = useState(DEFAULT_ORG);
  const [team, setTeam] = useState(DEFAULT_TEAM);
  const [dateRange, setDateRange] = useState(DATE_RANGES.LAST_28_DAYS);
  const [orgData, setOrgData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [teamBreakdownData, setTeamBreakdownData] = useState(null);
  const [multiTeamData, setMultiTeamData] = useState([]);
  const [totalLicensedUsers, setTotalLicensedUsers] = useState(0);
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

  // Fetch data when parameters change
  useEffect(() => {
    if (!authToken) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const days = parseInt(dateRange);
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
            console.log('Successfully fetched team-level data');
          } catch (teamErr) {
            console.error('Error fetching team data:', teamErr);
            setTeamData(null);
            
            // Try to fall back to org data if team data fails
            try {
              console.log('Falling back to organization data');
              const orgResults = await getCopilotUsageForOrg(organization, startDate, endDate);
              setOrgData(orgResults);
              console.log('Successfully fetched organization-level data as fallback');
            } catch (orgErr) {
              console.error('Error fetching organization data as fallback:', orgErr);
              setOrgData(null);
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
            console.log('Successfully fetched organization-level data');
          } catch (orgErr) {
            console.error('Error fetching organization data:', orgErr);
            setOrgData(null);
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
    
    const days = parseInt(dateRange);
    
    // Calculate core metrics
    const dailyActiveUsers = calculateDailyAverage(orgData, 'active_users', days);
    const adoptionRate = calculateAdoptionRate(orgData.active_users, totalLicensedUsers);
    const acceptanceRate = orgData.total_suggestions > 0 
      ? (orgData.accepted_suggestions / orgData.total_suggestions) * 100 
      : 0;
    
    // Calculate ROI
    const { hoursSaved, moneySaved, roi } = calculateROI(
      orgData.accepted_lines,
      ROI_DEFAULTS.avgLinesPerHour,
      ROI_DEFAULTS.avgHourlyRate,
      totalLicensedUsers * ROI_DEFAULTS.licenseCostPerMonth
    );
    
    return {
      totalActiveUsers: orgData.active_users,
      totalEngagedUsers: orgData.engaged_users,
      dailyActiveUsers,
      totalSuggestions: orgData.total_suggestions,
      acceptedSuggestions: orgData.accepted_suggestions,
      acceptanceRate,
      acceptedLines: orgData.accepted_lines,
      adoptionRate,
      roi: {
        hoursSaved,
        moneySaved,
        roiPercentage: roi * 100,
      },
      languages: orgData.languages || [],
      editors: orgData.editors || [],
    };
  }, [orgData, dateRange, totalLicensedUsers]);

  // Set the total licensed users
  const updateTotalLicensedUsers = (count) => {
    setTotalLicensedUsers(count);
  };

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
    totalLicensedUsers,
    updateTotalLicensedUsers,
    authToken,
    updateAuthToken,
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