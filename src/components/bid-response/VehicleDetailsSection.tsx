
import { VehicleDetails } from "./types";
import VehicleInformation from "./VehicleInformation";
import VehicleCondition from "./VehicleCondition";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  vehicle: VehicleDetails;
}

const VehicleDetailsSection = ({ vehicle }: Props) => {
  return (
    <div className="space-y-6">
      {/* Image Carousel */}
      {vehicle.images && vehicle.images.length > 0 ? (
        <Card className="p-4">
          <Carousel className="w-full max-w-3xl mx-auto">
            <CarouselContent>
              {vehicle.images.map((image, index) => (
                <CarouselItem key={index}>
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={image}
                      alt={`Vehicle image ${index + 1}`}
                      className={cn(
                        "rounded-lg object-cover w-full h-full",
                        "transition-all duration-300"
                      )}
                    />
                  </AspectRatio>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </Card>
      ) : (
        <Card className="p-4">
          <AspectRatio ratio={16 / 9}>
            <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
              <p className="text-gray-500">No images available</p>
            </div>
          </AspectRatio>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <VehicleInformation vehicle={vehicle} />
        <VehicleCondition vehicle={vehicle} />
      </div>
    </div>
  );
};

export default VehicleDetailsSection;
