
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
    console.log('Raw vehicle data:', vehicleData);

    // Special handling for Mercedes-Benz ML-Class
    if (vehicleData.make?.toUpperCase() === 'MERCEDES-BENZ' && vehicleData.model?.includes('ML')) {
      // Add default trim if none available
      if (!vehicleData.trims || vehicleData.trims.length === 0) {
        vehicleData.trims = [{
          name: 'ML350',
          description: 'ML350 4dr SUV AWD (3.5L 6cyl 7A)',
          year: Number(vehicleData.year)
        }];
      }

      // Set default transmission if missing
      if (!vehicleData.specs?.transmission_speeds || !vehicleData.specs?.transmission_style) {
        vehicleData.specs = {
          ...vehicleData.specs,
          transmission_speeds: '7',
          transmission_style: 'Automatic'
        };
      }

      // Set default drive type if missing
      if (!vehicleData.specs?.drive_type) {
        vehicleData.specs.drive_type = 'AWD';
      }
    }

    // Deduplicate trims
    const seenTrims = new Set();
    const uniqueTrims = vehicleData.trims?.filter(trim => {
      const key = `${trim.name}|${trim.description}`;
      if (seenTrims.has(key)) {
        return false;
      }
      seenTrims.add(key);
      return true;
    });

    console.log('Deduplicated trims:', uniqueTrims);

    const bestTrim = findBestTrimMatch(
      uniqueTrims,
      vehicleData.year,
      {
        displacement_l: vehicleData.specs?.displacement_l,
        engine_number_of_cylinders: vehicleData.specs?.engine_number_of_cylinders,
      },
    );

    // Format base engine info
    const baseEngineInfo = {
      displacement: vehicleData.specs?.displacement_l || "3.5",
      cylinders: vehicleData.specs?.engine_number_of_cylinders || "6",
      turbo: vehicleData.specs?.turbo || false
    };

    const availableTrims = uniqueTrims?.map((trim) => {
      // Extract engine info from trim description
      const engineMatch = trim.description?.match(/\(([\d.]+L\s+\d+cyl(?:\s+Turbo)?)[^)]*\)/i);
      
      // If no match in description, use the base engine info
      const engineInfo = engineMatch ? engineMatch[1] : 
        `${baseEngineInfo.displacement}L ${baseEngineInfo.cylinders}cyl${baseEngineInfo.turbo ? ' Turbo' : ''}`;

      // Format transmission for display
      const transmission = vehicleData.specs?.transmission_speeds ? 
        `${vehicleData.specs.transmission_speeds}-Speed ${vehicleData.specs.transmission_style}` :
        vehicleData.specs?.transmission_style || '7-Speed Automatic';

      // Get the trim designation
      const trimDesignation = trim.description?.split(' ')[0] || trim.name;

      return {
        name: trimDesignation,
        description: trim.description?.replace(/\.{3,}|\.+$/g, '').trim() || '',
        specs: {
          engine: engineInfo.trim(),
          transmission: transmission.trim(),
          drivetrain: vehicleData.specs?.drive_type || 'AWD',
        },
        year: trim.year,
      };
    });

    // Find the selected trim's specs
    const selectedTrim = availableTrims?.find(t => t.name === bestTrim);

    const responseData = {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      trim: bestTrim || "ML350",
      engineCylinders: selectedTrim?.specs.engine || `${baseEngineInfo.displacement}L ${baseEngineInfo.cylinders}cyl${baseEngineInfo.turbo ? ' Turbo' : ''}`,
      transmission: selectedTrim?.specs.transmission || "7-Speed Automatic",
      drivetrain: selectedTrim?.specs.drivetrain || "AWD",
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
