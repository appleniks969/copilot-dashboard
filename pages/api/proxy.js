/**
 * proxy.js
 * API route for proxying requests to GitHub API to avoid CORS issues
 */

import axios from 'axios';

export default async function handler(req, res) {
  // Only allow POST requests (which contain our proxied request details)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get request details from the body
    const { url, method = 'GET', headers = {}, params = {}, data = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Add authorization header if AUTH_TOKEN is available (server-side only)
    const authHeaders = { ...headers };
    if (process.env.AUTH_TOKEN) {
      authHeaders.Authorization = `Bearer ${process.env.AUTH_TOKEN}`;
    } else {
      console.warn('AUTH_TOKEN not found in environment variables');
    }

    // Make the request to the target API
    const response = await axios({
      url,
      method,
      headers: authHeaders,
      params,
      data,
      validateStatus: () => true, // Don't throw on error status codes
    });

    // Return the response data, status, and headers
    return res.status(response.status).json({
      data: response.data,
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    
    // Return error details
    return res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
      details: error.toJSON ? error.toJSON() : null,
    });
  }
}