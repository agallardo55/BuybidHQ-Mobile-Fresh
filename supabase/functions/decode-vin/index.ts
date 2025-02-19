
import { cleanTrimValue, findBestTrimMatch, cleanEngineDescription } from "./utils/trimUtils.ts";
import { fetchCarApiData } from "./api/carApi.ts";
import { CarApiResult } from "./types.ts";
import { corsHeaders } from "./config.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { vin } = await req.json() as { vin: string };

    if (!vin) {
      return new Response(JSON.stringify({ error: "VIN is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Received VIN: ${vin}`);

    const apiResult = await fetchCarApiData(vin);

    if (!apiResult) {
      console.error("Failed to decode VIN from CarAPI");
      return new Response(
        JSON.stringify({ error: "Failed to decode VIN from CarAPI" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const vehicleData = apiResult;

    const bestTrim = findBestTrimMatch(
      vehicleData.trims,
      vehicleData.year,
      {
        displacement_l: vehicleData.specs?.displacement_l,
        engine_number_of_cylinders: vehicleData.specs?.engine_number_of_cylinders,
      },
    );

    const cleanedTrim = bestTrim ? cleanTrimValue(bestTrim) : "";

    // Format engine information to match what's shown in trim description
    const engineInfo = `${vehicleData.specs?.displacement_l}L ${vehicleData.specs?.engine_number_of_cylinders}cyl${vehicleData.specs?.turbo ? ' Turbo' : ''}`;
    console.log('Raw engine info:', engineInfo);

    const availableTrims = vehicleData.trims?.map((trim) => {
      // Extract engine info from trim description
      const engineMatch = trim.description?.match(/\(([\d.]+L \d+cyl[^)]*)\)/);
      const trimEngineInfo = engineMatch ? engineMatch[1] : engineInfo;
      
      console.log('Trim engine info:', trimEngineInfo);

      return {
        name: cleanTrimValue(trim.name),
        description: trim.description?.replace(/\.{3,}|\.+$/g, '').trim() || '',
        specs: {
          engine: trimEngineInfo.trim(),
          transmission: vehicleData.specs?.transmission_style || '',
          drivetrain: vehicleData.specs?.drive_type || '',
        },
        year: trim.year,
      };
    });

    const responseData = {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      trim: cleanedTrim,
      engineCylinders: engineInfo.trim(),
      transmission: vehicleData.specs?.transmission_style,
      drivetrain: vehicleData.specs?.drive_type,
      availableTrims: availableTrims,
    };

    console.log(`Returning VIN decode response:`, responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Unexpected error: ${error}`);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
