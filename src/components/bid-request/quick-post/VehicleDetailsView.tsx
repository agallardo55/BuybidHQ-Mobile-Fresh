
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Send } from "lucide-react";
import VehicleDetailsCard from "./VehicleDetailsCard";
import MultiBuyerSelector from "./MultiBuyerSelector";
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
  selectedBuyers: string[];
  buyers: MappedBuyer[];
  onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onToggleBuyer: (buyerId: string) => void;
  onGoBack: () => void;
  onSubmit: () => void;
}

const VehicleDetailsView = ({
  vehicleDetails,
  vin,
  mileage,
  notes,
  selectedBuyers,
  buyers,
  onNotesChange,
  onToggleBuyer,
  onGoBack,
  onSubmit
}: VehicleDetailsViewProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 mr-3" 
          onClick={onGoBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Vehicle Details</h2>
      </div>
      
      <div className="flex-1 space-y-6">
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
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Notes</h3>
          <Textarea
            placeholder="Add any additional information about your bid request..."
            value={notes}
            onChange={onNotesChange}
            className="h-24 resize-none"
          />
        </div>
        
        <MultiBuyerSelector
          selectedBuyers={selectedBuyers}
          buyers={buyers}
          onToggleBuyer={onToggleBuyer}
        />
      </div>
      
      <div className="mt-6 pt-4 border-t space-y-4">
        {selectedBuyers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedBuyers.map(buyerId => {
              const buyer = buyers.find(b => b.id === buyerId);
              return buyer ? (
                <div
                  key={buyerId}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm"
                >
                  <span>{buyer.name}</span>
                  <button
                    onClick={() => onToggleBuyer(buyerId)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ) : null;
            })}
          </div>
        )}
        
        <Button 
          className="w-full py-3 text-base font-medium"
          onClick={onSubmit}
          disabled={selectedBuyers.length === 0}
        >
          <Send className="mr-2 h-4 w-4" />
          Submit
        </Button>
        
        <p className="text-muted-foreground text-center text-sm">
          After submission, dealers will contact you with offers
        </p>
      </div>
    </div>
  );
};

export default VehicleDetailsView;
