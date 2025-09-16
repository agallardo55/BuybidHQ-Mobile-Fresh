
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DealershipFormData } from "@/types/dealerships";
import BasicInfoSection from "./form-sections/BasicInfoSection";
import AddressSection from "./form-sections/AddressSection";

interface DealershipFormProps {
  initialData?: Partial<DealershipFormData>;
  onSubmit: (data: DealershipFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DealershipForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}: DealershipFormProps) => {
  const [formData, setFormData] = useState<DealershipFormData>({
    dealerName: initialData?.dealerName || "",
    dealerId: initialData?.dealerId || "",
    businessPhone: initialData?.businessPhone || "",
    businessEmail: initialData?.businessEmail || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
  });

  const handleChange = (field: keyof DealershipFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.dealerName.trim()) errors.push("Dealership Name is required");
    if (!formData.businessPhone.trim()) errors.push("Business Phone is required");
    if (!formData.businessEmail.trim()) errors.push("Business Email is required");
    
    if (formData.businessEmail && !/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      errors.push("Valid email address is required");
    }
    
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      // You could show these errors with toast or set them to state
      console.error('Validation errors:', validationErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection
        dealerName={formData.dealerName}
        dealerId={formData.dealerId}
        businessPhone={formData.businessPhone}
        businessEmail={formData.businessEmail}
        onChange={handleChange}
      />

      <AddressSection
        address={formData.address}
        city={formData.city}
        state={formData.state}
        zipCode={formData.zipCode}
        onChange={handleChange}
      />

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default DealershipForm;
