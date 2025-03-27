
import { findBestTrimMatch } from "../utils/trimUtils.ts";
import { CarApiResult, VehicleData } from "../types.ts";
import { fixMercedesBenzData } from "./brandSpecificProcessor.ts";
import { handlePorscheSpecialTrims } from "./porscheProcessor.ts";
import { formatEngineInfo } from "./engineProcessor.ts";

export function processVehicleData(vehicleData: CarApiResult): VehicleData {
  // Apply Mercedes-Benz specific fixes
  const processedData = fixMercedesBenzData(vehicleData);
  
  // First deduplicate trims
  const uniqueTrims = deduplicateTrims(processedData.trims || []);
  
  // Apply Porsche-specific trim handling
  const finalTrims = handlePorscheSpecialTrims(processedData, uniqueTrims);
  
  // Find the best trim match
  const bestTrim = findBestTrimMatch(
    finalTrims,
    processedData.year,
    {
      make: processedData.make,
      displacement_l: processedData.specs?.displacement_l,
      engine_number_of_cylinders: processedData.specs?.engine_number_of_cylinders,
      body_class: processedData.specs?.body_class,
      doors: processedData.specs?.doors,
    },
  );
  
  // Format base engine info
  const baseEngineInfo = {
    displacement: processedData.specs?.displacement_l || "3.5",
    cylinders: processedData.specs?.engine_number_of_cylinders || "6",
    turbo: processedData.specs?.turbo || false
  };
  
  const availableTrims = formatTrimsWithSpecs(finalTrims, processedData, baseEngineInfo);
  
  return {
    year: processedData.year,
    make: processedData.make,
    model: processedData.model,
    trim: bestTrim || (finalTrims[0]?.name || ''),
    engineCylinders: availableTrims[0]?.specs?.engine || formatEngineInfo(baseEngineInfo),
    transmission: availableTrims[0]?.specs?.transmission || "7-Speed Automatic",
    drivetrain: availableTrims[0]?.specs?.drivetrain || "AWD",
    availableTrims: availableTrims,
  };
}

function deduplicateTrims(trims: any[]) {
  const seenTrims = new Set();
  return trims.filter(trim => {
    const key = `${trim.name}|${trim.description}`;
    if (seenTrims.has(key)) {
      return false;
    }
    seenTrims.add(key);
    return true;
  });
}

function formatTrimsWithSpecs(trims: any[], vehicleData: CarApiResult, baseEngineInfo: any) {
  return trims.map((trim) => {
    const engineDesc = trim.description?.match(/\(([\d.]+L\s+\d+cyl(?:\s+Turbo)?)[^)]*\)/i)?.[1] || 
      formatEngineInfo(baseEngineInfo);

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
}
