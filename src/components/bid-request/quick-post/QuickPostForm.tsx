
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Gauge, ArrowRight, ChevronLeft, Check } from "lucide-react";
import { useVinDecoder } from "../vin-scanner/useVinDecoder";
import { toast } from "sonner";
import { TrimOption } from "../types";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

interface QuickPostFormProps {
  onClose: () => void;
}

type FormView = "vinEntry" | "vehicleDetails";

const QuickPostForm = ({ onClose }: QuickPostFormProps) => {
  const navigate = useNavigate();
  
  // Form state
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<FormView>("vinEntry");
  
  // Vehicle details after fetch
  const [vehicleDetails, setVehicleDetails] = useState<{
    year: string;
    make: string;
    model: string;
    trim: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    availableTrims: TrimOption[];
  } | null>(null);
  
  // Additional fields for second view
  const [notes, setNotes] = useState("");
  
  const { decodeVin, isLoading } = useVinDecoder((vehicleData) => {
    // Store the vehicle data once fetched
    setVehicleDetails(vehicleData);
    setIsSubmitting(false);
    
    // Switch to the vehicle details view
    setCurrentView("vehicleDetails");
    toast.success("Vehicle details retrieved successfully");
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vin || vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }
    
    setIsSubmitting(true);
    decodeVin(vin);
  };

  const handleCreateBidRequest = () => {
    // Here we would typically navigate to the create bid request form with the details pre-filled
    // For now, let's just show a success message and close
    toast.success("Creating new bid request with vehicle details");
    
    // Navigate to create bid request page (you could pass state with the vehicle details)
    navigate("/create-bid-request", { 
      state: { 
        vin,
        mileage: mileage.replace(/,/g, ''),
        ...vehicleDetails,
        notes 
      } 
    });
    
    onClose();
  };

  const goBackToVinEntry = () => {
    setCurrentView("vinEntry");
  };

  // Format and validate VIN input
  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove any non-alphanumeric characters
    const formattedVin = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Limit to 17 characters
    const limitedVin = formattedVin.slice(0, 17);
    
    setVin(limitedVin);
  };

  // Handle mileage input to only accept numbers
  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas for thousands
    let formattedValue = numericValue;
    if (numericValue) {
      formattedValue = Number(numericValue).toLocaleString('en-US', {
        maximumFractionDigits: 0,
        useGrouping: true
      });
    }
    
    setMileage(formattedValue);
  };

  return (
    <div className="flex flex-col py-4 px-1">
      {currentView === "vinEntry" ? (
        <>
          <h2 className="text-2xl font-semibold mb-2">Enter Vehicle VIN</h2>
          <p className="text-gray-500 mb-4">
            Please enter the 17-character VIN to fetch vehicle details
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Car className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                value={vin}
                onChange={handleVinChange}
                className="pl-8 py-2 h-9 uppercase text-sm"
                placeholder="e.g. 1C4HJWDG3JL915998"
                maxLength={17}
              />
            </div>
            
            <div className="relative">
              <Gauge className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                value={mileage}
                onChange={handleMileageChange}
                className="pl-8 py-2 h-9 text-sm"
                placeholder="Vehicle Mileage"
                inputMode="numeric"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-9 bg-blue-400 hover:bg-blue-500 text-white text-sm"
              disabled={isLoading || isSubmitting || vin.length !== 17}
              size="sm"
            >
              {isLoading || isSubmitting ? (
                "Loading..."
              ) : (
                <>
                  Fetch Vehicle Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          
          <p className="text-gray-500 text-center mt-4 text-xs">
            VIN can be found on the vehicle's dashboard or driver-side door jamb
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 mr-2" 
              onClick={goBackToVinEntry}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-semibold">Vehicle Details</h2>
          </div>
          
          {vehicleDetails && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-lg font-medium mb-2">
                  {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">VIN:</span> {vin}
                  </div>
                  <div>
                    <span className="font-medium">Mileage:</span> {mileage}
                  </div>
                  <div>
                    <span className="font-medium">Trim:</span> {vehicleDetails.trim}
                  </div>
                  <div>
                    <span className="font-medium">Engine:</span> {vehicleDetails.engineCylinders || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Transmission:</span> {vehicleDetails.transmission || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Drivetrain:</span> {vehicleDetails.drivetrain || "N/A"}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any additional details about the vehicle..."
                  className="h-24 resize-none"
                />
              </div>
              
              <Button 
                className="w-full bg-blue-400 hover:bg-blue-500 text-white"
                onClick={handleCreateBidRequest}
              >
                <Check className="mr-1 h-4 w-4" />
                Create Bid Request
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuickPostForm;
