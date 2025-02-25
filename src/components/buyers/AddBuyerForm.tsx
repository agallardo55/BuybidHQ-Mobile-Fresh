
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BuyerFormData } from "@/types/buyers";
import PersonalInfoSection from "./form-sections/PersonalInfoSection";
import DealershipSection from "./form-sections/DealershipSection";
import AddressSection from "./form-sections/AddressSection";

interface AddBuyerFormProps {
  onSubmit: (e: React.FormEvent) => void;
  formData: BuyerFormData;
  onFormDataChange: (data: Partial<BuyerFormData>) => void;
}

const AddBuyerForm = ({
  onSubmit,
  formData,
  onFormDataChange
}: AddBuyerFormProps) => {
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
    if (phoneNumber.length > 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    if (phoneNumber.length > 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return phoneNumber;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 mt-4">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <PersonalInfoSection 
            formData={formData} 
            onFormDataChange={onFormDataChange} 
            formatPhoneNumber={formatPhoneNumber} 
          />
        </div>

        <Separator className="my-6" />

        <div>
          <h3 className="text-lg font-medium mb-4">Dealership Information</h3>
          <DealershipSection 
            formData={formData} 
            onFormDataChange={onFormDataChange} 
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Address Information</h3>
          <AddressSection 
            formData={formData} 
            onFormDataChange={onFormDataChange} 
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {formData.fullName ? 'Update' : 'Add Buyer'}
        </Button>
      </div>
    </form>
  );
};

export default AddBuyerForm;
