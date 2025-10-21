import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BidRequestFormData, FormErrors } from "./types";
import BasicVehicleInfo from "./BasicVehicleInfo";
import ColorsAndAccessories from "./ColorsAndAccessories";
import VehicleCondition from "./VehicleCondition";
import BookValues from "./BookValues";
import FormProgress from "./FormProgress";
import BuyersSection from "./BuyersSection";
import AddBuyerDialog from "./AddBuyerDialog";
import FormTabs from "./FormTabs";
import StepNavigation from "./components/StepNavigation";
import { useFormNavigation } from "./hooks/useFormNavigation";
import { validateBasicInfoStep, validateBuyersStep } from "./utils/stepValidation";

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
    email: string;
  }>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onImagesUploaded?: (urls: string[]) => void;
  onBatchChange?: (changes: Array<{ name: string; value: any }>) => void;
  setShowValidation: (show: boolean) => void;
  showValidation: boolean;
  setErrors: (errors: FormErrors) => void;
  uploadedImageUrls?: string[];
  selectedFileUrls?: string[];
  onDeleteImage?: (url: string, isUploaded: boolean) => Promise<void>;
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
  setErrors,
  uploadedImageUrls = [],
  selectedFileUrls = [],
  onDeleteImage
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
    if (currentStep === "basic-info") {
      return validateBasicInfoStep(formData);
    } else if (currentStep === "buyers") {
      return validateBuyersStep(selectedBuyers);
    }
    return {};
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
      onValueChange={(value) => setCurrentStep(value as "basic-info" | "appearance" | "condition" | "book-values" | "buyers")}
    >
      <FormProgress currentStep={currentStep} progressMap={progressMap} />
      
      {/* Vehicle Details Section - Between Progress Bar and Tabs */}
      <div className="mt-6 mb-6">
        <BasicVehicleInfo 
          formData={formData}
          errors={errors}
          onChange={onChange}
          onBatchChange={onBatchChange}
          onSelectChange={onSelectChange}
          showValidation={showValidation}
        />
      </div>
      
      <FormTabs />

      <div className="mt-6">
        <TabsContent value="appearance">
          <ColorsAndAccessories 
            formData={formData}
            onChange={onChange}
            onImagesUploaded={onImagesUploaded}
            uploadedImageUrls={uploadedImageUrls}
            selectedFileUrls={selectedFileUrls}
          />
          <StepNavigation 
            showBack={false}
            onNext={handleNext}
          />
        </TabsContent>

        <TabsContent value="condition">
          <VehicleCondition 
            formData={formData}
            onChange={onChange}
            onSelectChange={onSelectChange}
          />
          <StepNavigation 
            onBack={handleBack}
            onNext={handleNext}
          />
        </TabsContent>

        <TabsContent value="book-values">
          <BookValues 
            formData={formData}
            errors={errors}
            onChange={onChange}
            showValidation={showValidation}
          />
          <StepNavigation 
            onBack={handleBack}
            onNext={handleNext}
          />
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
