
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BidRequestFormData, FormErrors } from "./types";
import BasicVehicleInfo from "./BasicVehicleInfo";
import ColorsAndAccessories from "./ColorsAndAccessories";
import VehicleCondition from "./VehicleCondition";
import FormProgress from "./FormProgress";
import BuyersSection from "./BuyersSection";
import AddBuyerDialog from "./AddBuyerDialog";
import FormTabs from "./FormTabs";
import { useFormNavigation } from "./hooks/useFormNavigation";
import { validateForm } from "./hooks/useFormValidation";

interface MultiStepFormProps {
  formData: BidRequestFormData;
  errors: FormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (value: string, name: string) => void;
  selectedBuyers: string[];
  toggleBuyer: (buyerId: string) => void;
  buyers: Array<{
    id: string;
    name: string;
    dealership: string;
    mobile: string;
  }>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onImagesUploaded?: (urls: string[]) => void;
  onBatchChange?: (changes: Array<{ name: string; value: string }>) => void;
  setShowValidation: (show: boolean) => void;
  showValidation: boolean;
  setErrors: (errors: FormErrors) => void;
}

const MultiStepForm = ({
  formData,
  errors,
  onChange,
  onSelectChange,
  selectedBuyers,
  toggleBuyer,
  buyers,
  searchTerm,
  setSearchTerm,
  onSubmit,
  isSubmitting,
  onImagesUploaded,
  onBatchChange,
  setShowValidation,
  showValidation,
  setErrors
}: MultiStepFormProps) => {
  const {
    currentStep,
    setCurrentStep,
    isAddBuyerOpen,
    setIsAddBuyerOpen,
    progressMap,
    handleNext: baseHandleNext,
    handleBack
  } = useFormNavigation();

  const validateCurrentStep = () => {
    const stepErrors: FormErrors = {};
    
    if (currentStep === "basic-info") {
      if (!formData.year) stepErrors.year = "Year is required";
      if (!formData.make) stepErrors.make = "Make is required";
      if (!formData.model) stepErrors.model = "Model is required";
      if (!formData.trim) stepErrors.trim = "Trim is required";
      if (!formData.vin) stepErrors.vin = "VIN is required";
      if (!formData.mileage) stepErrors.mileage = "Mileage is required";

      // VIN validation
      if (formData.vin && formData.vin.length !== 17) {
        stepErrors.vin = "VIN must be 17 characters";
      }

      // Year validation
      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.year);
      if (year < 1900 || year > currentYear + 1) {
        stepErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
      }

      // Mileage validation
      if (parseInt(formData.mileage) < 0) {
        stepErrors.mileage = "Mileage cannot be negative";
      }
    } else if (currentStep === "buyers") {
      if (selectedBuyers.length === 0) {
        stepErrors.buyers = "Please select at least one buyer";
      }
    }

    return stepErrors;
  };

  const handleNext = () => {
    setShowValidation(true);
    const stepErrors = validateCurrentStep();
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length === 0) {
      baseHandleNext();
      setShowValidation(false);
    }
  };

  return (
    <Tabs 
      value={currentStep}
      className="w-full"
      onValueChange={(value) => setCurrentStep(value as "basic-info" | "appearance" | "condition" | "buyers")}
    >
      <FormProgress currentStep={currentStep} progressMap={progressMap} />
      <FormTabs />

      <div className="mt-6">
        <TabsContent value="basic-info">
          <BasicVehicleInfo 
            formData={formData}
            errors={errors}
            onChange={onChange}
            onBatchChange={onBatchChange}
            onSelectChange={onSelectChange}
            showValidation={showValidation}
          />
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleNext}
              className="bg-custom-blue hover:bg-custom-blue/90"
            >
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <ColorsAndAccessories 
            formData={formData}
            onChange={onChange}
            onImagesUploaded={onImagesUploaded}
          />
          <div className="mt-6 flex justify-between">
            <Button 
              onClick={handleBack}
              variant="outline"
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-custom-blue hover:bg-custom-blue/90"
            >
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="condition">
          <VehicleCondition 
            formData={formData}
            onChange={onChange}
            onSelectChange={onSelectChange}
          />
          <div className="mt-6 flex justify-between">
            <Button 
              onClick={handleBack}
              variant="outline"
            >
              Back
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-custom-blue hover:bg-custom-blue/90"
            >
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="buyers">
          <BuyersSection
            errors={errors}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setIsAddBuyerOpen={setIsAddBuyerOpen}
            buyers={buyers}
            selectedBuyers={selectedBuyers}
            toggleBuyer={toggleBuyer}
            handleBack={handleBack}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </div>

      <AddBuyerDialog 
        isOpen={isAddBuyerOpen}
        onOpenChange={setIsAddBuyerOpen}
      />
    </Tabs>
  );
};

export default MultiStepForm;
