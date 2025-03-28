
import React from "react";
import { VehicleDetails } from "@/components/bid-response/types";
import { BidResponseFormData } from "@/components/bid-response/types";
import VehicleCard from "./components/VehicleCard";
import SellerInformation from "./components/SellerInformation";
import SellerNotes from "./components/SellerNotes";
import BidForm from "./components/BidForm";

interface QuickBidDetailsViewProps {
  vehicle: VehicleDetails;
  buyer: {
    name: string;
    dealership: string;
    mobileNumber: string;
  };
  notes: string;
  onSubmit: (data: BidResponseFormData) => void;
  isSubmitting: boolean;
  existingBidAmount?: string | null;
}

const QuickBidDetailsView = ({
  vehicle,
  buyer,
  notes,
  onSubmit,
  isSubmitting,
  existingBidAmount
}: QuickBidDetailsViewProps) => {
  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-center">Quick Bid Request</h1>
        
        <VehicleCard vehicle={vehicle} />
        <SellerInformation buyer={buyer} />
        <SellerNotes notes={notes} />
        
        <BidForm 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting} 
          existingBidAmount={existingBidAmount}
        />
      </div>
    </div>
  );
};

export default QuickBidDetailsView;
