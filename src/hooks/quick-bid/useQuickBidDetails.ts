
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

export const useQuickBidDetails = () => {
  const { id } = useParams();

  return useQuery({
    queryKey: ['quickBidDetails', id],
    queryFn: async () => {
      if (!id) throw new Error('No bid request ID provided');

      // Get the quick bid request details
      const { data: requestDetails, error: requestError } = await supabase
        .rpc('get_quick_bid_request_details', {
          p_request_id: id
        });

      if (requestError) {
        console.error('Error fetching quick bid details:', requestError);
        throw requestError;
      }

      if (!requestDetails || requestDetails.length === 0) {
        throw new Error('No bid request found');
      }

      const details = requestDetails[0];
      
      return {
        requestId: details.request_id,
        createdAt: new Date(details.created_at),
        status: details.status,
        notes: details.notes || '',
        vehicle: {
          year: details.year,
          make: details.make,
          model: details.model,
          trim: details.trim_level || 'N/A',
          vin: details.vin,
          mileage: details.mileage,
          engineCylinders: details.engine_cylinders || 'N/A',
          transmission: details.transmission || 'N/A',
          drivetrain: details.drivetrain || 'N/A'
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
