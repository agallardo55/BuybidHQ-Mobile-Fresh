
import { useState, useEffect } from "react";
import { VehicleDetails } from "@/components/bid-response/types";
import { supabase } from "@/integrations/supabase/client";

interface BidResponseDetails {
  isLoading: boolean;
  error: string | null;
  vehicleDetails: VehicleDetails | null;
  creatorInfo: { phoneNumber: string; fullName: string } | null;
}

export const useBidResponseDetails = (requestId: string | null): BidResponseDetails => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetails | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<{ phoneNumber: string; fullName: string } | null>(null);

  useEffect(() => {
    const fetchBidRequestDetails = async () => {
      if (!requestId) {
        setError('This bid request has expired.');
        return;
      }

      try {
        // Fetch bid request details
        const { data: requestData, error: requestError } = await supabase.rpc('get_bid_request_details', {
          p_request_id: requestId
        });

        if (requestError) throw requestError;

        if (!requestData?.[0]) {
          setError('This bid request has expired.');
          return;
        }

        // Fetch images for the bid request, ordered by sequence and creation date
        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .select('image_url')
          .eq('bid_request_id', requestId)
          .order('sequence_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (imageError) {
          console.error('Error fetching images:', imageError);
        }

        const detail = requestData[0];
        setVehicleDetails({
          year: detail.year,
          make: detail.make,
          model: detail.model,
          trim: detail.trim_level,
          mileage: parseFloat(detail.mileage) || 0,
          exteriorColor: detail.exterior_color,
          interiorColor: detail.interior_color,
          vin: detail.vin,
          windshield: detail.windshield,
          engineLights: detail.engine_lights,
          brakes: detail.brakes,
          tire: detail.tire,
          maintenance: detail.maintenance,
          reconEstimate: detail.recon_estimate || '0',
          reconDetails: detail.recon_details || '',
          accessories: detail.accessories,
          transmission: detail.transmission,
          engineCylinders: detail.engine_cylinders,
          drivetrain: detail.drivetrain,
          userFullName: detail.user_full_name,
          dealership: detail.dealership,
          mobileNumber: detail.mobile_number,
          images: imageData?.map(img => img.image_url) || []
        });

        setCreatorInfo({
          phoneNumber: detail.mobile_number,
          fullName: detail.user_full_name
        });
      } catch (err) {
        console.error('Error fetching bid request:', err);
        setError('Failed to load bid request details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBidRequestDetails();
  }, [requestId]);

  return { isLoading, error, vehicleDetails, creatorInfo };
};
