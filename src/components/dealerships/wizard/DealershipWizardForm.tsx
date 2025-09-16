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
    if (!formData.adminUser.phoneCarrier.trim()) {
      stepErrors.phoneCarrier = "Mobile Carrier is required";
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
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep === 'dealership' ? 1 : 2} of 2</span>
          <span>{progressMap[currentStep]}% Complete</span>
        </div>
        <Progress value={progressMap[currentStep]} className="h-2" />
      </div>

      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="dealership" 
            disabled={currentStep !== 'dealership'}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Dealership
          </TabsTrigger>
          <TabsTrigger 
            value="admin" 
            disabled={currentStep !== 'admin'}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Admin User
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="dealership">
            <DealershipInfoStep
              formData={formData.dealership}
              errors={errors.dealership || {}}
              onChange={handleDealershipChange}
            />
          </TabsContent>

          <TabsContent value="admin">
            <AdminUserStep
              formData={formData.adminUser}
              dealershipData={formData.dealership}
              errors={errors.adminUser || {}}
              onChange={handleAdminChange}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {currentStep === 'admin' && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
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
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Dealership"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealershipWizardForm;