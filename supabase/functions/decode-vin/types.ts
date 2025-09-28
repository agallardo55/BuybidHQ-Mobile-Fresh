
export interface CarApiResult {
  year: string;
  make: string;
  model: string;
  specs?: {
    engine_number_of_cylinders?: string;
    displacement_l?: string;
    transmission_speeds?: string;
    transmission_style?: string;
    drive_type?: string;
    turbo?: boolean | string;
    trim?: string;
    body_class?: string;
    doors?: string;
    series?: string;
  };
  trims: CarApiTrim[];
}

// Alias for backward compatibility
export type CarApiData = CarApiResult;

export interface NHTSAEngineData {
  cylinders?: string;
  displacement?: string;
  configuration?: string;
  turbo?: boolean;
}

export interface NHTSATransmissionData {
  speeds?: string;
  style?: string;
  type?: string;
}

export interface CarApiTrim {
  name: string;
  description: string;
  year: number;
  specs?: {
    engine?: string;
    transmission?: string;
    drivetrain?: string;
  };
}

export interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  availableTrims?: TrimOption[];
}

export interface TrimOption {
  name: string;
  description: string;
  specs?: {
    engine?: string;
    transmission?: string;
    drivetrain?: string;
  };
}
