
export interface BidRequestFormData {
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: string;
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
}

export interface FormErrors {
  [key: string]: string;
}
