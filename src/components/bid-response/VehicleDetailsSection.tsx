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
import { Copy } from "lucide-react";
import { getConditionDisplay } from "../bid-request/utils/conditionFormatting";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import carPlaceholder from "@/assets/car-placeholder.png";
import { formatCurrencyDisplay } from "@/utils/currencyUtils";
import BookValuesCard from "./BookValuesCard";
import ImageCarouselDialog from "./ImageCarouselDialog";

interface VehicleDetailsSectionProps {
  vehicle: VehicleDetails;
  buyer: {
    name: string;
    dealership: string;
    mobileNumber: string;
  };
}

const VehicleDetailsSection = ({ vehicle, buyer }: VehicleDetailsSectionProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCopyVin = async () => {
    try {
      await navigator.clipboard.writeText(vehicle.vin);
      toast.success('VIN copied to clipboard');
    } catch (error) {
      console.error('Error copying VIN:', error);
      toast.error('Failed to copy VIN');
    }
  };

  const images = vehicle.images || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">New Bid Request</CardTitle>
        </CardHeader>
        <Separator className="mb-6" />
        <CardContent>
          <div className="grid gap-1.5">
            <div className="grid grid-cols-5 gap-1.5 py-2">
              <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">From :</p>
              <p className="col-span-3 text-base lg:text-base text-lg font-normal">{buyer.name}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-5 gap-1.5 py-2">
              <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Dealership :</p>
              <p className="col-span-3 text-base lg:text-base text-lg font-normal">{buyer.dealership}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-5 gap-1.5 py-2">
              <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Mobile # :</p>
              <p className="col-span-3 text-base lg:text-base text-lg font-normal">{buyer.mobileNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 ? (
        <>
          <div className="relative w-full max-w-2xl mx-auto">
            <Carousel opts={{ startIndex: 0 }}>
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                     <div 
                      className="aspect-video w-full cursor-pointer" 
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setIsDialogOpen(true);
                      }}
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

          <ImageCarouselDialog
            images={images}
            initialIndex={selectedImageIndex}
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setSelectedImageIndex(-1);
            }}
          />
        </>
      ) : (
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center">
            <img
              src={carPlaceholder}
              alt="Vehicle placeholder"
              className="w-32 h-32 object-contain opacity-50"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
            </CardTitle>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent>
            <div className="grid gap-1.5">
              <div className="flex items-center gap-2 py-2 pr-6">
                <p className="text-base lg:text-base text-lg font-bold text-black">VIN :</p>
                <button
                  onClick={handleCopyVin}
                  className="ml-[50px] p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Copy VIN"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <p className="text-base lg:text-base text-lg font-normal">{vehicle.vin}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Mileage :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{vehicle.mileage?.toLocaleString()}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Engine :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{vehicle.engineCylinders}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Transmission :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{vehicle.transmission}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Drivetrain :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{vehicle.drivetrain}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Colors & Accessories</CardTitle>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent>
            <div className="grid gap-1.5">
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Exterior Color :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{vehicle.exteriorColor}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Interior Color :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{vehicle.interiorColor}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Accessories :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{vehicle.accessories || 'None'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Vehicle Condition</CardTitle>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent>
            <div className="grid gap-1.5">
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Windshield :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{getConditionDisplay(vehicle.windshield, 'windshield')}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Engine Lights :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{getConditionDisplay(vehicle.engineLights, 'engineLights')}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Brakes :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{getConditionDisplay(vehicle.brakes, 'brakesTires')}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Tires :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{getConditionDisplay(vehicle.tire, 'brakesTires')}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Maintenance :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{getConditionDisplay(vehicle.maintenance, 'maintenance')}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-5 gap-1.5 py-2">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Recon Est. :</p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">{formatCurrencyDisplay(vehicle.reconEstimate)}</p>
              </div>
              {vehicle.reconDetails && (
                <>
                  <Separator />
                  <div className="grid grid-cols-5 gap-1.5 py-2">
                    <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Recon Details :</p>
                    <p className="col-span-3 text-base lg:text-base text-lg font-normal">{vehicle.reconDetails}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

          <BookValuesCard
            kbbWholesale={vehicle.kbbWholesale}
            kbbRetail={vehicle.kbbRetail}
            jdPowerWholesale={vehicle.jdPowerWholesale}
            jdPowerRetail={vehicle.jdPowerRetail}
            mmrWholesale={vehicle.mmrWholesale}
            mmrRetail={vehicle.mmrRetail}
            auctionWholesale={vehicle.auctionWholesale}
            auctionRetail={vehicle.auctionRetail}
            bookValuesCondition={vehicle.bookValuesCondition}
          />
      </div>
    </div>
  );
};

export default VehicleDetailsSection;
