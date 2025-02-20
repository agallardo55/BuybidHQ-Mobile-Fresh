
import { useState } from "react";
import { VehicleDetails } from "./types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { getConditionDisplay } from "../bid-request/utils/conditionFormatting";

interface VehicleDetailsSectionProps {
  vehicle: VehicleDetails;
}

const VehicleDetailsSection = ({ vehicle }: VehicleDetailsSectionProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {vehicle.images && vehicle.images.length > 0 && (
        <>
          <div className="relative w-full max-w-2xl mx-auto">
            <Carousel>
              <CarouselContent>
                {vehicle.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div 
                      className="aspect-video w-full cursor-pointer" 
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`Vehicle image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="sm:max-w-3xl p-0 bg-black border-black">
              <div className="relative w-full h-[80vh]">
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="Selected vehicle" 
                    className="w-full h-full object-contain"
                  />
                )}
                <button
                  className="absolute right-4 top-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">VIN</p>
                <p className="text-base font-normal">{vehicle.vin}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Mileage</p>
                <p className="text-base font-normal">{vehicle.mileage?.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Engine</p>
                <p className="text-base font-normal">{vehicle.engineCylinders}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Transmission</p>
                <p className="text-base font-normal">{vehicle.transmission}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Drivetrain</p>
                <p className="text-base font-normal">{vehicle.drivetrain}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Colors & Accessories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Exterior Color</p>
                <p className="text-base font-normal">{vehicle.exteriorColor}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Interior Color</p>
                <p className="text-base font-normal">{vehicle.interiorColor}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Accessories</p>
                <p className="text-base font-normal">{vehicle.accessories || 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Vehicle Condition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Windshield</p>
                <p className="text-base font-normal">{getConditionDisplay(vehicle.windshield, 'windshield')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Engine Lights</p>
                <p className="text-base font-normal">{getConditionDisplay(vehicle.engineLights, 'engineLights')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Brakes</p>
                <p className="text-base font-normal">{getConditionDisplay(vehicle.brakes, 'brakesTires')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Tires</p>
                <p className="text-base font-normal">{getConditionDisplay(vehicle.tire, 'brakesTires')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Maintenance</p>
                <p className="text-base font-normal">{getConditionDisplay(vehicle.maintenance, 'maintenance')}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 py-1.5">
                <p className="text-base font-bold text-black">Reconditioning Estimate</p>
                <p className="text-base font-normal">${parseFloat(vehicle.reconEstimate).toLocaleString()}</p>
              </div>
              {vehicle.reconDetails && (
                <div className="grid grid-cols-2 gap-2 py-1.5">
                  <p className="text-base font-bold text-black">Reconditioning Details</p>
                  <p className="text-base font-normal">{vehicle.reconDetails}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleDetailsSection;
