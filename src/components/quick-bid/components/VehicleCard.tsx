
import React from "react";
import { Card } from "@/components/ui/card";
import { Car, Wrench, Cog } from "lucide-react";

interface VehicleCardProps {
  vehicle: {
    year: string;
    make: string;
    model: string;
    trim: string;
    vin: string;
    mileage: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
  };
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  return (
    <Card className="p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-bold">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <div className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
          {vehicle.trim}
        </div>
      </div>
      
      <div className="text-gray-700 mb-3 text-sm">
        <p>VIN: {vehicle.vin}</p>
      </div>
      
      <div className="flex items-center text-gray-600 mb-3">
        <Car className="h-4 w-4 mr-1.5 text-gray-500" />
        <span className="text-sm">{vehicle.mileage} miles</span>
      </div>
      
      <div className="border-t border-gray-200 my-2"></div>
      
      <div className="space-y-2 text-gray-700 text-xs">
        <div className="flex items-center">
          <Wrench className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
          <span>Engine: {vehicle.engineCylinders}</span>
        </div>
        
        <div className="flex items-center">
          <Cog className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
          <span>Transmission: {vehicle.transmission}</span>
        </div>
        
        <div className="flex items-center">
          <Car className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
          <span>Drivetrain: {vehicle.drivetrain}</span>
        </div>
      </div>
    </Card>
  );
};

export default VehicleCard;
