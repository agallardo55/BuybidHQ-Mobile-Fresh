
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
  onUpdate: (buyerId: string, buyerData: BuyerFormData) => void;
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
  });

  useEffect(() => {
    if (buyer) {
      const [city, state] = buyer.location.split(", ");
      setFormData({
        fullName: buyer.name,
        email: buyer.email,
        mobileNumber: "",
        businessNumber: buyer.phone,
        dealershipName: buyer.dealership,
        licenseNumber: "",
        dealershipAddress: "",
        city,
        state,
        zipCode: "",
      });
    }
  }, [buyer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (buyer) {
      onUpdate(buyer.id, formData);
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
          onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditBuyerDialog;
