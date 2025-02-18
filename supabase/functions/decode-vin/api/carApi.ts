
import { CarApiData } from "../types.ts";
import { fetchData } from "./fetchData.ts";

export async function fetchCarApiData(vin: string): Promise<CarApiData | null> {
  try {
    // First, validate input
    if (!vin || vin.length !== 17) {
      console.error('Invalid VIN provided:', vin);
      return null;
    }

    const API_URL = `https://carapi.app/api/vin/${vin}`;

    // Log the request details
    console.log('Making CarAPI request:', {
      url: API_URL,
      vin
    });

    // Make the direct API request without auth
    const response = await fetchData<any>(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Log the raw response for debugging
    console.log('CarAPI raw response:', response);

    if (!response) {
      console.error('No response from CarAPI');
      return null;
    }

    // For direct API access, the data is the response itself
    const vehicle = response;
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
        engine_number_of_cylinders: vehicle.specs?.engine_number_of_cylinders,
        displacement_l: vehicle.specs?.displacement_l,
        transmission_speeds: vehicle.specs?.transmission_speeds,
        transmission_style: vehicle.specs?.transmission_style,
        drive_type: vehicle.specs?.drive_type,
        turbo: vehicle.specs?.turbo,
        trim: vehicle.specs?.trim
      },
      trims: vehicle.trims || []
    };
  } catch (error) {
    console.error('CarAPI error:', error);
    return null;
  }
}
