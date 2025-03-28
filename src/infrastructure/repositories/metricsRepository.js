/**
 * metricsRepository.js
 * Repository implementation for metrics data
 */

import { UsageMetrics } from '../../domain/analytics/entities/UsageMetrics';
import { MetricsService } from '../../domain/analytics/services/MetricsService';

export class MetricsRepository {
  constructor(httpService) {
    this.httpService = httpService;
    this.metricsService = new MetricsService();
    this.cache = new Map();
  }

  // Fetch team metrics with caching
  async getTeamMetrics(organization, team, dateRange) {
    const cacheKey = `team-${organization}-${team}-${dateRange.formattedStartDate}-${dateRange.formattedEndDate}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      // Fetch data from API
      const endpoint = `/orgs/${organization}/team/${team}/copilot/metrics`;
      const params = {
        start_date: dateRange.formattedStartDate,
        end_date: dateRange.formattedEndDate
      };
      
      const response = await this.httpService.get(endpoint, params);
      
      // Process raw data into domain entity
      const metrics = this.metricsService.processRawMetricsData(response);
      
      // Add team information
      metrics.teamSlug = team;
      metrics.dataSource = 'team';
      
      // Cache the result
      this.cache.set(cacheKey, metrics);
      
      return metrics;
    } catch (error) {
      console.error('Error fetching team metrics:', error);
      throw error;
    }
  }

  // Fetch organization metrics with caching
  async getOrgMetrics(organization, dateRange) {
    const cacheKey = `org-${organization}-${dateRange.formattedStartDate}-${dateRange.formattedEndDate}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    try {
      // Fetch data from API
      const endpoint = `/orgs/${organization}/copilot/metrics`;
      const params = {
        start_date: dateRange.formattedStartDate,
        end_date: dateRange.formattedEndDate
      };
      
      const response = await this.httpService.get(endpoint, params);
      
      // Process raw data into domain entity
      const metrics = this.metricsService.processRawMetricsData(response);
      
      // Add organization information
      metrics.dataSource = 'organization';
      
      // Cache the result
      this.cache.set(cacheKey, metrics);
      
      return metrics;
    } catch (error) {
      console.error('Error fetching org metrics:', error);
      throw error;
    }
  }

  // Fetch data for multiple teams
  async getMultipleTeamsMetrics(organization, teams, dateRange) {
    // Create an array of promises for fetching each team's data
    const teamPromises = teams.map(async (team) => {
      try {
        return await this.getTeamMetrics(organization, team, dateRange);
      } catch (error) {
        console.error(`Error fetching data for team ${team}:`, error);
        // Return a skeleton metrics object if we fail to fetch data
        return new UsageMetrics({
          teamSlug: team,
          dataSource: 'team',
          metadata: { error: true, errorMessage: error.message }
        });
      }
    });
    
    // Wait for all promises to resolve
    return Promise.all(teamPromises);
  }

  // Clear cache for specific keys or entirely
  clearCache(keyPattern = null) {
    if (keyPattern) {
      // Clear specific keys matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(keyPattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear entire cache
      this.cache.clear();
    }
  }
}