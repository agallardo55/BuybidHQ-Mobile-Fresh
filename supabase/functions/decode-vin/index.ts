
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

    // Special handling for Porsche vehicles
    if (vehicleData.make?.toLowerCase() === 'porsche') {
      // Check if this is likely a GT3 RS based on specs
      const isGT3RS = vehicleData.specs?.displacement_l === "4" && 
                     vehicleData.specs?.engine_number_of_cylinders === "6" &&
                     vehicleData.specs?.body_class?.toLowerCase().includes('coupe') &&
                     vehicleData.specs?.doors === "2";

      if (isGT3RS) {
        // Add GT3 RS to available trims if it matches specs
        vehicleData.trims = [
          {
            name: 'GT3 RS',
            description: 'GT3 RS 2dr Coupe (4.0L 6cyl 7AM)',
            year: Number(vehicleData.year)
          },
          ...(vehicleData.trims || [])
        ];
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
        make: vehicleData.make,
        displacement_l: vehicleData.specs?.displacement_l,
        engine_number_of_cylinders: vehicleData.specs?.engine_number_of_cylinders,
        body_class: vehicleData.specs?.body_class,
        doors: vehicleData.specs?.doors,
      },
    );

    // Format base engine info
    const baseEngineInfo = {
      displacement: vehicleData.specs?.displacement_l || "3.5",
      cylinders: vehicleData.specs?.engine_number_of_cylinders || "6",
      turbo: vehicleData.specs?.turbo || false
    };

    const availableTrims = uniqueTrims?.map((trim) => {
      const engineDesc = trim.description?.match(/\(([\d.]+L\s+\d+cyl(?:\s+Turbo)?)[^)]*\)/i)?.[1] || 
        `${baseEngineInfo.displacement}L ${baseEngineInfo.cylinders}cyl${baseEngineInfo.turbo ? ' Turbo' : ''}`;

      const transmission = vehicleData.specs?.transmission_speeds ? 
        `${vehicleData.specs.transmission_speeds}-Speed ${vehicleData.specs.transmission_style}` :
        vehicleData.specs?.transmission_style || '7-Speed Automatic';

      return {
        name: trim.name,
        description: trim.description?.replace(/\.{3,}|\.+$/g, '').trim() || '',
        specs: {
          engine: engineDesc.trim(),
          transmission: transmission.trim(),
          drivetrain: vehicleData.specs?.drive_type || 'AWD',
        },
        year: trim.year,
      };
    });

    const responseData = {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      trim: bestTrim,
      engineCylinders: availableTrims?.[0]?.specs?.engine || `${baseEngineInfo.displacement}L ${baseEngineInfo.cylinders}cyl${baseEngineInfo.turbo ? ' Turbo' : ''}`,
      transmission: availableTrims?.[0]?.specs?.transmission || "7-Speed Automatic",
      drivetrain: availableTrims?.[0]?.specs?.drivetrain || "AWD",
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
