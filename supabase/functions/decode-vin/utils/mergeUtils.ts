
import { VehicleData, CarApiData } from "../types.ts";
import { handlePorscheSpecifics } from "./porscheUtils.ts";

export function mergeVehicleData(nhtsaData: VehicleData, carApiData: CarApiData | null): VehicleData {
  console.log('Merging vehicle data:');
  console.log('NHTSA data:', nhtsaData);
  console.log('CarAPI data:', carApiData);

  const mergedData: VehicleData = {
    year: '',
    make: '',
    model: '',
    trim: '',
    engineCylinders: '',
    transmission: '',
    drivetrain: ''
  };

  // Start with NHTSA data as base
  Object.assign(mergedData, nhtsaData);

  // Handle Porsche models specifically when CarAPI data isn't available
  if (mergedData.make === 'PORSCHE') {
    console.log('Processing Porsche vehicle data');
    handlePorscheSpecifics(mergedData);
  }

  // Enhance with CarAPI data if available
  if (carApiData) {
    const year = parseInt(carApiData.year?.toString() || nhtsaData.year || '');
    console.log('Processing vehicle data with year:', year);
    
    // Year: Use CarAPI if available
    if (carApiData.year) {
      mergedData.year = carApiData.year.toString();
    }

    // Make: Prefer CarAPI if available
    if (carApiData.make) {
      mergedData.make = carApiData.make;
    }

    // Model: Prefer CarAPI if available
    if (carApiData.model) {
      mergedData.model = carApiData.model;
    }

    // Trim: Use best match from CarAPI trims if available
    if (carApiData.trims && carApiData.trims.length > 0) {
      console.log('Found CarAPI trims:', carApiData.trims);
      const bestTrim = findBestTrimMatch(carApiData.trims, year, carApiData.specs);
      if (bestTrim) {
        console.log('Using CarAPI trim:', bestTrim);
        mergedData.trim = bestTrim;
      } else {
        console.log('Keeping NHTSA trim:', mergedData.trim);
      }
    }

    if (carApiData.specs) {
      mergeEngineData(mergedData, carApiData);
      mergeTransmissionData(mergedData, carApiData);
      mergeDrivetrainData(mergedData, carApiData);
    }
  }

  // Clean up any remaining empty strings with default values
  Object.keys(mergedData).forEach(key => {
    if (!mergedData[key]) {
      mergedData[key] = 'N/A';
      console.log(`Setting default value for ${key}: N/A`);
    }
  });

  console.log('Final merged data:', mergedData);
  return mergedData;
}

function mergeEngineData(mergedData: VehicleData, carApiData: CarApiData) {
  const engineParts = [];
  
  // Add displacement
  if (carApiData.specs?.displacement_l) {
    engineParts.push(`${carApiData.specs.displacement_l}L`);
  }
  
  // Add cylinder count
  if (carApiData.specs?.engine_number_of_cylinders) {
    engineParts.push(`${carApiData.specs.engine_number_of_cylinders}-Cylinder`);
  }
  
  // Add turbo information from either source
  const isTurbo = carApiData.specs?.turbo === 'Yes' || 
                 (carApiData.trims && carApiData.trims.some(t => 
                   t.description?.toLowerCase().includes('turbo')));
  if (isTurbo) {
    engineParts.push('Turbo');
  }
  
  const engineString = engineParts.join(' ');
  if (engineString) {
    mergedData.engineCylinders = engineString;
    console.log('Set engine string:', engineString);
  }
}

function mergeTransmissionData(mergedData: VehicleData, carApiData: CarApiData) {
  if (carApiData.specs?.transmission_style && carApiData.specs?.transmission_speeds) {
    mergedData.transmission = `${carApiData.specs.transmission_speeds}-Speed ${carApiData.specs.transmission_style}`;
    console.log('Set transmission:', mergedData.transmission);
  }
}

function mergeDrivetrainData(mergedData: VehicleData, carApiData: CarApiData) {
  if (carApiData.specs?.drive_type) {
    mergedData.drivetrain = carApiData.specs.drive_type;
    console.log('Set drivetrain:', mergedData.drivetrain);
  }
}
