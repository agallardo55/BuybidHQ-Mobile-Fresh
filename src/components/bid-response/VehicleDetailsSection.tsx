
import { VehicleDetails } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImagePlus } from "lucide-react";

interface VehicleDetailsSectionProps {
  vehicle: VehicleDetails;
}

const VehicleDetailsSection = ({ vehicle }: VehicleDetailsSectionProps) => {
  // Mock images array - in a real app, these would come from your API
  const images = [1, 2, 3]; // Placeholder for image URLs

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <ScrollArea className="h-64 whitespace-nowrap">
        <div className="flex">
          {images.map((_, index) => (
            <div
              key={index}
              className="w-full flex-none snap-center"
            >
              <div className="h-64 w-full flex items-center justify-center bg-gray-100">
                <ImagePlus className="h-12 w-12 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </h1>
          <p className="text-sm text-gray-500">
            VIN: {vehicle.vin}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Mileage</p>
            <p className="font-medium">{vehicle.mileage.toLocaleString()} miles</p>
          </div>
          <div>
            <p className="text-gray-500">Exterior</p>
            <p className="font-medium">{vehicle.exteriorColor}</p>
          </div>
          <div>
            <p className="text-gray-500">Interior</p>
            <p className="font-medium">{vehicle.interiorColor}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsSection;
