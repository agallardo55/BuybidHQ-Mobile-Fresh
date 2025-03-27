
import React, { useState } from "react";
import { useVinDecoder } from "../vin-scanner/useVinDecoder";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useBuyers } from "@/hooks/useBuyers";
import { MappedBuyer } from "@/hooks/buyers/types";
import VinEntryForm from "./VinEntryForm";
import VehicleDetailsView from "./VehicleDetailsView";
import { formatVin, formatMileage, createSyntheticEvent } from "./helpers";

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
    availableTrims: any[];
  } | null>(null);
  
  // Additional fields for second view
  const [notes, setNotes] = useState("");
  
  // Map buyers to the format expected by the BuyerSelector component
  const mappedBuyers: MappedBuyer[] = buyers?.map(buyer => ({
    id: buyer.id,
    user_id: buyer.user_id || '',
    name: buyer.name,
    email: buyer.email || '',
    dealership: buyer.dealership,
    dealerId: buyer.dealerId || '',
    mobileNumber: buyer.mobileNumber,
    businessNumber: buyer.businessNumber || '',
    location: buyer.location || '',
    address: buyer.address || '',
    city: buyer.city || '',
    state: buyer.state || '',
    zipCode: buyer.zipCode || '',
    acceptedBids: buyer.acceptedBids || 0,
    pendingBids: buyer.pendingBids || 0,
    declinedBids: buyer.declinedBids || 0,
    phoneCarrier: buyer.phoneCarrier || 'N/A',
    phoneValidationStatus: buyer.phoneValidationStatus
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
    const formattedVin = formatVin(e.target.value);
    setVin(formattedVin);
  };

  // Handle mileage input to only accept numbers
  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatMileage(e.target.value);
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
        <VinEntryForm 
          vin={vin}
          mileage={mileage}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onVinChange={handleVinChange}
          onMileageChange={handleMileageChange}
          onSubmit={handleSubmit}
        />
      ) : (
        vehicleDetails && (
          <VehicleDetailsView
            vehicleDetails={vehicleDetails}
            vin={vin}
            mileage={mileage}
            notes={notes}
            selectedBuyer={selectedBuyer}
            buyers={mappedBuyers}
            onNotesChange={handleNotesChange}
            onBuyerChange={handleBuyerChange}
            onGoBack={goBackToVinEntry}
            onSubmit={handleCreateBidRequest}
          />
        )
      )}
    </div>
  );
};

export default QuickPostForm;
