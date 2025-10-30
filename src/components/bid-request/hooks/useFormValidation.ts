
import { BidRequestFormData, FormErrors } from "../types";

const validateFormData = (formData: BidRequestFormData, selectedBuyers: string[]) => {
  const newErrors: FormErrors = {};
  
  // Required base fields validation
  if (!formData.year) newErrors.year = "Year is required";
  if (!formData.make) newErrors.make = "Make is required";
  if (!formData.model) newErrors.model = "Model is required";
  if (!formData.trim) newErrors.trim = "Trim is required";
  // VIN is now optional - remove required validation
  if (!formData.mileage) newErrors.mileage = "Mileage is required";
  if (selectedBuyers.length === 0) newErrors.buyers = "Please select at least one buyer";
  
  // VIN validation (only if provided)
  if (formData.vin && formData.vin.length !== 17) {
    newErrors.vin = "VIN must be 17 characters";
  }
  
  // Year validation
  const currentYear = new Date().getFullYear();
  const year = parseInt(formData.year);
  if (year < 1900 || year > currentYear + 1) {
    newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
  }

  // Mileage validation
  if (parseInt(formData.mileage) < 0) {
    newErrors.mileage = "Mileage cannot be negative";
  }

  return newErrors;
};

export const useFormValidation = () => {
  return { validateForm: validateFormData };
};

// Export the validateForm function directly
export const validateForm = validateFormData;
