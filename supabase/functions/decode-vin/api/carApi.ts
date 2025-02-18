
import { CarApiData } from "../types.ts";
import { fetchData } from "./fetchData.ts";

export async function fetchCarApiData(vin: string, apiKey: string): Promise<CarApiData | null> {
  try {
    // First, validate inputs
    if (!vin || vin.length !== 17) {
      console.error('Invalid VIN provided:', vin);
      return null;
    }

    if (!apiKey) {
      console.error('No API key provided');
      return null;
    }

    // Log the request (hiding most of the API key)
    console.log('CarAPI Request:', {
      vin,
      apiKey: `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`,
      url: `https://api.carapi.app/api/vin/${vin}`
    });

    // Make the API request
    const response = await fetchData<any>(`https://api.carapi.app/api/vin/${vin}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Log the raw response for debugging
    console.log('CarAPI raw response:', JSON.stringify(response));

    // Check for API errors or missing data
    if (!response) {
      console.error('No response from CarAPI');
      return null;
    }

    if (response.error) {
      console.error('CarAPI returned error:', response.error);
      return null;
    }

    // Extract vehicle data
    const vehicle = response.data?.vehicle;
    if (!vehicle) {
      console.error('No vehicle data in response:', response);
      return null;
    }

    // Log the extracted vehicle data
    console.log('CarAPI vehicle data:', vehicle);

    // Return only essential data for now
    return {
      year: vehicle.year?.toString() || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      specs: {
        engine_number_of_cylinders: '',
        displacement_l: '',
        turbo: false,
        transmission: '',
        drive_type: ''
      },
      trims: []
    };
  } catch (error) {
    console.error('CarAPI error:', error);
    return null;
  }
}
