
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bid Request Details</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <ImageCarousel 
              uploadedImages={images} 
              selectedFileUrls={[]} 
              onImageClick={(url) => setSelectedImage(url)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Vehicle Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Year:</div>
                <div>{request.year}</div>
                <div className="text-gray-500">Make:</div>
                <div>{request.make}</div>
                <div className="text-gray-500">Model:</div>
                <div>{request.model}</div>
                <div className="text-gray-500">Trim:</div>
                <div>{request.trim}</div>
                <div className="text-gray-500">VIN:</div>
                <div className="break-all">{request.vin}</div>
                <div className="text-gray-500">Mileage:</div>
                <div>{request.mileage.toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Request Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Date:</div>
                <div>{formatDate(request.createdAt)}</div>
                <div className="text-gray-500">Buyer:</div>
                <div>{request.buyer}</div>
                <div className="text-gray-500">Dealership:</div>
                <div>{request.dealership}</div>
                <div className="text-gray-500">Highest Offer:</div>
                <div>${request.highestOffer.toLocaleString()}</div>
                <div className="text-gray-500">Status:</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                    ${request.status === 'Pending' ? 'bg-blue-100 text-blue-800' : ''}
                    ${request.status === 'Declined' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {request.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImagePreviewDialog
        isOpen={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />
    </>
  );
};

export default BidRequestDialog;
