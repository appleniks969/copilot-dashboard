/**
 * AuthService.js
 * Domain service for authentication operations
 */

import { AuthCredentials } from '../entities/AuthCredentials';

export class AuthService {
  constructor(authRepository, httpService) {
    this.authRepository = authRepository;
    this.httpService = httpService;
  }

  // Authenticate with GitHub token
  async authenticate(token) {
    try {
      // Validate token format
      if (!token || token.trim() === '') {
        throw new Error('Token cannot be empty');
      }

      // Clean the token (remove any whitespace)
      const tokenValue = token.trim();
      
      // Create auth credentials
      const credentials = new AuthCredentials(tokenValue);
      
      // Set token in HTTP service
      this.httpService.setAuthToken(credentials.toString());
      
      // Verify token with a simple API call
      await this.verifyToken();
      
      // Store token if valid
      this.authRepository.storeToken(tokenValue);
      
      return credentials;
    } catch (error) {
      console.error('Authentication error:', error);
      // Clear token from HTTP service
      this.httpService.setAuthToken(null);
      throw error;
    }
  }


  // Verify token with GitHub API
  async verifyToken() {
    try {
      // Make a simple API call to verify the token
      // For GitHub, we can get the authenticated user's information
      await this.httpService.get('/user');
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new Error('Invalid GitHub token');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const credentials = this.authRepository.retrieveToken();
    return credentials && credentials.isValid;
  }

  // Logout user
  logout() {
    // Clear token from HTTP service
    this.httpService.setAuthToken(null);
    
    // Clear token from storage
    this.authRepository.clearToken();
  }
}