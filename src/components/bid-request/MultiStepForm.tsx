import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BidRequestFormData, FormErrors } from "./types";
import ColorsAndAccessories from "./ColorsAndAccessories";
import VehicleCondition from "./VehicleCondition";
import BookValues from "./BookValues";
import FormProgress from "./FormProgress";
import BuyersSection from "./BuyersSection";
import AddBuyerDialog from "./AddBuyerDialog";
import FormTabs from "./FormTabs";
import StepNavigation from "./components/StepNavigation";
import { useFormNavigation } from "./hooks/useFormNavigation";
import { validateBuyersStep } from "./utils/stepValidation";
import { useNavigate } from "react-router-dom";

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
  setSelectedFileUrls?: (urls: string[] | ((prev: string[]) => string[])) => void;
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
  setSelectedFileUrls,
  onDeleteImage
}: MultiStepFormProps) => {
  const navigate = useNavigate();
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
    if (currentStep === "buyers") {
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

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <Tabs
      value={currentStep}
      className="w-full"
      onValueChange={(value) => setCurrentStep(value as "appearance" | "condition" | "book-values" | "buyers")}
    >
      {/* Progress Indicator */}
      <div className="px-6 pt-6">
        <FormProgress currentStep={currentStep} progressMap={progressMap} />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-100 px-6 mt-6">
        <FormTabs />
      </div>

      {/* Tab Content Area */}
      <div className="p-6">
        <TabsContent value="appearance" className="mt-0">
          <ColorsAndAccessories
            formData={formData}
            onChange={onChange}
            onImagesUploaded={onImagesUploaded}
            uploadedImageUrls={uploadedImageUrls}
            selectedFileUrls={selectedFileUrls}
            setSelectedFileUrls={setSelectedFileUrls}
            onDeleteImage={onDeleteImage}
          />
          <StepNavigation
            showBack={false}
            showCancel={true}
            onCancel={handleCancel}
            onNext={handleNext}
          />
        </TabsContent>

        <TabsContent value="condition" className="mt-0">
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

        <TabsContent value="book-values" className="mt-0">
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

        <TabsContent value="buyers" className="mt-0">
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
