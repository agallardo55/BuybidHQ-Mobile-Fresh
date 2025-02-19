
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
