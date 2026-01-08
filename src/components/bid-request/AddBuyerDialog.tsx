
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBuyers } from "@/hooks/useBuyers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "@/utils/notificationToast";
import AddBuyerForm from "./form-sections/AddBuyerForm";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";

interface AddBuyerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddBuyerDialog = ({ isOpen, onOpenChange }: AddBuyerDialogProps) => {
  const { currentUser } = useCurrentUser();
  const { createBuyer } = useBuyers();
  const { formatPhoneNumber: formatPhoneForDisplay } = usePhoneFormat();
  const [formData, setFormData] = useState({
    name: "",
    dealership: "",
    mobile: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    return phoneNumber;
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
      setIsSubmitting(true);

      const buyerData = {
        fullName: formData.name,
        dealershipName: formData.dealership,
        mobileNumber: formatPhoneNumber(formData.mobile),
        email: formData.email,
        businessNumber: "",
        licenseNumber: "",
        dealershipAddress: "",
        city: "",
        state: "",
        zipCode: "",
      };

      await createBuyer(buyerData);
      setFormData({ name: "", dealership: "", mobile: "", email: "" });
      onOpenChange(false);
      toast.success("Buyer added successfully");
    } catch (error) {
      console.error("Error adding buyer:", error);
      toast.error("Failed to add buyer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone number for mobile field
    if (name === 'mobile') {
      const formattedValue = formatPhoneForDisplay(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Add New Buyer</DialogTitle>
        </DialogHeader>
        <AddBuyerForm
          formData={formData}
          isValidating={false}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddBuyerDialog;
