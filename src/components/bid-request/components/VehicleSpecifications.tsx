
import React from "react";
import { Car, Gauge, GitFork } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface VehicleSpecificationsProps {
  mileage: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
}

const VehicleSpecifications: React.FC<VehicleSpecificationsProps> = ({
  mileage,
  engineCylinders,
  transmission,
  drivetrain
}) => {
  return (
    <>
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
    </>
  );
};

export default VehicleSpecifications;
