
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BidRequest } from "./types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ImageCarousel from "./components/ImageCarousel";
import ImagePreviewDialog from "./components/ImagePreviewDialog";
import RequestHeader from "./components/RequestHeader";
import BidRequestTabs from "./components/BidRequestTabs";

interface BidRequestDialogProps {
  request: BidRequest | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: (responseId: string, status: "pending" | "accepted" | "declined") => Promise<void>;
  onBidRequestStatusUpdate?: (requestId: string, status: "pending" | "accepted" | "declined") => void;
}

const BidRequestDialog = ({ request, isOpen, onOpenChange, onStatusUpdate, onBidRequestStatusUpdate }: BidRequestDialogProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!request?.id) return;

      try {
        console.log('🖼️ Fetching images for bid request:', request.id);
        const { data, error } = await supabase
          .from('images')
          .select('image_url')
          .eq('bid_request_id', request.id);

        if (error) {
          console.error('❌ Error fetching images:', error);
          return;
        }

        console.log('📸 Fetched image data:', data);
        const urls = data.map(img => img.image_url).filter((url): url is string => url !== null);
        console.log('🔗 Processed image URLs:', urls);
        setImages(urls);
      } catch (error) {
        console.error('❌ Error in fetchImages:', error);
      }
    };

    if (isOpen) {
      fetchImages();
    }
  }, [request, isOpen]);

  if (!request) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="!w-[95vw] sm:!w-[90vw] md:!w-[85vw] lg:!w-[80vw] xl:!w-[75vw] !max-w-[1400px] !max-h-[90vh] overflow-y-auto pb-6">
          <RequestHeader request={request} />
          
          <div className="mt-3 bg-gray-50 rounded-lg p-3">
            <ImageCarousel 
              uploadedImages={images} 
              selectedFileUrls={[]} 
              onImageClick={(url) => setSelectedImage(url)}
            />
          </div>

          <div className="pb-4">
            <BidRequestTabs 
              request={request} 
              onStatusUpdate={onStatusUpdate}
              onBidRequestStatusUpdate={onBidRequestStatusUpdate}
            />
          </div>
          
          {/* Footer for visual breathing room */}
          <div className="border-t pt-4 mt-6">
            <div className="text-center text-sm text-gray-500">
              Need help? Contact support for assistance with bid requests.
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
