/**
 * ConfigService.js
 * Domain service for managing application configuration
 */

import { UserPreferences } from '../entities/UserPreferences';

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
    const preferences = this.getUserPreferences();
    return preferences.preferredOrg || this.defaultConfig.DEFAULT_ORG;
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
    return this.defaultConfig.TEAMS_LIST || [];
  }
}