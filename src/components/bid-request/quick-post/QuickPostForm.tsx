
import React from "react";
import { toast } from "sonner";
import { useBuyers } from "@/hooks/useBuyers";
import { MappedBuyer } from "@/hooks/buyers/types";
import VinEntryForm from "./VinEntryForm";
import VehicleDetailsView from "./VehicleDetailsView";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuickPostState } from "@/hooks/quick-post/useQuickPostState";
import { useQuickPostSubmission } from "@/hooks/quick-post/useQuickPostSubmission";
import { useVinFormHandling } from "@/hooks/quick-post/useVinFormHandling";

interface QuickPostFormProps {
  onClose: () => void;
}

const QuickPostForm = ({ onClose }: QuickPostFormProps) => {
  const { buyers } = useBuyers();
  const { currentUser } = useCurrentUser();
  
  // Get state from custom hooks
  const {
    vin, setVin,
    mileage, setMileage,
    isSubmitting, setIsSubmitting,
    currentView, setCurrentView,
    selectedBuyers, setSelectedBuyers,
    isBuyerPickerOpen, setIsBuyerPickerOpen,
    vehicleDetails, setVehicleDetails,
    notes, setNotes
  } = useQuickPostState();
  
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
  
  // VIN form handling
  const {
    isLoading,
    handleSubmit,
    handleVinChange,
    handleMileageChange
  } = useVinFormHandling(setVehicleDetails, setIsSubmitting, setCurrentView);
  
  // Bid submission handling
  const { handleCreateBidRequest } = useQuickPostSubmission(onClose, currentUser, mappedBuyers);

  const handleNotesChange = (notes: string) => {
    setNotes(notes);
  };

  const handleSelectedBuyersChange = (buyerIds: string[]) => {
    setSelectedBuyers(buyerIds);
  };

  const handleOpenBuyerPicker = () => {
    setIsBuyerPickerOpen(true);
  };

  const handleCloseBuyerPicker = () => {
    setIsBuyerPickerOpen(false);
  };

  const goBackToVinEntry = () => {
    setCurrentView("vinEntry");
  };
  
  const onVinSubmit = (e: React.FormEvent) => {
    handleSubmit(e, vin);
  };
  
  const onVinChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleVinChange(e, setVin);
  };
  
  const onMileageChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleMileageChange(e, setMileage);
  };

  const onCreateBidRequest = () => {
    if (vehicleDetails) {
      handleCreateBidRequest(vehicleDetails, vin, mileage, notes, selectedBuyers);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {currentView === "vinEntry" ? (
        <VinEntryForm 
          vin={vin}
          mileage={mileage}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onVinChange={onVinChangeHandler}
          onMileageChange={onMileageChangeHandler}
          onSubmit={onVinSubmit}
        />
      ) : (
        vehicleDetails && (
          <VehicleDetailsView
            vehicleDetails={vehicleDetails}
            vin={vin}
            mileage={mileage}
            notes={notes}
            selectedBuyers={selectedBuyers}
            buyers={mappedBuyers}
            isBuyerPickerOpen={isBuyerPickerOpen}
            onNotesChange={handleNotesChange}
            onSelectedBuyersChange={handleSelectedBuyersChange}
            onOpenBuyerPicker={handleOpenBuyerPicker}
            onCloseBuyerPicker={handleCloseBuyerPicker}
            onGoBack={goBackToVinEntry}
            onSubmit={onCreateBidRequest}
          />
        )
      )}
    </div>
  );
};

export default QuickPostForm;
