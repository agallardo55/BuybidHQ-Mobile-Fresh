
export async function fetchData<T>(url: string, options?: RequestInit): Promise<T | null> {
  const callId = `FETCH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🔍 [${callId}] fetchData: Making request to:`, url);
  console.log(`🔍 [${callId}] fetchData: Request method:`, options?.method || 'GET');
  console.log(`🔍 [${callId}] fetchData: Request headers:`, options?.headers);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
      }
    });

    const text = await response.text();
    console.log(`🔍 [${callId}] fetchData: Response status:`, response.status);
    console.log(`🔍 [${callId}] fetchData: Response ok:`, response.ok);
    console.log(`🔍 [${callId}] fetchData: Response statusText:`, response.statusText);
    console.log(`🔍 [${callId}] fetchData: Response headers:`, Object.fromEntries(response.headers));
    console.log(`🔍 [${callId}] fetchData: Response text length:`, text.length);
    console.log(`🔍 [${callId}] fetchData: Response text preview (first 500 chars):`, text.substring(0, 500));
    
    // Enhanced error handling for API authentication
    if (!response.ok) {
      console.error(`❌ [${callId}] fetchData: API request failed with status ${response.status}`);
      
      if (response.status === 401) {
        console.error(`❌ [${callId}] fetchData: Authentication failed: Invalid or missing API key`);
        console.error(`❌ [${callId}] fetchData: Response body:`, text);
        return null;
      } else if (response.status === 403) {
        console.error(`❌ [${callId}] fetchData: Access forbidden: API key may not have sufficient permissions`);
        console.error(`❌ [${callId}] fetchData: Response body:`, text);
        return null;
      } else if (response.status === 404) {
        console.error(`❌ [${callId}] fetchData: Not found: Resource does not exist`);
        console.error(`❌ [${callId}] fetchData: Response body:`, text);
        return null;
      } else if (response.status === 429) {
        console.error(`❌ [${callId}] fetchData: Rate limit exceeded: Too many requests`);
        console.error(`❌ [${callId}] fetchData: Response body:`, text);
        return null;
      } else if (response.status >= 500) {
        console.error(`❌ [${callId}] fetchData: Server error: API service is experiencing issues`);
        console.error(`❌ [${callId}] fetchData: Response body:`, text);
        return null;
      }
      
      console.error(`❌ [${callId}] fetchData: API Error Response:`, text);
      return null;
    }
    
    console.log(`🔍 [${callId}] fetchData: Raw API Response (full):`, text);

    try {
      const data = JSON.parse(text);
      console.log(`✅ [${callId}] fetchData: Successfully parsed JSON response`);
      console.log(`🔍 [${callId}] fetchData: Parsed response type:`, typeof data);
      console.log(`🔍 [${callId}] fetchData: Parsed response is array:`, Array.isArray(data));
      console.log(`🔍 [${callId}] fetchData: Parsed API Response (full):`, JSON.stringify(data, null, 2));
      return data;
    } catch (parseError) {
      console.error(`❌ [${callId}] fetchData: Error parsing response:`, parseError);
      console.error(`❌ [${callId}] fetchData: Response text that failed to parse:`, text);
      return null;
    }
  } catch (error) {
    console.error(`❌ [${callId}] fetchData: Network or other error:`, error);
    console.error(`❌ [${callId}] fetchData: Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    return null;
  }
}
