
export interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
}

export interface CarApiTrim {
  name: string;
  description: string;
  year: number;
}

export interface CarApiData {
  year?: string | number;
  make?: string;
  model?: string;
  trim?: string;
  specs?: {
    displacement_l?: string;
    engine_number_of_cylinders?: string;
    turbo?: string | null;
    transmission?: string;
    drive_type?: string;
  };
  trims?: CarApiTrim[];
}

export interface NHTSAEngineData {
  displacement: string;
  cylinders: string;
  configuration: string;
  turbo: boolean;
}

export interface NHTSATransmissionData {
  style?: string;
  speeds?: string;
  type?: string;
}

