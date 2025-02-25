
import { CarApiTrim } from "./types.ts";

interface GT3RSSpecs {
  displacement_l?: string;
  engine_number_of_cylinders?: string;
  body_class?: string;
  doors?: string;
}

function isGT3RSMatch(specs: GT3RSSpecs): boolean {
  const matches = {
    displacement: specs.displacement_l === "4" || specs.displacement_l === "4.0",
    cylinders: specs.engine_number_of_cylinders === "6",
    bodyClass: specs.body_class?.toLowerCase().includes('coupe'),
    doors: specs.doors === "2"
  };

  console.log('GT3 RS spec matching results:', matches);
  return Object.values(matches).every(match => match === true);
}

function findBestTrimMatch(trims: CarApiTrim[] | undefined, year: number, specs?: any): string {
  if (!trims || trims.length === 0) {
    console.log('No trims available for matching');
    return '';
  }

  // Only process Porsche vehicles
  if (specs?.make?.toLowerCase() !== 'porsche') {
    return trims[0]?.name || '';
  }

  console.log('Processing Porsche vehicle with specs:', specs);
  console.log('Available trims:', trims);

  // Check if this is a GT3 RS based on specs
  if (isGT3RSMatch(specs)) {
    console.log('Detected GT3 RS based on specifications');
    return 'GT3 RS';
  }

  // Look for GT3 RS in available trims
  const gt3rsMatch = trims.find(trim => {
    const name = trim.name?.toUpperCase() || '';
    const desc = trim.description?.toUpperCase() || '';
    return (name.includes('GT3') && name.includes('RS')) || 
           (desc.includes('GT3') && desc.includes('RS'));
  });

  if (gt3rsMatch) {
    console.log('Found GT3 RS in trim list:', gt3rsMatch);
    return 'GT3 RS';
  }

  // Look for GT3 models
  const gt3Match = trims.find(trim => {
    const name = trim.name?.toUpperCase() || '';
    const desc = trim.description?.toUpperCase() || '';
    return name.includes('GT3') || desc.includes('GT3');
  });

  if (gt3Match) {
    console.log('Found GT3 model:', gt3Match);
    return gt3Match.name;
  }

  // Filter out any duplicates and sort by name
  const uniqueTrims = Array.from(new Set(trims.map(trim => trim.name)))
    .filter(Boolean)
    .sort();

  console.log('Unique available trims:', uniqueTrims);

  // Return the most appropriate trim name
  return uniqueTrims[0] || '';
}

export { findBestTrimMatch };
