
export interface Dealership {
  id: string;
  user_id?: string | null; // From unified_dealer_info (individual_dealers.user_id or dealerships.primary_user_id)
  dealer_name: string;
  dealer_id: string | null;
  business_phone: string;
  business_email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  is_active: boolean;
  license_number: string | null;
  website: string | null;
  notes: string | null;
  primary_user_id: string | null; // Deprecated - will be removed after migration
  primary_assigned_at: string | null; // Deprecated - will be removed after migration
  last_updated_at: string | null;
  last_updated_by: string | null;
  created_at: string;
  account_admin?: {
    id: string;
    full_name: string | null;
    email: string;
    mobile_number: string | null;
  } | null;
}

export interface DealershipFormData {
  dealerName: string;
  dealerId: string;
  businessPhone: string;
  businessEmail: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}
