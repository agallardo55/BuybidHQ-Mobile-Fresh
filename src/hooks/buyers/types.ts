
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
  phone_validation_status: 'pending' | 'processing' | 'valid' | 'invalid' | null;
  standardized_phone: string | null;
  line_type: string | null;
  carrier_detail: Record<string, any> | null;
  last_validated_at: string | null;
  is_ported: boolean | null;
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
  mobileNumber: string; // Changed from phone to mobileNumber
  businessNumber: string; // Added businessNumber
  location: string;
  acceptedBids: number;
  pendingBids: number;
  declinedBids: number;
  ownerName: string;
  ownerEmail: string;
  phoneCarrier?: string;
  phoneValidationStatus?: 'pending' | 'processing' | 'valid' | 'invalid';
  lineType?: string;
  lastValidatedAt?: string;
  isPortedNumber?: boolean;
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
