
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
}

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="!w-[95vw] sm:!w-[90vw] md:!w-[85vw] lg:!w-[80vw] xl:!w-[75vw] !max-w-[1400px]">
          <RequestHeader request={request} />
          
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <ImageCarousel 
              uploadedImages={images} 
              selectedFileUrls={[]} 
              onImageClick={(url) => setSelectedImage(url)}
            />
          </div>

          <BidRequestTabs request={request} />
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
