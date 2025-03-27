
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car, Gauge, ArrowRight, ChevronLeft, Send, Engine, Transmission } from "lucide-react";
import { useVinDecoder } from "../vin-scanner/useVinDecoder";
import { toast } from "sonner";
import { TrimOption } from "../types";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useBuyers } from "@/hooks/useBuyers";
import BuyerSelector from "../components/BuyerSelector";
import NotesInput from "../components/NotesInput";
import { Card } from "@/components/ui/card";

interface QuickPostFormProps {
  onClose: () => void;
}

type FormView = "vinEntry" | "vehicleDetails";

const QuickPostForm = ({ onClose }: QuickPostFormProps) => {
  const navigate = useNavigate();
  const { buyers } = useBuyers();
  
  // Form state
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<FormView>("vinEntry");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  
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
  
  // Map buyers to the format expected by the BuyerSelector component
  const mappedBuyers = buyers?.map(buyer => ({
    id: buyer.id,
    name: buyer.name,
    dealership: buyer.dealership,
    mobile: buyer.mobileNumber
  })) || [];
  
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
    if (!selectedBuyer) {
      toast.error("Please select a buyer");
      return;
    }
    
    toast.success("Creating new bid request with vehicle details");
    
    // Navigate to create bid request page with the vehicle details
    navigate("/create-bid-request", { 
      state: { 
        vin,
        mileage: mileage.replace(/,/g, ''),
        ...vehicleDetails,
        notes,
        buyerId: selectedBuyer
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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleBuyerChange = (value: string) => {
    setSelectedBuyer(value);
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
        <div className="flex flex-col space-y-6">
          <div className="flex items-center mb-2">
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
            <>
              <Card className="p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">
                    {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
                  </h3>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {vehicleDetails.trim}
                  </div>
                </div>
                
                <div className="text-gray-700 mb-4">
                  <p>VIN: {vin}</p>
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <Car className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="text-lg">{mileage} miles</span>
                </div>
                
                <div className="border-t border-gray-200 my-3"></div>
                
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center">
                    <Engine className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Engine: {vehicleDetails.engineCylinders || "N/A"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Transmission className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Transmission: {vehicleDetails.transmission || "N/A"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Car className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Drivetrain: {vehicleDetails.drivetrain || "N/A"}</span>
                  </div>
                </div>
              </Card>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Notes</h3>
                <Textarea
                  placeholder="Add any additional information about your bid request..."
                  value={notes}
                  onChange={handleNotesChange}
                  className="h-24 resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Select Buyer</h3>
                <BuyerSelector
                  selectedBuyer={selectedBuyer}
                  buyers={mappedBuyers}
                  onBuyerChange={handleBuyerChange}
                />
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
                onClick={handleCreateBidRequest}
              >
                <Send className="mr-2 h-5 w-5" />
                Submit Bid Request
              </Button>
              
              <p className="text-gray-500 text-center text-sm">
                After submission, dealers will contact you with offers
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickPostForm;
