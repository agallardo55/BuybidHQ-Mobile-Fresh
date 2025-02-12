
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBuyers } from "@/hooks/useBuyers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";

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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.id) {
      toast.error("You must be logged in to add buyers");
      return;
    }

    if (!formData.name || !formData.dealership || !formData.mobile) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createBuyer({
        fullName: formData.name,
        dealershipName: formData.dealership,
        mobileNumber: formData.mobile,
        email: "", // Required by the type but not needed for this form
        businessNumber: "",
        licenseNumber: "",
        dealershipAddress: "",
        city: "",
        state: "",
        zipCode: "",
      });
      
      setFormData({ name: "", dealership: "", mobile: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding buyer:", error);
      toast.error("Failed to add buyer. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Buyer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input 
              placeholder="Enter buyer name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dealership</label>
            <Input 
              placeholder="Enter dealership name"
              name="dealership"
              value={formData.dealership}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile</label>
            <Input 
              placeholder="Enter mobile number"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>
          <Button 
            type="submit"
            className="w-full bg-custom-blue hover:bg-custom-blue/90 text-white"
          >
            Add Buyer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBuyerDialog;
