
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { VehicleData } from "./types.ts";
import { fetchNHTSAData, fetchCarApiData } from "./apiUtils.ts";
import { mergeVehicleData } from "./utils/mergeUtils.ts";
import { handleVinError, handleApiError } from "./utils/errorUtils.ts";
import { corsHeaders } from "./config.ts";

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

      // First get NHTSA data to check the year
      const nhtsaData = await fetchNHTSAData(vin);
      console.log('NHTSA data received:', nhtsaData);

      // Then get CarAPI data if year is supported
      const carApiData = await fetchCarApiData(vin, CARAPI_KEY, nhtsaData.year);
      console.log('CarAPI data received:', carApiData);

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

    } catch (apiError) {
      return handleApiError(apiError);
    }

  } catch (error) {
    return handleVinError(error);
  }
});
