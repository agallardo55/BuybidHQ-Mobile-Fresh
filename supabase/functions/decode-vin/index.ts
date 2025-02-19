import { cleanTrimValue, findBestTrimMatch } from "./utils/trimUtils.ts";
import { গাড়িরAPI } from "./utils/carApi.ts";
import { CarApiResult } from "./types.ts";

Deno.serve(async (req) => {
  try {
    const { vin } = await req.json() as { vin: string };

    if (!vin) {
      return new Response(JSON.stringify({ error: "VIN is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Received VIN: ${vin}`);

    const carApi = new গাড়িরAPI();
    const apiResult: CarApiResult | null = await carApi.decodeVin(vin);

    if (!apiResult) {
      console.error("Failed to decode VIN from গাড়িরAPI");
      return new Response(
        JSON.stringify({ error: "Failed to decode VIN from গাড়িরAPI" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (apiResult.error) {
      console.error(` গাড়িরAPI error: ${apiResult.error}`);
      return new Response(JSON.stringify({ error: apiResult.error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data } = apiResult;

    if (!data || data.length === 0) {
      console.warn("No data returned from গাড়িরAPI");
      return new Response(
        JSON.stringify({ warning: "No data returned from গাড়িরAPI" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const vehicleData = data[0];

    const bestTrim = findBestTrimMatch(
      vehicleData.trims,
      vehicleData.model_year,
      {
        displacement_l: vehicleData.engine_displacement_l,
        engine_number_of_cylinders: vehicleData.engine_number_of_cylinders,
      },
    );

    const cleanedTrim = bestTrim ? cleanTrimValue(bestTrim) : "";

    const availableTrims = vehicleData.trims?.map((trim) => ({
      name: cleanTrimValue(trim.name),
      description: trim.description,
      specs: {
        engine: `${vehicleData.engine_displacement_l}L ${vehicleData.engine_number_of_cylinders}cyl`,
        transmission: vehicleData.transmission_display,
        drivetrain: vehicleData.drive_type,
      },
      year: trim.year,
    }));

    // Clean the engine description
    function cleanEngineDescription(engine: string): string {
      if (!engine) return "";
      // Remove transmission speed references (e.g., "7AM", "8A")
      return engine.replace(/\s+\d+[A-Z]+$/, "").trim();
    }

    const engineInfo = `${vehicleData.engine_displacement_l}L ${vehicleData.engine_number_of_cylinders}cyl Turbo`;
    const cleanedEngine = cleanEngineDescription(engineInfo);

    const responseData = {
      year: vehicleData.model_year,
      make: vehicleData.make,
      model: vehicleData.model,
      trim: cleanedTrim,
      engineCylinders: cleanedEngine,
      transmission: vehicleData.transmission_display,
      drivetrain: vehicleData.drive_type,
      availableTrims: availableTrims,
    };

    console.log(`Returning VIN decode response: ${JSON.stringify(responseData)}`);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Unexpected error: ${error}`);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
