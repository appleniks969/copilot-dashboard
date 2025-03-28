/**
 * app.js
 * Main application setup and dependency injection
 */

import { HttpService } from './infrastructure/services/httpService';
import { AuthRepository } from './infrastructure/repositories/authRepository';
import { ConfigRepository } from './infrastructure/repositories/configRepository';
import { MetricsRepository } from './infrastructure/repositories/metricsRepository';

import { AuthService } from './domain/auth/services/AuthService';
import { ConfigService } from './domain/configuration/services/ConfigService';
import { MetricsService } from './domain/analytics/services/MetricsService';
import { ReportingService } from './domain/reporting/services/ReportingService';

import { AuthenticationService } from './application/auth/AuthenticationService';
import { ConfigurationService } from './application/configuration/ConfigurationService';
import { AnalyticsService } from './application/analytics/AnalyticsService';

import * as formatUtils from './utils/formatUtils';
import { 
  API_BASE_URL, 
  API_VERSION, 
  DEFAULT_ORG, 
  DEFAULT_SELECTED_TEAM, 
  DATE_RANGES, 
  ROI_DEFAULTS,
  TEAMS_LIST
} from '../config/constants';

// Create a dependency injection container
export function setupServices() {
  // Create infrastructure services
  const httpService = new HttpService(API_BASE_URL, API_VERSION);
  
  // Create repositories
  const authRepository = new AuthRepository();
  const configRepository = new ConfigRepository();
  const metricsRepository = new MetricsRepository(httpService);
  
  // Create domain services
  const authService = new AuthService(authRepository, httpService);
  const configService = new ConfigService(configRepository, {
    DEFAULT_ORG,
    DEFAULT_SELECTED_TEAM,
    DATE_RANGES,
    ROI_DEFAULTS,
    TEAMS_LIST
  });
  const reportingService = new ReportingService(formatUtils);
  
  // Create application services
  const authenticationService = new AuthenticationService(authService);
  const configurationService = new ConfigurationService(configService);
  const analyticsService = new AnalyticsService(metricsRepository, configService);
  
  // Return all services for use in the app
  return {
    // Infrastructure
    httpService,
    
    // Repositories
    authRepository,
    configRepository,
    metricsRepository,
    
    // Domain services
    authService,
    configService,
    reportingService,
    
    // Application services
    authenticationService,
    configurationService,
    analyticsService
  };
}