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
    displacement_l?: string;
    engine_number_of_cylinders?: string;
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

  // Deduplicate trims based on unique combinations of name and description
  const uniqueTrims = deduplicateTrims(trims);
  console.log('Deduplicated trims:', uniqueTrims);
  
  // First try to find an exact year match
  const yearMatches = uniqueTrims.filter(trim => trim.year === Number(year));
  console.log(`Found ${yearMatches.length} trims matching year ${year}`);
  
  const trimsToCheck = yearMatches.length > 0 ? yearMatches : uniqueTrims;

  // For performance models (like Turbo variants)
  const performanceMatch = findPerformanceMatch(trimsToCheck, specs);
  if (performanceMatch) {
    console.log('Found matching performance trim:', performanceMatch);
    return performanceMatch.name;
  }

  // If no performance match found, try to find any trim matching engine specs
  const engineMatch = trimsToCheck.find(trim => 
    matchesEngineSpecs(trim.description, specs)
  );

  if (engineMatch) {
    console.log('Found engine spec match:', engineMatch);
    return getFullTrimName(engineMatch);
  }

  // Default to first available trim if no matches found
  console.log('No specific matches found, using first available trim');
  return getFullTrimName(trimsToCheck[0]);
}

function deduplicateTrims(trims: CarApiTrim[]): CarApiTrim[] {
  const seen = new Set<string>();
  return trims.filter(trim => {
    // Create a unique key combining name and relevant description parts
    const key = `${trim.name}|${extractTrimVariant(trim.description)}`;
    if (seen.has(key)) {
      console.log(`Removing duplicate trim: ${key}`);
      return false;
    }
    seen.add(key);
    return true;
  });
}

function findPerformanceMatch(trims: CarApiTrim[], specs?: any): CarApiTrim | null {
  return trims.find(trim => {
    const isPerformance = isPerformanceModel(trim);
    const matchesEngine = matchesEngineSpecs(trim.description, specs);
    
    console.log(`Checking performance trim "${trim.name}":`, {
      isPerformance,
      matchesEngine,
      specs
    });

    return isPerformance && matchesEngine;
  }) || null;
}

function isPerformanceModel(trim: CarApiTrim): boolean {
  const name = trim.name.toLowerCase();
  const desc = trim.description?.toLowerCase() || '';
  return (
    name.includes('turbo') ||
    name.includes('gt') ||
    desc.includes('turbo') ||
    desc.includes('gt')
  );
}

function extractTrimVariant(description: string | undefined): string {
  if (!description) return '';
  
  // Extract specific trim variant from description
  const variants = description.match(/^([^(]+?)(?:\s*\(|$)/);
  return variants ? variants[1].trim() : '';
}

function getFullTrimName(trim: CarApiTrim): string {
  const variant = extractTrimVariant(trim.description);
  if (variant && variant !== trim.name) {
    return variant;
  }
  return trim.name;
}

function matchesEngineSpecs(
  description: string | undefined,
  specs?: {
    displacement_l?: string;
    engine_number_of_cylinders?: string;
  }
): boolean {
  if (!specs || !description) return false;

  const desc = description.toLowerCase();
  console.log('Matching engine specs for description:', desc);

  let matches = true;

  if (specs.displacement_l) {
    const displacementMatch = desc.includes(specs.displacement_l.toLowerCase() + 'l') ||
                             desc.includes(specs.displacement_l.toLowerCase() + ' l');
    console.log(`Displacement match (${specs.displacement_l}L):`, displacementMatch);
    matches = matches && displacementMatch;
  }

  if (specs.engine_number_of_cylinders) {
    const cylinderMatch = desc.includes(specs.engine_number_of_cylinders + ' cyl') ||
                         desc.includes(specs.engine_number_of_cylinders + '-cyl');
    console.log(`Cylinder match (${specs.engine_number_of_cylinders} cyl):`, cylinderMatch);
    matches = matches && cylinderMatch;
  }

  return matches;
}

export function cleanEngineDescription(engine: string): string {
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
