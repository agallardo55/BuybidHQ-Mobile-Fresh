import { DealershipFormData } from "./dealerships";
import { UserRole, CarrierType } from "./users";

export type WizardStep = 'dealership' | 'admin';

export interface AdminUserFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  phoneCarrier: CarrierType | string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  role: UserRole;
  isActive: boolean;
}

export interface DealershipWizardData {
  dealership: DealershipFormData;
  adminUser: AdminUserFormData;
}

export interface WizardFormProps {
  onSubmit: (data: DealershipWizardData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface WizardErrors {
  dealership?: Record<string, string>;
  adminUser?: Record<string, string>;
}