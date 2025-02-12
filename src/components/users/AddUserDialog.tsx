
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
import { UserFormData } from "@/types/users";

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: UserFormData;
  onFormDataChange: (data: Partial<UserFormData>) => void;
}

const AddUserDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  formData,
  onFormDataChange,
}: AddUserDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-accent hover:bg-accent/90">
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
            onSubmit={onSubmit}
            formData={formData}
            onFormDataChange={onFormDataChange}
          />
        </div>
        <DialogFooter className="h-4" />
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
