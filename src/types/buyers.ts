
export interface Buyer {
  id: string;
  name: string;
  email: string;
  dealership: string;
  phone: string;
  location: string;
  acceptedBids: number;
  pendingBids: number;
  declinedBids: number;
  ownerName: string;
  ownerEmail: string;
}

export interface BuyerFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  businessNumber: string;
  dealershipName: string;
  licenseNumber: string;
  dealershipAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface BuyerWithBids extends Buyer {
  acceptedBids: number;
  pendingBids: number;
  declinedBids: number;
}
