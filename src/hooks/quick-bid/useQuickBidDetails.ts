
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

// Define an interface for the return type
interface QuickBidDetails {
  requestId: string;
  createdAt: Date;
  status: string;
  notes: string;
  vehicle: {
    year: string;
    make: string;
    model: string;
    trim: string;
    vin: string;
    mileage: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
    exteriorColor: string;
    interiorColor: string;
    accessories: string;
    windshield: string;
    engineLights: string;
    brakes: string;
    tire: string;
    maintenance: string;
    reconEstimate: string;
    reconDetails: string;
  };
  buyer: {
    name: string;
    dealership: string;
    mobileNumber: string;
  };
}

export const useQuickBidDetails = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return useQuery({
    queryKey: ['quickBidDetails', token],
    queryFn: async (): Promise<QuickBidDetails> => {
      if (!token) throw new Error('No bid token provided');

      // Use the new secure RPC to get bid request details
      const { data: requestDetails, error: requestError } = await supabase
        .rpc('get_public_bid_request_details', { p_token: token });

      if (requestError) {
        console.error('Error fetching quick bid details:', requestError);
        throw requestError;
      }

      if (!requestDetails || requestDetails.length === 0) {
        throw new Error('Invalid or expired bid token');
      }

      const detail = requestDetails[0];
      
      return {
        requestId: detail.request_id,
        createdAt: new Date(detail.created_at),
        status: detail.status,
        notes: detail.notes || '',
        vehicle: {
          year: detail.vehicle_year,
          make: detail.vehicle_make,
          model: detail.vehicle_model,
          trim: detail.vehicle_trim,
          vin: detail.vehicle_vin,
          mileage: detail.vehicle_mileage,
          engineCylinders: detail.vehicle_engine,
          transmission: detail.vehicle_transmission,
          drivetrain: detail.vehicle_drivetrain,
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
          name: detail.buyer_name,
          dealership: detail.buyer_dealership,
          mobileNumber: detail.buyer_mobile
        }
      };
    },
    enabled: !!token
  });
};
