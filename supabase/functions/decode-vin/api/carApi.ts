
import { CarApiData } from "../types.ts";
import { fetchData } from "./fetchData.ts";

export async function fetchCarApiData(vin: string, apiKey: string): Promise<CarApiData | null> {
  try {
    // Simple VIN lookup first
    const response = await fetchData<any>(`https://api.carapi.app/api/vin/${vin}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response?.data?.vehicle) {
      console.log('No vehicle data found:', response);
      return null;
    }

    const vehicle = response.data.vehicle;
    console.log('Vehicle data:', vehicle);

    // Return basic data first
    return {
      year: vehicle.year?.toString() || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      specs: {
        engine_number_of_cylinders: vehicle.specs?.engine_number_of_cylinders || '',
        displacement_l: vehicle.specs?.displacement_l || '',
        turbo: vehicle.specs?.turbo || false,
        transmission: vehicle.specs?.transmission || '',
        drive_type: vehicle.specs?.drive_type || ''
      },
      trims: []
    };
  } catch (error) {
    console.error('CarAPI error:', error);
    return null;
  }
}
