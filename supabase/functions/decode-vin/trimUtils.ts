
import { CarApiTrim } from "./types.ts";

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

  // Log all available trim options for debugging
  yearMatches.forEach(trim => {
    console.log(`Available trim: ${trim.name} - ${trim.description}`);
  });

  // For Porsche vehicles, use specific matching logic
  if (specs) {
    const engineSpecs = {
      displacement: specs.displacement_l,
      cylinders: specs.engine_number_of_cylinders
    };
    console.log('Matching Porsche trim with engine specs:', engineSpecs);
    
    const matchingTrim = findMatchingPorscheTrim(yearMatches, engineSpecs);
    if (matchingTrim) {
      console.log('Found matching Porsche trim:', matchingTrim);
      // Extract the clean trim description without parenthetical details
      const trimDesc = matchingTrim.description?.split('(')[0].trim() || '';
      return `${matchingTrim.name} ${trimDesc}`;
    }
  }

  // If no specific match found, use the trim with matching engine specs
  const bestMatch = yearMatches.find(trim => {
    const engineInfo = trim.description?.match(/\((\d\.\d)L (\d)cyl/);
    return engineInfo && trim.description?.includes('3.0L 6cyl');
  });

  if (bestMatch) {
    console.log('Selected trim based on engine specs:', bestMatch);
    return `${bestMatch.name} ${bestMatch.description?.split('(')[0].trim() || ''}`;
  }

  // Fallback to GTS trim if available
  const gtsTrim = yearMatches.find(trim => trim.name === 'GTS');
  if (gtsTrim) {
    console.log('Falling back to GTS trim:', gtsTrim);
    return `${gtsTrim.name} ${gtsTrim.description?.split('(')[0].trim() || ''}`;
  }

  console.log('No matching trim found, using first available');
  return yearMatches[0].name;
}
