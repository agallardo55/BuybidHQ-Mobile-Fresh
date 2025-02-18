
import { CarApiData } from "../types.ts";
import { fetchData } from "./fetchData.ts";

export async function fetchCarApiData(vin: string, CARAPI_KEY: string, year?: string): Promise<CarApiData | null> {
  const carApiUrl = `https://api.carapi.app/vin/${vin}`;
  console.log('Calling CarAPI:', carApiUrl);

  const carApiResponse = await fetchData<any>(carApiUrl, {
    headers: { 
      'Authorization': `Bearer ${CARAPI_KEY}`,
      'Accept': 'application/json'
    }
  });

  if (carApiResponse?.data) {
    console.log('CarAPI Response Data:', {
      year: carApiResponse.data.year,
      make: carApiResponse.data.make,
      model: carApiResponse.data.model,
      trims: carApiResponse.data.trims,
      specs: carApiResponse.data.specs
    });
  }

  return carApiResponse?.data || null;
}
