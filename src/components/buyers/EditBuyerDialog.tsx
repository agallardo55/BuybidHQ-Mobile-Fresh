
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
        <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-[700px] h-[90vh] sm:h-auto max-h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold">Edit Buyer</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="buyer" className="w-full">
                <div className="border-b border-slate-100 px-6">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                    <TabsTrigger
                      value="buyer"
                      className="text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent text-slate-600 hover:text-slate-900"
                    >
                      Buyer Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="dealership"
                      className="text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent text-slate-600 hover:text-slate-900"
                    >
                      Dealership Information
                    </TabsTrigger>
                  </TabsList>
                </div>


                <TabsContent value="buyer" className="px-6 py-6 space-y-4">
                  <PersonalInfoSection
                    formData={formData}
                    onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                    formatPhoneNumber={formatPhoneNumber}
                  />
                </TabsContent>

                <TabsContent value="dealership" className="px-6 py-6 space-y-6">
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

            <DialogFooter className="border-t border-slate-100 px-6 py-4 flex-shrink-0 bg-slate-50">
              <div className="flex justify-between items-center w-full">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white h-11 px-6"
                >
                  Delete
                </Button>

                <div className="flex gap-3 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-11 px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-custom-blue hover:bg-custom-blue/90 text-white h-11 px-6"
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
