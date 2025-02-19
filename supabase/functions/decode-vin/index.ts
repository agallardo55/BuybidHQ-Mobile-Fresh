
import { cleanTrimValue, findBestTrimMatch } from "./utils/trimUtils.ts";
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

    const availableTrims = vehicleData.trims?.map((trim) => ({
      name: cleanTrimValue(trim.name),
      description: trim.description,
      specs: {
        engine: `${vehicleData.specs?.displacement_l}L ${vehicleData.specs?.engine_number_of_cylinders}cyl`,
        transmission: vehicleData.specs?.transmission_style,
        drivetrain: vehicleData.specs?.drive_type,
      },
      year: trim.year,
    }));

    // Clean the engine description
    function cleanEngineDescription(engine: string): string {
      if (!engine) return "";
      // Remove transmission speed references (e.g., "7AM", "8A")
      return engine.replace(/\s+\d+[A-Z]+$/, "").trim();
    }

    const engineInfo = `${vehicleData.specs?.displacement_l}L ${vehicleData.specs?.engine_number_of_cylinders}cyl Turbo`;
    const cleanedEngine = cleanEngineDescription(engineInfo);

    const responseData = {
      year: vehicleData.year,
      make: vehicleData.make,
      model: vehicleData.model,
      trim: cleanedTrim,
      engineCylinders: cleanedEngine,
      transmission: vehicleData.specs?.transmission_style,
      drivetrain: vehicleData.specs?.drive_type,
      availableTrims: availableTrims,
    };

    console.log(`Returning VIN decode response: ${JSON.stringify(responseData)}`);

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
