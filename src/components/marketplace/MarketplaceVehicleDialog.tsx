import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ImageCarousel from "../bid-request/components/ImageCarousel";
import ImagePreviewDialog from "../bid-request/components/ImagePreviewDialog";
import MarketplaceVehicleHeader from "./MarketplaceVehicleHeader";
import MarketplaceVehicleTabs from "./MarketplaceVehicleTabs";
import { BidRequest } from "../bid-request/types";
import { useVehicleImages } from "@/hooks/marketplace/useVehicleImages";

interface MarketplaceVehicleDialogProps {
  request?: BidRequest | null;
  vehicleId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MarketplaceVehicleDialog = ({ 
  request: propsRequest, 
  vehicleId, 
  isOpen, 
  onOpenChange 
}: MarketplaceVehicleDialogProps) => {
  const [request, setRequest] = useState<BidRequest | null>(propsRequest || null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use React Query for image caching
  const { data: images = [], isLoading: imagesLoading } = useVehicleImages(
    request?.id || vehicleId,
    isOpen && !!(request?.id || vehicleId)
  );

  useEffect(() => {
    // If request is passed from parent, use it immediately
    if (propsRequest) {
      setRequest(propsRequest);
      setLoading(false);
      return;
    }
    
    // Otherwise fetch it (fallback for backward compatibility)
    const fetchVehicleData = async () => {
      if (!vehicleId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Parallel fetching using Promise.all
        const [bidRequestData] = await Promise.all([
          supabase
            .from('bid_requests')
            .select(`
              *,
              vehicle:vehicles(*),
              recon:reconditioning(*)
            `)
            .eq('id', vehicleId)
            .single()
        ]);

        if (bidRequestData.error) {
          console.error('Error fetching bid request:', bidRequestData.error);
          setError('Failed to load vehicle details. Please try again.');
          return;
        }

        setRequest(bidRequestData.data as unknown as BidRequest);
      } catch (error) {
        console.error('Error in fetchVehicleData:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && vehicleId && !propsRequest) {
      fetchVehicleData();
    }
  }, [vehicleId, isOpen, propsRequest]);

  const isLoadingData = loading || imagesLoading;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="!w-[95vw] sm:!w-[90vw] md:!w-[85vw] lg:!w-[80vw] xl:!w-[75vw] !max-w-[1400px] !max-h-[90vh] overflow-y-auto pb-6">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading vehicle details...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-destructive">{error}</div>
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
