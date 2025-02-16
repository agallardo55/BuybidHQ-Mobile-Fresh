
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

  // If CarAPI data is available, use it as primary source
  if (carApiData) {
    // Get the best matching trim
    const year = parseInt(carApiData.year?.toString() || nhtsaData.year || '');
    const bestTrim = carApiData.trims ? findBestTrimMatch(carApiData.trims, year) : '';

    return {
      year: carApiData.year?.toString() || nhtsaData.year || '',
      make: carApiData.make || nhtsaData.make || '',
      model: carApiData.model || nhtsaData.model || '',
      trim: bestTrim || nhtsaData.trim || '',
      engineCylinders: nhtsaData.engineCylinders || '',
      transmission: carApiData.specs?.transmission || nhtsaData.transmission || '',
      drivetrain: carApiData.specs?.drive_type || nhtsaData.drivetrain || ''
    };
  }

  // Fallback to NHTSA data
  return nhtsaData;
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
