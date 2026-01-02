
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserFormData, DealershipFormData } from "@/types/users";
import { useUsers } from "@/hooks/users";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserInformationSection from "./sections/UserInformationSection";
import DealershipInformationSection from "./sections/DealershipInformationSection";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    try {
      await mutations.createUser.mutateAsync({
        userData: {
          ...formData,
          // Don't include an ID - let the database generate it
          email: formData.email.toLowerCase().trim() // Normalize email
        },
        dealershipData: dealershipData.dealerName ? dealershipData : undefined
      });

      toast.success("User created successfully");
      setIsOpen(false);
      // Reset form data
      setFormData({
        fullName: "",
        email: "",
        role: "associate",
        mobileNumber: "",
        isActive: true,
      });
      setDealershipData({
        dealerName: "",
        dealerId: "",
        businessPhone: "",
        businessEmail: "",
        address: "",
        city: "",
        state: "",
        zipCode: ""
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1.5 bg-brand hover:bg-brand/90 text-white h-9 px-4 text-[13px] font-medium shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all">
          <Plus className="h-4 w-4" />
          <span>User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[85vw] md:w-full max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader className="p-3 sm:p-4 md:p-6">
          <DialogTitle>Add New User</DialogTitle>
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
              <Button type="submit" className="w-full bg-brand hover:bg-brand/90">
                Add User
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
