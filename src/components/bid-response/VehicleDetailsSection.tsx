
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import VehicleInformation from "./VehicleInformation";
import VehicleCondition from "./VehicleCondition";

interface VehicleDetails {
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  mileage: number;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor: string;
  accessories: string;
  windshield: string;
  engineLights: string;
  brakes: string;
  tire: string;
  maintenance: string;
  reconEstimate: string;
  reconDetails: string;
  userFullName?: string;
  dealership?: string;
  mobileNumber?: string;
}

interface VehicleDetailsSectionProps {
  vehicle: VehicleDetails;
}

const VehicleDetailsSection = ({ vehicle }: VehicleDetailsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Vehicle Details</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>

        <VehicleInformation vehicle={vehicle} />

        {isExpanded && (
          <div className="mt-6 border-t pt-6">
            <VehicleCondition vehicle={vehicle} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetailsSection;
