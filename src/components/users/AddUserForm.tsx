
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserFormData, DealershipFormData } from "@/types/users";
import { Separator } from "@/components/ui/separator";
import UserInformationSection from "./sections/UserInformationSection";
import DealershipInformationSection from "./sections/DealershipInformationSection";

interface AddUserFormProps {
  onSubmit: (e: React.FormEvent, dealershipData?: DealershipFormData) => void;
  formData: UserFormData;
  onFormDataChange: (data: Partial<UserFormData>) => void;
  readOnlyDealership?: string;
}

const AddUserForm = ({ 
  onSubmit, 
  formData, 
  onFormDataChange, 
  readOnlyDealership 
}: AddUserFormProps) => {
  const [dealershipData, setDealershipData] = useState<DealershipFormData>({
    dealerName: '',
    dealerId: '',
    businessPhone: '',
    businessEmail: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'dealer') {
      onSubmit(e, dealershipData);
    } else {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <UserInformationSection 
        formData={formData}
        onFormDataChange={onFormDataChange}
      />

      <Separator className="my-6" />

      <DealershipInformationSection
        formData={formData}
        dealershipData={dealershipData}
        onFormDataChange={onFormDataChange}
        setDealershipData={setDealershipData}
      />

      <Button type="submit" className="w-full mt-6 bg-custom-blue hover:bg-custom-blue/90">
        {readOnlyDealership ? 'Update User' : 'Add User'}
      </Button>
    </form>
  );
};

export default AddUserForm;
