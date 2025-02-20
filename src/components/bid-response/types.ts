
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

export interface BidResponseFormData {
  offerAmount: string;
}
