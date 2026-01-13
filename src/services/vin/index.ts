/**
 * VIN Service Module
 *
 * Centralized VIN decoding service - single source of truth for all VIN-related operations.
 *
 * Usage:
 *   import { vinService, VehicleData, TrimOption } from '@/services/vin';
 */

// Re-export types
export * from './types';

// Re-export constants
export * from './constants';

// Import and re-export the singleton from the legacy service
// This maintains backward compatibility during migration
import { vinService } from '../vinService';

export { vinService };

// Re-export the legacy types that are defined in vinService.ts
// These will be removed once migration is complete
export type { VehicleData, TrimOption, VinDecodeResult } from '../vinService';
