
import { VehicleDetails } from "./types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface VehicleDetailsSectionProps {
  vehicle: VehicleDetails;
}

const VehicleDetailsSection = ({ vehicle }: VehicleDetailsSectionProps) => {
  return (
    <div className="space-y-6">
      {vehicle.images && vehicle.images.length > 0 && (
        <div className="relative w-full max-w-2xl mx-auto">
          <Carousel>
            <CarouselContent>
              {vehicle.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video w-full">
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
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-bold text-gray-500">VIN</p>
                <p className="text-sm font-normal">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Mileage</p>
                <p className="text-sm font-normal">{vehicle.mileage?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Engine</p>
                <p className="text-sm font-normal">{vehicle.engineCylinders}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Transmission</p>
                <p className="text-sm font-normal">{vehicle.transmission}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Drivetrain</p>
                <p className="text-sm font-normal">{vehicle.drivetrain}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Colors & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-bold text-gray-500">Exterior Color</p>
                <p className="text-sm font-normal">{vehicle.exteriorColor}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Interior Color</p>
                <p className="text-sm font-normal">{vehicle.interiorColor}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Accessories</p>
                <p className="text-sm font-normal">{vehicle.accessories || 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Vehicle Condition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-bold text-gray-500">Windshield</p>
                <p className="text-sm font-normal">{vehicle.windshield}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Engine Lights</p>
                <p className="text-sm font-normal">{vehicle.engineLights}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Brakes</p>
                <p className="text-sm font-normal">{vehicle.brakes}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Tires</p>
                <p className="text-sm font-normal">{vehicle.tire}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Maintenance</p>
                <p className="text-sm font-normal">{vehicle.maintenance}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Reconditioning Estimate</p>
                <p className="text-sm font-normal">{vehicle.reconEstimate}</p>
              </div>
              {vehicle.reconDetails && (
                <div>
                  <p className="text-sm font-bold text-gray-500">Reconditioning Details</p>
                  <p className="text-sm font-normal">{vehicle.reconDetails}</p>
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
