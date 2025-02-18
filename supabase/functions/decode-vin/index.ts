
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { VehicleData } from "./types.ts";
import { fetchCarApiData } from "./api/carApi.ts";
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

      console.log('CarAPI key found:', CARAPI_KEY.substring(0, 4) + '...');

      // Get CarAPI data
      const carApiData = await fetchCarApiData(vin, CARAPI_KEY);
      console.log('CarAPI data received:', carApiData);

      if (!carApiData) {
        throw new Error('Could not decode VIN with CarAPI');
      }

      // Map the response to match our frontend expectations
      const vehicleData: VehicleData = {
        year: carApiData.year?.toString() || '',
        make: carApiData.make || '',
        model: carApiData.model || '',
        trim: '',
        engineCylinders: carApiData.specs?.engine_number_of_cylinders || '',
        transmission: carApiData.specs?.transmission || '',
        drivetrain: carApiData.specs?.drive_type || '',
        availableTrims: carApiData.trims?.map(trim => ({
          name: trim.name,
          description: trim.description,
          specs: {
            engine: `${trim.name} Engine`,
            transmission: carApiData.specs?.transmission || '',
            drivetrain: carApiData.specs?.drive_type || ''
          }
        })) || []
      };

      console.log('Returning vehicle data:', vehicleData);
      return new Response(
        JSON.stringify(vehicleData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (apiError) {
      return handleApiError(apiError);
    }

  } catch (error) {
    return handleVinError(error);
  }
});
