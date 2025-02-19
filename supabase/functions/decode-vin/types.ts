
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
    turbo?: boolean;
    trim?: string;
  };
  trims: CarApiTrim[];
}

export interface CarApiTrim {
  name: string;
  description: string;
  year: number;
}
