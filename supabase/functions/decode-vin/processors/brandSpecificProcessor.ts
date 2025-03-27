
import { CarApiResult } from "../types.ts";

export function fixMercedesBenzData(vehicleData: CarApiResult): CarApiResult {
  // Make a shallow copy to avoid mutating the original
  const processedData = { ...vehicleData };
  
  // Special handling for Mercedes-Benz ML-Class
  if (processedData.make?.toUpperCase() === 'MERCEDES-BENZ' && processedData.model?.includes('ML')) {
    // Add default trim if none available
    if (!processedData.trims || processedData.trims.length === 0) {
      processedData.trims = [{
        name: 'ML350',
        description: 'ML350 4dr SUV AWD (3.5L 6cyl 7A)',
        year: Number(processedData.year)
      }];
    }

    // Set default transmission if missing
    if (!processedData.specs?.transmission_speeds || !processedData.specs?.transmission_style) {
      processedData.specs = {
        ...processedData.specs,
        transmission_speeds: '7',
        transmission_style: 'Automatic'
      };
    }

    // Set default drive type if missing
    if (!processedData.specs?.drive_type) {
      processedData.specs = {
        ...processedData.specs || {},
        drive_type: 'AWD'
      };
    }
  }
  
  return processedData;
}
