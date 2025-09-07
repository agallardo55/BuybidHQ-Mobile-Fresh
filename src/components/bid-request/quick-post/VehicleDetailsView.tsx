
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Send, Users } from "lucide-react";
import VehicleDetailsCard from "./VehicleDetailsCard";
import BuyerPickerPanel from "@/components/buyers/BuyerPickerPanel";
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
  isBuyerPickerOpen: boolean;
  onNotesChange: (notes: string) => void;
  onSelectedBuyersChange: (buyerIds: string[]) => void;
  onOpenBuyerPicker: () => void;
  onCloseBuyerPicker: () => void;
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
  isBuyerPickerOpen,
  onNotesChange,
  onSelectedBuyersChange,
  onOpenBuyerPicker,
  onCloseBuyerPicker,
  onGoBack,
  onSubmit
}: VehicleDetailsViewProps) => {
  return (
    <div className="flex flex-col h-full relative overflow-hidden">
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
              className="resize-none focus:outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 focus:!ring-0 focus:!ring-offset-0 focus:!border-blue-600 focus-visible:!border-blue-600"
            />
          </div>

          <div className="space-y-2">
            <Label>Select Buyers</Label>
            <Button
              variant="outline"
              onClick={onOpenBuyerPicker}
              className="w-full justify-between h-auto p-4"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {selectedBuyers.length === 0 
                    ? "Choose buyers to send bid request" 
                    : `${selectedBuyers.length} buyer${selectedBuyers.length === 1 ? '' : 's'} selected`
                  }
                </span>
              </div>
              {selectedBuyers.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  {selectedBuyers.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 pt-4 bg-background border-t">
        <Button
          onClick={onSubmit}
          disabled={selectedBuyers.length === 0}
          className="w-full py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="mr-2 h-4 w-4" />
          Submit
        </Button>
        
        <p className="text-muted-foreground text-center text-xs mt-2">
          Dealers will receive your request via SMS/Email
        </p>
      </div>

      <BuyerPickerPanel
        isOpen={isBuyerPickerOpen}
        onClose={onCloseBuyerPicker}
        buyers={buyers}
        selectedBuyers={selectedBuyers}
        onSelectedBuyersChange={onSelectedBuyersChange}
      />
    </div>
  );
};

export default VehicleDetailsView;
