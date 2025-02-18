
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
      // Get CarAPI data - no API key needed
      const carApiData = await fetchCarApiData(vin);
      console.log('CarAPI data received:', carApiData);

      if (!carApiData) {
        throw new Error('Could not decode VIN with CarAPI');
      }

      // Map the response to match our frontend expectations
      const vehicleData: VehicleData = {
        year: carApiData.year?.toString() || '',
        make: carApiData.make || '',
        model: carApiData.model || '',
        trim: carApiData.specs?.trim || '',
        engineCylinders: carApiData.specs?.engine_number_of_cylinders || '',
        transmission: carApiData.specs?.transmission || '',
        drivetrain: carApiData.specs?.drive_type || '',
        availableTrims: carApiData.trims?.map(trim => ({
          name: trim.name,
          description: trim.description,
          specs: {
            engine: `${trim.description?.split('(')[1]?.split(')')[0] || ''}`,
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
