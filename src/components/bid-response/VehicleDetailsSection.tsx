
import { VehicleDetails } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImagePlus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

interface VehicleDetailsSectionProps {
  vehicle: VehicleDetails;
}

const VehicleDetailsSection = ({ vehicle }: VehicleDetailsSectionProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Mock images array - in a real app, these would come from your API
  const images = [1, 2, 3]; // Placeholder for image URLs

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(value));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">
            From: {vehicle.userFullName}
          </h2>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Dealership: {vehicle.dealership}</p>
            <p>Phone: {vehicle.mobileNumber}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-64 whitespace-nowrap">
        <div className="flex">
          {images.map((_, index) => (
            <div
              key={index}
              className="w-full flex-none snap-center cursor-pointer"
              onClick={() => {
                setSelectedImageIndex(index);
                setIsGalleryOpen(true);
              }}
            >
              <div className="h-64 w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
                <ImagePlus className="h-12 w-12 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <div className="relative">
            <ScrollArea className="h-[80vh] whitespace-nowrap">
              <div className="flex snap-x snap-mandatory">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className="w-full flex-none snap-center"
                  >
                    <div className="h-[80vh] w-screen flex items-center justify-center">
                      <div className="h-64 w-full flex items-center justify-center">
                        <ImagePlus className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
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
          <div>
            <p className="text-gray-500">Transmission</p>
            <p className="font-medium">{vehicle.transmission}</p>
          </div>
          <div>
            <p className="text-gray-500">Engine</p>
            <p className="font-medium">{vehicle.engineCylinders}</p>
          </div>
          <div>
            <p className="text-gray-500">Drivetrain</p>
            <p className="font-medium">{vehicle.drivetrain}</p>
          </div>
          <div>
            <p className="text-gray-500">Windshield</p>
            <p className="font-medium capitalize">{vehicle.windshield || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Engine Lights</p>
            <p className="font-medium capitalize">{vehicle.engineLights || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Brakes</p>
            <p className="font-medium capitalize">{vehicle.brakes || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Tires</p>
            <p className="font-medium capitalize">{vehicle.tire || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Maintenance</p>
            <p className="font-medium capitalize">{vehicle.maintenance || '-'}</p>
          </div>
        </div>

        <div className="space-y-3">
          {vehicle.accessories && (
            <div>
              <p className="text-gray-500 text-sm">Additional Equipment/Accessories</p>
              <p className="text-sm">{vehicle.accessories}</p>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t pt-3">
          <div>
            <p className="text-gray-500 text-sm">Reconditioning Estimate</p>
            <p className="font-medium">{formatCurrency(vehicle.reconEstimate)}</p>
          </div>
          
          {vehicle.reconDetails && (
            <div>
              <p className="text-gray-500 text-sm">Reconditioning Details</p>
              <p className="text-sm">{vehicle.reconDetails}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsSection;
