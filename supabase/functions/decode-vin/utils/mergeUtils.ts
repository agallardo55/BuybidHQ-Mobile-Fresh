
import { VehicleData, CarApiData } from "../types.ts";
import { findBestTrimMatch } from "./trimUtils.ts";

export function mergeVehicleData(
  nhtsaData: VehicleData,
  carApiData: CarApiData
): VehicleData {
  console.log('Merging vehicle data:', { 
    nhtsaData, 
    carApiData: {
      ...carApiData,
      trims: carApiData?.trims?.map(t => ({
        name: t.name,
        description: t.description,
        year: t.year
      }))
    }
  });

  const mergedData: VehicleData = {
    ...nhtsaData,
    availableTrims: []
  };

  if (carApiData) {
    // Basic vehicle info
    if (carApiData.year) mergedData.year = carApiData.year.toString();
    if (carApiData.make) mergedData.make = carApiData.make;
    if (carApiData.model) mergedData.model = carApiData.model;

    // Process trims
    if (carApiData.trims && carApiData.trims.length > 0) {
      console.log('Processing CarAPI trims for merge');
      
      // Get unique trim names and create TrimOptions
      const uniqueTrims = [...new Set(carApiData.trims.map(trim => trim.name))];
      mergedData.availableTrims = uniqueTrims.map(trimName => {
        const trim = carApiData.trims.find(t => t.name === trimName);
        return {
          name: trimName,
          description: trim?.description || '',
          specs: carApiData.specs ? {
            engine: `${carApiData.specs.displacement_l}L ${carApiData.specs.engine_number_of_cylinders}-Cylinder${carApiData.specs.turbo ? ' Turbo' : ''}`,
            transmission: carApiData.specs.transmission,
            drivetrain: carApiData.specs.drive_type
          } : undefined
        };
      });

      const bestTrim = findBestTrimMatch(
        carApiData.trims,
        mergedData.year,
        carApiData.specs
      );
      
      if (bestTrim) {
        console.log('Using CarAPI trim:', bestTrim);
        mergedData.trim = bestTrim;
      } else {
        console.log('Keeping NHTSA trim:', mergedData.trim);
      }
    }

    // Engine and transmission specs
    if (carApiData.specs) {
      const { specs } = carApiData;

      if (specs.engine_number_of_cylinders) {
        const cylinders = specs.engine_number_of_cylinders;
        const displacement = specs.displacement_l;
        const turbo = specs.turbo ? ' Turbo' : '';
        
        mergedData.engineCylinders = `${displacement}L ${cylinders}-Cylinder${turbo}`.trim();
        console.log('Set engine cylinders:', mergedData.engineCylinders);
      }

      if (specs.transmission) {
        mergedData.transmission = specs.transmission;
        console.log('Set transmission:', mergedData.transmission);
      }

      if (specs.drive_type) {
        mergedData.drivetrain = specs.drive_type;
        console.log('Set drivetrain:', mergedData.drivetrain);
      }
    }
  }

  console.log('Final merged vehicle data:', mergedData);
  return mergedData;
}
