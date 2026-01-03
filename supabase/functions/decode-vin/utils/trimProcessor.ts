/**
 * Trim Processing and Quality Validation
 * Handles deduplication, fallback creation, and quality checks
 */

interface VehicleData {
  make?: string;
  model?: string;
  year?: string;
  specs?: any;
  trims?: any[];
}

/**
 * Deduplicate trims by name and description
 */
export function deduplicateTrims(trims: any[]): any[] {
  if (!trims || trims.length === 0) return [];

  const seenTrims = new Set<string>();
  return trims.filter(trim => {
    const key = `${trim.name}|${trim.description}`;
    if (seenTrims.has(key)) return false;
    seenTrims.add(key);
    return true;
  });
}

/**
 * Create fallback trim from specs if no trims available
 */
export function createFallbackTrim(vehicleData: VehicleData): any[] {
  if (!vehicleData.specs?.trim) return [];

  const trimName = vehicleData.specs.trim;
  const seriesInfo = vehicleData.specs.series ? ` ${vehicleData.specs.series}` : '';
  const engineInfo = vehicleData.specs.displacement_l && vehicleData.specs.engine_number_of_cylinders
    ? `(${vehicleData.specs.displacement_l}L ${vehicleData.specs.engine_number_of_cylinders}cyl${vehicleData.specs.turbo ? ' Turbo' : ''})`
    : '';

  const description = `${trimName}${seriesInfo} ${engineInfo}`.trim();

  return [{
    name: trimName,
    description,
    year: Number(vehicleData.year)
  }];
}

/**
 * Validate trim data quality and create emergency fallback if needed
 */
export function validateAndCleanTrims(trims: any[], vehicleData: VehicleData): any[] {
  // Remove trims with invalid data
  let cleanedTrims = trims.filter(t => t.name && t.description);

  // Emergency fallback if still no trims
  if (cleanedTrims.length === 0) {
    const trimName = vehicleData.specs?.trim || vehicleData.specs?.series || 'Base';
    cleanedTrims = [{
      name: trimName,
      description: `${vehicleData.year} ${vehicleData.make} ${vehicleData.model} ${trimName}`,
      year: Number(vehicleData.year),
      specs: {}
    }];
  }

  return cleanedTrims;
}

/**
 * Complete trim processing pipeline
 */
export function processTrims(vehicleData: VehicleData): any[] {
  // Step 1: Deduplicate
  let trims = deduplicateTrims(vehicleData.trims || []);

  // Step 2: Create fallback if empty
  if (trims.length === 0) {
    trims = createFallbackTrim(vehicleData);
  }

  // Step 3: Validate and clean
  trims = validateAndCleanTrims(trims, vehicleData);

  return trims;
}
