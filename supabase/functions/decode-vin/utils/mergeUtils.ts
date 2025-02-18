
import { VehicleData, CarApiData, TrimOption } from "../types.ts";

function findMatchingTrim(searchTrim: string, availableTrims: any[]): any {
  if (!availableTrims || availableTrims.length === 0) {
    console.log('No available trims to match against');
    return { name: searchTrim };
  }

  console.log('Searching for trim match:', { searchTrim, availableTrims });
  
  // Normalize search trim
  const normalizedSearch = searchTrim.toLowerCase().replace(/\s+/g, '');
  
  // Try to find an exact match first (case-insensitive)
  const exactMatch = availableTrims.find(trim => {
    const normalizedTrim = (trim.name || '').toLowerCase().replace(/\s+/g, '');
    return normalizedTrim === normalizedSearch;
  });

  if (exactMatch) {
    console.log('Found exact trim match:', exactMatch);
    return exactMatch;
  }

  // If no exact match, try to find a partial match with more flexible comparison
  const partialMatch = availableTrims.find(trim => {
    const normalizedTrim = (trim.name || '').toLowerCase().replace(/\s+/g, '');
    const normalizedDesc = (trim.description || '').toLowerCase();
    
    return normalizedTrim.includes(normalizedSearch) ||
           normalizedSearch.includes(normalizedTrim) ||
           normalizedDesc.includes(normalizedSearch);
  });

  if (partialMatch) {
    console.log('Found partial trim match:', partialMatch);
    return partialMatch;
  }

  // If no match found, return first trim or original
  console.log('No trim match found, using first available trim');
  return availableTrims[0] || { name: searchTrim };
}

function getEngineDetails(nhtsaData: VehicleData, trimSpecs: any): string {
  // First try to use trim-specific engine details
  if (trimSpecs?.engine) {
    console.log('Using trim-specific engine details:', trimSpecs.engine);
    return trimSpecs.engine;
  }

  // If NHTSA data has engine info, use that
  if (nhtsaData.engineCylinders) {
    console.log('Using NHTSA engine details:', nhtsaData.engineCylinders);
    return nhtsaData.engineCylinders;
  }

  // Try to extract from trim description if available
  if (trimSpecs?.description) {
    const desc = trimSpecs.description.toLowerCase();
    const cylinderMatch = desc.match(/(\d+)[\s-]?cyl/);
    if (cylinderMatch) {
      const engineInfo = `${cylinderMatch[1]} Cylinder`;
      console.log('Extracted engine details from trim description:', engineInfo);
      return engineInfo;
    }
  }

  return '';
}

function getTransmission(nhtsaTransmission: string, trimTransmission: string): string {
  if (trimTransmission) {
    console.log('Using trim-specific transmission:', trimTransmission);
    return trimTransmission;
  }

  // Clean up and standardize NHTSA transmission
  if (nhtsaTransmission) {
    const trans = nhtsaTransmission.toLowerCase();
    if (trans.includes('automatic')) return 'Automatic';
    if (trans.includes('manual')) return 'Manual';
    if (trans.includes('cvt')) return 'CVT';
    return nhtsaTransmission;
  }

  return '';
}

function formatDrivetrain(drivetrain: string): string {
  if (!drivetrain) return '';
  
  const normalized = drivetrain.toLowerCase();
  
  // Map common drivetrain terms to standardized format
  const drivetrainMap: Record<string, string> = {
    'awd': 'AWD',
    'all-wheel': 'AWD',
    'all wheel': 'AWD',
    '4wd': 'AWD',
    '4x4': 'AWD',
    'fwd': 'FWD',
    'front-wheel': 'FWD',
    'front wheel': 'FWD',
    'rwd': 'RWD',
    'rear-wheel': 'RWD',
    'rear wheel': 'RWD',
    '2wd': 'RWD'
  };

  // Check each key in the map
  for (const [key, value] of Object.entries(drivetrainMap)) {
    if (normalized.includes(key)) {
      console.log(`Mapped drivetrain from "${drivetrain}" to "${value}"`);
      return value;
    }
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
    drivetrain: formatDrivetrain(bestTrim.specs?.drivetrain || nhtsaData.drivetrain),
    availableTrims: getAvailableTrims(carApiData.trims)
  };

  console.log('Final merged data:', mergedData);
  return mergedData;
}
