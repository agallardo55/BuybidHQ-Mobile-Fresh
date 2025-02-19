
import { Button } from "@/components/ui/button";
import { CarrierType } from "@/types/buyers";
import BuyerInfoSection from "./BuyerInfoSection";
import ContactInfoSection from "./ContactInfoSection";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBuyers } from "@/hooks/useBuyers";
import { useState } from "react";
import { toast } from "sonner";

interface AddBuyerFormProps {
  formData: {
    name: string;
    dealership: string;
    mobile: string;
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
  const { currentUser } = useCurrentUser();
  const { validateCarrier } = useBuyers();
  const [isValidatingCarrier, setIsValidatingCarrier] = useState(false);

  const handleValidateCarrier = async () => {
    if (!currentUser?.id || !formData.mobile) {
      toast.error("Please enter a mobile number first");
      return;
    }

    setIsValidatingCarrier(true);
    try {
      const result = await validateCarrier(currentUser.id, formData.mobile);
      if (result) {
        if (result.carrier && CARRIER_OPTIONS.includes(result.carrier as CarrierType)) {
          onCarrierChange(result.carrier);
          toast.success("Carrier detected successfully");
        } else {
          toast.error("Carrier not supported or could not be detected");
        }
      }
    } finally {
      setIsValidatingCarrier(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <BuyerInfoSection
        name={formData.name}
        dealership={formData.dealership}
        onChange={onChange}
      />
      <div className="space-y-2">
        <ContactInfoSection
          mobile={formData.mobile}
          carrier={formData.carrier}
          onChange={onChange}
          onCarrierChange={onCarrierChange}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleValidateCarrier}
          disabled={isValidatingCarrier || !formData.mobile}
          className="w-full mt-2"
        >
          {isValidatingCarrier ? "Detecting Carrier..." : "Detect Carrier"}
        </Button>
      </div>
      <Button 
        type="submit"
        className="w-full bg-custom-blue hover:bg-custom-blue/90 text-white"
        disabled={isValidating}
      >
        {isValidating ? "Validating..." : "Add Buyer"}
      </Button>
    </form>
  );
};

export default AddBuyerForm;
