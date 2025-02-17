
export interface VehicleDetails {
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
  windshield: string;
  engineLights: string;
  brakes: string;
  tire: string;
  maintenance: string;
  reconEstimate: string;
  reconDetails: string;
  userFullName?: string;
  dealership?: string;
  mobileNumber?: string;
}

export interface BidResponseFormData {
  offerAmount: string;
  notes?: string;
}
