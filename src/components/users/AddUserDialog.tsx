
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddUserForm from "./AddUserForm";
import { UserFormData, DealershipFormData } from "@/types/users";
import { useUsers } from "@/hooks/users";
import { useState } from "react";

const AddUserDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutations } = useUsers({
    pageSize: 20,
    currentPage: 1,
    searchTerm: ""
  });
  
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    role: "associate",
    mobileNumber: "",
    isActive: true,
  });

  const handleFormDataChange = (data: Partial<UserFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async (e: React.FormEvent, dealershipData?: DealershipFormData) => {
    e.preventDefault();
    try {
      await mutations.createUser.mutateAsync({
        userData: formData,
        dealershipData
      });
      setIsOpen(false);
      setFormData({
        fullName: "",
        email: "",
        role: "associate",
        mobileNumber: "",
        isActive: true,
      });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-custom-blue hover:bg-custom-blue/90">
          <Plus className="h-4 w-4" />
          User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="px-6">
          <AddUserForm
            onSubmit={handleSubmit}
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        </div>
        <DialogFooter className="h-4" />
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
