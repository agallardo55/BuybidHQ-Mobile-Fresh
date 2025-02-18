
export interface VehicleData {
  year: string;
  make: string;
  model: string;
  trim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  availableTrims: TrimOption[];
}

export interface CarApiData {
  year?: string | number;
  make?: string;
  model?: string;
  specs?: {
    engine_number_of_cylinders?: string;
    displacement_l?: string;
    transmission?: string;
    drive_type?: string;
    turbo?: string | null;
  };
  trims?: Array<{
    id: number;
    make_model_id: number;
    year: number;
    name: string;
    description: string;
    msrp: number;
    invoice: number;
    make_model: {
      id: number;
      make_id: number;
      name: string;
      make: {
        id: number;
        name: string;
      }
    }
  }>;
}

export interface TrimOption {
  name: string;
  description: string;
  specs?: {
    engine?: string;
    transmission?: string;
    drivetrain?: string;
  }
}
