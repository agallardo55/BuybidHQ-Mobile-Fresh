
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BidRequest } from "./types";
import { format, parseISO } from "date-fns";
import ImageCarousel from "./components/ImageCarousel";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ImagePreviewDialog from "./components/ImagePreviewDialog";

interface BidRequestDialogProps {
  request: BidRequest | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const getConditionDisplay = (value: string | undefined, type: 'windshield' | 'engineLights' | 'brakesTires' | 'maintenance'): string => {
  const displayMaps = {
    windshield: {
      clear: "Clear",
      chips: "Chips",
      smallCracks: "Small cracks",
      largeCracks: "Large cracks"
    },
    engineLights: {
      none: "None",
      engine: "Engine Light",
      maintenance: "Maintenance Required",
      mobile: "Mobile Device"
    },
    brakesTires: {
      acceptable: "Acceptable",
      replaceFront: "Replace front",
      replaceRear: "Replace rear",
      replaceAll: "Replace all"
    },
    maintenance: {
      upToDate: "Up to date",
      basicService: "Basic service needed",
      minorService: "Minor service needed",
      majorService: "Major service needed"
    }
  };

  if (!value) {
    return type === 'windshield' ? "Clear" :
           type === 'engineLights' ? "None" :
           type === 'brakesTires' ? "Acceptable" :
           "Up to date";
  }

  const map = type === 'brakesTires' ? displayMaps.brakesTires :
              type === 'maintenance' ? displayMaps.maintenance :
              type === 'engineLights' ? displayMaps.engineLights :
              displayMaps.windshield;

  return (map as Record<string, string>)[value] || value;
};

const BidRequestDialog = ({ request, isOpen, onOpenChange }: BidRequestDialogProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!request?.id) return;

      try {
        const { data, error } = await supabase
          .from('images')
          .select('image_url')
          .eq('bid_request_id', request.id);

        if (error) {
          console.error('Error fetching images:', error);
          return;
        }

        const urls = data.map(img => img.image_url).filter((url): url is string => url !== null);
        setImages(urls);
      } catch (error) {
        console.error('Error in fetchImages:', error);
      }
    };

    if (isOpen) {
      fetchImages();
    }
  }, [request, isOpen]);

  if (!request) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="!w-[95vw] sm:!w-[90vw] md:!w-[85vw] lg:!w-[80vw] xl:!w-[75vw] !max-w-[1400px]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">Vehicle Details</DialogTitle>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium
                ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                ${request.status === 'Pending' ? 'bg-blue-100 text-blue-800' : ''}
                ${request.status === 'Declined' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {request.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="font-medium">{formatDate(request.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Buyer:</span>
                <p className="font-medium">{request.buyer}</p>
              </div>
              <div>
                <span className="text-gray-500">Highest Offer:</span>
                <p className="font-medium">
                  {request.highestOffer === null ? (
                    <span className="text-gray-500">No offers yet</span>
                  ) : (
                    `$${request.highestOffer.toLocaleString()}`
                  )}
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <ImageCarousel 
              uploadedImages={images} 
              selectedFileUrls={[]} 
              onImageClick={(url) => setSelectedImage(url)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-lg mb-2">Details</h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                    <div className="text-gray-500">Year:</div>
                    <div className="font-medium">{request.year}</div>
                    <div className="text-gray-500">Make:</div>
                    <div className="font-medium">{request.make}</div>
                    <div className="text-gray-500">Model:</div>
                    <div className="font-medium">{request.model}</div>
                    <div className="text-gray-500">Trim:</div>
                    <div className="font-medium">{request.trim}</div>
                    <div className="text-gray-500">VIN:</div>
                    <div className="font-medium break-all">{request.vin}</div>
                    <div className="text-gray-500">Mileage:</div>
                    <div className="font-medium">{request.mileage.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-lg mb-2">Technical Specs</h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                    <div className="text-gray-500">Engine:</div>
                    <div className="font-medium">{request.engineCylinders}</div>
                    <div className="text-gray-500">Transmission:</div>
                    <div className="font-medium">{request.transmission}</div>
                    <div className="text-gray-500">Drivetrain:</div>
                    <div className="font-medium">{request.drivetrain}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-lg mb-2">Appearance</h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                    <div className="text-gray-500">Exterior Color:</div>
                    <div className="font-medium">{request.exteriorColor}</div>
                    <div className="text-gray-500">Interior Color:</div>
                    <div className="font-medium">{request.interiorColor}</div>
                    <div className="text-gray-500">Accessories:</div>
                    <div className="font-medium">{request.accessories}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-lg mb-2">Condition</h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                    <div className="text-gray-500">Windshield:</div>
                    <div className="font-medium">{getConditionDisplay(request.windshield, 'windshield')}</div>
                    <div className="text-gray-500">Engine Lights:</div>
                    <div className="font-medium">{getConditionDisplay(request.engineLights, 'engineLights')}</div>
                    <div className="text-gray-500">Brakes:</div>
                    <div className="font-medium">{getConditionDisplay(request.brakes, 'brakesTires')}</div>
                    <div className="text-gray-500">Tires:</div>
                    <div className="font-medium">{getConditionDisplay(request.tire, 'brakesTires')}</div>
                    <div className="text-gray-500">Maintenance:</div>
                    <div className="font-medium">{getConditionDisplay(request.maintenance, 'maintenance')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold text-lg mb-2">Reconditioning</h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="text-gray-500 mb-1">Estimate:</div>
                    <div className="font-medium text-lg">${request.reconEstimate || '0'}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500 mb-1">Details:</div>
                    <div className="font-medium whitespace-pre-wrap bg-gray-50 p-3 rounded-md max-h-[300px] overflow-y-auto">
                      {request.reconDetails || 'No details provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImagePreviewDialog
        previewImage={selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      />
    </>
  );
};

export default BidRequestDialog;
