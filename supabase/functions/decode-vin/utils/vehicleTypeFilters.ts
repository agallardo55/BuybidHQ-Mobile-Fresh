/**
 * Vehicle Type Filters
 *
 * Only allows automobiles (passenger cars and trucks).
 * Rejects powersports, RVs, buses, trailers, and other non-automobile vehicles.
 */

/**
 * Checks if a vehicle is an automobile (passenger car or truck).
 * Uses a whitelist approach - only allows specific vehicle types.
 *
 * @param vehicleType - The vehicle type from API (e.g., "Passenger Car", "Truck")
 * @param bodyClass - The body class from API (e.g., "Sedan", "SUV", "Pickup")
 * @returns true if automobile, false if not (powersports, RV, bus, etc.)
 */
export function isNotPowersports(vehicleType?: string, bodyClass?: string): boolean {
  // If no data provided, fail closed (reject) to be safe
  if (!vehicleType && !bodyClass) {
    return false;
  }

  const vehicleTypeLower = (vehicleType || '').toLowerCase();
  const bodyClassLower = (bodyClass || '').toLowerCase();

  // WHITELIST: Allowed vehicle types (passenger cars and trucks only)
  const allowedVehicleTypes = [
    'passenger car',
    'multipurpose passenger vehicle',
    'multipurpose passenger vehicle (mpv)',
    'truck'
  ];

  // WHITELIST: Allowed body classes (cars and trucks only)
  const allowedBodyClasses = [
    'sedan',
    'coupe',
    'convertible',
    'hatchback',
    'wagon',
    'suv',
    'sport utility',
    'sport utility vehicle',
    'multi-purpose vehicle',
    'crossover',
    'minivan',
    'van',
    'cargo van',
    'passenger van',
    'pickup',
    'truck',
    'crew cab',
    'extended cab',
    'regular cab'
  ];

  // BLACKLIST: Explicitly reject these (safety net)
  const rejectedTypes = [
    'motorcycle',
    'bus',
    'motorhome',
    'rv',
    'recreational vehicle',
    'trailer',
    'incomplete vehicle',
    'atv',
    'utv',
    'off-road'
  ];

  // First check: Explicit rejections (safety net)
  for (const rejected of rejectedTypes) {
    if (vehicleTypeLower.includes(rejected) || bodyClassLower.includes(rejected)) {
      return false; // Explicitly rejected
    }
  }

  // Second check: Must match at least one allowed vehicle type OR body class
  let typeMatched = false;
  for (const allowedType of allowedVehicleTypes) {
    if (vehicleTypeLower.includes(allowedType)) {
      typeMatched = true;
      break;
    }
  }

  let bodyMatched = false;
  for (const allowedBody of allowedBodyClasses) {
    if (bodyClassLower.includes(allowedBody)) {
      bodyMatched = true;
      break;
    }
  }

  // Allow if EITHER vehicle type OR body class matches the whitelist
  // (Some vehicles only have one field populated)
  return typeMatched || bodyMatched;
}

/**
 * Returns a user-friendly error message for non-automobile rejection
 *
 * @param vehicleType - The vehicle type from API
 * @param bodyClass - The body class from API
 * @returns User-friendly error message
 */
export function getPowersportsRejectionMessage(
  vehicleType?: string,
  bodyClass?: string
): string {
  const vehicleTypeLower = (vehicleType || '').toLowerCase();
  const bodyClassLower = (bodyClass || '').toLowerCase();

  // Determine specific type for more helpful message
  if (vehicleTypeLower.includes('motorcycle') || bodyClassLower.includes('motorcycle')) {
    return 'Motorcycles are not supported on BuyBidHQ. Only passenger cars and trucks are allowed.';
  }

  if (bodyClassLower.includes('atv') || bodyClassLower.includes('all terrain')) {
    return 'ATVs (All-Terrain Vehicles) are not supported on BuyBidHQ. Only passenger cars and trucks are allowed.';
  }

  if (bodyClassLower.includes('utv') || bodyClassLower.includes('side-by-side')) {
    return 'UTVs (Utility Terrain Vehicles) are not supported on BuyBidHQ. Only passenger cars and trucks are allowed.';
  }

  if (vehicleTypeLower.includes('bus') || bodyClassLower.includes('bus')) {
    return 'Buses are not supported on BuyBidHQ. Only passenger cars and trucks are allowed.';
  }

  if (vehicleTypeLower.includes('motorhome') || vehicleTypeLower.includes('rv') ||
      vehicleTypeLower.includes('recreational vehicle') || bodyClassLower.includes('motorhome')) {
    return 'RVs and motorhomes are not supported on BuyBidHQ. Only passenger cars and trucks are allowed.';
  }

  if (vehicleTypeLower.includes('trailer') || bodyClassLower.includes('trailer')) {
    return 'Trailers are not supported on BuyBidHQ. Only passenger cars and trucks are allowed.';
  }

  // Generic message for other non-automobile vehicles
  return 'This vehicle type is not supported on BuyBidHQ. Only passenger cars and trucks are allowed.';
}

