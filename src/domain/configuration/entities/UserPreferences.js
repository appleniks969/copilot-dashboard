/**
 * UserPreferences.js
 * Domain entity representing user configuration preferences
 */

export class UserPreferences {
  constructor({
    preferredOrg = null,
    preferredTeam = null,
    defaultDateRange = '28 days',
    reportConfigs = {}
  }) {
    this.preferredOrg = preferredOrg;
    this.preferredTeam = preferredTeam;
    this.defaultDateRange = defaultDateRange;
    this.reportConfigs = reportConfigs;
  }

  // Get config for a specific report
  getReportConfig(reportId) {
    return this.reportConfigs[reportId] || { dateRange: this.defaultDateRange };
  }

  // Update a report configuration (returns a new instance)
  updateReportConfig(reportId, config) {
    return new UserPreferences({
      ...this,
      reportConfigs: {
        ...this.reportConfigs,
        [reportId]: {
          ...this.reportConfigs[reportId],
          ...config
        }
      }
    });
  }

  // Update preferred organization (returns a new instance)
  withPreferredOrg(org) {
    return new UserPreferences({
      ...this,
      preferredOrg: org
    });
  }

  // Update preferred team (returns a new instance)
  withPreferredTeam(team) {
    return new UserPreferences({
      ...this,
      preferredTeam: team
    });
  }

  // Update default date range (returns a new instance)
  withDefaultDateRange(dateRange) {
    return new UserPreferences({
      ...this,
      defaultDateRange: dateRange
    });
  }
}