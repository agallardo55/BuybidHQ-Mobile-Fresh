
import { fetchData } from "./fetchData.ts";
import { CarApiResult } from "../types.ts";

export async function fetchCarApiData(vin: string): Promise<CarApiResult | null> {
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
    console.log('CarAPI raw response:', JSON.stringify(response, null, 2));

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

    // Log the trims specifically
    console.log('CarAPI trims data:', JSON.stringify(vehicle.trims, null, 2));

    const processedData = {
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
      trims: Array.isArray(vehicle.trims) ? vehicle.trims : []
    };

    console.log('Processed CarAPI data:', JSON.stringify(processedData, null, 2));
    return processedData;
  } catch (error) {
    console.error('CarAPI error:', error);
    return null;
  }
}
