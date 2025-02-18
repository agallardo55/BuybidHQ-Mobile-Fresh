
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

    if (!vinResponse?.data?.vehicle) {
      console.log('No vehicle data received from CarAPI VIN endpoint:', JSON.stringify(vinResponse));
      return null;
    }

    const vehicleData = vinResponse.data.vehicle;
    console.log('CarAPI VIN Response vehicle data:', JSON.stringify(vehicleData));

    // If we got valid VIN data, fetch trims with more specific parameters
    if (vehicleData.make && vehicleData.model && vehicleData.year) {
      const trimEndpoint = `https://api.carapi.app/api/trims?make=${encodeURIComponent(vehicleData.make)}&model=${encodeURIComponent(vehicleData.model)}&year=${vehicleData.year}&detailed=yes&verbose=yes`;
      console.log('Fetching trims from CarAPI:', trimEndpoint);

      const trimResponse = await fetchData<any>(trimEndpoint, {
        headers: { 
          'Authorization': `Bearer ${CARAPI_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (trimResponse?.data?.trims && trimResponse.data.trims.length > 0) {
        console.log('Found trims:', JSON.stringify(trimResponse.data.trims));
        
        const processedData = {
          year: vehicleData.year,
          make: vehicleData.make,
          model: vehicleData.model,
          specs: {
            ...vehicleData.specs,
            engine_number_of_cylinders: vehicleData.specs?.engine_number_of_cylinders || '',
            displacement_l: vehicleData.specs?.displacement_l || '',
            turbo: vehicleData.specs?.turbo || false,
            transmission: vehicleData.specs?.transmission || '',
            drive_type: vehicleData.specs?.drive_type || ''
          },
          trims: trimResponse.data.trims.map((trim: any) => ({
            name: trim.name || 'Unknown Trim',
            description: trim.description || '',
            specs: {
              engine: trim.engine?.name || vehicleData.specs?.engine_description || '',
              transmission: trim.transmission?.name || vehicleData.specs?.transmission || '',
              drivetrain: trim.drive_type || vehicleData.specs?.drive_type || ''
            }
          }))
        };
        
        console.log('Processed CarAPI data with trims:', JSON.stringify(processedData));
        return processedData;
      }
    }

    // If no trims found or couldn't fetch trims, return basic vehicle data
    const basicData = {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      specs: {
        engine_number_of_cylinders: vehicleData.specs?.engine_number_of_cylinders || '',
        displacement_l: vehicleData.specs?.displacement_l || '',
        turbo: vehicleData.specs?.turbo || false,
        transmission: vehicleData.specs?.transmission || '',
        drive_type: vehicleData.specs?.drive_type || ''
      },
      trims: []
    };
    
    console.log('Returning basic vehicle data:', JSON.stringify(basicData));
    return basicData;
  } catch (error) {
    console.error('Error in fetchCarApiData:', error);
    throw error;
  }
}
