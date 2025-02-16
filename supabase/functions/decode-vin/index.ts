
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { VehicleData, CarApiData } from "./types.ts";
import { fetchNHTSAData, fetchCarApiData } from "./apiUtils.ts";
import { findBestTrimMatch } from "./trimUtils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function mergeVehicleData(nhtsaData: VehicleData, carApiData: CarApiData | null): VehicleData {
  console.log('Merging vehicle data:');
  console.log('NHTSA data:', nhtsaData);
  console.log('CarAPI data:', carApiData);

  const mergedData: VehicleData = {
    year: '',
    make: '',
    model: '',
    trim: '',
    engineCylinders: '',
    transmission: '',
    drivetrain: ''
  };

  // Start with NHTSA data as base
  Object.assign(mergedData, nhtsaData);

  // Enhance with CarAPI data if available
  if (carApiData) {
    const year = parseInt(carApiData.year?.toString() || nhtsaData.year || '');
    
    // Year: Use CarAPI if available
    if (carApiData.year) {
      mergedData.year = carApiData.year.toString();
    }

    // Make: Prefer CarAPI if available
    if (carApiData.make) {
      mergedData.make = carApiData.make;
    }

    // Model: Prefer CarAPI if available
    if (carApiData.model) {
      mergedData.model = carApiData.model;
    }

    // Trim: Use best match from CarAPI trims if available
    if (carApiData.trims && carApiData.trims.length > 0) {
      const bestTrim = findBestTrimMatch(carApiData.trims, year);
      if (bestTrim && (!mergedData.trim || bestTrim.length > mergedData.trim.length)) {
        mergedData.trim = bestTrim;
      }
    } else if (carApiData.trim) {
      mergedData.trim = carApiData.trim;
    }

    // Transmission: Combine both sources if possible
    if (carApiData.specs?.transmission) {
      const carApiTransmission = carApiData.specs.transmission.trim();
      console.log('CarAPI transmission:', carApiTransmission);
      
      if (mergedData.transmission) {
        // Check if CarAPI data provides new information
        if (!mergedData.transmission.toLowerCase().includes(carApiTransmission.toLowerCase())) {
          mergedData.transmission = `${carApiTransmission} ${mergedData.transmission}`.trim();
          console.log('Combined transmission:', mergedData.transmission);
        }
      } else {
        mergedData.transmission = carApiTransmission;
        console.log('Using CarAPI transmission:', carApiTransmission);
      }
    }

    // Drivetrain: Use CarAPI's drive_type if available
    if (carApiData.specs?.drive_type) {
      mergedData.drivetrain = carApiData.specs.drive_type;
    }

    // Engine: Enhance NHTSA engine data with CarAPI data if available
    if (carApiData.specs?.engine_number_of_cylinders || carApiData.specs?.displacement_l) {
      const engineParts = [];
      
      if (carApiData.specs.displacement_l) {
        engineParts.push(`${carApiData.specs.displacement_l}L`);
      }
      
      if (carApiData.specs.engine_number_of_cylinders) {
        engineParts.push(`${carApiData.specs.engine_number_of_cylinders}-Cylinder`);
      }
      
      if (carApiData.specs.turbo) {
        engineParts.push('Turbo');
      }
      
      const carApiEngine = engineParts.join(' ');
      
      // Use the more detailed engine description
      if (carApiEngine.length > mergedData.engineCylinders.length) {
        mergedData.engineCylinders = carApiEngine;
      }
    }
  }

  // Clean up any remaining empty strings with default values
  Object.keys(mergedData).forEach(key => {
    if (!mergedData[key]) {
      mergedData[key] = 'N/A';
      console.log(`Setting default value for ${key}: N/A`);
    }
  });

  console.log('Final merged data:', mergedData);
  return mergedData;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vin } = await req.json();
    
    if (!vin || vin.length !== 17) {
      console.error('Invalid VIN format:', vin);
      return new Response(
        JSON.stringify({ error: 'Invalid VIN format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing VIN:', vin);

    try {
      // Get CARAPI key
      const CARAPI_KEY = Deno.env.get('CARAPI_KEY');
      if (!CARAPI_KEY) {
        console.error('CarAPI key not found in environment');
        throw new Error('CarAPI key not configured');
      }

      // Fetch data from both APIs in parallel
      const [nhtsaData, carApiData] = await Promise.all([
        fetchNHTSAData(vin),
        fetchCarApiData(vin, CARAPI_KEY)
      ]);

      console.log('API responses received:');
      console.log('NHTSA:', nhtsaData);
      console.log('CarAPI:', carApiData);

      // Merge data from both sources
      const mergedData = mergeVehicleData(nhtsaData, carApiData);

      // Check if we have at least some basic vehicle information
      if (mergedData.year || mergedData.make || mergedData.model) {
        console.log('Returning merged data:', mergedData);
        return new Response(
          JSON.stringify(mergedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error('Could not decode VIN with either API');

    } catch (apiError: any) {
      console.error('API Error:', apiError?.message || apiError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to decode VIN. Please try again.',
          details: apiError?.message || 'Unknown API error'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error: any) {
    console.error('General Error:', error?.message || error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Failed to decode VIN',
        details: 'Unexpected error occurred'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

