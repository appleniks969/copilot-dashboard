/**
 * AuthContext.js
 * Context provider for authentication state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children, authenticationService }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      
      try {
        const result = await authenticationService.verifyAuthentication();
        
        if (result.authenticated) {
          // Get token from stored credentials
          const credentials = authenticationService.authService.authRepository.retrieveToken();
          setAuthToken(credentials.token);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Failed to verify authentication');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthentication();
  }, [authenticationService]);

  // Login handler
  const login = async (token) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authenticationService.login(token);
      
      if (result.success) {
        setAuthToken(result.token);
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    authenticationService.logout();
    setAuthToken(null);
  };

  // Value to be provided by the context
  const value = {
    authToken,
    isAuthenticated: !!authToken,
    isLoading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};