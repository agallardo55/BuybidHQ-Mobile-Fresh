import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DealershipFormData, Dealership } from "@/types/dealerships";
import BasicInfoSection from "./form-sections/BasicInfoSection";
import AddressSection from "./form-sections/AddressSection";
import AccountAdminSection from "./AccountAdminSection";

interface EditDealershipFormProps {
  initialData?: Partial<DealershipFormData>;
  dealership?: Dealership;
  onSubmit: (data: DealershipFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting: boolean;
}

const EditDealershipForm = ({
  initialData,
  dealership,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting
}: EditDealershipFormProps) => {
  const [formData, setFormData] = useState<DealershipFormData>({
    dealerName: initialData?.dealerName || "",
    dealerId: initialData?.dealerId || "",
    businessPhone: initialData?.businessPhone || "",
    businessEmail: initialData?.businessEmail || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
  });

  const handleChange = (field: keyof DealershipFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.dealerName.trim()) errors.push("Dealership Name is required");
    if (!formData.businessPhone.trim()) errors.push("Business Phone is required");
    if (!formData.businessEmail.trim()) errors.push("Business Email is required");
    
    if (formData.businessEmail && !/\S+@\S+\.\S+/.test(formData.businessEmail)) {
      errors.push("Valid email address is required");
    }
    
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="dealership" className="w-full">
          <div className="border-b border-slate-100 px-6">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
              <TabsTrigger
                value="dealership"
                className="text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent text-slate-600 hover:text-slate-900"
              >
                Dealership Information
              </TabsTrigger>
              <TabsTrigger
                value="account-admin"
                className="text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent text-slate-600 hover:text-slate-900"
              >
                Account Admin
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dealership" className="px-6 py-6 space-y-6">
            <BasicInfoSection
              dealerName={formData.dealerName}
              dealerId={formData.dealerId}
              businessPhone={formData.businessPhone}
              businessEmail={formData.businessEmail}
              onChange={handleChange}
            />

            <AddressSection
              address={formData.address}
              city={formData.city}
              state={formData.state}
              zipCode={formData.zipCode}
              onChange={handleChange}
            />
          </TabsContent>

          <TabsContent value="account-admin" className="px-6 py-6">
            <AccountAdminSection dealership={dealership} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="border-t border-slate-100 px-6 py-4 flex-shrink-0 bg-slate-50">
        <div className="flex justify-between items-center w-full">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white h-11 px-6"
            >
              Delete Account
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-custom-blue hover:bg-custom-blue/90 text-white h-11 px-6"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditDealershipForm;