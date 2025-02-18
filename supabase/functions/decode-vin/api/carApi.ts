
import { CarApiData } from "../types.ts";
import { fetchData } from "./fetchData.ts";

export async function fetchCarApiData(vin: string, CARAPI_KEY: string, year?: string): Promise<CarApiData | null> {
  try {
    // First get vehicle data from the /vin endpoint
    const vinEndpoint = `https://api.carapi.app/api/vin/${vin}`;
    console.log('Calling CarAPI VIN endpoint:', vinEndpoint);

    const vinResponse = await fetchData<any>(vinEndpoint, {
      headers: { 
        'Authorization': CARAPI_KEY, // Removed 'Bearer ' prefix
        'Accept': 'application/json'
      }
    });

    if (!vinResponse?.data?.vehicle) {
      console.log('No vehicle data received from CarAPI VIN endpoint:', JSON.stringify(vinResponse));
      return null;
    }

    const vehicleData = vinResponse.data.vehicle;
    console.log('CarAPI VIN Response vehicle data:', JSON.stringify(vehicleData));

    // Clean up make/model for better trim matching
    const make = vehicleData.make?.toUpperCase().trim();
    const model = vehicleData.model?.replace(/\s+/g, ' ').trim();
    const year = vehicleData.year;

    // If we got valid VIN data, fetch trims with more specific parameters
    if (make && model && year) {
      // Use a more general query first to ensure we get results
      const trimEndpoint = `https://api.carapi.app/api/trims?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}&detailed=yes&verbose=yes&include_makes=yes&include_models=yes`;
      console.log('Fetching trims from CarAPI:', trimEndpoint);

      const trimResponse = await fetchData<any>(trimEndpoint, {
        headers: { 
          'Authorization': CARAPI_KEY, // Removed 'Bearer ' prefix
          'Accept': 'application/json'
        }
      });

      console.log('Trim response:', JSON.stringify(trimResponse?.data));

      if (trimResponse?.data?.trims && trimResponse.data.trims.length > 0) {
        console.log(`Found ${trimResponse.data.trims.length} trims:`, JSON.stringify(trimResponse.data.trims));
        
        const processedData = {
          year: vehicleData.year,
          make: make,
          model: model,
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
      } else {
        console.log('No trims found for:', { make, model, year });
      }
    }

    // If no trims found or couldn't fetch trims, return basic vehicle data
    const basicData = {
      year: vehicleData.year,
      make: make || vehicleData.make,
      model: model || vehicleData.model,
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
