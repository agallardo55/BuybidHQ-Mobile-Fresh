
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
  onImagesUploaded
}: MultiStepFormProps) => {
  const {
    currentStep,
    setCurrentStep,
    isAddBuyerOpen,
    setIsAddBuyerOpen,
    progressMap,
    handleNext,
    handleBack
  } = useFormNavigation();

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
