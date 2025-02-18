
import { VehicleData, CarApiData } from "../types.ts";
import { findBestTrimMatch } from "./trimUtils.ts";

export function mergeVehicleData(
  nhtsaData: VehicleData,
  carApiData: CarApiData
): VehicleData {
  console.log('Starting merge with NHTSA data:', JSON.stringify(nhtsaData));
  console.log('Starting merge with CarAPI data:', JSON.stringify({
    ...carApiData,
    trims: carApiData?.trims?.map(t => ({
      name: t.name,
      description: t.description
    }))
  }));

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
      console.log('Processing CarAPI trims:', JSON.stringify(carApiData.trims));
      
      mergedData.availableTrims = carApiData.trims.map(trim => {
        const trimOption = {
          name: trim.name,
          description: trim.description,
          specs: trim.specs
        };
        console.log('Created trim option:', JSON.stringify(trimOption));
        return trimOption;
      });

      // Find best matching trim
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
    } else {
      console.log('No trims available from CarAPI');
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

  console.log('Final merged vehicle data:', JSON.stringify(mergedData));
  return mergedData;
}
