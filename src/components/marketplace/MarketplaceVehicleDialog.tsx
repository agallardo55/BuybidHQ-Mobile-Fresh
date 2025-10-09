import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ImageCarousel from "../bid-request/components/ImageCarousel";
import ImagePreviewDialog from "../bid-request/components/ImagePreviewDialog";
import MarketplaceVehicleHeader from "./MarketplaceVehicleHeader";
import MarketplaceVehicleTabs from "./MarketplaceVehicleTabs";
import { BidRequest } from "../bid-request/types";

interface MarketplaceVehicleDialogProps {
  vehicleId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MarketplaceVehicleDialog = ({ vehicleId, isOpen, onOpenChange }: MarketplaceVehicleDialogProps) => {
  const [request, setRequest] = useState<BidRequest | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!vehicleId) return;
      
      setLoading(true);
      try {
        // Fetch bid request by vehicle ID
        const { data: bidRequestData, error: bidRequestError } = await supabase
          .from('bid_requests')
          .select(`
            *,
            vehicle:vehicles(*),
            recon:reconditioning(*)
          `)
          .eq('vehicle_id', vehicleId)
          .single();

        if (bidRequestError) {
          console.error('Error fetching bid request:', bidRequestError);
          return;
        }

        setRequest(bidRequestData as unknown as BidRequest);

        // Fetch images
        const { data: imagesData, error: imagesError } = await supabase
          .from('images')
          .select('image_url')
          .eq('bid_request_id', bidRequestData.id);

        if (imagesError) {
          console.error('Error fetching images:', imagesError);
          return;
        }

        const urls = imagesData.map(img => img.image_url).filter((url): url is string => url !== null);
        setImages(urls);
      } catch (error) {
        console.error('Error in fetchVehicleData:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && vehicleId) {
      fetchVehicleData();
    }
  }, [vehicleId, isOpen]);

  if (!request && !loading) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="!w-[95vw] sm:!w-[90vw] md:!w-[85vw] lg:!w-[80vw] xl:!w-[75vw] !max-w-[1400px] !max-h-[90vh] overflow-y-auto pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading vehicle details...</div>
            </div>
          ) : request ? (
            <>
              <MarketplaceVehicleHeader request={request} />
              
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <ImageCarousel 
                  uploadedImages={images} 
                  selectedFileUrls={[]} 
                  onImageClick={(url) => setSelectedImage(url)}
                />
              </div>

              <div className="pb-4">
                <MarketplaceVehicleTabs request={request} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <ImagePreviewDialog
        previewImage={selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      />
    </>
  );
};

export default MarketplaceVehicleDialog;
