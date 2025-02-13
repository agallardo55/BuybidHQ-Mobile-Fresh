
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
