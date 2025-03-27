
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// Import our new components
import VehicleHeader from "./components/VehicleHeader";
import VehicleSpecifications from "./components/VehicleSpecifications";
import BidRequestForm from "./components/BidRequestForm";
import ErrorCard from "./components/ErrorCard";

interface VehicleDetailsViewProps {}

const VehicleDetailsView: React.FC<VehicleDetailsViewProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicleData = location.state?.vehicleData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!vehicleData) {
    return <ErrorCard />;
  }

  const { year, make, model, trim, vin, mileage, engineCylinders, transmission, drivetrain } = vehicleData;

  const handleSubmit = async () => {
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
          <VehicleHeader
            year={year}
            make={make}
            model={model}
            trim={trim}
            vin={vin}
          />
          
          <VehicleSpecifications
            mileage={mileage}
            engineCylinders={engineCylinders}
            transmission={transmission}
            drivetrain={drivetrain}
          />
        </CardContent>
      </Card>
      
      <BidRequestForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default VehicleDetailsView;
