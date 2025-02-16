
export interface Dealership {
  id: string;
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
  primary_user_id: string | null;
  primary_assigned_at: string | null;
  last_updated_at: string | null;
  last_updated_by: string | null;
  created_at: string;
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
  licenseNumber: string;
  website: string;
  notes: string;
}
