
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
    console.log('Raw API Response:', text);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}\n${text}`);
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('fetchData error:', error);
    return null;
  }
}
