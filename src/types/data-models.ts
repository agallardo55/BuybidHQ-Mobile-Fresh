/**
 * Core Data Models for BuyBidHQ
 * 
 * This file defines the primary data structures that align with
 * the Supabase database schema and provide type safety across the app.
 */

// Base types for common patterns
export interface TimestampedEntity {
  created_at: string;
  updated_at?: string;
}

export interface UserOwnedEntity {
  user_id: string;
}

export interface AccountOwnedEntity {
  account_id: string;
}

// Account and subscription types
export type PlanType = 'free' | 'connect' | 'group';

export interface Account extends TimestampedEntity {
  id: string;
  name: string;
  plan: PlanType;
  seat_limit: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  billing_status: string;
  feature_group_enabled: boolean;
}

// User profile extending auth user
export interface UserProfile extends TimestampedEntity, UserOwnedEntity {
  id: string; // matches auth.users.id
  email: string;
  full_name?: string;
  mobile_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  role: 'basic' | 'individual' | 'dealer' | 'associate' | 'admin';
  app_role: 'member' | 'manager' | 'account_admin' | 'super_admin';
  status: 'active' | 'inactive' | 'deleted';
  is_active: boolean;
  dealership_id?: string;
  account_id?: string;
  phone_validated: boolean;
  phone_carrier?: string;
  phone_type?: 'mobile' | 'landline' | 'voip';
  sms_consent: boolean;
  deleted_at?: string;
}

// Dealership types
export type DealerType = 'individual' | 'multi_user';

export interface Dealership extends TimestampedEntity {
  id: string;
  dealer_name: string;
  dealer_type: DealerType;
  primary_user_id?: string;
  primary_assigned_at?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  business_phone: string;
  business_email: string;
  license_number?: string;
  website?: string;
  notes?: string;
  is_active: boolean;
  last_updated_at?: string;
  last_updated_by?: string;
}

// Vehicle and bid request types
export interface Vehicle extends TimestampedEntity {
  id: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  vin?: string;
  mileage?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  exterior?: string;
  interior?: string;
  options?: string;
}

export interface Reconditioning extends TimestampedEntity {
  id: string;
  vehicle_id?: string;
  windshield?: string;
  engine_light?: string;
  brakes?: string;
  tires?: string;
  maintenance?: string;
  recon_estimate?: string;
  recon_details?: string;
}

export type BidRequestStatus = 'Pending' | 'Active' | 'Completed' | 'Cancelled';

export interface BidRequest extends TimestampedEntity, UserOwnedEntity, AccountOwnedEntity {
  id: string;
  vehicle_id?: string;
  recon?: string;
  status?: BidRequestStatus;
  contacts?: string;
  images_id?: string;
  // Populated relations
  vehicle?: Vehicle;
  reconditioning?: Reconditioning;
  images?: VehicleImage[];
  responses?: BidResponse[];
}

// Buyer types
export type BuyerPhoneValidationStatus = 'valid' | 'invalid' | 'pending';

export interface Buyer extends TimestampedEntity, UserOwnedEntity, AccountOwnedEntity {
  id: string;
  buyer_name?: string;
  dealer_name?: string;
  email: string;
  buyer_mobile?: string;
  buyer_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  dealer_id?: string;
  phone_carrier?: string;
  standardized_phone?: string;
  phone_validation_status?: BuyerPhoneValidationStatus;
  last_validated_at?: string;
  owner_user_id?: string;
  accepted_bids: number;
  pending_bids: number;
  declined_bids: number;
}

// Bid response types
export interface BidResponse extends TimestampedEntity {
  id: string;
  bid_request_id: string;
  buyer_id: string;
  offer_amount: number;
  status: 'pending' | 'accepted' | 'declined';
  notes?: string;
  // Populated relations
  buyer?: Buyer;
  bid_request?: BidRequest;
}

// Image types
export interface VehicleImage extends TimestampedEntity {
  id: string;
  bid_request_id?: string;
  image_url?: string;
  sequence_order?: number;
}

// Notification types
export type NotificationType = 'bid_response' | 'bid_accepted' | 'bid_declined' | 'system';

export interface Notification extends TimestampedEntity, UserOwnedEntity {
  id: string;
  type: NotificationType;
  content: Record<string, any>; // jsonb content
  read_at?: string;
  cleared_at?: string;
  reference_id?: string;
}

// Subscription and billing types
export interface Subscription extends TimestampedEntity, UserOwnedEntity {
  id: string;
  plan_type: string;
  status: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
  trial_ends_at?: string;
  next_billing_date?: string;
  last_billing_date?: string;
  billing_cycle_anchor?: string;
  is_trial: boolean;
}

// Usage tracking
export interface BidUsage extends TimestampedEntity, UserOwnedEntity {
  id: string;
  subscription_id?: string;
  bid_request_id?: string;
  amount?: number;
  billing_status: string;
  billed_at?: string;
  stripe_invoice_item_id?: string;
}

// Form data types for UI components
export interface BidRequestFormData {
  // Vehicle information
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  exterior: string;
  interior: string;
  options: string;
  
  // Reconditioning information
  windshield: string;
  engine_light: string;
  brakes: string;
  tires: string;
  maintenance: string;
  recon_estimate: string;
  recon_details: string;
  
  // Images and buyers
  images: File[];
  selected_buyers: string[];
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Search and filter types
export interface SearchFilters {
  search_term?: string;
  status?: BidRequestStatus[];
  date_from?: string;
  date_to?: string;
  make?: string[];
  model?: string[];
  year_from?: number;
  year_to?: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}