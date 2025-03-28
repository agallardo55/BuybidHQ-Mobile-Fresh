
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

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
  const { id } = useParams();

  return useQuery({
    queryKey: ['quickBidDetails', id],
    queryFn: async (): Promise<QuickBidDetails> => {
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

      // Safely handle possibly undefined values
      const vehicle = requestDetails.vehicles || {};
      const user = requestDetails.buybidhq_users || {};
      const tokenData = Array.isArray(requestDetails.bid_submission_tokens) 
        ? requestDetails.bid_submission_tokens 
        : [];
      
      // Use the first token's notes or empty string
      const notes = tokenData.length > 0 && tokenData[0] && 'notes' in tokenData[0] 
        ? String(tokenData[0].notes || '') 
        : '';
      
      return {
        requestId: requestDetails.id,
        createdAt: new Date(requestDetails.created_at),
        status: requestDetails.status,
        notes: notes,
        vehicle: {
          year: typeof vehicle === 'object' && vehicle && 'year' in vehicle ? String(vehicle.year || 'N/A') : 'N/A',
          make: typeof vehicle === 'object' && vehicle && 'make' in vehicle ? String(vehicle.make || 'N/A') : 'N/A',
          model: typeof vehicle === 'object' && vehicle && 'model' in vehicle ? String(vehicle.model || 'N/A') : 'N/A',
          trim: typeof vehicle === 'object' && vehicle && 'trim' in vehicle ? String(vehicle.trim || 'N/A') : 'N/A',
          vin: typeof vehicle === 'object' && vehicle && 'vin' in vehicle ? String(vehicle.vin || 'N/A') : 'N/A',
          mileage: typeof vehicle === 'object' && vehicle && 'mileage' in vehicle ? String(vehicle.mileage || 'N/A') : 'N/A',
          engineCylinders: typeof vehicle === 'object' && vehicle && 'engine' in vehicle ? String(vehicle.engine || 'N/A') : 'N/A',
          transmission: typeof vehicle === 'object' && vehicle && 'transmission' in vehicle ? String(vehicle.transmission || 'N/A') : 'N/A',
          drivetrain: typeof vehicle === 'object' && vehicle && 'drivetrain' in vehicle ? String(vehicle.drivetrain || 'N/A') : 'N/A',
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
          name: typeof user === 'object' && user && 'full_name' in user ? String(user.full_name || 'N/A') : 'N/A',
          dealership: 'N/A',
          mobileNumber: typeof user === 'object' && user && 'mobile_number' in user ? String(user.mobile_number || 'N/A') : 'N/A'
        }
      };
    },
    enabled: !!id
  });
};
