import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BidRequestNavigation from "@/components/bid-request/BidRequestNavigation";
import VinSection from "@/components/bid-request/VinSection";
import BasicVehicleInfo from "@/components/bid-request/BasicVehicleInfo";
import ColorsAndAccessories from "@/components/bid-request/ColorsAndAccessories";
import VehicleCondition from "@/components/bid-request/VehicleCondition";
import { BidRequestFormData, FormErrors } from "@/components/bid-request/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRound } from "lucide-react";

const CreateBidRequest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [formData, setFormData] = useState<BidRequestFormData>({
    year: "",
    make: "",
    model: "",
    trim: "",
    vin: "",
    mileage: "",
    exteriorColor: "",
    interiorColor: "",
    accessories: "",
    windshield: "",
    engineLights: "",
    brakes: "",
    tire: "",
    maintenance: "",
    reconEstimate: "",
    reconDetails: "",
  });

  const buyers = [
    { id: "1", name: "John Smith", dealership: "Premium Auto Sales", mobile: "(310) 555-0123" },
    { id: "2", name: "Sarah Williams", dealership: "Elite Motors", mobile: "(212) 555-0124" },
    { id: "3", name: "Mike Johnson", dealership: "Prestige Cars", mobile: "(312) 555-0125" },
    { id: "4", name: "Emily Brown", dealership: "City Auto Group", mobile: "(713) 555-0126" },
    { id: "5", name: "David Wilson", dealership: "Luxury Vehicles Inc", mobile: "(305) 555-0127" },
  ];

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.make) newErrors.make = "Make is required";
    if (!formData.model) newErrors.model = "Model is required";
    if (!formData.vin) newErrors.vin = "VIN is required";
    if (!formData.mileage) newErrors.mileage = "Mileage is required";
    if (selectedBuyers.length === 0) newErrors.buyers = "Please select at least one buyer";
    
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Bid request submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to submit bid request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleBuyer = (buyerId: string) => {
    setSelectedBuyers(prev => {
      if (prev.includes(buyerId)) {
        return prev.filter(id => id !== buyerId);
      }
      return [...prev, buyerId];
    });
    if (errors.buyers) {
      setErrors(prev => ({ ...prev, buyers: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BidRequestNavigation />

      <div className="pt-20 px-3 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-2.5">
            <h1 className="text-lg font-bold text-gray-900 mb-2.5">Create Bid Request</h1>
            
            <form onSubmit={handleSubmit} className="h-[calc(100vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 h-full">
                <ScrollArea className="h-full pr-2.5">
                  <div className="space-y-2.5">
                    <VinSection 
                      vin={formData.vin}
                      onChange={handleChange}
                      error={errors.vin}
                    />
                    <BasicVehicleInfo 
                      formData={formData}
                      errors={errors}
                      onChange={handleChange}
                    />
                    <ColorsAndAccessories 
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                </ScrollArea>

                <ScrollArea className="h-full pr-2.5">
                  <VehicleCondition 
                    formData={formData}
                    onChange={handleChange}
                    onSelectChange={handleSelectChange}
                  />
                </ScrollArea>

                <div className="flex flex-col h-full">
                  <h2 className="text-sm font-semibold mb-2.5">Select Buyers</h2>
                  <div className="flex-1 border rounded-lg p-2.5">
                    {errors.buyers && (
                      <p className="text-xs text-red-500 mb-2">{errors.buyers}</p>
                    )}
                    <ScrollArea className="h-[calc(100%-96px)]">
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
                                <div className="flex items-center gap-1.5">
                                  <UserRound className="h-4 w-4 text-gray-500" />
                                  <span>{buyer.name}</span>
                                  <div className="flex items-center text-gray-500 ml-2">
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
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-2.5 text-sm py-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bid Request"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBidRequest;
