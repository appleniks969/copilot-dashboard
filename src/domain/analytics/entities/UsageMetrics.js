/**
 * UsageMetrics.js
 * Core domain entity that represents GitHub Copilot usage metrics
 * This is the single source of truth for all metrics calculations
 */

export class UsageMetrics {
  constructor({
    activeUsers = 0,
    engagedUsers = 0,
    totalSuggestions = 0,
    acceptedSuggestions = 0,
    acceptedLines = 0,
    languages = [],
    editors = [],
    processedDays = 0,
    dataSource = '',
    teamSlug = null,
    rawData = [],
    metadata = {}
  }) {
    this.activeUsers = activeUsers;
    this.engagedUsers = engagedUsers;
    this.totalSuggestions = totalSuggestions;
    this.acceptedSuggestions = acceptedSuggestions;
    this.acceptedLines = acceptedLines;
    this.languages = languages;
    this.editors = editors;
    this.processedDays = processedDays;
    this.dataSource = dataSource;
    this.teamSlug = teamSlug;
    this.rawData = rawData;
    this.metadata = metadata;
  }

  // Derived properties with accurate calculations
  get avgDailyActiveUsers() {
    return this.processedDays > 0 ? this.activeUsers : 0;
  }

  get avgDailyEngagedUsers() {
    return this.processedDays > 0 ? this.engagedUsers : 0;
  }

  get acceptanceRate() {
    return this.totalSuggestions > 0
      ? (this.acceptedSuggestions / this.totalSuggestions) * 100
      : 0;
  }

  // Methods to transform data for different visualizations
  toUserEngagementData() {
    return [
      { name: 'Avg Daily Active', value: this.avgDailyActiveUsers },
      { name: 'Avg Daily Engaged', value: this.avgDailyEngagedUsers },
    ];
  }

  toAcceptanceRateData() {
    return [
      { name: 'Accepted', value: this.acceptedSuggestions },
      { name: 'Not Accepted', value: this.totalSuggestions - this.acceptedSuggestions },
    ];
  }

  // Create a normalized copy for consistent comparison across time periods
  normalizeForTimeRange(standardDays = 28) {
    if (this.processedDays === 0 || standardDays === 0) {
      return this; // Cannot normalize without processed days
    }

    const factor = this.processedDays / standardDays;
    return new UsageMetrics({
      ...this,
      // Don't normalize user counts as they are averages
      totalSuggestions: Math.round(this.totalSuggestions / factor),
      acceptedSuggestions: Math.round(this.acceptedSuggestions / factor),
      acceptedLines: Math.round(this.acceptedLines / factor),
      // Add normalization metadata
      metadata: {
        ...this.metadata,
        normalized: true,
        normalizationFactor: factor,
        originalDays: this.processedDays,
        normalizedToDays: standardDays
      }
    });
  }
}