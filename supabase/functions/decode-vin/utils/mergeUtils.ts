
import { VehicleData, CarApiData, TrimOption } from "../types.ts";

function findMatchingTrim(searchTrim: string, availableTrims: any[]): any {
  if (!availableTrims || availableTrims.length === 0) {
    console.log('No available trims to match against');
    return { name: searchTrim };
  }

  console.log('Searching for trim match:', { searchTrim, availableTrims });
  
  // Try to find an exact match first
  const exactMatch = availableTrims.find(trim => 
    trim.name.toLowerCase() === searchTrim.toLowerCase()
  );

  if (exactMatch) {
    console.log('Found exact trim match:', exactMatch);
    return exactMatch;
  }

  // If no exact match, try to find a partial match
  const partialMatch = availableTrims.find(trim => 
    trim.name.toLowerCase().includes(searchTrim.toLowerCase()) ||
    searchTrim.toLowerCase().includes(trim.name.toLowerCase())
  );

  if (partialMatch) {
    console.log('Found partial trim match:', partialMatch);
    return partialMatch;
  }

  // If no match found, return first trim or original
  console.log('No trim match found, using first available trim');
  return availableTrims[0] || { name: searchTrim };
}

function getEngineDetails(nhtsaData: VehicleData, trimSpecs: any): string {
  if (!trimSpecs || !trimSpecs.engine) {
    return nhtsaData.engineCylinders || '';
  }

  // Use trim-specific engine details if available
  console.log('Using trim-specific engine details:', trimSpecs.engine);
  return trimSpecs.engine;
}

function getTransmission(nhtsaTransmission: string, trimTransmission: string): string {
  // Prefer trim-specific transmission info if available
  if (trimTransmission) {
    console.log('Using trim-specific transmission:', trimTransmission);
    return trimTransmission;
  }
  return nhtsaTransmission || '';
}

function formatDrivetrain(drivetrain: string): string {
  if (!drivetrain) return '';
  
  // Normalize common drivetrain terms
  const normalized = drivetrain.toLowerCase();
  if (normalized.includes('awd') || normalized.includes('all-wheel')) {
    return 'AWD';
  }
  if (normalized.includes('fwd') || normalized.includes('front-wheel')) {
    return 'FWD';
  }
  if (normalized.includes('rwd') || normalized.includes('rear-wheel')) {
    return 'RWD';
  }
  
  return drivetrain;
}

function getAvailableTrims(trims: any[]): TrimOption[] {
  if (!trims || !Array.isArray(trims)) {
    console.log('No trims available');
    return [];
  }

  return trims.map(trim => ({
    name: trim.name || '',
    description: trim.description || '',
    specs: {
      engine: trim.specs?.engine || '',
      transmission: trim.specs?.transmission || '',
      drivetrain: trim.specs?.drivetrain || ''
    }
  }));
}

export function mergeVehicleData(
  nhtsaData: VehicleData,
  carApiData: CarApiData
): VehicleData | null {
  if (!nhtsaData || !carApiData) {
    console.error("Missing input data");
    return null;
  }

  console.log('Starting merge with data:', { nhtsaData, carApiData });

  const bestTrim = findMatchingTrim(nhtsaData.trim, carApiData.trims);
  
  const mergedData: VehicleData = {
    year: nhtsaData.year,
    make: nhtsaData.make,
    model: nhtsaData.model,
    trim: bestTrim.name,
    engineCylinders: getEngineDetails(nhtsaData, bestTrim.specs),
    transmission: getTransmission(nhtsaData.transmission, bestTrim.specs?.transmission),
    drivetrain: formatDrivetrain(nhtsaData.drivetrain),
    availableTrims: getAvailableTrims(carApiData.trims)
  };

  console.log('Final merged data:', mergedData);
  return mergedData;
}
