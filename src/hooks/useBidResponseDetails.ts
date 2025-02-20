
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

interface BidResponseDetailsType {
  request_id: string;
  created_at: string;
  status: string;
  year: string;
  make: string;
  model: string;
  trim_level: string;
  vin: string;
  mileage: string;
  user_full_name: string;
  engine_cylinders: string;
  transmission: string;
  drivetrain: string;
  exterior_color: string;
  interior_color: string;
  accessories: string;
  windshield: string;
  engine_lights: string;
  brakes: string;
  tire: string;
  maintenance: string;
  recon_estimate: string;
  recon_details: string;
  dealership: string | null;
  mobile_number: string | null;
  images: string[];
}

export const useBidResponseDetails = () => {
  const { id } = useParams();

  return useQuery({
    queryKey: ['bidResponse', id],
    queryFn: async () => {
      if (!id) throw new Error('No bid response ID provided');

      // First get the bid request details
      const { data: requestDetails, error: requestError } = await supabase
        .rpc('get_bid_request_details', {
          p_request_id: id
        });

      if (requestError) {
        console.error('Error fetching bid response details:', requestError);
        throw requestError;
      }

      if (!requestDetails || requestDetails.length === 0) {
        throw new Error('No bid response found');
      }

      // Then get the images for this bid request
      const { data: imageData, error: imageError } = await supabase
        .from('images')
        .select('image_url')
        .eq('bid_request_id', id);

      if (imageError) {
        console.error('Error fetching images:', imageError);
      }

      const details = requestDetails[0] as BidResponseDetailsType;
      const images = imageData?.map(img => img.image_url) || [];

      return {
        requestId: details.request_id,
        createdAt: new Date(details.created_at),
        status: details.status,
        vehicle: {
          year: parseInt(details.year),
          make: details.make,
          model: details.model,
          trim: details.trim_level,
          vin: details.vin,
          mileage: parseInt(details.mileage),
          engineCylinders: details.engine_cylinders,
          transmission: details.transmission,
          drivetrain: details.drivetrain,
          exteriorColor: details.exterior_color,
          interiorColor: details.interior_color,
          accessories: details.accessories,
          windshield: details.windshield,
          engineLights: details.engine_lights,
          brakes: details.brakes,
          tire: details.tire,
          maintenance: details.maintenance,
          reconEstimate: details.recon_estimate,
          reconDetails: details.recon_details,
          images: images
        },
        buyer: {
          name: details.user_full_name,
          dealership: details.dealership || 'N/A',
          mobileNumber: details.mobile_number || 'N/A'
        }
      };
    },
    enabled: !!id
  });
};
