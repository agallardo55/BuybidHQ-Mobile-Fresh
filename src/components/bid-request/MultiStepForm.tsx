
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BidRequestFormData, FormErrors } from "./types";
import { useState } from "react";
import BasicVehicleInfo from "./BasicVehicleInfo";
import ColorsAndAccessories from "./ColorsAndAccessories";
import VehicleCondition from "./VehicleCondition";
import FormProgress from "./FormProgress";
import BuyersSection from "./BuyersSection";
import AddBuyerDialog from "./AddBuyerDialog";

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
}: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState<"basic-info" | "appearance" | "condition" | "buyers">("basic-info");
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false);
  
  const progressMap = {
    "basic-info": 25,
    "appearance": 50,
    "condition": 75,
    "buyers": 100
  };

  const validateBasicInfo = () => {
    const newErrors: FormErrors = {};
    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.make) newErrors.make = "Make is required";
    if (!formData.model) newErrors.model = "Model is required";
    if (!formData.vin) newErrors.vin = "VIN is required";
    if (!formData.mileage) newErrors.mileage = "Mileage is required";
    
    if (formData.vin && formData.vin.length !== 17) {
      newErrors.vin = "VIN must be 17 characters";
    }
    
    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.year);
    if (year < 1900 || year > currentYear + 1) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }

    if (parseInt(formData.mileage) < 0) {
      newErrors.mileage = "Mileage cannot be negative";
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    switch (currentStep) {
      case "basic-info":
        if (validateBasicInfo()) {
          setCurrentStep("appearance");
        }
        break;
      case "appearance":
        setCurrentStep("condition");
        break;
      case "condition":
        setCurrentStep("buyers");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "appearance":
        setCurrentStep("basic-info");
        break;
      case "condition":
        setCurrentStep("appearance");
        break;
      case "buyers":
        setCurrentStep("condition");
        break;
      default:
        break;
    }
  };

  return (
    <Tabs 
      value={currentStep}
      className="w-full"
      onValueChange={(value) => setCurrentStep(value as "basic-info" | "appearance" | "condition" | "buyers")}
    >
      <FormProgress currentStep={currentStep} progressMap={progressMap} />

      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic-info" disabled={currentStep !== "basic-info"}>Vehicle</TabsTrigger>
        <TabsTrigger value="appearance" disabled={currentStep !== "appearance"}>Appearance</TabsTrigger>
        <TabsTrigger value="condition" disabled={currentStep !== "condition"}>Condition</TabsTrigger>
        <TabsTrigger value="buyers" disabled={currentStep !== "buyers"}>Buyers</TabsTrigger>
      </TabsList>

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
