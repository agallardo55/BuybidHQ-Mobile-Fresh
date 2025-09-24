import { CarApiTrim } from "../types.ts";

export function cleanTrimValue(trim: string): string {
  if (!trim) return "";
  
  // Keep the full trim designation, including model variants
  const cleanedTrim = trim
    .replace(/^(trim:|series:|style:)/i, '')
    .replace(/\.{2,}/g, '')  // Remove ellipsis
    .replace(/\.$/, '')      // Remove trailing dot
    .trim();
  
  console.log(`Cleaned trim value: "${trim}" -> "${cleanedTrim}"`);
  return cleanedTrim;
}

export function findBestTrimMatch(
  trims: CarApiTrim[],
  year: string | number,
  specs?: {
    make?: string;
    displacement_l?: string;
    engine_number_of_cylinders?: string;
    body_class?: string;
    doors?: string;
  }
): string | null {
  if (!trims || trims.length === 0) {
    console.log('No trims available for matching');
    return null;
  }

  console.log('Finding best trim match with:', {
    year,
    specs,
    availableTrims: trims.map(t => ({ name: t.name, description: t.description, year: t.year }))
  });

  // Deduplicate trims based on exact name match
  const uniqueTrims = Array.from(new Map(trims.map(trim => [trim.name, trim])).values());
  console.log('Deduplicated trims:', uniqueTrims);
  
  // First try to find an exact year match
  const yearMatches = uniqueTrims.filter(trim => trim.year === Number(year));
  console.log(`Found ${yearMatches.length} trims matching year ${year}`);
  
  const trimsToCheck = yearMatches.length > 0 ? yearMatches : uniqueTrims;

  // Look for GT2 RS or other specific performance trims first
  const performanceMatch = trimsToCheck.find(trim => 
    trim.name.toLowerCase().includes('gt2') || 
    trim.name.toLowerCase().includes('gt3') ||
    trim.name.toLowerCase().includes('rs')
  );

  if (performanceMatch) {
    console.log('Found performance trim match:', performanceMatch);
    return performanceMatch.name;
  }

  // If no specific match found, return the first trim
  console.log('No specific match found, using first trim:', trimsToCheck[0]);
  return trimsToCheck[0]?.name || null;
}

function cleanEngineDescription(engine: string): string {
  if (!engine) return "";
  
  // Remove transmission speed references and clean up the format
  let cleaned = engine
    .replace(/\s+\d+[A-Z]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract and format the engine specs
  const parts = cleaned.match(/([\d.]+)\s*L\s*(\d+)\s*cyl(?:\s*Turbo)?/i);
  if (parts) {
    const [, displacement, cylinders] = parts;
    cleaned = `${displacement}L ${cylinders}cyl${cleaned.toLowerCase().includes('turbo') ? ' Turbo' : ''}`;
  }

  return cleaned;
}

// Export for use in other modules
export { cleanEngineDescription };
