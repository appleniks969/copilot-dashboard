import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCopilotUsageForOrg, 
  getCopilotUsageForTeam, 
  getCopilotBreakdownByTeam,
  setAuthToken,
  calculateDailyAverage,
  calculateAdoptionRate,
  calculateROI
} from './api';
import { getDateRange, getDaysBetween } from './utils';
import { DEFAULT_ORG, DEFAULT_TEAM, DATE_RANGES, ROI_DEFAULTS } from './config';

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
        
        // Fetch team data - we'll start with just team data and use it as our primary data source
        const teamResults = await getCopilotUsageForTeam(organization, team, startDate, endDate);
        setTeamData(teamResults);
        
        // For now, we'll use the team data as our org data as well
        // This simplifies our initial implementation
        setOrgData(teamResults);
        
        // We won't fetch team breakdown for now, since we're focusing on a single team
        setTeamBreakdownData(null);
        
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