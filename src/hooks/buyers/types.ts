
import { BuyerFormData } from "@/types/buyers";

export interface BuyerResponse {
  id: string;
  user_id: string | null;
  buyer_name: string | null;
  email: string | null;
  dealer_name: string | null;
  buyer_mobile: string | null;
  buyer_phone: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  accepted_bids: number;
  pending_bids: number;
  declined_bids: number;
  phone_carrier: string | null;
  phone_validation_status: 'pending' | 'valid' | 'invalid' | null;
  standardized_phone: string | null;
  user: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface MappedBuyer {
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

export interface UpdateBuyerParams {
  buyerId: string;
  buyerData: BuyerFormData;
}

// Add new interface for user permissions
export interface UserPermission {
  id: string;
  user_id: string | null;
  resource_type: string;
  resource_id: string;
  permission: string;
  created_at: string | null;
}
