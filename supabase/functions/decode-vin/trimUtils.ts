
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

  // Get all unique trim names and ensure GT3 RS is first if present
  let uniqueTrims = Array.from(new Set(trims.map(trim => trim.name)))
    .filter(Boolean)
    .sort((a, b) => {
      // Always put GT3 RS first
      if (a === 'GT3 RS') return -1;
      if (b === 'GT3 RS') return 1;
      // Then GT3 models
      if (a.includes('GT3') && !b.includes('GT3')) return -1;
      if (!a.includes('GT3') && b.includes('GT3')) return 1;
      // Then alphabetically
      return a.localeCompare(b);
    });

  // Look for GT3 RS in available trims
  const hasGT3RS = trims.some(trim => {
    const name = trim.name?.toUpperCase() || '';
    const desc = trim.description?.toUpperCase() || '';
    return (name.includes('GT3') && name.includes('RS')) || 
           (desc.includes('GT3') && desc.includes('RS'));
  });

  // If GT3 RS is detected but not in the list, add it at the beginning
  if (hasGT3RS && !uniqueTrims.includes('GT3 RS')) {
    uniqueTrims = ['GT3 RS', ...uniqueTrims];
  }

  console.log('Sorted unique trims:', uniqueTrims);

  return uniqueTrims[0] || '';
}

export { findBestTrimMatch };
