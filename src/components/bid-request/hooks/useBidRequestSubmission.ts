
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FormState } from "../types";
import { toast } from "sonner";

interface BidRequestSubmissionProps {
  formState: FormState;
  userId: string;
}

export const useBidRequestSubmission = () => {
  const navigate = useNavigate();

  const submitBidRequest = async ({ formState, userId }: BidRequestSubmissionProps) => {
    const { formData, selectedBuyers, uploadedImageUrls } = formState;

    try {
      console.log('Submitting bid request with data:', { formData, selectedBuyers, uploadedImageUrls });

      // Prepare vehicle data matching database schema
      const vehicleData = {
        year: formData.year,
        make: formData.make,
        model: formData.model,
        trim: formData.trim,
        vin: formData.vin,
        mileage: formData.mileage,
        engine: formData.engineCylinders,
        transmission: formData.transmission,
        drivetrain: formData.drivetrain,
        exterior: formData.exteriorColor,
        interior: formData.interiorColor,
        options: formData.accessories
      };

      // Prepare reconditioning data matching database schema
      const reconData = {
        windshield: formData.windshield || 'None',
        engine_light: formData.engineLights || 'No',
        brakes: formData.brakes || 'Good',
        tires: formData.tire || 'Good',
        maintenance: formData.maintenance || 'Up to date',
        recon_estimate: formData.reconEstimate || '0',
        recon_details: formData.reconDetails || 'No additional details'
      };

      console.log('Calling RPC with formatted data:', {
        vehicle_data: vehicleData,
        recon_data: reconData,
        image_urls: uploadedImageUrls,
        buyer_ids: selectedBuyers,
        creator_id: userId,
        reconEstimate: formData.reconEstimate
      });

      const { data: bidRequestData, error: bidRequestError } = await supabase.rpc('create_complete_bid_request', {
        vehicle_data: vehicleData,
        recon_data: reconData,
        image_urls: uploadedImageUrls,
        buyer_ids: selectedBuyers,
        creator_id: userId
      });

      if (bidRequestError) {
        console.error('Error creating bid request:', bidRequestError);
        toast.error('Failed to create bid request: ' + bidRequestError.message);
        throw bidRequestError;
      }

      console.log('Bid request created successfully:', bidRequestData);

      // Send SMS notifications to selected buyers using Knock
      for (const buyerId of selectedBuyers) {
        // Get buyer details - using correct column names from database
        const { data: buyerData, error: buyerError } = await supabase
          .from('buyers')
          .select('buyer_name, buyer_mobile')
          .eq('id', buyerId)
          .single();

        if (buyerError) {
          console.error('Error fetching buyer details:', buyerError);
          continue;
        }

        // Generate unique bid submission URL
        const bidRequestUrl = `${window.location.origin}/bid-response/${bidRequestData}?token=${encodeURIComponent(buyerId)}`;

        // Send SMS notification via Knock
        const { error: smsError } = await supabase.functions.invoke('send-knock-sms', {
          body: {
            type: 'bid_request',
            phoneNumber: buyerData.buyer_mobile,
            vehicleDetails: {
              year: formData.year,
              make: formData.make,
              model: formData.model
            },
            bidRequestUrl
          }
        });

        if (smsError) {
          console.error('Error sending SMS to buyer:', buyerData.buyer_mobile, smsError);
          toast.error(`Failed to send SMS to ${buyerData.buyer_name}`);
        } else {
          console.log('SMS sent successfully to:', buyerData.buyer_mobile);
        }
      }

      toast.success('Bid request created successfully');
      navigate('/dashboard');

    } catch (error) {
      console.error('Error in submitBidRequest:', error);
      toast.error('Failed to create bid request. Please try again.');
      throw error;
    }
  };

  return { submitBidRequest };
};
