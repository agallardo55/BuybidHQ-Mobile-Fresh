
import { CarApiTrim } from "./types.ts";

interface TrimConfiguration {
  cab?: string;
  bedLength?: string;
  drivetrain?: string;
  engine?: string;
}

interface GT3RSSpecs {
  displacement?: string;
  cylinders?: string;
  bodyClass?: string;
  doors?: string;
  trim?: string;
}

function isGT3RSSpecMatch(specs: GT3RSSpecs): boolean {
  // Check for GT3 RS specific criteria
  const isCorrectDisplacement = specs.displacement === "4" || specs.displacement === "4.0";
  const isCorrectCylinders = specs.cylinders === "6";
  const isCoupe = specs.bodyClass?.toLowerCase().includes('coupe');
  const isTwoDoor = specs.doors === "2";
  const isRSTrim = specs.trim?.toUpperCase().includes('RS');

  const match = isCorrectDisplacement && isCorrectCylinders && isCoupe && isTwoDoor && isRSTrim;
  
  if (match) {
    console.log('Found matching GT3 RS specs:', specs);
  }
  
  return match;
}

function isGT3Model(trim: CarApiTrim, specs?: any): boolean {
  // First check if it's explicitly marked as GT3
  const nameContainsGT3 = trim.name?.toUpperCase().includes('GT3');
  const descContainsGT3 = trim.description?.toUpperCase().includes('GT3');

  // For GT3 RS specific checks
  if ((nameContainsGT3 || descContainsGT3) && specs) {
    // Check displacement to differentiate between GT3 variants
    const isGT3RS = isGT3RSSpecMatch({
      displacement: specs.displacement_l,
      cylinders: specs.engine_number_of_cylinders,
      bodyClass: specs.body_class,
      doors: specs.doors,
      trim: trim.name
    });

    if (isGT3RS) {
      console.log('Confirmed GT3 RS model:', { trim, specs });
      return true;
    }
  }

  // For regular GT3 detection
  if (nameContainsGT3 || descContainsGT3) {
    console.log('Found GT3 model:', trim);
    return true;
  }

  return false;
}

function isTurboModel(trim: CarApiTrim): boolean {
  const name = trim.name?.toUpperCase() || '';
  const desc = trim.description?.toUpperCase() || '';
  return name.includes('TURBO') || desc.includes('TURBO');
}

function findMatchingPorscheTrim(trims: CarApiTrim[], specs: any): CarApiTrim | null {
  console.log('Finding Porsche trim with specs:', specs);
  console.log('Available trims:', trims);

  // First, explicitly look for GT3 RS
  for (const trim of trims) {
    // Check if it's marked as RS and meets GT3 RS specifications
    if (trim.name?.toUpperCase().includes('RS') && 
        !isTurboModel(trim) && // Exclude Turbo models
        isGT3RSSpecMatch({
          displacement: specs.displacement_l,
          cylinders: specs.engine_number_of_cylinders,
          bodyClass: specs.body_class,
          doors: specs.doors,
          trim: trim.name
        })) {
      console.log('Found GT3 RS match:', trim);
      // Override the name if needed
      trim.name = 'GT3 RS';
      return trim;
    }
  }

  // Then look for explicitly labeled GT3 models
  const gt3Match = trims.find(trim => isGT3Model(trim, specs));
  if (gt3Match) {
    return gt3Match;
  }

  // Look for RS models that might be GT3 RS but not properly labeled
  const rsMatch = trims.find(trim => {
    const isRS = trim.name?.toUpperCase().includes('RS');
    const isNotTurbo = !isTurboModel(trim);
    const meetsSpecs = isGT3RSSpecMatch({
      displacement: specs.displacement_l,
      cylinders: specs.engine_number_of_cylinders,
      bodyClass: specs.body_class,
      doors: specs.doors,
      trim: trim.name
    });

    if (isRS && isNotTurbo && meetsSpecs) {
      console.log('Found potential GT3 RS (unlabeled):', trim);
      return true;
    }
    return false;
  });

  if (rsMatch) {
    // Override the name to GT3 RS since it meets all criteria
    rsMatch.name = 'GT3 RS';
    console.log('Reclassified as GT3 RS:', rsMatch);
    return rsMatch;
  }

  // If no GT3/RS model found, look for other GT models
  const gtMatch = trims.find(trim => {
    const isGTModel = trim.name?.includes('GT') || trim.description?.includes('GT');
    const isNotTurbo = !isTurboModel(trim);
    if (isGTModel && isNotTurbo) {
      console.log('Found GT model:', trim);
      return true;
    }
    return false;
  });

  if (gtMatch) {
    return gtMatch;
  }

  // Finally, fallback to engine matching for GTS models
  return trims.find(trim => {
    if (trim.name !== 'GTS') return false;
    
    const engineInfo = trim.description?.match(/\((\d\.\d)L (\d)cyl/);
    if (engineInfo) {
      const [, displacement, cylinders] = engineInfo;
      const match = displacement === specs.displacement_l && 
                   cylinders === specs.engine_number_of_cylinders;
      if (match) {
        console.log('Found engine spec match:', trim);
      }
      return match;
    }
    return false;
  }) || null;
}

export function findBestTrimMatch(trims: CarApiTrim[] | undefined, year: number, specs?: any): string {
  if (!trims || trims.length === 0) {
    console.log('No trims available for matching');
    return '';
  }
  
  // Allow for slight year variations (e.g., early/late production)
  let yearMatches = trims.filter(trim => Math.abs(trim.year - year) <= 1);
  console.log(`Found ${yearMatches.length} trims matching year ${year}:`, yearMatches);

  if (yearMatches.length === 0) {
    console.log('No trims match the vehicle year, using all trims');
    yearMatches = trims;
  }

  // For Porsche vehicles, prioritize GT and RS models
  if (specs?.make?.toLowerCase() === 'porsche') {
    const matchingTrim = findMatchingPorscheTrim(yearMatches, specs);
    if (matchingTrim) {
      console.log('Found matching Porsche trim:', matchingTrim);
      return matchingTrim.name;
    }
  }

  // Create a map to deduplicate trims based on full configuration
  const uniqueTrims = new Map<string, CarApiTrim>();
  
  yearMatches.forEach(trim => {
    const config = extractTrimConfiguration(trim.description || '');
    const displayName = formatTrimDisplay(trim.name, config);
    
    // Use the full configuration as the key to prevent duplicates
    const key = `${displayName}-${config.engine || ''}`;
    
    if (!uniqueTrims.has(key)) {
      uniqueTrims.set(key, {
        ...trim,
        name: displayName,
      });
    }
  });

  // Convert back to array
  const processedTrims = Array.from(uniqueTrims.values());
  console.log('Processed unique trims:', processedTrims);

  // If no specific match found, return the first trim
  const bestMatch = processedTrims[0];
  if (bestMatch) {
    console.log('Selected best match trim:', bestMatch);
    return bestMatch.name;
  }

  console.log('No matching trim found, using empty string');
  return '';
}
