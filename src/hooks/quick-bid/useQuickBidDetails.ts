
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
        .from('bid_requests')
        .select(`
          id,
          created_at,
          status,
          vehicles (
            id,
            year, 
            make,
            model,
            trim,
            vin,
            mileage,
            engine,
            transmission,
            drivetrain
          ),
          buybidhq_users (
            full_name,
            dealership_id,
            mobile_number
          ),
          bid_submission_tokens (
            notes
          )
        `)
        .eq('id', id)
        .single();

      if (requestError) {
        console.error('Error fetching quick bid details:', requestError);
        throw requestError;
      }

      if (!requestDetails) {
        throw new Error('No bid request found');
      }

      const vehicle = requestDetails.vehicles || {};
      const user = requestDetails.buybidhq_users || {};
      const token = requestDetails.bid_submission_tokens?.[0] || {};
      
      return {
        requestId: requestDetails.id,
        createdAt: new Date(requestDetails.created_at),
        status: requestDetails.status,
        notes: token.notes || '',
        vehicle: {
          year: vehicle.year || 'N/A',
          make: vehicle.make || 'N/A',
          model: vehicle.model || 'N/A',
          trim: vehicle.trim || 'N/A',
          vin: vehicle.vin || 'N/A',
          mileage: vehicle.mileage || 'N/A',
          engineCylinders: vehicle.engine || 'N/A',
          transmission: vehicle.transmission || 'N/A',
          drivetrain: vehicle.drivetrain || 'N/A',
          exteriorColor: 'N/A',
          interiorColor: 'N/A',
          accessories: 'N/A',
          windshield: 'N/A',
          engineLights: 'N/A',
          brakes: 'N/A',
          tire: 'N/A',
          maintenance: 'N/A',
          reconEstimate: '0',
          reconDetails: 'N/A'
        },
        buyer: {
          name: user.full_name || 'N/A',
          dealership: 'N/A',
          mobileNumber: user.mobile_number || 'N/A'
        }
      };
    },
    enabled: !!id
  });
};
