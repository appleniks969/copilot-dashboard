/**
 * configRepository.js
 * Repository implementation for configuration storage
 */

import { UserPreferences } from '../../domain/configuration/entities/UserPreferences';

export class ConfigRepository {
  constructor(
    storageKey = 'copilot_dashboard_config',
    defaultConfig = {
      preferredOrg: null,
      preferredTeam: null,
      defaultDateRange: '28 days',
      reportConfigs: {
        userEngagement: { dateRange: '28 days' },
        productivity: { dateRange: '28 days' },
        roi: { dateRange: '28 days' },
        languageEditor: { dateRange: '28 days' },
        teamComparison: { dateRange: '28 days', teams: [] },
        rawData: { dateRange: '28 days' }
      }
    }
  ) {
    this.storageKey = storageKey;
    this.defaultConfig = defaultConfig;
  }

  // Get user preferences
  getUserPreferences() {
    if (typeof window !== 'undefined') {
      const storedConfig = localStorage.getItem(this.storageKey);
      
      if (storedConfig) {
        try {
          const config = JSON.parse(storedConfig);
          return new UserPreferences(config);
        } catch (error) {
          console.error('Error parsing stored config:', error);
        }
      }
    }
    
    // Return default preferences if none found
    return new UserPreferences(this.defaultConfig);
  }

  // Save user preferences
  saveUserPreferences(preferences) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(preferences));
        return true;
      } catch (error) {
        console.error('Error saving user preferences:', error);
        return false;
      }
    }
    return false;
  }
}