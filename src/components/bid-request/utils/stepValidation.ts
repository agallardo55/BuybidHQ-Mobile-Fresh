
import { FormErrors } from "../types";

export const validateBasicInfoStep = (formData: {
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: string;
}): FormErrors => {
  const stepErrors: FormErrors = {};

  if (!formData.year) stepErrors.year = "Year is required";
  if (!formData.make) stepErrors.make = "Make is required";
  if (!formData.model) stepErrors.model = "Model is required";
  if (!formData.trim) stepErrors.trim = "Trim is required";
  // VIN is now optional - remove required validation
  if (!formData.mileage) stepErrors.mileage = "Mileage is required";

  // VIN validation (only if provided)
  if (formData.vin && formData.vin.length !== 17) {
    stepErrors.vin = "VIN must be 17 characters";
  }

  // Year validation
  const currentYear = new Date().getFullYear();
  const year = parseInt(formData.year);
  if (year < 1900 || year > currentYear + 1) {
    stepErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
  }

  // Mileage validation
  if (parseInt(formData.mileage) < 0) {
    stepErrors.mileage = "Mileage cannot be negative";
  }

  return stepErrors;
};

export const validateBuyersStep = (selectedBuyers: string[]): FormErrors => {
  const stepErrors: FormErrors = {};
  
  if (selectedBuyers.length === 0) {
    stepErrors.buyers = "Please select at least one buyer";
  }

  return stepErrors;
};
