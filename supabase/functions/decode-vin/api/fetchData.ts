
export async function fetchData<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    console.log('Making request to:', url);
    console.log('Request headers:', options?.headers);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
      }
    });

    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    // Enhanced error handling for API authentication
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      
      if (response.status === 401) {
        console.error('Authentication failed: Invalid or missing API key');
        return null;
      } else if (response.status === 403) {
        console.error('Access forbidden: API key may not have sufficient permissions');
        return null;
      } else if (response.status === 429) {
        console.error('Rate limit exceeded: Too many requests');
        return null;
      } else if (response.status >= 500) {
        console.error('Server error: API service is experiencing issues');
        return null;
      }
      
      console.error('API Error Response:', text);
      return null;
    }
    
    console.log('Raw API Response:', text);

    try {
      const data = JSON.parse(text);
      console.log('Parsed API Response:', JSON.stringify(data, null, 2));
      return data;
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('fetchData error:', error);
    return null;
  }
}
