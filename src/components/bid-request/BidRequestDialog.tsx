
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

const BidRequestDialog = ({ request, isOpen, onOpenChange }: BidRequestDialogProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!request) return;

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
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] max-w-[1400px] p-6">
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
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="font-medium">{formatDate(request.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Buyer:</span>
                <p className="font-medium">{request.buyer}</p>
              </div>
              <div>
                <span className="text-gray-500">Dealership:</span>
                <p className="font-medium">{request.dealership}</p>
              </div>
              <div>
                <span className="text-gray-500">Highest Offer:</span>
                <p className="font-medium">${request.highestOffer.toLocaleString()}</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <ImageCarousel 
              uploadedImages={images} 
              selectedFileUrls={[]} 
              onImageClick={(url) => setSelectedImage(url)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mt-6">
            {/* Core Vehicle Information */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4">Core Details</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
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

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4">Technical Specs</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
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

            {/* Vehicle Condition & Colors */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4">Appearance</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Exterior Color:</div>
                    <div className="font-medium">{request.exteriorColor}</div>
                    <div className="text-gray-500">Interior Color:</div>
                    <div className="font-medium">{request.interiorColor}</div>
                    <div className="text-gray-500">Accessories:</div>
                    <div className="font-medium">{request.accessories}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4">Condition</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Windshield:</div>
                    <div className="font-medium">{request.windshield}</div>
                    <div className="text-gray-500">Engine Lights:</div>
                    <div className="font-medium">{request.engineLights}</div>
                    <div className="text-gray-500">Brakes:</div>
                    <div className="font-medium">{request.brakes}</div>
                    <div className="text-gray-500">Tires:</div>
                    <div className="font-medium">{request.tire}</div>
                    <div className="text-gray-500">Maintenance:</div>
                    <div className="font-medium">{request.maintenance}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reconditioning Information */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-4">Reconditioning</h3>
                <div className="space-y-4">
                  <div className="text-sm">
                    <div className="text-gray-500 mb-1">Estimate:</div>
                    <div className="font-medium text-lg">${request.reconEstimate}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500 mb-1">Details:</div>
                    <div className="font-medium whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                      {request.reconDetails}
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
