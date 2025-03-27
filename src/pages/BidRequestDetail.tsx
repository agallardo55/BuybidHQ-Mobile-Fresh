
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import VehicleHeader from "../components/bid-request/components/VehicleHeader";
import VehicleSpecifications from "../components/bid-request/components/VehicleSpecifications";

const BidRequestDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Mock data for demonstration
  const vehicleData = {
    year: "2022",
    make: "Toyota",
    model: "Camry",
    trim: "XSE",
    vin: "JT2BF22K1X0123456",
    mileage: "15000",
    engineCylinders: "V6 3.5L",
    transmission: "Automatic",
    drivetrain: "FWD"
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Bid Request Details</h1>
      
      <Card>
        <CardContent className="pt-6">
          <VehicleHeader
            year={vehicleData.year}
            make={vehicleData.make}
            model={vehicleData.model}
            trim={vehicleData.trim}
            vin={vehicleData.vin}
          />
          
          <VehicleSpecifications
            mileage={vehicleData.mileage}
            engineCylinders={vehicleData.engineCylinders}
            transmission={vehicleData.transmission}
            drivetrain={vehicleData.drivetrain}
          />
          
          <div className="mt-6 flex space-x-4">
            <Button
              onClick={() => navigate(`/bid-requests/${id}/respond`)}
              className="flex-1"
            >
              Respond to Bid
            </Button>
            
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BidRequestDetail;
