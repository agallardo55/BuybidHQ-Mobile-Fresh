/**
 * Vehicle Type Filters (Frontend)
 * 
 * Filters out motorcycles and powersports vehicles (ATVs, UTVs, etc.)
 * from BuyBidHQ vehicle data.
 */

/**
 * Checks if a vehicle is NOT a powersports vehicle (motorcycle, ATV, UTV, etc.)
 * Returns false if the vehicle is powersports, true otherwise.
 * 
 * @param vehicleType - The vehicle type from API (e.g., "Motorcycle", "Low Speed Vehicle")
 * @param bodyClass - The body class from API (e.g., "Motorcycle", "ATV", "Sport")
 * @returns false if powersports detected, true if passenger vehicle
 */
export function isNotPowersports(vehicleType?: string, bodyClass?: string): boolean {
  // If no data provided, fail open (allow through) to avoid false positives
  if (!vehicleType && !bodyClass) {
    return true;
  }

  const vehicleTypeLower = (vehicleType || '').toLowerCase();
  const bodyClassLower = (bodyClass || '').toLowerCase();

  // Check VehicleType values for powersports indicators
  const powersportsVehicleTypes = [
    'motorcycle',
    'low speed vehicle',
    'low speed vehicle (lsv)',
    'incomplete vehicle'
  ];

  for (const type of powersportsVehicleTypes) {
    if (vehicleTypeLower.includes(type)) {
      console.log('🚫 Rejected by vehicleType:', vehicleType);
      return false; // Powersports detected
    }
  }

  // Check BodyClass values for powersports indicators
  const powersportsBodyClasses = [
    'motorcycle',
    'sport', // Motorcycle style
    'standard', // Motorcycle style
    'cruiser', // Motorcycle style
    'touring', // Motorcycle style
    'atv',
    'all terrain vehicle',
    'utv',
    'utility vehicle',
    'side-by-side',
    'three-wheeled motorcycle',
    'autocycle',
    'off-road'
  ];

  for (const bodyClass of powersportsBodyClasses) {
    if (bodyClassLower.includes(bodyClass)) {
      console.log('🚫 Rejected by bodyClass:', bodyClass);
      return false; // Powersports detected
    }
  }

  // Not powersports - allow through
  return true;
}

/**
 * Returns a user-friendly error message for powersports rejection
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
    return 'Motorcycles are not supported on BuyBidHQ.';
  }

  if (bodyClassLower.includes('atv') || bodyClassLower.includes('all terrain')) {
    return 'ATVs (All-Terrain Vehicles) are not supported on BuyBidHQ.';
  }

  if (bodyClassLower.includes('utv') || bodyClassLower.includes('utility vehicle') || bodyClassLower.includes('side-by-side')) {
    return 'UTVs (Utility Terrain Vehicles) are not supported on BuyBidHQ.';
  }

  // Generic message for other powersports
  return 'Powersports vehicles are not supported on BuyBidHQ.';
}

