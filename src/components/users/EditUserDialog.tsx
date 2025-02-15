
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserFormData, DealershipFormData, transformDatabaseUser } from "@/types/users";
import { useState, useEffect } from "react";
import UserInformationSection from "./sections/UserInformationSection";
import DealershipInformationSection from "./sections/DealershipInformationSection";
import { Button } from "@/components/ui/button";

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
    dealershipId: undefined
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
      // Set user form data
      const transformedData = transformDatabaseUser(user);
      setFormData({
        ...transformedData,
        dealershipId: user.dealership?.id
      });

      // Set dealership data if it exists
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
      // Always send dealership data if it exists, regardless of role
      onUpdate(
        user.id, 
        formData,
        dealershipData
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[85vw] md:w-full max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader className="p-3 sm:p-4 md:p-6">
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
            <Tabs defaultValue="user-info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user-info">User Information</TabsTrigger>
                <TabsTrigger value="dealership-info">Dealership Information</TabsTrigger>
              </TabsList>
              <TabsContent value="user-info" className="mt-4">
                <UserInformationSection
                  formData={formData}
                  onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                />
              </TabsContent>
              <TabsContent value="dealership-info" className="mt-4">
                <DealershipInformationSection
                  formData={formData}
                  dealershipData={dealershipData}
                  onFormDataChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                  onDealershipDataChange={(data) => setDealershipData(prev => ({ ...prev, ...data }))}
                />
              </TabsContent>
            </Tabs>
            <div className="mt-6">
              <Button type="submit" className="w-full bg-custom-blue hover:bg-custom-blue/90">
                Update
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
