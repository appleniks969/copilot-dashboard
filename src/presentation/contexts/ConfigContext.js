/**
 * ConfigContext.js
 * Context provider for application configuration
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [organization, setOrganization] = useState(null);
  const [team, setTeam] = useState(null);
  const [globalDateRange, setGlobalDateRange] = useState(null);
  const [reportConfigs, setReportConfigs] = useState({});

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = () => {
      const config = configurationService.getCurrentConfig();
      
      setOrganization(config.organization);
      setTeam(config.team);
      setGlobalDateRange(config.globalDateRange);
      setReportConfigs(config.reportConfigs);
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