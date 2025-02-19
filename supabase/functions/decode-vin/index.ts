
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

    // Format base engine info
    const baseEngineInfo = {
      displacement: vehicleData.specs?.displacement_l || "",
      cylinders: vehicleData.specs?.engine_number_of_cylinders || "",
      turbo: vehicleData.specs?.turbo || false
    };

    // Deduplicate trims based on name and description
    const uniqueTrims = vehicleData.trims?.reduce((acc: any[], trim) => {
      const exists = acc.some(t => 
        t.name === trim.name && 
        t.description === trim.description
      );
      
      if (!exists) {
        acc.push(trim);
      }
      return acc;
    }, []);

    console.log('Deduplicated trims:', uniqueTrims);

    const availableTrims = uniqueTrims?.map((trim) => {
      // First try to extract engine info from trim description
      const engineMatch = trim.description?.match(/\(([\d.]+L\s+\d+cyl(?:\s+Turbo)?)[^)]*\)/i);
      
      // If no match in description, use the base engine info
      const engineInfo = engineMatch ? engineMatch[1] : 
        `${baseEngineInfo.displacement}L ${baseEngineInfo.cylinders}cyl${baseEngineInfo.turbo ? ' Turbo' : ''}`;

      // Format transmission for display
      const transmission = vehicleData.specs?.transmission_speeds ? 
        `${vehicleData.specs.transmission_speeds}-Speed ${vehicleData.specs.transmission_style}` :
        vehicleData.specs?.transmission_style || '';

      console.log('Processing trim:', {
        name: trim.name,
        engineInfo,
        transmission,
        drivetrain: vehicleData.specs?.drive_type
      });

      return {
        name: cleanTrimValue(trim.name),
        description: trim.description?.replace(/\.{3,}|\.+$/g, '').trim() || '',
        specs: {
          engine: engineInfo.trim(),
          transmission: transmission.trim(),
          drivetrain: vehicleData.specs?.drive_type || '',
        },
        year: trim.year,
      };
    });

    // Find the selected trim's specs
    const selectedTrim = availableTrims?.find(t => cleanTrimValue(t.name) === cleanedTrim);

    const responseData = {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      trim: cleanedTrim,
      engineCylinders: selectedTrim?.specs.engine || `${baseEngineInfo.displacement}L ${baseEngineInfo.cylinders}cyl${baseEngineInfo.turbo ? ' Turbo' : ''}`,
      transmission: selectedTrim?.specs.transmission || `${vehicleData.specs?.transmission_speeds}-Speed ${vehicleData.specs?.transmission_style}`,
      drivetrain: selectedTrim?.specs.drivetrain || vehicleData.specs?.drive_type || '',
      availableTrims: availableTrims,
    };

    console.log('Returning VIN decode response:', responseData);

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
