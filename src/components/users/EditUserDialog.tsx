
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, UserFormData } from "@/types/users";
import { useState, useEffect } from "react";
import AddUserForm from "./AddUserForm";

interface EditUserDialogProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (userId: string, userData: UserFormData) => void;
}

const EditUserDialog = ({ user, isOpen, onOpenChange, onUpdate }: EditUserDialogProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    role: "basic",
    mobileNumber: "",
    isActive: true,
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
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onUpdate(user.id, formData);
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
          readOnlyDealership={user?.dealershipName || ""}
          submitButtonText="Update"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
