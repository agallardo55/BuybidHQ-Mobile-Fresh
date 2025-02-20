
import { Vehicle } from "./types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface VehicleDetailsSectionProps {
  vehicle: Vehicle;
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

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Vehicle Details</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">VIN</dt>
                <dd className="text-sm text-gray-900">{vehicle.vin}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Mileage</dt>
                <dd className="text-sm text-gray-900">{vehicle.mileage}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Engine</dt>
                <dd className="text-sm text-gray-900">{vehicle.engineCylinders}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Transmission</dt>
                <dd className="text-sm text-gray-900">{vehicle.transmission}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Drivetrain</dt>
                <dd className="text-sm text-gray-900">{vehicle.drivetrain}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Colors & Features</h3>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Exterior Color</dt>
                <dd className="text-sm text-gray-900">{vehicle.exteriorColor}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Interior Color</dt>
                <dd className="text-sm text-gray-900">{vehicle.interiorColor}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Accessories</dt>
                <dd className="text-sm text-gray-900">{vehicle.accessories || 'None'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsSection;
