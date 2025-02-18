
export async function fetchData<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    console.log('Making request to:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Accept': 'application/json'
      }
    });

    const text = await response.text();
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
