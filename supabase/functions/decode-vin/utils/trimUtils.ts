
import { CarApiTrim } from "../types.ts";

export function cleanTrimValue(trim: string): string {
  if (!trim) return "";
  
  let cleaned = trim
    .replace(/^(trim:|series:|style:)/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove ellipsis and trailing dots
  cleaned = cleaned.replace(/\.{3,}|\.+$/g, '').trim();
  
  // Remove parenthetical content
  cleaned = cleaned.replace(/\([^)]*\)/g, '').trim();
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
  if (!trims || trims.length === 0) {
    console.log('No trims available for matching');
    return null;
  }

  console.log('Finding best trim match with:', {
    year,
    specs,
    availableTrims: trims.map(t => ({ name: t.name, description: t.description, year: t.year }))
  });
  
  // First try to find an exact year match
  const yearMatches = trims.filter(trim => trim.year === Number(year));
  console.log(`Found ${yearMatches.length} trims matching year ${year}`);
  
  const trimsToCheck = yearMatches.length > 0 ? yearMatches : trims;

  // For performance models (like EVO)
  const performanceMatch = trimsToCheck.find(trim => {
    const isPerfModel = trim.name.includes('EVO') || trim.name.includes('Performance');
    const matchesEngine = matchesEngineSpecs(trim.description, specs);
    
    console.log(`Checking trim "${trim.name}" (${trim.description}):`, {
      isPerfModel,
      matchesEngine,
      engineSpecs: specs
    });

    return isPerfModel && matchesEngine;
  });

  if (performanceMatch) {
    console.log('Found matching performance trim:', performanceMatch);
    return cleanTrimValue(performanceMatch.name);
  }

  // If no performance match found, try to find any trim matching engine specs
  const engineMatch = trimsToCheck.find(trim => 
    matchesEngineSpecs(trim.description, specs)
  );

  if (engineMatch) {
    console.log('Found engine spec match:', engineMatch);
    return cleanTrimValue(engineMatch.name);
  }

  // Default to first available trim if no matches found
  console.log('No specific matches found, using first available trim');
  return cleanTrimValue(trimsToCheck[0].name);
}

function matchesEngineSpecs(
  description: string,
  specs?: {
    displacement_l?: string;
    engine_number_of_cylinders?: string;
  }
): boolean {
  if (!specs) return false;

  const desc = description?.toLowerCase() || '';
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
