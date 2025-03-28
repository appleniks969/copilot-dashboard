/**
 * AuthCredentials.js
 * Domain entity representing authentication credentials
 */

export class AuthCredentials {
  constructor(token, expiresAt = null) {
    this.token = token;
    this.expiresAt = expiresAt ? new Date(expiresAt) : null;
  }

  get isValid() {
    if (!this.token) return false;
    if (!this.expiresAt) return true; // No expiration time specified
    return new Date() < this.expiresAt;
  }

  toString() {
    return `Bearer ${this.token}`;
  }

  static fromBearer(bearerToken) {
    if (!bearerToken) return null;
    const token = bearerToken.replace('Bearer ', '');
    return new AuthCredentials(token);
  }
}