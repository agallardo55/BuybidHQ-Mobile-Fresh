
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

interface QuickPostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickPostDrawer = ({ isOpen, onClose }: QuickPostDrawerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [vin, setVin] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVin(e.target.value);
  };

  const handleFetchVin = () => {
    if (!vin) return;
    
    setIsLoading(true);
    // Simulate fetching VIN details
    setTimeout(() => {
      setIsLoading(false);
      // Here you would normally populate form with VIN data
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle quick post submission logic here
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
            <div className="space-y-1 w-full">
              <Label htmlFor="quick-vin">VIN</Label>
              <div className="flex w-full">
                <Input 
                  id="quick-vin" 
                  value={vin}
                  onChange={handleVinChange}
                  placeholder="Enter vehicle VIN" 
                  className="rounded-r-none w-full h-9"
                />
                <Button 
                  type="button" 
                  onClick={handleFetchVin}
                  disabled={isLoading}
                  className="bg-custom-blue hover:bg-custom-blue/90 rounded-l-none border-l-0 h-9"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-3 w-3 animate-spin mr-1" />
                      <span className="hidden sm:inline text-xs">Loading</span>
                    </>
                  ) : (
                    "Go"
                  )}
                </Button>
              </div>
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

            <div className="flex flex-wrap gap-2 w-full">
              <div className="space-y-1 flex-1 min-w-[calc(50%-4px)]">
                <Label htmlFor="year" className="text-sm">Year</Label>
                <Input id="year" placeholder="Year" className="h-8 w-full" />
              </div>

              <div className="space-y-1 flex-1 min-w-[calc(50%-4px)]">
                <Label htmlFor="make" className="text-sm">Make</Label>
                <Input id="make" placeholder="Make" className="h-8 w-full" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full">
              <div className="space-y-1 flex-1 min-w-[calc(50%-4px)]">
                <Label htmlFor="model" className="text-sm">Model</Label>
                <Input id="model" placeholder="Model" className="h-8 w-full" />
              </div>

              <div className="space-y-1 flex-1 min-w-[calc(50%-4px)]">
                <Label htmlFor="mileage" className="text-sm">Mileage</Label>
                <Input id="mileage" placeholder="Mileage" className="h-8 w-full" />
              </div>
            </div>

            <div className="space-y-1 w-full">
              <Label htmlFor="notes" className="text-sm">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter any additional details" 
                rows={2} 
                className="resize-none text-sm w-full"
              />
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
