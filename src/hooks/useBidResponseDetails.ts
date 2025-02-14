
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
        const { data, error } = await supabase.rpc('get_bid_request_details', {
          p_request_id: requestId
        });

        if (error) throw error;

        if (data && data[0]) {
          setVehicleDetails({
            year: data[0].year,
            make: data[0].make,
            model: data[0].model,
            trim: data[0].trim_level,
            mileage: data[0].mileage,
            exteriorColor: data[0].exterior_color,
            interiorColor: data[0].interior_color,
            vin: data[0].vin,
            windshield: data[0].windshield,
            engineLights: data[0].engine_lights,
            brakes: data[0].brakes,
            tire: data[0].tire,
            maintenance: data[0].maintenance,
            reconEstimate: data[0].recon_estimate,
            reconDetails: data[0].recon_details,
            accessories: data[0].accessories,
            transmission: data[0].transmission,
            engineCylinders: data[0].engine_cylinders,
            drivetrain: data[0].drivetrain,
            userFullName: data[0].user_full_name,
            dealership: data[0].dealership,
            mobileNumber: data[0].mobile_number
          });

          setCreatorInfo({
            phoneNumber: data[0].mobile_number,
            fullName: data[0].user_full_name
          });
        } else {
          setError('This bid request has expired.');
        }
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
