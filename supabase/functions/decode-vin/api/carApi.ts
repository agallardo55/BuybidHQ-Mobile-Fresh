
import { CarApiData } from "../types.ts";
import { fetchData } from "./fetchData.ts";

export async function fetchCarApiData(vin: string, CARAPI_KEY: string, year?: string): Promise<CarApiData | null> {
  try {
    // First get vehicle data from the /vin endpoint
    const vinEndpoint = `https://api.carapi.app/api/vin/${vin}`;
    console.log('Calling CarAPI VIN endpoint:', vinEndpoint);

    const vinResponse = await fetchData<any>(vinEndpoint, {
      headers: { 
        'Authorization': `Bearer ${CARAPI_KEY}`,
        'Accept': 'application/json'
      }
    });

    console.log('Raw VIN Response:', JSON.stringify(vinResponse));

    if (!vinResponse?.data?.vehicle) {
      console.log('No vehicle data received from CarAPI VIN endpoint:', vinResponse);
      return null;
    }

    const vehicleData = vinResponse.data.vehicle;
    console.log('CarAPI VIN Response vehicle data:', JSON.stringify(vehicleData));

    // If we got valid VIN data, fetch trims
    if (vehicleData.make && vehicleData.model && vehicleData.year) {
      const trimEndpoint = `https://api.carapi.app/api/trims?make=${encodeURIComponent(vehicleData.make)}&model=${encodeURIComponent(vehicleData.model)}&year=${vehicleData.year}&verbose=yes`;
      console.log('Fetching trims from CarAPI:', trimEndpoint);

      const trimResponse = await fetchData<any>(trimEndpoint, {
        headers: { 
          'Authorization': `Bearer ${CARAPI_KEY}`,
          'Accept': 'application/json'
        }
      });

      console.log('Raw Trim Response:', JSON.stringify(trimResponse));

      // Merge trim data with vehicle data
      if (trimResponse?.data?.trims) {
        const processedData = {
          year: vehicleData.year,
          make: vehicleData.make,
          model: vehicleData.model,
          specs: vehicleData.specs,
          trims: trimResponse.data.trims.map((trim: any) => ({
            name: trim.name,
            description: trim.description || '',
            specs: {
              engine: trim.engine?.name || '',
              transmission: trim.transmission?.name || '',
              drivetrain: trim.drive_type || ''
            }
          }))
        };
        
        console.log('Processed CarAPI data:', JSON.stringify(processedData));
        return processedData;
      }
    }

    // If no trims found, return just the vehicle data
    const basicData = {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      specs: vehicleData.specs,
      trims: []
    };
    
    console.log('Returning basic vehicle data:', JSON.stringify(basicData));
    return basicData;
  } catch (error) {
    console.error('Error in fetchCarApiData:', error);
    throw error;
  }
}
