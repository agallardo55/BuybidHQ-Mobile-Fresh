
import { CarApiTrim } from "./types.ts";

export function findBestTrimMatch(trims: CarApiTrim[] | undefined, year: number): string {
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

  // First, try to find a trim that includes both name and description
  const bestMatch = yearMatches.find(trim => trim.description);
  if (bestMatch) {
    const fullTrimName = `${bestMatch.name} ${bestMatch.description.split('(')[0].trim()}`;
    console.log(`Selected full trim name: ${fullTrimName}`);
    return fullTrimName;
  }

  // If no description is available, just use the name
  if (yearMatches.length > 0) {
    console.log(`Using simple trim name: ${yearMatches[0].name}`);
    return yearMatches[0].name;
  }

  console.log('No matching trim found');
  return '';
}
