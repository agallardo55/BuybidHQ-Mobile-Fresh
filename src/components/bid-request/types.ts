
export interface BidRequest {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: number;
  buyer: string;
  dealership: string;
  highestOffer: number;
  status: "Pending" | "Approved" | "Declined";
}

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
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
}

export interface FormErrors {
  year?: string;
  make?: string;
  model?: string;
  vin?: string;
  mileage?: string;
  buyers?: string;
  [key: string]: string | undefined;
}
