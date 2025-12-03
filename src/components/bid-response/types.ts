
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
  history?: string;
  historyService?: string;
  kbbWholesale?: number;
  kbbRetail?: number;
  jdPowerWholesale?: number;
  jdPowerRetail?: number;
  mmrWholesale?: number;
  mmrRetail?: number;
  auctionWholesale?: number;
  auctionRetail?: number;
  bookValuesCondition?: string;
}

export interface BidResponseFormData {
  offerAmount: string;
}
