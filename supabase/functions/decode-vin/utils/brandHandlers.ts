/**
 * Brand-Specific Vehicle Data Handlers
 * Handles special cases for BMW, Mercedes-Benz
 *
 * NOTE: Tesla and Porsche handlers were removed because CarAPI now returns
 * accurate data for these brands (electric specs, trims, GT3 RS, etc.)
 */

interface VehicleData {
  make?: string;
  model?: string;
  year?: string;
  specs?: any;
  trims?: any[];
}

/**
 * Apply brand-specific handling to vehicle data
 */
export function applyBrandSpecificHandling(vehicleData: VehicleData): void {
  const make = vehicleData.make?.toUpperCase() || '';

  if (make === 'BMW') {
    handleBMW(vehicleData);
  } else if (make === 'MERCEDES-BENZ') {
    handleMercedesBenz(vehicleData);
  }
}

/**
 * BMW: Create trim fallback from specs
 */
function handleBMW(vehicleData: VehicleData): void {
  if (!vehicleData.trims || vehicleData.trims.length === 0) {
    const trimDesignation = vehicleData.specs?.trim || vehicleData.specs?.series || 'Base';

    vehicleData.trims = [{
      name: trimDesignation,
      description: `${vehicleData.model} ${trimDesignation}`,
      year: Number(vehicleData.year)
    }];
  }
}

/**
 * Mercedes-Benz: ML-Class defaults, AMG trim detection
 */
function handleMercedesBenz(vehicleData: VehicleData): void {
  const model = vehicleData.model || '';

  // ML-Class specific defaults
  if (model.includes('ML')) {
    if (!vehicleData.trims || vehicleData.trims.length === 0) {
      vehicleData.trims = [{
        name: 'ML350',
        description: 'ML350 4dr SUV AWD (3.5L 6cyl 7A)',
        year: Number(vehicleData.year)
      }];
    }

    if (!vehicleData.specs) vehicleData.specs = {};
    if (!vehicleData.specs.transmission_speeds) {
      vehicleData.specs.transmission_speeds = '7';
      vehicleData.specs.transmission_style = 'Automatic';
    }
    if (!vehicleData.specs.drive_type) {
      vehicleData.specs.drive_type = 'AWD';
    }
  }
}

/**
 * Handle AMG trim detection (called after deduplication)
 */
export function handleAMGTrims(vehicleData: VehicleData, processedTrims: any[]): any[] {
  if (vehicleData.make?.toLowerCase() !== 'mercedes-benz') {
    return processedTrims;
  }

  const amgSeries = vehicleData.specs?.series;
  if (!amgSeries || !amgSeries.toLowerCase().includes('amg')) {
    return processedTrims;
  }

  // Check if AMG trim already exists
  const hasAMGTrim = processedTrims.some(t =>
    t.name?.toLowerCase().includes('amg')
  );

  if (hasAMGTrim) {
    return processedTrims;
  }

  // Create AMG trim from series
  const amgTrim = {
    name: amgSeries,
    description: `${vehicleData.model} ${amgSeries}`,
    year: Number(vehicleData.year)
  };

  return [amgTrim, ...processedTrims];
}
