const API_BASE_URLS = [
     'https://vfinserv.in',
     'http://localhost:9999'  
];

export const fetchWithFallback = async (endpoint, options = {}) => {
  let lastError = null;
  
  // Try each base URL until one succeeds
  for (const baseUrl of API_BASE_URLS) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`Attempting to fetch from: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        credentials: 'include' // Important for cookies/sessions
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`Attempt failed for ${endpoint} with base URL ${baseUrl}:`, error.message);
      lastError = error;
      // Continue to the next URL
    }
  }

  // If we get here, all attempts failed
  throw lastError || new Error('All API endpoints failed');
};
