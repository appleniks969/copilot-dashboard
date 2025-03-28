/**
 * ConfigurationService.js
 * Application service for configuration operations
 */

export class ConfigurationService {
  constructor(configService) {
    this.configService = configService;
  }

  // Get current configuration
  getCurrentConfig() {
    const preferences = this.configService.getUserPreferences();
    
    return {
      organization: preferences.preferredOrg,
      team: preferences.preferredTeam,
      globalDateRange: preferences.defaultDateRange,
      reportConfigs: preferences.reportConfigs
    };
  }

  // Update organization
  updateOrganization(org) {
    const preferences = this.configService.getUserPreferences();
    const updatedPreferences = preferences.withPreferredOrg(org);
    const success = this.configService.updateUserPreferences(updatedPreferences);
    
    return {
      success,
      organization: org
    };
  }

  // Update team
  updateTeam(team) {
    const preferences = this.configService.getUserPreferences();
    const updatedPreferences = preferences.withPreferredTeam(team);
    const success = this.configService.updateUserPreferences(updatedPreferences);
    
    return {
      success,
      team
    };
  }

  // Update global date range
  updateGlobalDateRange(dateRange) {
    const preferences = this.configService.getUserPreferences();
    const updatedPreferences = preferences.withDefaultDateRange(dateRange);
    const success = this.configService.updateUserPreferences(updatedPreferences);
    
    return {
      success,
      dateRange
    };
  }

  // Update report configuration
  updateReportConfig(reportId, config) {
    const success = this.configService.updateReportConfig(reportId, config);
    
    return {
      success,
      reportId,
      config
    };
  }
  
  // Get teams list
  getTeamsList() {
    return this.configService.getTeamsList();
  }
}