import { DealershipFormData } from "@/types/dealerships";
import BasicInfoSection from "../form-sections/BasicInfoSection";
import AddressSection from "../form-sections/AddressSection";

interface DealershipInfoStepProps {
  formData: DealershipFormData;
  errors: Record<string, string>;
  onChange: (field: keyof DealershipFormData, value: string) => void;
}

const DealershipInfoStep = ({
  formData,
  errors,
  onChange,
}: DealershipInfoStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Dealership Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Enter the basic information about your dealership.
        </p>
      </div>

      <BasicInfoSection
        dealerName={formData.dealerName}
        dealerId={formData.dealerId}
        businessPhone={formData.businessPhone}
        businessEmail={formData.businessEmail}
        onChange={onChange}
      />

      <AddressSection
        address={formData.address}
        city={formData.city}
        state={formData.state}
        zipCode={formData.zipCode}
        onChange={onChange}
      />
    </div>
  );
};

export default DealershipInfoStep;