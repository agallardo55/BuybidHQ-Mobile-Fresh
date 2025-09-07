
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  onNotesChange: (notes: string) => void;
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
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={onGoBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this vehicle..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <MultiBuyerSelector
            selectedBuyers={selectedBuyers}
            buyers={buyers}
            onToggleBuyer={onToggleBuyer}
          />
        </div>
      </div>

      <div className="sticky bottom-0 pt-4 bg-background border-t">
        <Button
          onClick={onSubmit}
          disabled={selectedBuyers.length === 0}
          className="w-full py-3 text-base font-medium"
        >
          <Send className="mr-2 h-4 w-4" />
          Send Bid Request to {selectedBuyers.length} Buyer{selectedBuyers.length !== 1 ? 's' : ''}
        </Button>
        
        <p className="text-muted-foreground text-center text-xs mt-2">
          Dealers will receive your request via SMS/Email
        </p>
      </div>
    </div>
  );
};

export default VehicleDetailsView;
