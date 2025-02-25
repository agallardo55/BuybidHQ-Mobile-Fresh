
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
  console.log('Raw specs:', specs);
  return Object.values(matches).every(match => match === true);
}

function findBestTrimMatch(trims: CarApiTrim[] | undefined, year: number, specs?: any): string {
  if (!trims || trims.length === 0) {
    console.log('No trims available for matching');
    return '';
  }

  // Only process Porsche vehicles
  if (specs?.make?.toLowerCase() !== 'porsche') {
    console.log('Not a Porsche vehicle, returning first trim');
    return trims[0]?.name || '';
  }

  console.log('Processing Porsche vehicle with specs:', specs);
  console.log('Initial available trims:', trims.map(t => ({ name: t.name, description: t.description })));

  // Check if this is a GT3 RS based on specs
  const isGT3RS = isGT3RSMatch(specs);
  console.log('Is GT3 RS based on specs?', isGT3RS);

  if (isGT3RS) {
    console.log('Detected GT3 RS based on specifications');
    return 'GT3 RS';
  }

  // Get initial unique trim names
  let uniqueTrims = Array.from(new Set(trims.map(trim => trim.name)))
    .filter(Boolean);
  
  console.log('Initial unique trims before sorting:', uniqueTrims);

  // Look for GT3 RS in available trims
  const hasGT3RS = trims.some(trim => {
    const name = trim.name?.toUpperCase() || '';
    const desc = trim.description?.toUpperCase() || '';
    const isGT3RS = (name.includes('GT3') && name.includes('RS')) || 
                    (desc.includes('GT3') && desc.includes('RS'));
    if (isGT3RS) {
      console.log('Found GT3 RS in trim:', { name, description: desc });
    }
    return isGT3RS;
  });

  console.log('Has GT3 RS in trims?', hasGT3RS);

  // Sort trims with GT3 RS first
  uniqueTrims = uniqueTrims.sort((a, b) => {
    // Always put GT3 RS first
    if (a === 'GT3 RS') return -1;
    if (b === 'GT3 RS') return 1;
    // Then GT3 models
    if (a.includes('GT3') && !b.includes('GT3')) return -1;
    if (!a.includes('GT3') && b.includes('GT3')) return 1;
    // Then alphabetically
    return a.localeCompare(b);
  });

  // If GT3 RS is detected but not in the list, add it at the beginning
  if (hasGT3RS && !uniqueTrims.includes('GT3 RS')) {
    console.log('Adding GT3 RS to beginning of trim list');
    uniqueTrims = ['GT3 RS', ...uniqueTrims];
  }

  console.log('Final sorted unique trims:', uniqueTrims);
  const selectedTrim = uniqueTrims[0] || '';
  console.log('Selected trim:', selectedTrim);

  return selectedTrim;
}

export { findBestTrimMatch };
