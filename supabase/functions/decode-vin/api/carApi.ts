
import { CarApiData } from "../types.ts";
import { fetchData } from "./fetchData.ts";

export async function fetchCarApiData(vin: string, CARAPI_KEY: string, year?: string): Promise<CarApiData | null> {
  // First get vehicle data from the /vin endpoint
  const vinEndpoint = `https://api.carapi.app/api/vin/${vin}`;
  console.log('Calling CarAPI VIN endpoint:', vinEndpoint);

  const vinResponse = await fetchData<any>(vinEndpoint, {
    headers: { 
      'Authorization': `Bearer ${CARAPI_KEY}`,
      'Accept': 'application/json'
    }
  });

  if (!vinResponse?.data) {
    console.log('No data received from CarAPI VIN endpoint');
    return null;
  }

  console.log('CarAPI VIN Response:', vinResponse.data);

  // If we got valid VIN data, fetch trims
  if (vinResponse.data.make && vinResponse.data.model && vinResponse.data.year) {
    const trimEndpoint = `https://api.carapi.app/api/trims?make=${encodeURIComponent(vinResponse.data.make)}&model=${encodeURIComponent(vinResponse.data.model)}&year=${vinResponse.data.year}`;
    console.log('Fetching trims from CarAPI:', trimEndpoint);

    const trimResponse = await fetchData<any>(trimEndpoint, {
      headers: { 
        'Authorization': `Bearer ${CARAPI_KEY}`,
        'Accept': 'application/json'
      }
    });

    console.log('CarAPI Trim Response:', trimResponse?.data);

    // Merge trim data with vehicle data
    if (trimResponse?.data?.data) {
      return {
        ...vinResponse.data,
        trims: trimResponse.data.data
      };
    }
  }

  // If no trims found, return just the vehicle data
  return vinResponse.data;
}
