/**
 * httpService.js
 * Infrastructure service for HTTP communication
 */

import axios from 'axios';

export class HttpService {
  constructor(baseURL, apiVersion) {
    this.apiClient = axios.create({
      baseURL,
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': apiVersion,
      }
    });
  }

  // Set the auth token for API requests
  setAuthToken(token) {
    if (token) {
      this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.apiClient.defaults.headers.common['Authorization'];
    }
  }

  // Get token from headers
  getAuthToken() {
    return this.apiClient.defaults.headers.common['Authorization']?.replace('Bearer ', '') || null;
  }

  // Make a GET request through our proxy to avoid CORS issues
  async get(endpoint, params = {}) {
    try {
      // For client-side calls, use our proxy to avoid CORS issues
      if (typeof window !== 'undefined') {
        const requestUrl = `${this.apiClient.defaults.baseURL}${endpoint}`;
        console.log(`Making API call through proxy to: ${requestUrl}`);
        
        const response = await axios.post('/api/proxy', {
          url: requestUrl,
          method: 'GET',
          headers: {
            'Authorization': this.apiClient.defaults.headers.common['Authorization'],
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': this.apiClient.defaults.headers['X-GitHub-Api-Version'],
          },
          params,
        });
        
        return response.data;
      } else {
        // For server-side calls, use axios directly
        const response = await this.apiClient.get(endpoint, { params });
        return response.data;
      }
    } catch (error) {
      this._handleError(error, endpoint);
      throw error;
    }
  }

  // Make a POST request through our proxy to avoid CORS issues
  async post(endpoint, data = {}, params = {}) {
    try {
      // For client-side calls, use our proxy to avoid CORS issues
      if (typeof window !== 'undefined') {
        const requestUrl = `${this.apiClient.defaults.baseURL}${endpoint}`;
        console.log(`Making API call through proxy to: ${requestUrl}`);
        
        const response = await axios.post('/api/proxy', {
          url: requestUrl,
          method: 'POST',
          headers: {
            'Authorization': this.apiClient.defaults.headers.common['Authorization'],
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': this.apiClient.defaults.headers['X-GitHub-Api-Version'],
          },
          params,
          data,
        });
        
        return response.data;
      } else {
        // For server-side calls, use axios directly
        const response = await this.apiClient.post(endpoint, data, { params });
        return response.data;
      }
    } catch (error) {
      this._handleError(error, endpoint);
      throw error;
    }
  }

  // Handle API errors with detailed logging
  _handleError(error, endpoint) {
    console.error(`Error calling API: ${endpoint}`);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}