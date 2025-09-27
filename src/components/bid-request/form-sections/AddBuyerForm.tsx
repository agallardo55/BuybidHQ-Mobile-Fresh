
import { Button } from "@/components/ui/button";
import { CarrierType } from "@/types/buyers";
import BuyerInfoSection from "./BuyerInfoSection";
import ContactInfoSection from "./ContactInfoSection";
import { Input } from "@/components/ui/input";

interface AddBuyerFormProps {
  formData: {
    name: string;
    dealership: string;
    mobile: string;
    email: string;
    carrier: CarrierType | "";
  };
  isValidating: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCarrierChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AddBuyerForm = ({
  formData,
  isValidating,
  onChange,
  onCarrierChange,
  onSubmit
}: AddBuyerFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <BuyerInfoSection
        name={formData.name}
        dealership={formData.dealership}
        onChange={onChange}
      />
      <div className="space-y-4">
        <ContactInfoSection
          mobile={formData.mobile}
          carrier={formData.carrier}
          onChange={onChange}
          onCarrierChange={onCarrierChange}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Email (Optional)</label>
          <Input
            placeholder="Enter buyer email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
          />
        </div>
      </div>
      <Button 
        type="submit"
        className="w-full bg-custom-blue hover:bg-custom-blue/90 text-white"
        disabled={isValidating}
      >
        {isValidating ? "Submitting..." : "Add Buyer"}
      </Button>
    </form>
  );
};

export default AddBuyerForm;
