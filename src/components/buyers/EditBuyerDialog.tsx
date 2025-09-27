
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Buyer, BuyerFormData } from "@/types/buyers";
import { useState, useEffect } from "react";
import { usePhoneFormat } from "@/hooks/signup/usePhoneFormat";
import AddBuyerForm from "./AddBuyerForm";

interface EditBuyerDialogProps {
  buyer: Buyer | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (variables: { buyerId: string, buyerData: BuyerFormData }) => void;
}

const EditBuyerDialog = ({ buyer, isOpen, onOpenChange, onUpdate }: EditBuyerDialogProps) => {
  const { formatPhoneNumber } = usePhoneFormat();
  
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
      setFormData({
        fullName: buyer.name || "",
        email: buyer.email || "",
        mobileNumber: formatPhoneNumber(buyer.mobileNumber || ""),
        businessNumber: formatPhoneNumber(buyer.businessNumber || ""),
        dealershipName: buyer.dealership || "",
        licenseNumber: buyer.dealerId || "",
        dealershipAddress: buyer.address || "",
        city: buyer.city || "",
        state: buyer.state || "",
        zipCode: buyer.zipCode || "",
        phoneCarrier: buyer.phoneCarrier || "",
      });
    }
  }, [buyer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (buyer) {
      onUpdate({ buyerId: buyer.id, buyerData: formData });
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
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
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditBuyerDialog;
