/**
 * Brand-Specific Vehicle Data Handlers
 * Handles special cases for Tesla, BMW, Porsche, Mercedes-Benz, etc.
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

  if (make === 'TESLA') {
    handleTesla(vehicleData);
  } else if (make === 'BMW') {
    handleBMW(vehicleData);
  } else if (make === 'PORSCHE') {
    handlePorsche(vehicleData);
  } else if (make === 'MERCEDES-BENZ') {
    handleMercedesBenz(vehicleData);
  }
}

/**
 * Tesla: Force electric specs, create trim fallbacks
 */
function handleTesla(vehicleData: VehicleData): void {
  if (!vehicleData.specs) vehicleData.specs = {};

  // Force electric vehicle specs
  vehicleData.specs.fuel_type_primary = 'Electric';
  vehicleData.specs.electrification_level = 'BEV';
  vehicleData.specs.transmission_speeds = '1';
  vehicleData.specs.transmission_style = 'Direct Drive';
  vehicleData.specs.engine_number_of_cylinders = null;
  vehicleData.specs.displacement_l = null;

  // Create trim fallbacks if missing
  if (!vehicleData.trims || vehicleData.trims.length === 0) {
    const modelUpper = vehicleData.model?.toUpperCase() || '';
    const commonTrims = getTeslaTrims(modelUpper);

    vehicleData.trims = commonTrims.map(trimName => ({
      name: trimName,
      description: `${vehicleData.model} ${trimName}`,
      year: Number(vehicleData.year)
    }));
  }
}

function getTeslaTrims(model: string): string[] {
  if (model.includes('MODEL 3')) return ['Standard Range Plus', 'Long Range', 'Performance'];
  if (model.includes('MODEL S')) return ['Long Range', 'Plaid'];
  if (model.includes('MODEL X')) return ['Long Range', 'Plaid'];
  if (model.includes('MODEL Y')) return ['Long Range', 'Performance'];
  return ['Base'];
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
 * Porsche: Handle Taycan (electric), ensure proper specs
 */
function handlePorsche(vehicleData: VehicleData): void {
  const model = vehicleData.model?.toUpperCase() || '';

  // Taycan is electric
  if (model.includes('TAYCAN')) {
    if (!vehicleData.specs) vehicleData.specs = {};
    vehicleData.specs.fuel_type_primary = 'Electric';
    vehicleData.specs.electrification_level = 'BEV';
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

/**
 * Handle Porsche GT3 RS detection (called after deduplication)
 */
export function handlePorscheGT3RS(vehicleData: VehicleData, processedTrims: any[]): any[] {
  if (vehicleData.make?.toUpperCase() !== 'PORSCHE') {
    return processedTrims;
  }

  const model = vehicleData.model?.toLowerCase() || '';
  if (!model.includes('911')) {
    return processedTrims;
  }

  const trim = vehicleData.specs?.trim?.toLowerCase() || '';
  const series = vehicleData.specs?.series?.toLowerCase() || '';

  if (!trim.includes('gt3') && !series.includes('gt3')) {
    return processedTrims;
  }

  // Check if GT3 RS already exists
  const hasGT3RS = processedTrims.some(t =>
    t.name?.toLowerCase().includes('gt3') && t.name?.toLowerCase().includes('rs')
  );

  if (hasGT3RS) {
    return processedTrims;
  }

  // Create GT3 RS trim
  const gt3Trim = {
    name: 'GT3 RS',
    description: `${vehicleData.model} GT3 RS`,
    year: Number(vehicleData.year)
  };

  return [gt3Trim, ...processedTrims];
}
