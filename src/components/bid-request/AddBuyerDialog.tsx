
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBuyers } from "@/hooks/useBuyers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { CarrierType } from "@/types/buyers";
import { supabase } from "@/integrations/supabase/client";
import AddBuyerForm from "./form-sections/AddBuyerForm";
import { CARRIER_OPTIONS } from "./form-sections/ContactInfoSection";

interface AddBuyerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddBuyerDialog = ({ isOpen, onOpenChange }: AddBuyerDialogProps) => {
  const { currentUser } = useCurrentUser();
  const { createBuyer } = useBuyers();
  const [formData, setFormData] = useState({
    name: "",
    dealership: "",
    mobile: "",
    carrier: "" as CarrierType | "",
  });
  const [isValidating, setIsValidating] = useState(false);

  const validatePhoneNumber = async (phoneNumber: string) => {
    try {
      setIsValidating(true);
      const { data, error } = await supabase.functions.invoke('validate-phone', {
        body: { phone_number: phoneNumber }
      });

      if (error) throw error;

      if (!data.is_valid) {
        toast.error("Invalid phone number. Please check and try again.");
        return false;
      }

      if (data.line_type !== 'mobile') {
        toast.error("Please provide a mobile phone number.");
        return false;
      }

      // Auto-set carrier if detected and it's one of our supported carriers
      if (data.carrier?.name && CARRIER_OPTIONS.includes(data.carrier.name as CarrierType)) {
        setFormData(prev => ({
          ...prev,
          carrier: data.carrier.name as CarrierType
        }));
        toast.success("Carrier detected automatically");
      }

      return true;
    } catch (error) {
      console.error("Phone validation error:", error);
      toast.error("Failed to validate phone number. Please try again.");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.id) {
      toast.error("You must be logged in to add buyers");
      return;
    }

    if (!formData.name || !formData.dealership || !formData.mobile) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsValidating(true);

      const buyerData = {
        fullName: formData.name,
        dealershipName: formData.dealership,
        mobileNumber: formData.mobile,
        phoneCarrier: formData.carrier || "",
        email: "",
        businessNumber: "",
        dealershipAddress: "",
        city: "",
        state: "",
        zipCode: "",
      };

      await createBuyer(buyerData);
      setFormData({ name: "", dealership: "", mobile: "", carrier: "" });
      onOpenChange(false);
      toast.success("Buyer added successfully");
    } catch (error) {
      console.error("Error adding buyer:", error);
      toast.error("Failed to add buyer. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate phone number when mobile number is complete
    if (name === 'mobile' && value.length >= 10) {
      validatePhoneNumber(value);
    }
  };

  const handleCarrierChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      carrier: value as CarrierType
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Add New Buyer</DialogTitle>
        </DialogHeader>
        <AddBuyerForm
          formData={formData}
          isValidating={isValidating}
          onChange={handleChange}
          onCarrierChange={handleCarrierChange}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddBuyerDialog;
