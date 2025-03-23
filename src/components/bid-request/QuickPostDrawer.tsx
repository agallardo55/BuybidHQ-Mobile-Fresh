
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";

interface QuickPostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickPostDrawer = ({ isOpen, onClose }: QuickPostDrawerProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle quick post submission logic here
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Quick Post</SheetTitle>
          <SheetDescription>
            Create a quick bid request with minimal details.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" placeholder="Enter vehicle VIN" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" placeholder="Vehicle year" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input id="make" placeholder="Vehicle make" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="Vehicle model" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input id="mileage" placeholder="Vehicle mileage" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" placeholder="Enter any additional details" rows={3} />
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-accent text-white hover:bg-accent/90">
              Create Request
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default QuickPostDrawer;
