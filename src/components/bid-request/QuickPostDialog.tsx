
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FormField from "./components/FormField";
import { useVinDecoder } from "./vin-scanner/useVinDecoder";

interface QuickPostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickPostDialog = ({ isOpen, onOpenChange }: QuickPostDialogProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vin: "",
    mileage: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    engineCylinders: "",
    transmission: "",
    drivetrain: "",
    reconEstimate: "",
    reconDetails: ""
  });

  const { decodeVin, isLoading } = useVinDecoder((vehicleData) => {
    setFormData(prev => ({
      ...prev,
      year: vehicleData.year || "",
      make: vehicleData.make || "",
      model: vehicleData.model || "",
      trim: vehicleData.trim || "",
      engineCylinders: vehicleData.engineCylinders || "",
      transmission: vehicleData.transmission || "",
      drivetrain: vehicleData.drivetrain || "",
    }));
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.vin || !formData.mileage) {
      toast.error("VIN and mileage are required");
      return;
    }
    
    // Navigate to create bid request page with form data as state
    navigate("/create-bid-request", { state: { quickPostData: formData } });
    onOpenChange(false);
  };

  const handleFetchVinDetails = () => {
    if (!formData.vin || formData.vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }

    decodeVin(formData.vin);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Quick Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                  VIN <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="vin"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    placeholder="Enter VIN"
                    maxLength={17}
                  />
                  <Button 
                    type="button" 
                    className="bg-custom-blue hover:bg-custom-blue/90 px-6"
                    onClick={handleFetchVinDetails}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Go"}
                  </Button>
                </div>
              </div>
              
              <FormField
                id="mileage"
                label="Mileage"
                value={formData.mileage}
                onChange={handleChange}
                type="number"
                required={true}
                placeholder="Enter mileage"
              />
              
              <FormField
                id="year"
                label="Year"
                value={formData.year}
                onChange={handleChange}
                type="text"
                required={false}
                placeholder="Enter year"
              />
              
              <FormField
                id="make"
                label="Make"
                value={formData.make}
                onChange={handleChange}
                type="text"
                required={false}
                placeholder="Enter make"
              />
              
              <FormField
                id="model"
                label="Model"
                value={formData.model}
                onChange={handleChange}
                type="text"
                required={false}
                placeholder="Enter model"
              />
            </div>
            
            <div className="space-y-4">
              <FormField
                id="trim"
                label="Trim"
                value={formData.trim}
                onChange={handleChange}
                type="text"
                required={false}
                placeholder="Enter trim"
              />
              
              <FormField
                id="engineCylinders"
                label="Engine"
                value={formData.engineCylinders}
                onChange={handleChange}
                type="text"
                required={false}
                placeholder="Enter engine type"
              />
              
              <FormField
                id="transmission"
                label="Transmission"
                value={formData.transmission}
                onChange={handleChange}
                type="text"
                required={false}
                placeholder="Enter transmission"
              />
              
              <FormField
                id="drivetrain"
                label="Drivetrain"
                value={formData.drivetrain}
                onChange={handleChange}
                type="text"
                required={false}
                placeholder="Enter drivetrain"
              />
              
              <div>
                <Label htmlFor="reconEstimate" className="block text-sm font-medium text-gray-700 mb-1">
                  Recon Estimate
                </Label>
                <Input
                  id="reconEstimate"
                  name="reconEstimate"
                  value={formData.reconEstimate}
                  onChange={handleChange}
                  type="text"
                  placeholder="$0"
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="reconDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Comments
            </Label>
            <Textarea
              id="reconDetails"
              name="reconDetails"
              value={formData.reconDetails}
              onChange={handleChange}
              placeholder="Enter additional comments or reconditioning details"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Bid Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickPostDialog;
