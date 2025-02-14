
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, UserFormData, DealershipFormData } from "@/types/users";
import { useState, useEffect } from "react";
import AddUserForm from "./AddUserForm";

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (userId: string, userData: UserFormData, dealershipData?: DealershipFormData) => void;
}

const EditUserDialog = ({ user, isOpen, onOpenChange, onUpdate }: EditUserDialogProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    role: "basic",
    mobileNumber: "",
    isActive: true,
  });

  const [dealershipData, setDealershipData] = useState<DealershipFormData>({
    dealerName: "",
    dealerId: "",
    businessPhone: "",
    businessEmail: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        dealershipId: user.dealershipId || "",
        isActive: user.isActive,
      });

      if (user.dealershipInfo) {
        setDealershipData({
          dealerName: user.dealershipInfo.dealerName,
          dealerId: user.dealershipInfo.dealerId,
          businessPhone: user.dealershipInfo.businessPhone,
          businessEmail: user.dealershipInfo.businessEmail,
          address: user.dealershipInfo.address || "",
          city: user.dealershipInfo.city || "",
          state: user.dealershipInfo.state || "",
          zipCode: user.dealershipInfo.zipCode || ""
        });
      }
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onUpdate(
        user.id, 
        formData, 
        formData.role === 'dealer' ? dealershipData : undefined
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <AddUserForm
          onSubmit={handleSubmit}
          formData={formData}
          onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
          initialDealershipData={dealershipData}
          onDealershipDataChange={setDealershipData}
          submitButtonText="Update"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
