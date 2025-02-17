
import { VehicleData, CarApiData } from "../types.ts";
import { findBestTrimMatch } from "./trimUtils.ts";

export function mergeVehicleData(
  nhtsaData: VehicleData,
  carApiData: CarApiData
): VehicleData {
  console.log('Merging vehicle data:', { nhtsaData, carApiData });

  const mergedData: VehicleData = {
    ...nhtsaData,
  };

  // Use CarAPI data if available
  if (carApiData) {
    // Basic vehicle info
    if (carApiData.year) mergedData.year = carApiData.year.toString();
    if (carApiData.make) mergedData.make = carApiData.make;
    if (carApiData.model) mergedData.model = carApiData.model;

    // Trim handling
    if (carApiData.trims && carApiData.trims.length > 0) {
      console.log('Found CarAPI trims:', carApiData.trims);
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

      // Engine cylinders
      if (specs.engine_number_of_cylinders) {
        const cylinders = specs.engine_number_of_cylinders;
        const displacement = specs.displacement_l;
        const turbo = specs.turbo ? ' Turbo' : '';
        
        mergedData.engineCylinders = `${displacement}L ${cylinders}-Cylinder${turbo}`.trim();
      }

      // Transmission
      if (specs.transmission) {
        mergedData.transmission = specs.transmission;
      }

      // Drivetrain
      if (specs.drive_type) {
        mergedData.drivetrain = specs.drive_type;
      }
    }
  }

  console.log('Merged vehicle data:', mergedData);
  return mergedData;
}
