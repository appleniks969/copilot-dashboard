/**
 * AnalyticsContext.js
 * Context provider for analytics data
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DateRange } from '../../domain/analytics/valueObjects/DateRange';
import { useAuth } from './AuthContext';
import { useConfig } from './ConfigContext';

// Create context
const AnalyticsContext = createContext(null);

// Custom hook to use the analytics context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Provider component
export const AnalyticsProvider = ({ children, analyticsService }) => {
  // Get auth and config from their respective contexts
  const { authToken } = useAuth();
  const { organization, team, globalDateRange, reportConfigs } = useConfig();
  
  // State for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for metrics data per report
  const [reportMetrics, setReportMetrics] = useState({});
  const [orgMetrics, setOrgMetrics] = useState(null);
  const [teamComparisonMetrics, setTeamComparisonMetrics] = useState([]);
  const [rawData, setRawData] = useState(null);
  
  // Load metrics when organization, team, or date ranges change
  useEffect(() => {
    if (!authToken || !organization) return;
    
    const loadAllMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get all report IDs from report configs
        const reportIds = Object.keys(reportConfigs);
        
        // Create promises for each report's metrics
        const reportPromises = reportIds.map(reportId => 
          analyticsService.getReportMetrics(reportId, organization, team)
        );
        
        // Wait for all promises to resolve
        const results = await Promise.allSettled(reportPromises);
        
        // Process results and update each report's metrics
        const newReportMetrics = { ...reportMetrics };
        
        results.forEach((result, index) => {
          const reportId = reportIds[index];
          
          if (result.status === 'fulfilled' && result.value) {
            newReportMetrics[reportId] = result.value;
            
            // Use the first successful report for global data
            if (!orgMetrics) {
              setOrgMetrics(result.value);
              setRawData(result.value.rawData);
            }
          } else {
            console.error(`Failed to fetch metrics for ${reportId}:`, result.reason);
          }
        });
        
        // Update report metrics state
        setReportMetrics(newReportMetrics);
        
        // Fetch team comparison metrics if needed
        if (reportConfigs.teamComparison) {
          const comparisonDateRange = DateRange.fromRangeIdentifier(
            reportConfigs.teamComparison.dateRange
          );
          
          const teamsList = reportConfigs.teamComparison.teams || [];
          
          if (teamsList.length > 0) {
            const teamsResults = await analyticsService.getTeamComparisonMetrics(
              organization,
              teamsList,
              comparisonDateRange
            );
            
            setTeamComparisonMetrics(teamsResults);
          }
        }
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError('Failed to load analytics data. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllMetrics();
  }, [authToken, organization, team, analyticsService, reportConfigs]);
  
  // Update report date range and fetch new data
  const updateReportDateRange = async (reportId, newDateRange) => {
    try {
      // Update config first
      // This would be handled by the config service
      
      // Clear cache for this report
      analyticsService.clearReportCache(reportId);
      
      // Set loading state for this report
      setIsLoading(true);
      
      // Fetch new data
      const metrics = await analyticsService.getReportMetrics(
        reportId,
        organization,
        team
      );
      
      // Update report metrics
      setReportMetrics(prev => ({
        ...prev,
        [reportId]: metrics
      }));
      
      setIsLoading(false);
      
      return metrics;
    } catch (error) {
      console.error(`Error updating date range for ${reportId}:`, error);
      setError(`Failed to update date range for ${reportId}`);
      setIsLoading(false);
      throw error;
    }
  };
  
  // Helper to get metrics for a specific report
  const getMetricsForReport = (reportId) => {
    return reportMetrics[reportId] || orgMetrics;
  };
  
  // Value to be provided by the context
  const value = {
    isLoading,
    error,
    reportMetrics,
    orgMetrics,
    teamComparisonMetrics,
    rawData,
    updateReportDateRange,
    getMetricsForReport,
  };
  
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};