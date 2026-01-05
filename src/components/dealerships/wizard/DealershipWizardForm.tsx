import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DealershipWizardData, WizardStep, WizardErrors, WizardFormProps } from "@/types/dealership-wizard";
import DealershipInfoStep from "./DealershipInfoStep";
import AdminUserStep from "./AdminUserStep";

const DealershipWizardForm = ({
  onSubmit,
  onCancel,
  isSubmitting
}: WizardFormProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('dealership');
  const [errors, setErrors] = useState<WizardErrors>({});
  
  const [formData, setFormData] = useState<DealershipWizardData>({
    dealership: {
      dealerName: "",
      dealerId: "",
      businessPhone: "",
      businessEmail: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    adminUser: {
      fullName: "",
      email: "",
      mobileNumber: "",
      phoneCarrier: "",
      accountType: 'basic',
      address: "",
      city: "",
      state: "",
      zipCode: "",
      role: "admin",
      isActive: true,
    }
  });

  const progressMap = {
    dealership: 50,
    admin: 100
  };

  const validateDealershipStep = () => {
    const stepErrors: Record<string, string> = {};
    
    if (!formData.dealership.dealerName.trim()) {
      stepErrors.dealerName = "Dealership Name is required";
    }
    if (!formData.dealership.businessPhone.trim()) {
      stepErrors.businessPhone = "Business Phone is required";
    }
    if (!formData.dealership.businessEmail.trim()) {
      stepErrors.businessEmail = "Business Email is required";
    }
    if (formData.dealership.businessEmail && !/\S+@\S+\.\S+/.test(formData.dealership.businessEmail)) {
      stepErrors.businessEmail = "Valid email address is required";
    }
    
    return stepErrors;
  };

  const validateAdminStep = () => {
    const stepErrors: Record<string, string> = {};

    if (!formData.adminUser.fullName.trim()) {
      stepErrors.fullName = "Full Name is required";
    }
    if (!formData.adminUser.email.trim()) {
      stepErrors.email = "Email is required";
    }
    if (formData.adminUser.email && !/\S+@\S+\.\S+/.test(formData.adminUser.email)) {
      stepErrors.email = "Valid email address is required";
    }
    if (!formData.adminUser.mobileNumber.trim()) {
      stepErrors.mobileNumber = "Mobile Number is required";
    }

    return stepErrors;
  };

  const handleDealershipChange = (field: keyof typeof formData.dealership, value: string) => {
    setFormData(prev => ({
      ...prev,
      dealership: { ...prev.dealership, [field]: value }
    }));
    
    // Clear error when user starts typing
    if (errors.dealership?.[field]) {
      setErrors(prev => ({
        ...prev,
        dealership: { ...prev.dealership, [field]: undefined }
      }));
    }
  };

  const handleAdminChange = (field: keyof typeof formData.adminUser, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      adminUser: { ...prev.adminUser, [field]: value }
    }));
    
    // Clear error when user starts typing
    if (errors.adminUser?.[field]) {
      setErrors(prev => ({
        ...prev,
        adminUser: { ...prev.adminUser, [field]: undefined }
      }));
    }
  };

  const handleNext = () => {
    if (currentStep === 'dealership') {
      const stepErrors = validateDealershipStep();
      if (Object.keys(stepErrors).length > 0) {
        setErrors(prev => ({ ...prev, dealership: stepErrors }));
        return;
      }
      setErrors(prev => ({ ...prev, dealership: {} }));
      setCurrentStep('admin');
    }
  };

  const handleBack = () => {
    if (currentStep === 'admin') {
      setCurrentStep('dealership');
    }
  };

  const handleSubmit = () => {
    const adminErrors = validateAdminStep();
    if (Object.keys(adminErrors).length > 0) {
      setErrors(prev => ({ ...prev, adminUser: adminErrors }));
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Progress Bar */}
      <div className="px-6 pt-2 pb-4 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Step {currentStep === 'dealership' ? 1 : 2} of 2</span>
            <span>{progressMap[currentStep]}% Complete</span>
          </div>
          <Progress value={progressMap[currentStep]} className="h-2" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs value={currentStep} className="w-full">
          <div className="border-b border-slate-100 px-6">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
              <TabsTrigger
                value="dealership"
                disabled={currentStep !== 'dealership'}
                className="text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent text-slate-600 hover:text-slate-900 disabled:opacity-40"
              >
                Dealership Information
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                disabled={currentStep !== 'admin'}
                className="text-[11px] font-bold uppercase tracking-widest py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-custom-blue data-[state=active]:text-custom-blue data-[state=active]:bg-transparent text-slate-600 hover:text-slate-900 disabled:opacity-40"
              >
                Admin User
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dealership" className="px-6 py-6">
            <DealershipInfoStep
              formData={formData.dealership}
              errors={errors.dealership || {}}
              onChange={handleDealershipChange}
            />
          </TabsContent>

          <TabsContent value="admin" className="px-6 py-6">
            <AdminUserStep
              formData={formData.adminUser}
              dealershipData={formData.dealership}
              errors={errors.adminUser || {}}
              onChange={handleAdminChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Navigation */}
      <div className="border-t border-slate-100 px-6 py-4 flex-shrink-0 bg-slate-50">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            {currentStep === 'admin' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="h-11 px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div>
            {currentStep === 'dealership' ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-custom-blue hover:bg-custom-blue/90 text-white h-11 px-6"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-custom-blue hover:bg-custom-blue/90 text-white h-11 px-6"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealershipWizardForm;