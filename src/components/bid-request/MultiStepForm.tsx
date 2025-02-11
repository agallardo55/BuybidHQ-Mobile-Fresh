import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import BasicVehicleInfo from "./BasicVehicleInfo";
import ColorsAndAccessories from "./ColorsAndAccessories";
import VehicleCondition from "./VehicleCondition";
import { Button } from "@/components/ui/button";
import { BidRequestFormData, FormErrors } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
      <div className="mb-6">
        <Progress value={progressMap[currentStep]} className="h-2 bg-gray-200 [&>[role=progressbar]]:bg-custom-blue" />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>Step {Object.keys(progressMap).indexOf(currentStep) + 1} of 4</span>
          <span>{progressMap[currentStep]}% Complete</span>
        </div>
      </div>

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
        </TabsContent>

        <TabsContent value="buyers">
          <div className="flex-1 border rounded-lg p-2.5">
            {errors.buyers && (
              <p className="text-xs text-red-500 mb-2">{errors.buyers}</p>
            )}
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                placeholder="Enter buyer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-custom-blue text-white hover:bg-custom-blue/90"
                onClick={() => setIsAddBuyerOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Buyer</span>
              </Button>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {buyers.map((buyer) => (
                  <div
                    key={buyer.id}
                    className="flex items-start space-x-2 p-1.5 rounded hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`buyer-${buyer.id}`}
                      checked={selectedBuyers.includes(buyer.id)}
                      onCheckedChange={() => toggleBuyer(buyer.id)}
                      className="h-4 w-4 mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`buyer-${buyer.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <UserRound className="h-4 w-4 text-gray-500" />
                            <span>{buyer.name}</span>
                          </div>
                          <div className="text-gray-500">
                            <span className="text-sm">M: {buyer.mobile}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{buyer.dealership}</p>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="mt-6 flex justify-between">
            <Button 
              onClick={handleBack}
              variant="outline"
            >
              Back
            </Button>
            <Button 
              onClick={onSubmit}
              className="bg-custom-blue hover:bg-custom-blue/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>

          <Dialog open={isAddBuyerOpen} onOpenChange={setIsAddBuyerOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Buyer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input placeholder="Enter buyer name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dealership</label>
                  <Input placeholder="Enter dealership name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile</label>
                  <Input placeholder="Enter mobile number" />
                </div>
                <Button 
                  className="w-full bg-custom-blue hover:bg-custom-blue/90 text-white"
                  onClick={() => setIsAddBuyerOpen(false)}
                >
                  Add Buyer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default MultiStepForm;
