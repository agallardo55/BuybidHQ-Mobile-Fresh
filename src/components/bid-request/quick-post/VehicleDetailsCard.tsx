
import React from "react";
import { Card } from "@/components/ui/card";
import { Car, Wrench, Cog } from "lucide-react";

interface VehicleDetailsCardProps {
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
}

const VehicleDetailsCard = ({
  year,
  make, 
  model,
  trim,
  vin,
  mileage,
  engineCylinders,
  transmission,
  drivetrain
}: VehicleDetailsCardProps) => {
  return (
    <Card className="p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-bold">
          {year} {make} {model}
        </h3>
        <div className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
          {trim}
        </div>
      </div>
      
      <div className="text-gray-700 mb-3 text-sm">
        <p>VIN: {vin}</p>
      </div>
      
      <div className="flex items-center text-gray-600 mb-3">
        <Car className="h-4 w-4 mr-1.5 text-gray-500" />
        <span className="text-sm">{mileage} miles</span>
      </div>
      
      <div className="border-t border-gray-200 my-2"></div>
      
      <div className="space-y-2 text-gray-700 text-xs">
        <div className="flex items-center">
          <Wrench className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
          <span>Engine: {engineCylinders || "N/A"}</span>
        </div>
        
        <div className="flex items-center">
          <Cog className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
          <span>Transmission: {transmission || "N/A"}</span>
        </div>
        
        <div className="flex items-center">
          <Car className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
          <span>Drivetrain: {drivetrain || "N/A"}</span>
        </div>
      </div>
    </Card>
  );
};

export default VehicleDetailsCard;
