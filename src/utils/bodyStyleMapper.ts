/**
 * Body Style Mapper
 * 
 * Normalizes vehicle body styles from various APIs (CarAPI, NHTSA) to BuyBidHQ's
 * approved body style list. Handles variations, consolidates similar styles, and
 * ensures consistent naming across all data sources.
 */

/**
 * Approved body styles for BuyBidHQ
 */
export const APPROVED_BODY_STYLES = [
  'Sedan',
  'Coupe',
  'Hatchback',
  'SUV',
  'Crossover',
  'Pickup Truck',
  'Minivan',
  'Station Wagon',
  'Convertible',
  'Van'
] as const;

export type ApprovedBodyStyle = typeof APPROVED_BODY_STYLES[number];

/**
 * Normalizes a raw body style value from API to BuyBidHQ's approved list.
 * Returns null for unmapped values (motorcycles, commercial vehicles, etc.)
 * 
 * @param rawBodyStyle - Raw body style value from API (e.g., "Sedan/Saloon", "Sport Utility Vehicle")
 * @returns Normalized body style from approved list, or null if unmapped
 */
export function normalizeBodyStyle(rawBodyStyle?: string | null): string | null {
  if (!rawBodyStyle || typeof rawBodyStyle !== 'string') {
    return null;
  }

  const normalized = rawBodyStyle.trim();
  if (normalized.length === 0) {
    return null;
  }

  const lower = normalized.toLowerCase();

  // Log original value for debugging
  console.log(`Original body_class: ${rawBodyStyle}`);

  // ===== SEDAN =====
  if (
    lower.includes('sedan') ||
    lower.includes('saloon') ||
    lower === '4-door sedan' ||
    lower === '2-door sedan' ||
    lower === '4 door sedan' ||
    lower === '2 door sedan'
  ) {
    console.log(`Normalized to: Sedan`);
    return 'Sedan';
  }

  // ===== COUPE =====
  if (
    lower.includes('coupe') ||
    lower === '2-door coupe' ||
    lower === '2 door coupe' ||
    lower === 'sport coupe'
  ) {
    // Exclude "4-door coupe" variants (these are usually sedans)
    if (!lower.includes('4-door') && !lower.includes('4 door')) {
      console.log(`Normalized to: Coupe`);
      return 'Coupe';
    }
  }

  // ===== HATCHBACK =====
  if (
    lower.includes('hatchback') ||
    lower === '3-door hatchback' ||
    lower === '5-door hatchback' ||
    lower === '3 door hatchback' ||
    lower === '5 door hatchback'
  ) {
    console.log(`Normalized to: Hatchback`);
    return 'Hatchback';
  }

  // ===== CONVERTIBLE =====
  if (
    lower.includes('convertible') ||
    lower.includes('cabriolet') ||
    lower.includes('roadster') ||
    lower === 'convertible/cabriolet'
  ) {
    console.log(`Normalized to: Convertible`);
    return 'Convertible';
  }

  // ===== STATION WAGON =====
  if (
    lower.includes('wagon') ||
    lower.includes('estate') ||
    lower === 'station wagon'
  ) {
    console.log(`Normalized to: Station Wagon`);
    return 'Station Wagon';
  }

  // ===== MINIVAN =====
  if (
    lower.includes('minivan') ||
    lower.includes('mini-van') ||
    (lower.includes('passenger van') && (lower.includes('compact') || lower.includes('family')))
  ) {
    console.log(`Normalized to: Minivan`);
    return 'Minivan';
  }

  // ===== VAN =====
  if (
    lower === 'van' ||
    lower.includes('cargo van') ||
    lower.includes('full-size van') ||
    lower.includes('full size van') ||
    (lower.includes('passenger van') && !lower.includes('compact') && !lower.includes('family'))
  ) {
    console.log(`Normalized to: Van`);
    return 'Van';
  }

  // ===== PICKUP TRUCK =====
  if (
    lower.includes('pickup') ||
    (lower === 'truck' && !lower.includes('tractor') && !lower.includes('commercial')) ||
    lower.includes('pickup truck') ||
    lower.includes('extended cab pickup') ||
    lower.includes('crew cab pickup') ||
    lower.includes('regular cab') ||
    lower.includes('crew cab') ||
    lower.includes('extended cab')
  ) {
    // Exclude commercial trucks
    if (
      !lower.includes('truck-tractor') &&
      !lower.includes('truck tractor') &&
      !lower.includes('commercial truck') &&
      !lower.includes('semi') &&
      !lower.includes('tractor')
    ) {
      console.log(`Normalized to: Pickup Truck`);
      return 'Pickup Truck';
    }
  }

  // ===== CROSSOVER =====
  // Check for crossover first (more specific than SUV)
  if (
    lower.includes('crossover') ||
    lower === 'cuv' ||
    lower.includes('compact suv') ||
    lower.includes('subcompact suv') ||
    (lower.includes('crossover utility vehicle') && (lower.includes('compact') || lower.includes('subcompact')))
  ) {
    console.log(`Normalized to: Crossover`);
    return 'Crossover';
  }

  // ===== SUV =====
  if (
    lower.includes('suv') ||
    lower.includes('sport utility vehicle') ||
    lower.includes('sport utility') ||
    lower === '4x4' ||
    lower.includes('off-road') ||
    lower.includes('off road') ||
    lower.includes('multipurpose passenger vehicle') ||
    lower.includes('mpv') ||
    (lower.includes('crossover utility vehicle') && !lower.includes('compact') && !lower.includes('subcompact'))
  ) {
    // Exclude if it's clearly a crossover (already handled above)
    if (!lower.includes('crossover') && lower !== 'cuv') {
      console.log(`Normalized to: SUV`);
      return 'SUV';
    }
  }

  // ===== EXCLUSIONS =====
  // Explicitly exclude motorcycles, commercial vehicles, buses, RVs
  if (
    lower.includes('motorcycle') ||
    lower.includes('atv') ||
    lower.includes('utv') ||
    lower.includes('scooter') ||
    lower.includes('moped') ||
    lower.includes('bus') ||
    lower.includes('rv') ||
    lower.includes('recreational vehicle') ||
    lower.includes('motor home') ||
    lower.includes('truck-tractor') ||
    lower.includes('truck tractor') ||
    lower.includes('commercial truck') ||
    lower.includes('semi') ||
    lower.includes('tractor') ||
    lower.includes('trailer')
  ) {
    console.log(`⚠️ Excluded body style (powersports/commercial): ${rawBodyStyle}`);
    return null;
  }

  // If we get here, the value couldn't be mapped
  console.log(`⚠️ Could not map body style: ${rawBodyStyle}`);
  return null;
}

/**
 * Validates if a body style is in the approved list
 * 
 * @param bodyStyle - Body style to validate
 * @returns true if body style is approved, false otherwise
 */
export function isApprovedBodyStyle(bodyStyle: string | null | undefined): boolean {
  if (!bodyStyle) return false;
  return APPROVED_BODY_STYLES.includes(bodyStyle as ApprovedBodyStyle);
}

/**
 * Gets a safe body style value - returns normalized value or "Unknown"
 * 
 * @param rawBodyStyle - Raw body style value from API
 * @returns Normalized body style or "Unknown"
 */
export function getSafeBodyStyle(rawBodyStyle?: string | null): string {
  const normalized = normalizeBodyStyle(rawBodyStyle);
  return normalized || 'Unknown';
}

