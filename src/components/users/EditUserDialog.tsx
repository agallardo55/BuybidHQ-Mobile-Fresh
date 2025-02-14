
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, UserFormData, DealershipFormData, transformDatabaseUser } from "@/types/users";
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
    role: "associate",
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
      setFormData(transformDatabaseUser(user));

      if (user.dealership) {
        setDealershipData({
          dealerName: user.dealership.dealer_name,
          dealerId: user.dealership.dealer_id || '',
          businessPhone: user.dealership.business_phone,
          businessEmail: user.dealership.business_email,
          address: user.dealership.address || "",
          city: user.dealership.city || "",
          state: user.dealership.state || "",
          zipCode: user.dealership.zip_code || ""
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
