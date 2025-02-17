
export interface Buyer {
  id: string;
  user_id: string;
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
  phoneCarrier?: string;
  phoneValidationStatus?: 'pending' | 'valid' | 'invalid';
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
  phoneCarrier: string;
}

export interface BuyerWithBids extends Buyer {
  acceptedBids: number;
  pendingBids: number;
  declinedBids: number;
}

export type CarrierType = 
  | 'Verizon Wireless'
  | 'AT&T'
  | 'T-Mobile'
  | 'Sprint'
  | 'US Cellular'
  | 'Metro PCS'
  | 'Boost Mobile'
  | 'Cricket'
  | 'Virgin Mobile';

