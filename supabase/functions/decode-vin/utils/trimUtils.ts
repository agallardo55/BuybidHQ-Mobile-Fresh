
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

  // For Porsche GTS models
  const gtsMatch = trimsToCheck.find(trim => {
    const isGTS = trim.name.includes('GTS');
    const matchesEngine = matchesEngineSpecs(trim.description, specs);
    
    console.log(`Checking trim "${trim.name}" (${trim.description}):`, {
      isGTS,
      matchesEngine,
      engineSpecs: specs
    });

    return isGTS && matchesEngine;
  });

  if (gtsMatch) {
    console.log('Found matching GTS trim:', gtsMatch);
    return 'GTS';
  }

  // If no GTS match found, try to find any trim matching engine specs
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

// New function to clean engine description
export function cleanEngineDescription(engine: string): string {
  if (!engine) return "";
  
  // Remove transmission speed references (e.g., "7AM", "8A")
  return engine.replace(/\s+\d+[A-Z]+$/, '').trim();
}
