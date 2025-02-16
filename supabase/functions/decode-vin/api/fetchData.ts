
export async function fetchData<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, options);
    const responseText = await response.text();
    console.log(`API Response [${url}]:`, responseText);

    if (!response.ok) {
      console.error('API error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        response: responseText
      });
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return null;
    }
  } catch (fetchError) {
    console.error('Error fetching data:', fetchError);
    return null;
  }
}
