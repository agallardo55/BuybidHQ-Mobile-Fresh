/**
 * VIN Service Types
 * Centralized type definitions for VIN decoding operations
 */

/** Core vehicle data returned from VIN decode */
export interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
  displayTrim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  bodyStyle?: string;
  availableTrims: TrimOption[];
  selectedTrim?: TrimOption | null;
}

/** Individual trim option with specifications */
export interface TrimOption {
  id?: string | number;
  name: string;
  description: string;
  specs: TrimSpecs;
  year: number;
  source?: TrimSource;
}

/** Trim specification details */
export interface TrimSpecs {
  engine: string;
  transmission: string;
  drivetrain: string;
  bodyStyle?: string;
}

/** Data source for trim information */
export type TrimSource = 'carapi' | 'nhtsa' | 'fallback';

/** Result wrapper for VIN decoding operations */
export interface VinDecodeResult {
  success: boolean;
  data?: VehicleData;
  error?: string;
  fallbackToManual?: boolean;
  partialData?: {
    year?: string | number;
    make?: string;
    model?: string;
  };
}

/** Vehicle type classification */
export type VehicleType = 'BEV' | 'PHEV' | 'ICE';

/** Vehicle specifications from API responses */
export interface VehicleSpecs {
  engine_number_of_cylinders?: number | null;
  displacement_l?: number | null;
  transmission_speeds?: string;
  transmission_style?: string;
  electrification_level?: string;
  fuel_type_primary?: string;
  body_class?: string;
  bodyStyle?: string;
  drivetrain?: string;
  drive_type?: string;
}

/** Unified API data structure for internal processing */
export interface ApiData {
  year?: string | number;
  make?: string;
  model?: string;
  trim?: string;
  description?: string;
  specs?: VehicleSpecs;
  trims?: TrimData[];
  availableTrims?: TrimOption[];
  electrification_level?: string;
  fuel_type_primary?: string;
  engine_number_of_cylinders?: number | null;
  displacement_l?: number | null;
  transmission_style?: string;
  drive_type?: string;
  body_class?: string;
}

/** Raw trim data from API responses */
export interface TrimData {
  id?: string | number;
  name?: string;
  description?: string;
  make_model_trim_id?: number;
  year?: number;
  specs?: Partial<TrimSpecs>;
}

/** CarAPI response structure */
export interface CarApiResponse {
  data?: CarApiTrim[];
  collection?: {
    count: number;
    pages: number;
  };
}

/** CarAPI trim data */
export interface CarApiTrim {
  id: number;
  make_model_id: number;
  year: number;
  name: string;
  description?: string;
  msrp?: number;
  invoice?: number;
  created?: string;
  modified?: string;
}

/** NHTSA decode response */
export interface NHTSAResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAResult[];
}

/** Individual NHTSA result */
export interface NHTSAResult {
  Value: string | null;
  ValueId: string | null;
  Variable: string;
  VariableId: number;
}

/** Make/Model validation result */
export interface MakeModelValidation {
  isValid: boolean;
  makeModelId?: number;
  specs?: TrimSpecs;
}

/** Dropdown option for make/model selects */
export interface DropdownOption {
  value: string;
  label: string;
}
