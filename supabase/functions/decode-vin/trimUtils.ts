
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
    // Fallback to all trims if no year matches
    yearMatches = trims;
  }

  // Common trim level patterns in order of preference
  const trimPatterns = [
    // Performance/Luxury trims
    /^(GTS|GT|RS|AMG|M|Type[ -]?R|Type[ -]?S|F[ -]?SPORT)/i,
    // Sport/Premium trims
    /^(Sport|S[ -]?Line|R[ -]?Line|M[ -]?Sport|F[ -]?Sport)/i,
    // Luxury trims
    /^(Premium|Luxury|Limited|Platinum|Executive)/i,
    // Base trims with qualifiers
    /^(SE[ -]?L|SE|LE|XLE|XSE)/i,
    // Basic trims
    /^(Base|Standard|L|S|EX)/i
  ];

  // Try to find a match using trim patterns
  for (const pattern of trimPatterns) {
    const match = yearMatches.find(trim => pattern.test(trim.name));
    if (match) {
      console.log(`Found matching trim using pattern ${pattern}:`, match.name);
      return match.name;
    }
  }

  // If no patterns match, return the first trim
  console.log(`No preferred trim found, using first available: ${yearMatches[0].name}`);
  return yearMatches[0].name;
}
