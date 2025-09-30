
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DialogFooter } from "@/components/ui/dialog";
import { BuyerFormData } from "@/types/buyers";
import PersonalInfoSection from "./form-sections/PersonalInfoSection";
import DealershipSection from "./form-sections/DealershipSection";
import AddressSection from "./form-sections/AddressSection";

interface AddBuyerFormProps {
  onSubmit: (e: React.FormEvent) => void;
  formData: BuyerFormData;
  onFormDataChange: (data: Partial<BuyerFormData>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditMode?: boolean;
}

const AddBuyerForm = ({
  onSubmit,
  formData,
  onFormDataChange,
  onCancel,
  onDelete,
  isEditMode
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
    <form onSubmit={onSubmit} className="space-y-6">
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
          <AddressSection 
            formData={formData} 
            onFormDataChange={onFormDataChange} 
          />
        </div>
      </div>

      <DialogFooter>
        <div className="flex justify-between items-center w-full mt-6">
          {/* Left side - Delete button (only in edit mode) */}
          {isEditMode && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          )}
          
          {/* Right side - Cancel and Submit buttons */}
          <div className="flex gap-4 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isEditMode ? 'Update' : 'Add Buyer'}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </form>
  );
};

export default AddBuyerForm;
