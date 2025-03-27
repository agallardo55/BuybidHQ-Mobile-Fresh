
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Car, Gauge, GitFork, SendHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

interface VehicleDetailsViewProps {}

const VehicleDetailsView: React.FC<VehicleDetailsViewProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicleData = location.state?.vehicleData;
  const [notes, setNotes] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!vehicleData) {
    return (
      <div className="container max-w-md mx-auto p-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">No vehicle data available. Please go back and try again.</p>
            <Button 
              onClick={() => navigate(-1)} 
              className="mt-4 w-full"
              variant="outline"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { year, make, model, trim, vin, mileage, engineCylinders, transmission, drivetrain } = vehicleData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBuyer) {
      toast.error("Please select a buyer");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here you would submit the bid request to your API
      // For now we'll just show a success message
      setTimeout(() => {
        toast.success("Bid request submitted successfully");
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Error submitting bid request:", error);
      toast.error("Failed to submit bid request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Vehicle Details</h1>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-semibold">
              {year} {make} {model}
            </h2>
            <span className="inline-block bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm font-medium">
              {trim}
            </span>
          </div>
          
          <p className="text-gray-700 mt-2">VIN: {vin}</p>
          
          <div className="flex items-center gap-2 mt-4 text-gray-600">
            <Car className="h-5 w-5" />
            <span>{Number(mileage.replace(/,/g, '')).toLocaleString()} miles</span>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Gauge className="h-5 w-5 shrink-0" />
              <span>Engine: {engineCylinders}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <GitFork className="h-5 w-5 shrink-0 rotate-90" />
              <span>Transmission: {transmission}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="shrink-0"
              >
                <path d="M5 9h14M9 5v14M4.5 4.5l15 15" />
              </svg>
              <span>Drivetrain: {drivetrain}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-3">Notes</h2>
          <Textarea
            placeholder="Add any additional information about your bid request..."
            className="min-h-24 resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-3">Select Buyer</h2>
          <Select value={selectedBuyer} onValueChange={setSelectedBuyer}>
            <SelectTrigger>
              <SelectValue placeholder="Select a buyer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer1">ABC Motors</SelectItem>
              <SelectItem value="buyer2">XYZ Dealership</SelectItem>
              <SelectItem value="buyer3">123 Auto Group</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 h-12"
          disabled={isSubmitting}
        >
          <SendHorizontal className="mr-2 h-5 w-5" />
          Submit Bid Request
        </Button>
        
        <p className="text-center text-gray-500 text-sm">
          After submission, dealers will contact you with offers
        </p>
      </form>
    </div>
  );
};

export default VehicleDetailsView;
