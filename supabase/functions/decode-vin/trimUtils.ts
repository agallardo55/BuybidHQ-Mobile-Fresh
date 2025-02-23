
import { CarApiTrim } from "./types.ts";

interface TrimConfiguration {
  cab?: string;
  bedLength?: string;
  drivetrain?: string;
  engine?: string;
}

function extractTrimConfiguration(description: string): TrimConfiguration {
  const config: TrimConfiguration = {};
  
  // Extract cab style
  const cabMatch = description.match(/(SuperCrew|SuperCab|Regular Cab)/i);
  if (cabMatch) config.cab = cabMatch[1];
  
  // Extract bed length
  const bedMatch = description.match(/(\d+\.?\d*)\s*ft\.\s*(?:SB|LB)/i);
  if (bedMatch) config.bedLength = `${bedMatch[1]}ft`;
  
  // Extract drivetrain
  const drivetrainMatch = description.match(/(4WD|2WD|AWD|RWD)/i);
  if (drivetrainMatch) config.drivetrain = drivetrainMatch[1];
  
  // Extract engine
  const engineMatch = description.match(/\(([\d.]+L\s*\d*cyl[^)]*)\)/i);
  if (engineMatch) config.engine = engineMatch[1];
  
  return config;
}

function formatTrimDisplay(name: string, config: TrimConfiguration): string {
  const parts = [name];
  
  if (config.cab) parts.push(config.cab);
  if (config.bedLength) parts.push(config.bedLength);
  if (config.drivetrain) parts.push(config.drivetrain);
  
  return parts.join(' ');
}

function findMatchingPorscheTrim(trims: CarApiTrim[], engineSpecs: { displacement?: string; cylinders?: string }): CarApiTrim | null {
  // For Porsche Macan GTS, look for:
  // - 3.0L engine
  // - 6 cylinders
  // - GTS trim name
  return trims.find(trim => {
    const engineInfo = trim.description?.match(/\((\d\.\d)L (\d)cyl/);
    if (engineInfo) {
      const [, displacement, cylinders] = engineInfo;
      return trim.name === "GTS" && 
             displacement === engineSpecs.displacement && 
             cylinders === engineSpecs.cylinders;
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
        name: displayName, // Update the name to include configuration
      });
    }
  });

  // Convert back to array
  const processedTrims = Array.from(uniqueTrims.values());
  console.log('Processed unique trims:', processedTrims);

  // For Porsche vehicles, use specific matching logic
  if (specs) {
    const engineSpecs = {
      displacement: specs.displacement_l,
      cylinders: specs.engine_number_of_cylinders
    };
    console.log('Matching Porsche trim with engine specs:', engineSpecs);
    
    const matchingTrim = findMatchingPorscheTrim(processedTrims, engineSpecs);
    if (matchingTrim) {
      console.log('Found matching Porsche trim:', matchingTrim);
      return matchingTrim.name;
    }
  }

  // If no specific match found, return the first trim
  const bestMatch = processedTrims[0];
  if (bestMatch) {
    console.log('Selected best match trim:', bestMatch);
    return bestMatch.name;
  }

  console.log('No matching trim found, using empty string');
  return '';
}
