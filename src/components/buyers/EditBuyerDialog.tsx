
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Buyer, BuyerFormData } from "@/types/buyers";
import { useState, useEffect } from "react";
import { formatPhoneForDisplay } from "@/utils/phoneUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PersonalInfoSection from "./form-sections/PersonalInfoSection";
import DealershipSection from "./form-sections/DealershipSection";
import AddressSection from "./form-sections/AddressSection";
import DeleteBuyerDialog from "./DeleteBuyerDialog";
import { useBuyers } from "@/hooks/useBuyers";

interface EditBuyerDialogProps {
  buyer: Buyer | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (variables: { buyerId: string, buyerData: BuyerFormData }) => void;
}

const EditBuyerDialog = ({ buyer, isOpen, onOpenChange, onUpdate }: EditBuyerDialogProps) => {
  const { deleteBuyer } = useBuyers();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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
        mobileNumber: formatPhoneForDisplay(buyer.mobileNumber || ""),
        businessNumber: formatPhoneForDisplay(buyer.businessNumber || ""),
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

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = (reason?: string) => {
    if (buyer) {
      deleteBuyer({ buyerId: buyer.id, reason });
      onOpenChange(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length >= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
    if (phoneNumber.length > 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    if (phoneNumber.length > 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return phoneNumber;
  };

  return (
    <>
      <DeleteBuyerDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] h-[700px]">
          <DialogHeader className="pb-2">
            <DialogTitle>Edit Buyer</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="buyer" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buyer">Buyer Information</TabsTrigger>
                  <TabsTrigger value="dealership">Dealership Information</TabsTrigger>
                </TabsList>
                
                <TabsContent value="buyer" className="space-y-4 mt-4 h-full">
                  <PersonalInfoSection 
                    formData={formData} 
                    onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                    formatPhoneNumber={formatPhoneNumber}
                  />
                </TabsContent>
                
                <TabsContent value="dealership" className="space-y-4 mt-4 h-full">
                  <DealershipSection 
                    formData={formData} 
                    onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                  />
                  <AddressSection 
                    formData={formData} 
                    onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="pt-4 mt-auto">
              <div className="flex justify-between items-center w-full">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
                
                <div className="flex gap-4 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditBuyerDialog;
