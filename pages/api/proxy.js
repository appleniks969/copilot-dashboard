import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url, method = 'GET', data, headers, params } = req.body;
  
  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    console.log(`[API Proxy] Forwarding request to: ${url}`);
    console.log(`[API Proxy] Headers:`, headers);
    console.log(`[API Proxy] Params:`, params);
    
    // Forward the request to GitHub API
    const response = await axios({
      url,
      method,
      data,
      params,
      headers: {
        ...headers,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    console.log(`[API Proxy] Response status: ${response.status}`);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    
    if (error.response) {
      console.error('[API Proxy] Response data:', error.response.data);
      console.error('[API Proxy] Response status:', error.response.status);
    }
    
    return res.status(statusCode).json({
      message: errorMessage,
      error: error.toString(),
      details: error.response?.data || null
    });
  }
}