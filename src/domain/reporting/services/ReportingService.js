/**
 * ReportingService.js
 * Domain service for generating reports from metrics data
 */

export class ReportingService {
  constructor(formatUtils) {
    this.formatters = formatUtils || {
      formatNumber: num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      formatPercentage: num => `${Math.round(num * 100) / 100}%`,
      formatCurrency: num => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
    };
  }
  
  // Helper method to safely get rawData from metrics, handling case sensitivity
  _getRawData(metrics) {
    if (!metrics) return [];
    
    let rawData = metrics.rawData;
    
    // Try lowercase if camelCase not found
    if (rawData === undefined && metrics.rawdata !== undefined) {
      console.warn('Using metrics.rawdata instead of metrics.rawData');
      rawData = metrics.rawdata;
    }
    
    // Ensure we have an array for processing
    if (!Array.isArray(rawData)) {
      if (rawData === undefined || rawData === null) {
        console.warn('Raw data is missing or invalid in metrics object');
        return [];
      }
      
      // Convert single object to array for consistency
      return [rawData];
    }
    
    return rawData;
  }

  // Generate user engagement report data
  generateUserEngagementReport(metrics) {
    if (!metrics) {
      return {
        summary: null,
        charts: {},
        tables: {},
        insights: []
      };
    }
    
    // Extract the raw data for detailed analysis
    const rawData = this._getRawData(metrics);
    
    const processedDays = metrics.processedDays || 0;
    
    // Prepare summary statistics
    const summary = {
      avgDailyActiveUsers: metrics.avgDailyActiveUsers,
      avgDailyEngagedUsers: metrics.avgDailyEngagedUsers,
      acceptanceRate: metrics.acceptanceRate,
      totalSuggestions: metrics.totalSuggestions,
      acceptedSuggestions: metrics.acceptedSuggestions
    };
    
    // Prepare chart data
    const charts = {
      userEngagement: metrics.toUserEngagementData(),
      acceptanceRate: metrics.toAcceptanceRateData(),
      featureUsage: this._extractFeatureUsageData(rawData, processedDays),
      devEnvironments: this._extractDevEnvironmentsData(rawData, processedDays),
      trends: this._extractTrendData(rawData)
    };
    
    // Prepare table data
    const tables = {
      featureDetails: this._extractFeatureDetails(rawData, processedDays),
      languageDetails: this._extractLanguageDetails(metrics.languages),
      editorDetails: this._extractEditorDetails(metrics.editors)
    };
    
    // Generate insights
    const insights = this._generateUserEngagementInsights(metrics, charts, tables);
    
    return {
      summary,
      charts,
      tables,
      insights
    };
  }

  // Generate productivity report data
  generateProductivityReport(metrics) {
    if (!metrics) {
      return {
        summary: null,
        charts: {},
        tables: {},
        insights: []
      };
    }
    
    // Extract the raw data for detailed analysis
    const rawData = this._getRawData(metrics);
    
    const processedDays = metrics.processedDays || 0;
    
    // Prepare summary statistics
    const summary = {
      acceptedLines: metrics.acceptedLines,
      acceptanceRate: metrics.acceptanceRate,
      totalSuggestions: metrics.totalSuggestions,
      acceptedSuggestions: metrics.acceptedSuggestions
    };
    
    // Prepare chart data
    const charts = {
      codeSuggestions: [
        { name: 'Accepted', value: metrics.acceptedSuggestions },
        { name: 'Not Accepted', value: metrics.totalSuggestions - metrics.acceptedSuggestions }
      ],
      linesOfCode: [
        { name: 'Accepted Lines', value: metrics.acceptedLines }
      ],
      languageProductivity: this._extractLanguageProductivity(metrics.languages),
      editorProductivity: this._extractEditorProductivity(metrics.editors),
      dailyProductivity: this._extractDailyProductivity(rawData)
    };
    
    // Prepare table data
    const tables = {
      languageDetails: this._transformLanguagesForTable(metrics.languages),
      editorDetails: this._transformEditorsForTable(metrics.editors)
    };
    
    // Generate insights
    const insights = this._generateProductivityInsights(metrics, charts, tables);
    
    return {
      summary,
      charts,
      tables,
      insights
    };
  }

  // Generate ROI report data
  generateROIReport(metrics, roiData) {
    if (!metrics || !roiData) {
      return {
        summary: null,
        charts: {},
        tables: {},
        insights: []
      };
    }
    
    // Prepare summary statistics
    const summary = {
      hoursSaved: roiData.hoursSaved,
      moneySaved: roiData.moneySaved,
      licenseCost: roiData.licenseCost,
      roiPercentage: roiData.roiPercentage
    };
    
    // Prepare chart data
    const charts = {
      costBenefit: [
        { name: 'License Cost', value: roiData.licenseCost },
        { name: 'Money Saved', value: roiData.moneySaved }
      ],
      savingsBreakdown: [
        { name: 'Hours Saved', value: roiData.hoursSaved }
      ]
    };
    
    // Prepare table data
    const tables = {
      roiDetails: {
        hoursSaved: roiData.hoursSaved,
        hourlyRate: roiData.metadata?.config?.avgHourlyRate || 75,
        moneySaved: roiData.moneySaved,
        licenseCost: roiData.licenseCost,
        netSavings: roiData.moneySaved - roiData.licenseCost,
        roi: roiData.roiPercentage
      }
    };
    
    // Generate insights
    const insights = this._generateROIInsights(metrics, roiData);
    
    return {
      summary,
      charts,
      tables,
      insights
    };
  }

  // --- Private helper methods for data extraction ---

  // Extract feature usage data
  _extractFeatureUsageData(rawData, processedDays) {
    const features = {
      ide_completions: { name: 'IDE Completions', users: 0 },
      ide_chat: { name: 'IDE Chat', users: 0 },
      dotcom_chat: { name: 'GitHub.com Chat', users: 0 },
      pull_requests: { name: 'Pull Request Summaries', users: 0 }
    };
    
    // Aggregate data across all days
    (Array.isArray(rawData) ? rawData : []).forEach(dayData => {
      if (!dayData) return;
      
      features.ide_completions.users += dayData.copilot_ide_code_completions?.total_engaged_users || 0;
      features.ide_chat.users += dayData.copilot_ide_chat?.total_engaged_users || 0;
      features.dotcom_chat.users += dayData.copilot_dotcom_chat?.total_engaged_users || 0;
      features.pull_requests.users += dayData.copilot_dotcom_pull_requests?.total_engaged_users || 0;
      });
    
    // Average by number of days
    if (processedDays > 0) {
      Object.values(features).forEach(feature => {
        feature.users = Math.round(feature.users / processedDays);
      });
    }
    
    // Convert to array for charts
    return Object.values(features).map(feature => ({
      name: feature.name,
      value: feature.users
    }));
  }

  // Extract development environments data
  _extractDevEnvironmentsData(rawData, processedDays) {
    const environments = {
      'VS Code': { name: 'VS Code', users: 0 },
      'JetBrains': { name: 'JetBrains', users: 0 },
      'Visual Studio': { name: 'Visual Studio', users: 0 },
      'Neovim': { name: 'Neovim', users: 0 },
      'Other': { name: 'Other', users: 0 }
    };
    
    // Aggregate data across all days
    (Array.isArray(rawData) ? rawData : []).forEach(dayData => {
      if (!dayData || !dayData.editors) return;
      
      // Process each editor entry
      (dayData.editors || []).forEach(editor => {
        if (!editor || !editor.name) return;
        
        // Map editor name to our predefined categories
        let category = 'Other';
        const editorName = editor.name.toLowerCase();
        
        if (editorName.includes('vscode') || editorName.includes('vs code')) {
          category = 'VS Code';
        } else if (editorName.includes('intellij') || editorName.includes('pycharm') || 
                  editorName.includes('webstorm') || editorName.includes('rider') ||
                  editorName.includes('goland') || editorName.includes('phpstorm') ||
                  editorName.includes('jetbrains')) {
          category = 'JetBrains';
        } else if (editorName.includes('visual studio') && !editorName.includes('code')) {
          category = 'Visual Studio';
        } else if (editorName.includes('vim') || editorName.includes('neovim')) {
          category = 'Neovim';
        }
        
        // Add the users to the appropriate category
        environments[category].users += editor.total_engaged_users || 0;
      });
    });
    
    // Average by number of days if needed
    if (processedDays > 0) {
      Object.values(environments).forEach(env => {
        env.users = Math.round(env.users / processedDays);
      });
    }
    
    // Convert to array format for charts, filtering out any with zero users
    return Object.values(environments)
      .filter(env => env.users > 0)
      .map(env => ({
        name: env.name,
        value: env.users
      }))
      .sort((a, b) => b.value - a.value);
  }

  // Extract trend data
  _extractTrendData(rawData) {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }
    
    // Create daily trend data points
    return (Array.isArray(rawData) ? rawData : []).map(dayData => {
      if (!dayData || !dayData.date) return null;
      
      return {
        date: dayData.date,
        activeUsers: dayData.copilot_ide_code_completions?.total_active_users || 0,
        engagedUsers: dayData.copilot_ide_code_completions?.total_engaged_users || 0,
        totalSuggestions: dayData.copilot_ide_code_completions?.total_suggestions || 0,
        acceptedSuggestions: dayData.copilot_ide_code_completions?.total_acceptances || 0,
        acceptanceRate: dayData.copilot_ide_code_completions?.total_suggestions > 0
          ? (dayData.copilot_ide_code_completions.total_acceptances / dayData.copilot_ide_code_completions.total_suggestions) * 100
          : 0
      };
    }).filter(Boolean);
  }

  // Extract feature details
  _extractFeatureDetails(rawData, processedDays) {
    const features = {
      'IDE Completions': { users: 0 },
      'IDE Chat': { users: 0 },
      'GitHub.com Chat': { users: 0 },
      'Pull Request Summaries': { users: 0 }
    };
    
    // Aggregate data across all days
    (Array.isArray(rawData) ? rawData : []).forEach(dayData => {
      if (!dayData) return;
      
      features['IDE Completions'].users += dayData.copilot_ide_code_completions?.total_engaged_users || 0;
      features['IDE Chat'].users += dayData.copilot_ide_chat?.total_engaged_users || 0;
      features['GitHub.com Chat'].users += dayData.copilot_dotcom_chat?.total_engaged_users || 0;
      features['Pull Request Summaries'].users += dayData.copilot_dotcom_pull_requests?.total_engaged_users || 0;
      });
    
    // Average by number of days
    if (processedDays > 0) {
      Object.values(features).forEach(feature => {
        feature.users = Math.round(feature.users / processedDays);
      });
    }
    
    return features;
  }

  // Extract language details from language metrics
  _extractLanguageDetails(languages) {
    if (!languages || !Array.isArray(languages)) return {};
    
    const result = {};
    
    languages.forEach(lang => {
      if (!lang || !lang.name) return;
      
      result[lang.name] = {
        users: lang.total_engaged_users || 0,
        suggestions: lang.total_suggestions || 0,
        acceptances: lang.total_acceptances || 0,
        acceptanceRate: lang.total_suggestions > 0 
          ? (lang.total_acceptances / lang.total_suggestions) * 100 
          : 0
      };
    });
    
    return result;
  }

  // Extract editor details from editor metrics
  _extractEditorDetails(editors) {
    if (!editors || !Array.isArray(editors)) return {};
    
    const result = {};
    
    editors.forEach(editor => {
      if (!editor || !editor.name) return;
      
      result[editor.name] = {
        users: editor.total_engaged_users || 0,
        suggestions: editor.total_suggestions || 0,
        acceptances: editor.total_acceptances || 0,
        acceptanceRate: editor.total_suggestions > 0 
          ? (editor.total_acceptances / editor.total_suggestions) * 100 
          : 0
      };
    });
    
    return result;
  }

  // Extract language productivity data
  _extractLanguageProductivity(languages) {
    if (!languages || !Array.isArray(languages)) return [];
    
    return languages
      .filter(lang => lang && lang.name)
      .map(lang => ({
        name: lang.name,
        value: lang.total_acceptances || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 languages
  }

  // Extract editor productivity data
  _extractEditorProductivity(editors) {
    if (!editors || !Array.isArray(editors)) return [];
    
    return editors
      .filter(editor => editor && editor.name)
      .map(editor => ({
        name: editor.name,
        value: editor.total_acceptances || 0
      }))
      .sort((a, b) => b.value - a.value);
  }

  // Extract daily productivity data
  _extractDailyProductivity(rawData) {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }
    
    // Create daily productivity data points
    return (Array.isArray(rawData) ? rawData : []).map(dayData => {
      if (!dayData || !dayData.date) return null;
      
      // Get code completion metrics
      const completions = dayData.copilot_ide_code_completions || {};
      
      return {
        date: dayData.date,
        acceptedSuggestions: completions.total_acceptances || 0,
        acceptedLines: completions.total_lines_accepted || 0,
        // Calculate productivity metrics
        suggestionsPerUser: completions.total_active_users > 0
          ? Math.round((completions.total_acceptances || 0) / completions.total_active_users)
          : 0,
        linesPerUser: completions.total_active_users > 0
          ? Math.round((completions.total_lines_accepted || 0) / completions.total_active_users)
          : 0
      };
    }).filter(Boolean);
  }

  // Transform languages for table display
  _transformLanguagesForTable(languages) {
    if (!languages || !Array.isArray(languages)) return [];
    
    return languages
      .filter(lang => lang && lang.name)
      .map(lang => ({
        name: lang.name,
        users: lang.total_engaged_users || 0,
        suggestions: lang.total_suggestions || 0,
        acceptances: lang.total_acceptances || 0,
        acceptanceRate: lang.total_suggestions > 0 
          ? (lang.total_acceptances / lang.total_suggestions) * 100 
          : 0,
        linesAccepted: lang.total_lines_accepted || 0
      }))
      .sort((a, b) => b.acceptances - a.acceptances);
  }

  // Transform editors for table display
  _transformEditorsForTable(editors) {
    if (!editors || !Array.isArray(editors)) return [];
    
    return editors
      .filter(editor => editor && editor.name)
      .map(editor => ({
        name: editor.name,
        users: editor.total_engaged_users || 0,
        suggestions: editor.total_suggestions || 0,
        acceptances: editor.total_acceptances || 0,
        acceptanceRate: editor.total_suggestions > 0 
          ? (editor.total_acceptances / editor.total_suggestions) * 100 
          : 0,
        linesAccepted: editor.total_lines_accepted || 0
      }))
      .sort((a, b) => b.acceptances - a.acceptances);
  }

  // Generate insights for user engagement report
  _generateUserEngagementInsights(metrics, charts, tables) {
    const insights = [];
    
    // Add an insight about user engagement
    if (metrics.avgDailyActiveUsers > 0) {
      const engagementRate = (metrics.avgDailyEngagedUsers / metrics.avgDailyActiveUsers) * 100;
      
      insights.push({
        title: 'User Engagement',
        description: `${this.formatters.formatPercentage(engagementRate)} of active users are engaged with Copilot, meaning they're actively accepting suggestions.`
      });
    }
    
    // Add an insight about acceptance rate
    if (metrics.acceptanceRate > 0) {
      insights.push({
        title: 'Suggestion Quality',
        description: `Users are accepting ${this.formatters.formatPercentage(metrics.acceptanceRate)} of Copilot's suggestions, indicating a good level of suggestion quality.`
      });
    }
    
    return insights;
  }

  // Generate insights for productivity report
  _generateProductivityInsights(metrics, charts, tables) {
    const insights = [];
    
    // Add insight about code suggestions
    if (metrics.totalSuggestions > 0 && metrics.acceptedSuggestions > 0) {
      insights.push({
        title: 'Code Generation',
        description: `Copilot has generated ${this.formatters.formatNumber(metrics.acceptedSuggestions)} accepted code suggestions, saving developers from typing ${this.formatters.formatNumber(metrics.acceptedLines)} lines of code.`
      });
    }
    
    // Add insight about most productive language
    if (charts.languageProductivity && charts.languageProductivity.length > 0) {
      const topLanguage = charts.languageProductivity[0];
      
      insights.push({
        title: 'Most Productive Language',
        description: `${topLanguage.name} is your team's most productive language with Copilot, with ${this.formatters.formatNumber(topLanguage.value)} accepted suggestions.`
      });
    }
    
    // Add insight about time savings
    const estimatedMinutesPerLine = 1.5; // Assume 1.5 minutes saved per line of code
    const estimatedHoursSaved = (metrics.acceptedLines * estimatedMinutesPerLine) / 60;
    
    if (estimatedHoursSaved > 0) {
      insights.push({
        title: 'Time Savings',
        description: `Based on an average of ${estimatedMinutesPerLine} minutes saved per line of code, Copilot has potentially saved your team approximately ${this.formatters.formatNumber(Math.round(estimatedHoursSaved))} development hours.`
      });
    }
    
    return insights;
  }

  // Generate insights for ROI report
  _generateROIInsights(metrics, roiData) {
    const insights = [];
    
    // Add insight about ROI
    if (roiData.roiPercentage > 0) {
      insights.push({
        title: 'Positive ROI',
        description: `GitHub Copilot is delivering a ${this.formatters.formatPercentage(roiData.roiPercentage)} return on investment, saving approximately ${this.formatters.formatNumber(Math.round(roiData.hoursSaved))} developer hours.`
      });
    } else {
      insights.push({
        title: 'ROI Opportunity',
        description: `Increase Copilot usage to improve ROI. Currently, the cost is ${this.formatters.formatCurrency(roiData.licenseCost)} with ${this.formatters.formatCurrency(roiData.moneySaved)} in estimated savings.`
      });
    }
    
    return insights;
  }
}