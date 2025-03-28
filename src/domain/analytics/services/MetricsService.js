/**
 * MetricsService.js
 * Core domain service for processing metrics data
 * Ensures consistent calculation of metrics across the application
 */

import { UsageMetrics } from '../entities/UsageMetrics';

export class MetricsService {
  constructor() {
    // No dependencies needed for domain service
  }

  // Process raw API data into domain entities with accurate metrics
  processRawMetricsData(metricsData) {
    if (!metricsData) {
      console.warn('No metrics data provided to process');
      return new UsageMetrics({
        rawData: metricsData
      });
    }

    // Initialize summary object for aggregation
    const summary = {
      activeUsers: 0,
      engagedUsers: 0,
      totalSuggestions: 0,
      acceptedSuggestions: 0,
      acceptedLines: 0,
      languages: {},
      editors: {},
      processedDays: 0
    };

    // Handle non-array data
    const dataArray = Array.isArray(metricsData) ? metricsData : [metricsData];
    
    if (dataArray.length === 0) {
      console.warn('Metrics data is an empty array');
      return new UsageMetrics({
        rawData: metricsData
      });
    }

    // Aggregate metrics across all days with careful validation
    dataArray.forEach((dayData) => {
      if (!dayData) return;
      
      // Count processed days
      summary.processedDays++;
      
      // Extract daily metrics with null safety
      const dailyActiveUsers = this._safeExtract(dayData, 'total_active_users', 0);
      const dailyEngagedUsers = this._safeExtract(dayData, 'total_engaged_users', 0);
      
      // Accumulate user counts - these will be averaged later
      summary.activeUsers += dailyActiveUsers;
      summary.engagedUsers += dailyEngagedUsers;

      // Process code completions data
      const completions = this._safeExtract(dayData, 'copilot_ide_code_completions', {});
      
      // Process languages
      this._processLanguages(completions, summary);
      
      // Process editors
      this._processEditors(completions, summary);
      
      // Aggregate core metrics from all sources
      this._aggregateSuggestionMetrics(completions, summary);
    });

    // Normalize user counts to daily averages
    if (summary.processedDays > 0) {
      summary.activeUsers = Math.round(summary.activeUsers / summary.processedDays);
      summary.engagedUsers = Math.round(summary.engagedUsers / summary.processedDays);
    }

    // Convert languages and editors objects to arrays
    summary.languages = Object.values(summary.languages);
    summary.editors = Object.values(summary.editors);

    // Create and return UsageMetrics domain entity
    return new UsageMetrics({
      ...summary,
      rawData: metricsData,
      dataSource: 'github_api',
      metadata: {
        processedAt: new Date().toISOString(),
        rawDataPoints: dataArray.length
      }
    });
  }

  // Calculate ROI metrics
  calculateROI(metrics, config) {
    const {
      avgLinesPerHour = 30,
      avgHourlyRate = 75,
      licenseCostPerMonth = 19
    } = config;

    // Extract values with fallbacks
    const acceptedLines = metrics.acceptedLines || 0;
    const avgDailyActiveUsers = metrics.avgDailyActiveUsers || 0;
    
    // Calculate hours saved based on accepted lines
    const hoursSaved = acceptedLines / avgLinesPerHour;
    
    // Calculate money saved based on hours and rate
    const moneySaved = hoursSaved * avgHourlyRate;
    
    // Calculate license cost based on active users
    const licenseCost = avgDailyActiveUsers * licenseCostPerMonth;
    
    // Calculate ROI as a ratio
    const roi = licenseCost > 0 ? (moneySaved / licenseCost) - 1 : 0;
    
    return {
      hoursSaved,
      moneySaved,
      licenseCost,
      roi,
      roiPercentage: roi * 100,
      metadata: {
        calculatedAt: new Date().toISOString(),
        config: { avgLinesPerHour, avgHourlyRate, licenseCostPerMonth }
      }
    };
  }

  // Helper method to safely extract values from nested objects
  _safeExtract(obj, path, defaultValue) {
    if (!obj) return defaultValue;
    
    // Handle direct property
    if (!path.includes('.')) {
      return obj[path] !== undefined ? obj[path] : defaultValue;
    }
    
    // Handle nested path
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current[part] === undefined) {
        return defaultValue;
      }
      current = current[part];
    }
    
    return current;
  }

  // Process languages data
  _processLanguages(completions, summary) {
    const languages = this._safeExtract(completions, 'languages', []);
    if (!Array.isArray(languages)) return;
    
    languages.forEach(lang => {
      if (!lang || !lang.name) return;
      
      if (!summary.languages[lang.name]) {
        summary.languages[lang.name] = {
          name: lang.name,
          total_engaged_users: 0,
          total_suggestions: 0,
          total_acceptances: 0,
          total_lines_suggested: 0,
          total_lines_accepted: 0
        };
      }
      
      // Track maximum users rather than summing to avoid double-counting
      summary.languages[lang.name].total_engaged_users = Math.max(
        summary.languages[lang.name].total_engaged_users,
        lang.total_engaged_users || 0
      );
    });
  }

  // Process editors data
  _processEditors(completions, summary) {
    const editors = this._safeExtract(completions, 'editors', []);
    if (!Array.isArray(editors)) return;
    
    editors.forEach(editor => {
      if (!editor || !editor.name) return;
      
      if (!summary.editors[editor.name]) {
        summary.editors[editor.name] = {
          name: editor.name,
          total_engaged_users: 0,
          total_suggestions: 0,
          total_acceptances: 0,
          total_lines_suggested: 0,
          total_lines_accepted: 0
        };
      }
      
      // Track maximum users rather than summing to avoid double-counting
      summary.editors[editor.name].total_engaged_users = Math.max(
        summary.editors[editor.name].total_engaged_users,
        editor.total_engaged_users || 0
      );

      // Process models within editors to aggregate metrics
      this._processEditorModels(editor, summary);
    });
  }

  // Process editor models to extract metrics
  _processEditorModels(editor, summary) {
    const models = this._safeExtract(editor, 'models', []);
    if (!Array.isArray(models)) return;
    
    models.forEach(model => {
      if (!model) return;
      
      // Process languages within models
      const languages = this._safeExtract(model, 'languages', []);
      if (!Array.isArray(languages)) return;
      
      languages.forEach(lang => {
        if (!lang || !lang.name) return;
        
        // Extract metrics with safe defaults
        const suggestions = lang.total_code_suggestions || 0;
        const acceptances = lang.total_code_acceptances || 0;
        const linesSuggested = lang.total_code_lines_suggested || 0;
        const linesAccepted = lang.total_code_lines_accepted || 0;
        
        // Aggregate global metrics
        summary.totalSuggestions += suggestions;
        summary.acceptedSuggestions += acceptances;
        summary.acceptedLines += linesAccepted;
        
        // Update editor-specific metrics
        if (summary.editors[editor.name]) {
          summary.editors[editor.name].total_suggestions += suggestions;
          summary.editors[editor.name].total_acceptances += acceptances;
          summary.editors[editor.name].total_lines_suggested += linesSuggested;
          summary.editors[editor.name].total_lines_accepted += linesAccepted;
        }
        
        // Update language-specific metrics
        if (summary.languages[lang.name]) {
          summary.languages[lang.name].total_suggestions += suggestions;
          summary.languages[lang.name].total_acceptances += acceptances;
          summary.languages[lang.name].total_lines_suggested += linesSuggested;
          summary.languages[lang.name].total_lines_accepted += linesAccepted;
        }
      });
    });
  }

  // Aggregate metrics from all sources in the completions data
  _aggregateSuggestionMetrics(completions, summary) {
    // Already implemented in _processEditorModels
    // This method is a placeholder for any additional aggregation needed in the future
  }
}