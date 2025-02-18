
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

    const API_URL = `https://api.carapi.app/api/vin/${vin}`;

    // Log the request details
    console.log('Making CarAPI request:', {
      url: API_URL,
      vin,
      keyProvided: !!apiKey
    });

    // Make the API request with the API key as a Bearer token
    const response = await fetchData<any>(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // Log the raw response for debugging
    console.log('CarAPI raw response:', response);

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

    return {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      specs: {
        engine_number_of_cylinders: vehicle.engine?.cylinders?.toString(),
        displacement_l: vehicle.engine?.displacement_l?.toString(),
        transmission: vehicle.transmission?.type,
        drive_type: vehicle.drive_type,
        turbo: vehicle.engine?.turbo
      },
      trims: vehicle.trims || []
    };
  } catch (error) {
    console.error('CarAPI error:', error);
    return null;
  }
}
