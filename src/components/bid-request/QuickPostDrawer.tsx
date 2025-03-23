
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader, ChevronDown, Users } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockBuyers } from "./mockData";
import VinInput from "./components/VinInput";
import { TrimOption } from "./types";
import { useVinDecoder } from "./vin-scanner/useVinDecoder";
import { toast } from "sonner";

interface QuickPostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickPostDrawer = ({ isOpen, onClose }: QuickPostDrawerProps) => {
  // Form state
  const [vin, setVin] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [selectedTrim, setSelectedTrim] = useState("");
  const [availableTrims, setAvailableTrims] = useState<TrimOption[]>([
    { name: "Base", description: "Base Trim", specs: { engine: "4 Cylinder", transmission: "Automatic", drivetrain: "FWD" } },
    { name: "Sport", description: "Sport Trim", specs: { engine: "6 Cylinder", transmission: "Manual", drivetrain: "AWD" } },
    { name: "Limited", description: "Limited Edition", specs: { engine: "6 Cylinder Turbo", transmission: "Automatic", drivetrain: "AWD" } },
  ]);

  // Use the VIN decoder hook
  const { isLoading, decodeVin } = useVinDecoder((vehicleData) => {
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
    // Handle quick post submission logic here
    
    // Validate required fields
    if (!vin || !year || !make || !model || !selectedBuyer) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Process the bid request
    toast.success("Bid request created successfully");
    onClose();
  };

  // Sort buyers alphabetically by name
  const sortedBuyers = [...mockBuyers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Quick Post</SheetTitle>
          <SheetDescription>
            Create a quick bid request with minimal details.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-3">
            <VinInput 
              value={vin}
              onChange={handleVinChange}
              onFetchDetails={handleFetchVin}
              isLoading={isLoading}
            />

            <div className="space-y-1 w-full">
              <Label htmlFor="year" className="text-sm">Year</Label>
              <Input 
                id="year" 
                placeholder="Year" 
                className="h-8 w-full" 
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <div className="space-y-1 w-full">
              <Label htmlFor="make" className="text-sm">Make</Label>
              <Input 
                id="make" 
                placeholder="Make" 
                className="h-8 w-full" 
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
            </div>
            
            <div className="space-y-1 w-full">
              <Label htmlFor="model" className="text-sm">Model</Label>
              <Input 
                id="model" 
                placeholder="Model" 
                className="h-8 w-full"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>

            <div className="space-y-1 w-full">
              <Label htmlFor="trim" className="text-sm">Trim</Label>
              <Select value={selectedTrim} onValueChange={setSelectedTrim}>
                <SelectTrigger className="w-full h-8">
                  <SelectValue placeholder="Select a trim" />
                </SelectTrigger>
                <SelectContent>
                  {availableTrims.map((trim) => (
                    <SelectItem key={trim.name} value={trim.name}>
                      <div className="flex items-center gap-1">
                        <span>{trim.name}</span>
                        <span className="text-xs text-muted-foreground"> - {trim.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 w-full">
              <Label htmlFor="mileage" className="text-sm">Mileage</Label>
              <Input 
                id="mileage" 
                placeholder="Mileage" 
                className="h-8 w-full"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>

            <div className="space-y-1 w-full">
              <Label htmlFor="notes" className="text-sm">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter any additional details" 
                rows={2} 
                className="resize-none text-sm w-full"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="space-y-1 w-full">
              <Label htmlFor="buyer-select">Select Buyer</Label>
              <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select a buyer" />
                </SelectTrigger>
                <SelectContent>
                  {sortedBuyers.map((buyer) => (
                    <SelectItem key={buyer.id} value={buyer.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{buyer.name}</span>
                        <span className="text-xs text-muted-foreground">({buyer.dealership})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="pt-2 flex flex-row gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-initial h-8 text-sm">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 sm:flex-initial bg-accent text-white hover:bg-accent/90 h-8 text-sm">
              Create Request
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default QuickPostDrawer;
