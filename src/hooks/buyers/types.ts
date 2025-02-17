
import { BuyerFormData } from "@/types/buyers";

export interface BuyerResponse {
  id: string;
  user_id: string;
  buyer_name: string;
  email: string;
  dealer_name: string;
  buyer_mobile: string;
  buyer_phone: string;
  city: string;
  state: string;
  zip_code: string;
  accepted_bids: number;
  pending_bids: number;
  declined_bids: number;
  phone_carrier: string;
  user: {
    full_name: string;
    email: string;
  };
}

export interface MappedBuyer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  dealership: string;
  mobileNumber: string;
  businessNumber: string;
  location: string;
  acceptedBids: number;
  pendingBids: number;
  declinedBids: number;
  ownerName: string;
  ownerEmail: string;
  phoneCarrier: string;
}

export interface UpdateBuyerParams {
  buyerId: string;
  buyerData: BuyerFormData;
}
