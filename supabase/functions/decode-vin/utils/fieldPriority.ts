/**
 * Field Priority Resolution
 * Handles priority order for extracting vehicle fields from multiple data sources
 * to ensure the most complete and accurate data is used
 */

interface VehicleData {
  make?: string;
  model?: string;
  year?: string | number;
  specs?: {
    trim?: string;
    series?: string;
    style?: string;
    body_class?: string;
  };
  trims?: any[];
}

interface TrimResolutionResult {
  value: string;
  source: string;
  confidence: number;
}

/**
 * Resolve the best trim value using priority order:
 * 1. specs.trim (most complete, e.g., "4S Cross Turismo")
 * 2. bestMatch from trim matching algorithm
 * 3. trims[0].name (first available trim)
 * 4. specs.series (fallback for BMW, Mercedes)
 *
 * @param vehicleData - The vehicle data with specs and trims
 * @param bestMatch - The trim name from findBestTrimMatch function
 * @returns The resolved trim value with metadata
 */
export function resolveTrimValue(
  vehicleData: VehicleData,
  bestMatch: string | null
): TrimResolutionResult {
  const specs = vehicleData.specs;
  const trims = vehicleData.trims || [];

  // Priority 1: specs.trim (most complete designation)
  if (specs?.trim && specs.trim.trim() !== '') {
    console.log(`✅ TRIM RESOLUTION: Using specs.trim = "${specs.trim}"`);
    return {
      value: specs.trim.trim(),
      source: 'specs.trim',
      confidence: 0.95
    };
  }

  // Priority 2: bestMatch from trim matching algorithm
  if (bestMatch && bestMatch.trim() !== '') {
    console.log(`✅ TRIM RESOLUTION: Using bestMatch = "${bestMatch}"`);
    return {
      value: bestMatch.trim(),
      source: 'bestMatch',
      confidence: 0.85
    };
  }

  // Priority 3: First trim in trims array
  if (trims.length > 0 && trims[0].name) {
    const trimName = trims[0].name.trim();
    console.log(`✅ TRIM RESOLUTION: Using trims[0].name = "${trimName}"`);
    return {
      value: trimName,
      source: 'trims[0].name',
      confidence: 0.75
    };
  }

  // Priority 4: specs.series (BMW, Mercedes fallback)
  if (specs?.series && specs.series.trim() !== '') {
    console.log(`✅ TRIM RESOLUTION: Using specs.series = "${specs.series}"`);
    return {
      value: specs.series.trim(),
      source: 'specs.series',
      confidence: 0.70
    };
  }

  // No trim found
  console.warn('⚠️ TRIM RESOLUTION: No trim value found in any source');
  return {
    value: '',
    source: 'none',
    confidence: 0.0
  };
}

/**
 * Resolve the best model value
 * Handles cases where trim might be embedded in model field
 *
 * @param vehicleData - The vehicle data
 * @returns The resolved model value
 */
export function resolveModelValue(vehicleData: VehicleData): string {
  const model = vehicleData.model?.trim() || '';

  // Check if model contains trim designations that should be separated
  // Common patterns: "Bentayga V8", "Cayenne Turbo", "911 GT3 RS"
  const trimPatterns = [
    /\s+(V\d+|W\d+)$/i,           // V8, V12, W12
    /\s+(Turbo|GT\d+|GTS|RS)$/i,  // Performance trims
  ];

  for (const pattern of trimPatterns) {
    const match = model.match(pattern);
    if (match) {
      const cleanModel = model.replace(pattern, '').trim();
      console.log(`ℹ️ MODEL RESOLUTION: Detected embedded trim in model: "${model}" → "${cleanModel}"`);
      return cleanModel;
    }
  }

  return model;
}

/**
 * Compare data quality between two sources (CarAPI vs NHTSA)
 * Used for logging and analysis to determine which API is better per field
 */
export function compareDataSources(carApiData: any, nhtsaData: any): {
  field: string;
  carapi: string;
  nhtsa: string;
  winner: string;
}[] {
  if (!carApiData || !nhtsaData) return [];

  const comparisons: {
    field: string;
    carapi: string;
    nhtsa: string;
    winner: string;
  }[] = [];

  // Compare key fields
  const fields = [
    { key: 'trim', carPath: 'specs.trim', nhtsaPath: 'specs.trim' },
    { key: 'series', carPath: 'specs.series', nhtsaPath: 'specs.series' },
    { key: 'body_class', carPath: 'specs.body_class', nhtsaPath: 'specs.body_class' },
    { key: 'engine', carPath: 'specs.engine_number_of_cylinders', nhtsaPath: 'specs.engine_number_of_cylinders' },
    { key: 'displacement', carPath: 'specs.displacement_l', nhtsaPath: 'specs.displacement_l' },
  ];

  for (const { key, carPath, nhtsaPath } of fields) {
    const carValue = getNestedValue(carApiData, carPath);
    const nhtsaValue = getNestedValue(nhtsaData, nhtsaPath);

    if (carValue || nhtsaValue) {
      const winner = determineWinner(carValue, nhtsaValue);
      comparisons.push({
        field: key,
        carapi: String(carValue || 'N/A'),
        nhtsa: String(nhtsaValue || 'N/A'),
        winner
      });
    }
  }

  return comparisons;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function determineWinner(carValue: any, nhtsaValue: any): string {
  if (!carValue && !nhtsaValue) return 'none';
  if (!carValue) return 'nhtsa';
  if (!nhtsaValue) return 'carapi';

  // Prefer longer, more descriptive values
  const carLength = String(carValue).length;
  const nhtsaLength = String(nhtsaValue).length;

  if (carLength > nhtsaLength) return 'carapi';
  if (nhtsaLength > carLength) return 'nhtsa';

  return 'equal';
}
