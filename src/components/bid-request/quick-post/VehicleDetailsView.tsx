
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Send } from "lucide-react";
import VehicleDetailsCard from "./VehicleDetailsCard";
import BuyerSelector from "../components/BuyerSelector";
import { MappedBuyer } from "@/hooks/buyers/types";
import { TrimOption } from "../types";

interface VehicleDetailsViewProps {
  vehicleDetails: {
    year: string;
    make: string;
    model: string;
    trim: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    availableTrims: TrimOption[];
  };
  vin: string;
  mileage: string;
  notes: string;
  selectedBuyer: string;
  buyers: MappedBuyer[];
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBuyerChange: (value: string) => void;
  onGoBack: () => void;
  onSubmit: () => void;
}

const VehicleDetailsView = ({
  vehicleDetails,
  vin,
  mileage,
  notes,
  selectedBuyer,
  buyers,
  onNotesChange,
  onBuyerChange,
  onGoBack,
  onSubmit
}: VehicleDetailsViewProps) => {
  return (
    <div className="flex flex-col space-y-5">
      <div className="flex items-center mb-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 mr-2" 
          onClick={onGoBack}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Vehicle Details</h2>
      </div>
      
      <VehicleDetailsCard
        year={vehicleDetails.year}
        make={vehicleDetails.make}
        model={vehicleDetails.model}
        trim={vehicleDetails.trim}
        vin={vin}
        mileage={mileage}
        engineCylinders={vehicleDetails.engineCylinders}
        transmission={vehicleDetails.transmission}
        drivetrain={vehicleDetails.drivetrain}
      />
      
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Notes</h3>
        <Textarea
          placeholder="Add any additional information about your bid request..."
          value={notes}
          onChange={onNotesChange}
          className="h-20 resize-none text-sm"
        />
      </div>
      
      <BuyerSelector
        selectedBuyer={selectedBuyer}
        buyers={buyers}
        onBuyerChange={onBuyerChange}
      />
      
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-sm"
        onClick={onSubmit}
      >
        <Send className="mr-2 h-4 w-4" />
        Submit Bid Request
      </Button>
      
      <p className="text-gray-500 text-center text-xs">
        After submission, dealers will contact you with offers
      </p>
    </div>
  );
};

export default VehicleDetailsView;
