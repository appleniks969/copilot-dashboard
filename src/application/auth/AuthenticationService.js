/**
 * AuthenticationService.js
 * Application service for authentication operations
 */

export class AuthenticationService {
  constructor(authService) {
    this.authService = authService;
  }

  // Login with GitHub token
  async login(token) {
    try {
      const credentials = await this.authService.authenticate(token);
      return {
        success: true,
        token: credentials.token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }

  // Verify current authentication
  async verifyAuthentication() {
    try {
      if (!this.authService.isAuthenticated()) {
        return {
          authenticated: false,
          error: 'Not authenticated'
        };
      }

      await this.authService.verifyToken();
      return {
        authenticated: true
      };
    } catch (error) {
      console.error('Verification error:', error);
      return {
        authenticated: false,
        error: error.message || 'Token verification failed'
      };
    }
  }

  // Logout
  logout() {
    this.authService.logout();
    return {
      success: true
    };
  }
}