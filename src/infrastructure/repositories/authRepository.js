/**
 * authRepository.js
 * Repository implementation for auth storage
 */

import { AuthCredentials } from '../../domain/auth/entities/AuthCredentials';

export class AuthRepository {
  constructor(storageKey = 'github_token') {
    this.storageKey = storageKey;
  }

  // Store token in localStorage
  storeToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, token);
      return true;
    }
    return false;
  }

  // Retrieve token from localStorage
  retrieveToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(this.storageKey);
      return token ? new AuthCredentials(token) : null;
    }
    return null;
  }

  // Clear token from localStorage
  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
      return true;
    }
    return false;
  }
}