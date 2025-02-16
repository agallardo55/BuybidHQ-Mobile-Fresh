
// Database User Role type matching Supabase enum
export type UserRole = 'basic' | 'individual' | 'dealer' | 'associate' | 'admin';

// Carrier type for mobile providers
export type CarrierType = 'Verizon Wireless' | 'AT&T' | 'T-Mobile' | 'Sprint' | 'US Cellular' | 'Metro PCS' | 'Boost Mobile' | 'Cricket' | 'Virgin Mobile';

// Base user interface matching database schema
export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  full_name: string | null;
  mobile_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  company: string | null;
  dealership_id: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
  phone_carrier: string | null;
  phone_validated: boolean;
}

// Dealership interface matching database schema
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
  created_at?: string;
  primary_user_id: string | null;
  primary_assigned_at?: string;
}

// Extended user interface with dealership information
export interface User extends BaseUser {
  dealership?: Dealership | null;
  isPrimaryDealer?: boolean;
}

// Form data interfaces for consistent shape across components
export interface UserFormData {
  fullName: string;
  email: string;
  role: UserRole;
  mobileNumber: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dealershipId?: string;
  isActive: boolean;
  isPrimaryDealer?: boolean;
  phoneCarrier?: string;
  phoneValidated?: boolean;
}

export interface DealershipFormData {
  dealerName: string;
  dealerId: string;
  businessPhone: string;
  businessEmail: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  primaryUserId?: string;
}

// Type guard for UserRole
export const isUserRole = (role: string): role is UserRole => {
  return ['basic', 'individual', 'dealer', 'associate', 'admin'].includes(role);
};

// Utility type for transforming snake_case to camelCase
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

// Database to frontend type transformer
export const transformDatabaseUser = (dbUser: BaseUser): UserFormData => {
  return {
    fullName: dbUser.full_name || '',
    email: dbUser.email,
    role: dbUser.role,
    mobileNumber: dbUser.mobile_number || '',
    address: dbUser.address || '',
    city: dbUser.city || '',
    state: dbUser.state || '',
    zipCode: dbUser.zip_code || '',
    dealershipId: dbUser.dealership_id || undefined,
    isActive: dbUser.is_active,
    phoneCarrier: dbUser.phone_carrier || undefined,
    phoneValidated: dbUser.phone_validated
  };
};

// Frontend to database type transformer
export const transformFormUser = (formData: UserFormData): Partial<BaseUser> => {
  return {
    full_name: formData.fullName,
    email: formData.email,
    role: formData.role,
    mobile_number: formData.mobileNumber,
    address: formData.address || null,
    city: formData.city || null,
    state: formData.state || null,
    zip_code: formData.zipCode || null,
    dealership_id: formData.dealershipId || null,
    is_active: formData.isActive,
    phone_carrier: formData.phoneCarrier || null,
    phone_validated: formData.phoneValidated || false
  };
};

