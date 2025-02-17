
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBuyers } from "@/hooks/useBuyers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { CarrierType } from "@/types/buyers";

const CARRIER_OPTIONS: CarrierType[] = [
  'Verizon Wireless',
  'AT&T',
  'T-Mobile',
  'Sprint',
  'US Cellular',
  'Metro PCS',
  'Boost Mobile',
  'Cricket',
  'Virgin Mobile'
];

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
    carrier: "" as CarrierType | "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.id) {
      toast.error("You must be logged in to add buyers");
      return;
    }

    if (!formData.name || !formData.dealership || !formData.mobile || !formData.carrier) {
      toast.error("Please fill in all fields including carrier");
      return;
    }

    try {
      await createBuyer({
        fullName: formData.name,
        dealershipName: formData.dealership,
        mobileNumber: formData.mobile,
        phoneCarrier: formData.carrier,
        email: "", // Required by the type but not needed for this form
        businessNumber: "",
        licenseNumber: "",
        dealershipAddress: "",
        city: "",
        state: "",
        zipCode: "",
      });
      
      setFormData({ name: "", dealership: "", mobile: "", carrier: "" });
      onOpenChange(false);
      toast.success("Buyer added successfully");
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

  const handleCarrierChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      carrier: value as CarrierType
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Carrier</label>
            <Select
              value={formData.carrier}
              onValueChange={handleCarrierChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                {CARRIER_OPTIONS.map(carrier => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
