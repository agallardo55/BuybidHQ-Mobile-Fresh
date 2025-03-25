import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useBuyers } from "@/hooks/useBuyers";
import VinInput from "./components/VinInput";
import BasicVehicleFields from "./components/BasicVehicleFields";
import TrimSelector from "./components/TrimSelector";
import MileageInput from "./components/MileageInput";
import NotesInput from "./components/NotesInput";
import BuyerSelector from "./components/BuyerSelector";
import { TrimOption } from "./types";
import { useVinDecoder } from "./vin-scanner/useVinDecoder";
interface QuickPostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
const QuickPostDrawer = ({
  isOpen,
  onClose
}: QuickPostDrawerProps) => {
  // Form state
  const [vin, setVin] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [selectedTrim, setSelectedTrim] = useState("");
  const [availableTrims, setAvailableTrims] = useState<TrimOption[]>([{
    name: "Base",
    description: "Base Trim",
    specs: {
      engine: "4 Cylinder",
      transmission: "Automatic",
      drivetrain: "FWD"
    }
  }, {
    name: "Sport",
    description: "Sport Trim",
    specs: {
      engine: "6 Cylinder",
      transmission: "Manual",
      drivetrain: "AWD"
    }
  }, {
    name: "Limited",
    description: "Limited Edition",
    specs: {
      engine: "6 Cylinder Turbo",
      transmission: "Automatic",
      drivetrain: "AWD"
    }
  }]);

  // Use the buyers hook to get real buyers
  const {
    buyers = []
  } = useBuyers();

  // Map buyers to the format expected by BuyerSelector with all required properties
  const mappedBuyers = buyers.map(buyer => ({
    id: buyer.id,
    user_id: buyer.user_id,
    name: buyer.name,
    email: buyer.email,
    dealership: buyer.dealership,
    dealerId: buyer.dealerId,
    mobileNumber: buyer.mobileNumber,
    businessNumber: buyer.businessNumber,
    location: buyer.location,
    address: buyer.address,
    city: buyer.city,
    state: buyer.state,
    zipCode: buyer.zipCode,
    acceptedBids: buyer.acceptedBids,
    pendingBids: buyer.pendingBids,
    declinedBids: buyer.declinedBids,
    phoneCarrier: buyer.phoneCarrier,
    phoneValidationStatus: buyer.phoneValidationStatus
  }));

  // Use the VIN decoder hook
  const {
    isLoading,
    decodeVin
  } = useVinDecoder(vehicleData => {
    console.log("VIN decoder returned vehicle data:", vehicleData);

    // Update form state with the retrieved vehicle data
    setYear(vehicleData.year || "");
    setMake(vehicleData.make || "");
    setModel(vehicleData.model || "");

    // Handle trims
    if (vehicleData.availableTrims && vehicleData.availableTrims.length > 0) {
      setAvailableTrims(vehicleData.availableTrims);
      setSelectedTrim(vehicleData.trim || vehicleData.availableTrims[0]?.name || "");
    }
    toast.success("Vehicle information retrieved successfully");
  });
  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVin(e.target.value);
  };
  const handleFetchVin = () => {
    if (!vin) {
      toast.error("Please enter a VIN");
      return;
    }
    if (vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }

    // Call the VIN decoder
    decodeVin(vin);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!vin || !year || !make || !model || !selectedBuyer) {
      toast.error("Please fill all required fields");
      return;
    }

    // Process the bid request
    toast.success("Bid request created successfully");
    onClose();
  };
  return <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Quick Post</SheetTitle>
          <SheetDescription>
            Create a quick bid request with minimal details.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-3">
            <VinInput value={vin} onChange={handleVinChange} onFetchDetails={handleFetchVin} isLoading={isLoading} />

            <BasicVehicleFields year={year} make={make} model={model} onYearChange={e => setYear(e.target.value)} onMakeChange={e => setMake(e.target.value)} onModelChange={e => setModel(e.target.value)} />

            <TrimSelector selectedTrim={selectedTrim} availableTrims={availableTrims} onTrimChange={setSelectedTrim} />

            <MileageInput mileage={mileage} onChange={e => setMileage(e.target.value)} />

            <NotesInput notes={notes} onChange={e => setNotes(e.target.value)} />
            
            <BuyerSelector selectedBuyer={selectedBuyer} buyers={mappedBuyers} onBuyerChange={setSelectedBuyer} />
          </div>

          <SheetFooter className="pt-2 flex flex-row gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-initial h-8 text-sm">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 sm:flex-initial bg-accent text-white hover:bg-accent/90 h-8 text-sm">Submit</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>;
};
export default QuickPostDrawer;