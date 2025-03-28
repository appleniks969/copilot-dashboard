/**
 * ConfigContext.js
 * Context provider for application configuration
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
// Removed: import { getOrganization } from '../../utils/env';

// Create context
const ConfigContext = createContext(null);

// Custom hook to use the config context
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

// Provider component
export const ConfigProvider = ({ children, configurationService }) => {
  // State for configuration
  const [organization, setOrganization] = useState(null); // Initialize as null
  const [team, setTeam] = useState(null);
  const [globalDateRange, setGlobalDateRange] = useState(null);
  const [reportConfigs, setReportConfigs] = useState({});
  const [teamsList, setTeamsList] = useState([]);

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = () => {
      const config = configurationService.getCurrentConfig();
      
      // Removed DEBUG log
      setOrganization(config.organization);
      setTeam(config.team);
      setGlobalDateRange(config.globalDateRange);
      setReportConfigs(config.reportConfigs);
      
      // Get the teams list from env variables via configuration service
      const teams = configurationService.getTeamsList();
      setTeamsList(teams);
      // Removed DEBUG log
      
      console.log('Config loaded:', {
        organization: config.organization,
        team: config.team,
        teams: teams,
        globalDateRange: config.globalDateRange
      });
    };
    
    loadConfig();
  }, [configurationService]);

  // Update organization handler
  const updateOrganization = (org) => {
    const result = configurationService.updateOrganization(org);
    
    if (result.success) {
      setOrganization(org);
    }
    
    return result.success;
  };

  // Update team handler
  const updateTeam = (team) => {
    const result = configurationService.updateTeam(team);
    
    if (result.success) {
      setTeam(team);
    }
    
    return result.success;
  };

  // Update global date range handler
  const updateGlobalDateRange = (dateRange) => {
    const result = configurationService.updateGlobalDateRange(dateRange);
    
    if (result.success) {
      setGlobalDateRange(dateRange);
    }
    
    return result.success;
  };

  // Update report configuration handler
  const updateReportConfig = (reportId, config) => {
    const result = configurationService.updateReportConfig(reportId, config);
    
    if (result.success) {
      setReportConfigs(prev => ({
        ...prev,
        [reportId]: {
          ...prev[reportId],
          ...config
        }
      }));
    }
    
    return result.success;
  };

  // Value to be provided by the context
  const value = {
    organization,
    team,
    globalDateRange,
    reportConfigs,
    teamsList,
    updateOrganization,
    updateTeam,
    updateGlobalDateRange,
    updateReportConfig
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
