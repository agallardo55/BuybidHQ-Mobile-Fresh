
export interface Vehicle {
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor: string;
  accessories: string;
  images?: string[];
}

export interface VehicleDetails extends Vehicle {
  windshield: string;
  engineLights: string;
  brakes: string;
  tire: string;
  maintenance: string;
  reconEstimate: string;
  reconDetails?: string;
}

export interface BidResponseFormData {
  offerAmount: string;
}
