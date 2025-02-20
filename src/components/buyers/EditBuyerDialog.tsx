
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Buyer, BuyerFormData } from "@/types/buyers";
import { useState, useEffect } from "react";
import AddBuyerForm from "./AddBuyerForm";

interface EditBuyerDialogProps {
  buyer: Buyer | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (variables: { buyerId: string, buyerData: BuyerFormData }) => void;
}

const EditBuyerDialog = ({ buyer, isOpen, onOpenChange, onUpdate }: EditBuyerDialogProps) => {
  const [formData, setFormData] = useState<BuyerFormData>({
    fullName: "",
    email: "",
    mobileNumber: "",
    businessNumber: "",
    dealershipName: "",
    licenseNumber: "",
    dealershipAddress: "",
    city: "",
    state: "",
    zipCode: "",
    phoneCarrier: "",
  });

  useEffect(() => {
    if (buyer) {
      // Extract city, state, and address from location if it exists
      const locationParts = buyer.location?.split(", ") || [];
      const city = locationParts[0] || "";
      const state = locationParts[1] || "";
      
      // Transform buyer data to form data format
      setFormData({
        fullName: buyer.name || "",
        email: buyer.email || "",
        mobileNumber: buyer.mobileNumber || "",
        businessNumber: buyer.businessNumber || "",
        dealershipName: buyer.dealership || "",
        licenseNumber: "", // Keeping this empty as it's not in the Buyer type
        dealershipAddress: locationParts[2] || "", // Using the third part of location as address if available
        city,
        state,
        zipCode: locationParts[3] || "", // Using the fourth part of location as zipcode if available
        phoneCarrier: buyer.phoneCarrier || "",
      });

      // Log the data being loaded for debugging
      console.log("Loading buyer data:", {
        original: buyer,
        transformed: formData
      });
    }
  }, [buyer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (buyer) {
      // Log the data being submitted for debugging
      console.log("Submitting buyer update:", {
        buyerId: buyer.id,
        formData
      });
      
      onUpdate({ buyerId: buyer.id, buyerData: formData });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Buyer</DialogTitle>
        </DialogHeader>
        <AddBuyerForm
          onSubmit={handleSubmit}
          formData={formData}
          onFormDataChange={(data) => {
            console.log("Form data changing:", data);
            setFormData(prev => ({ ...prev, ...data }));
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditBuyerDialog;
