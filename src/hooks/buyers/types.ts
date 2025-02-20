
import { BuyerFormData } from "@/types/buyers";

export interface BuyerResponse {
  id: string;
  user_id: string;
  buyer_name: string;
  email: string;
  dealer_name: string;
  dealer_id: string | null;
  buyer_mobile: string;
  buyer_phone: string;
  city: string;
  state: string;
  zip_code: string;
  address: string;
  accepted_bids: number;
  pending_bids: number;
  declined_bids: number;
  phone_carrier: string | null;
  phone_validation_status?: 'pending' | 'valid' | 'invalid' | 'processing';
}

export interface MappedBuyer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  dealership: string;
  dealerId: string;
  mobileNumber: string;
  businessNumber: string;
  location: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  acceptedBids: number;
  pendingBids: number;
  declinedBids: number;
  phoneCarrier: string;
  phoneValidationStatus?: 'pending' | 'valid' | 'invalid' | 'processing';
}

export interface UpdateBuyerParams {
  buyerId: string;
  buyerData: BuyerFormData;
}
