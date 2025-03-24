import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url, method = 'GET', data, headers } = req.body;
  
  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    // Forward the request to GitHub API
    const response = await axios({
      url,
      method,
      data,
      headers: {
        ...headers,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    
    return res.status(statusCode).json({
      message: errorMessage,
      error: error.toString(),
    });
  }
}