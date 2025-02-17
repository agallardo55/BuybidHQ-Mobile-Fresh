
import { CarApiData } from "../types.ts";
import { fetchData } from "./fetchData.ts";

const SUPPORTED_YEAR_RANGE = {
  min: 2015,
  max: 2020
};

export async function fetchCarApiData(vin: string, CARAPI_KEY: string, year?: string): Promise<CarApiData | null> {
  // If we have the year and it's outside supported range, skip CarAPI call
  if (year) {
    const modelYear = parseInt(year);
    if (modelYear < SUPPORTED_YEAR_RANGE.min || modelYear > SUPPORTED_YEAR_RANGE.max) {
      console.log(`Vehicle year ${modelYear} is outside CarAPI supported range (${SUPPORTED_YEAR_RANGE.min}-${SUPPORTED_YEAR_RANGE.max}). Skipping CarAPI call.`);
      return null;
    }
  }

  const carApiUrl = `https://api.carapi.app/vin/${vin}`;
  console.log('Calling CarAPI:', carApiUrl);

  const carApiResponse = await fetchData<any>(carApiUrl, {
    headers: { 
      'Authorization': `Bearer ${CARAPI_KEY}`,
      'Accept': 'application/json'
    }
  });

  if (carApiResponse?.data) {
    console.log('CarAPI transmission data:', carApiResponse.data.specs?.transmission);
  }

  return carApiResponse?.data || null;
}
