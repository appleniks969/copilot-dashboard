/**
 * AnalyticsService.js
 * Application service for analytics operations
 */

import { DateRange } from '../../domain/analytics/valueObjects/DateRange';

export class AnalyticsService {
  constructor(metricsRepository, configService) {
    this.metricsRepository = metricsRepository;
    this.configService = configService;
    this.reportMetricsCache = new Map();
  }

  // Get metrics for a specific report with the appropriate date range
  async getReportMetrics(reportId, organization, team) {
    // Get report-specific date range from configuration
    const reportConfig = this.configService.getReportConfig(reportId);
    const dateRange = DateRange.fromRangeIdentifier(reportConfig.dateRange);
    
    // Create cache key
    const cacheKey = `${reportId}-${organization}-${team}-${dateRange.formattedStartDate}-${dateRange.formattedEndDate}`;
    
    // Check cache first
    if (this.reportMetricsCache.has(cacheKey)) {
      return this.reportMetricsCache.get(cacheKey);
    }
    
    try {
      // Fetch metrics based on team selection
      let metrics;
      
      if (team) {
        // Fetch team-specific metrics
        metrics = await this.metricsRepository.getTeamMetrics(organization, team, dateRange);
      } else {
        // Fall back to organization metrics if no team selected
        metrics = await this.metricsRepository.getOrgMetrics(organization, dateRange);
      }
      
      // Store in cache
      this.reportMetricsCache.set(cacheKey, metrics);
      
      return metrics;
    } catch (error) {
      console.error(`Error fetching metrics for report ${reportId}:`, error);
      throw error;
    }
  }

  // Compare metrics across multiple teams
  async getTeamComparisonMetrics(organization, teams, dateRange) {
    try {
      // Fetch metrics for all specified teams
      const teamsMetrics = await this.metricsRepository.getMultipleTeamsMetrics(
        organization, 
        teams,
        dateRange
      );
      
      // Return the metrics for comparison
      return teamsMetrics;
    } catch (error) {
      console.error('Error fetching team comparison metrics:', error);
      throw error;
    }
  }

  // Calculate ROI for a specific team or organization
  async calculateROI(organization, team, dateRange, customConfig = {}) {
    try {
      // Fetch the base metrics
      let metrics;
      
      if (team) {
        metrics = await this.metricsRepository.getTeamMetrics(organization, team, dateRange);
      } else {
        metrics = await this.metricsRepository.getOrgMetrics(organization, dateRange);
      }
      
      // Get default ROI configuration
      const defaultConfig = this.configService.getROIConfig();
      
      // Merge with custom configuration
      const config = { ...defaultConfig, ...customConfig };
      
      // Use the metrics service to calculate ROI
      return this.metricsRepository.metricsService.calculateROI(metrics, config);
    } catch (error) {
      console.error('Error calculating ROI:', error);
      throw error;
    }
  }

  // Clear the report metrics cache for specific report or all reports
  clearReportCache(reportId = null) {
    if (reportId) {
      // Clear cache for specific report
      for (const key of this.reportMetricsCache.keys()) {
        if (key.startsWith(reportId)) {
          this.reportMetricsCache.delete(key);
        }
      }
    } else {
      // Clear entire cache
      this.reportMetricsCache.clear();
    }
  }
}