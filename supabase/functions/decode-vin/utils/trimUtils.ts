
import { CarApiTrim } from "../types.ts";

export function cleanTrimValue(trim: string): string {
  if (!trim) return "";
  
  // Remove common prefixes and suffixes
  let cleaned = trim
    .replace(/^(trim:|series:|style:)/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove parenthetical content
  cleaned = cleaned.replace(/\([^)]*\)/g, '').trim();

  // Remove special characters
  cleaned = cleaned.replace(/[^\w\s-]/g, '').trim();

  console.log(`Cleaned trim value: "${trim}" -> "${cleaned}"`);
  return cleaned;
}

export function findBestTrimMatch(
  trims: CarApiTrim[],
  year: string | number,
  specs?: {
    displacement_l?: string;
    engine_number_of_cylinders?: string;
  }
): string | null {
  if (!trims || trims.length === 0) return null;

  console.log('Finding best trim match from:', trims);
  
  // First try to find an exact year match
  const yearMatches = trims.filter(trim => trim.year === Number(year));
  
  if (yearMatches.length > 0) {
    console.log('Found year matches:', yearMatches);
    // If we have engine specs, try to match those
    if (specs?.displacement_l || specs?.engine_number_of_cylinders) {
      const engineMatch = yearMatches.find(trim => {
        const description = trim.description.toLowerCase();
        return (
          (specs.displacement_l && description.includes(specs.displacement_l)) ||
          (specs.engine_number_of_cylinders && 
           description.includes(specs.engine_number_of_cylinders))
        );
      });
      
      if (engineMatch) {
        console.log('Found engine spec match:', engineMatch);
        return engineMatch.name;
      }
    }
    
    // If no engine match or no specs, return the first year match
    return yearMatches[0].name;
  }
  
  // If no year matches, try adjacent years
  const targetYear = Number(year);
  const closestTrim = trims.reduce((closest, current) => {
    const currentDiff = Math.abs(current.year - targetYear);
    const closestDiff = closest ? Math.abs(closest.year - targetYear) : Infinity;
    return currentDiff < closestDiff ? current : closest;
  });

  console.log('Using closest year match:', closestTrim);
  return closestTrim?.name || null;
}

export function findMatchingPorscheTrim(
  trims: CarApiTrim[],
  displacement?: string,
  cylinders?: string
): string | null {
  if (!trims || trims.length === 0) return null;

  // Look for GTS trim specifically
  const gtsMatch = trims.find(trim => 
    trim.name.includes('GTS') &&
    matchesEngineSpecs(trim.description, displacement, cylinders)
  );

  if (gtsMatch) {
    console.log('Found GTS trim match:', gtsMatch);
    return gtsMatch.name;
  }

  // Look for any trim that matches engine specs
  const engineMatch = trims.find(trim =>
    matchesEngineSpecs(trim.description, displacement, cylinders)
  );

  if (engineMatch) {
    console.log('Found engine spec match:', engineMatch);
    return engineMatch.name;
  }

  // Default to first trim if no matches found
  console.log('No specific matches found, using first trim:', trims[0]);
  return trims[0].name;
}

function matchesEngineSpecs(
  description: string,
  displacement?: string,
  cylinders?: string
): boolean {
  const desc = description.toLowerCase();
  
  if (displacement && !desc.includes(displacement.toLowerCase())) {
    return false;
  }
  
  if (cylinders && !desc.includes(cylinders.toLowerCase())) {
    return false;
  }
  
  return true;
}
