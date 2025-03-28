/**
 * ConfigService.js
 * Domain service for managing application configuration
 */

import { UserPreferences } from '../entities/UserPreferences';
import { getTeamsList, getOrganization } from '../../../utils/env';

export class ConfigService {
  constructor(configRepository, defaultConfig = {}) {
    this.configRepository = configRepository;
    this.defaultConfig = defaultConfig;
  }

  // Get user preferences
  getUserPreferences() {
    return this.configRepository.getUserPreferences();
  }

  // Update user preferences
  updateUserPreferences(preferences) {
    return this.configRepository.saveUserPreferences(preferences);
  }

  // Get default organization
  getDefaultOrg() {
    // First try from user preferences
    const preferences = this.getUserPreferences();
    if (preferences.preferredOrg) {
      return preferences.preferredOrg;
    }

    // If no user preference, directly use the environment utility function.
    // This function reads process.env.NEXT_PUBLIC_ORGANIZATION and has its own fallback.
    return getOrganization();
  }

  // Get default team
  getDefaultTeam() {
    const preferences = this.getUserPreferences();
    return preferences.preferredTeam || this.defaultConfig.DEFAULT_SELECTED_TEAM;
  }

  // Get default date range
  getDefaultDateRange() {
    const preferences = this.getUserPreferences();
    return preferences.defaultDateRange || this.defaultConfig.DATE_RANGES?.LAST_28_DAYS;
  }

  // Get configuration for a specific report
  getReportConfig(reportId) {
    const preferences = this.getUserPreferences();
    return preferences.getReportConfig(reportId);
  }

  // Update configuration for a specific report
  updateReportConfig(reportId, config) {
    const preferences = this.getUserPreferences();
    const updatedPreferences = preferences.updateReportConfig(reportId, config);
    return this.updateUserPreferences(updatedPreferences);
  }

  // Get ROI configuration defaults
  getROIConfig() {
    return this.defaultConfig.ROI_DEFAULTS || {
      avgLinesPerHour: 30,
      avgHourlyRate: 75,
      licenseCostPerMonth: 19
    };
  }

  // Get teams list
  getTeamsList() {
    // First try from user preferences
    const teams = getTeamsList();
    
    // Use defaultConfig as backup only if environment returns empty
    if (!teams || teams.length === 0) {
      return this.defaultConfig.TEAMS_LIST || [];
    }
    
    return teams;
  }
}
