
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
    const { selectedBuyers, uploadedImageUrls, formData } = formState;
    const requestId = crypto.randomUUID();

    try {
      console.log(`[${requestId}] Starting bid request submission`);

      // Get sender's name
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error(`[${requestId}] Error fetching sender details:`, userError);
        throw userError;
      }

      const senderName = userData.full_name || 'BuyBidHQ User';

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

      // Create the bid request
      const { data: bidRequestData, error: bidRequestError } = await supabase.rpc('create_complete_bid_request', {
        vehicle_data: vehicleData,
        recon_data: reconData,
        image_urls: uploadedImageUrls,
        buyer_ids: selectedBuyers,
        creator_id: userId
      });

      if (bidRequestError) {
        console.error(`[${requestId}] Error creating bid request:`, bidRequestError);
        toast.error('Failed to create bid request: ' + bidRequestError.message);
        throw bidRequestError;
      }

      console.log(`[${requestId}] Bid request created successfully:`, bidRequestData);

      // Send SMS notifications to selected buyers using Knock
      for (const buyerId of selectedBuyers) {
        console.log(`[${requestId}] Processing buyer ID:`, buyerId);
        
        // Get buyer details
        const { data: buyerData, error: buyerError } = await supabase
          .from('buyers')
          .select('buyer_name, buyer_mobile')
          .eq('id', buyerId)
          .single();

        if (buyerError) {
          console.error(`[${requestId}] Error fetching buyer details:`, buyerError);
          continue;
        }

        // Generate bid submission token
        const { data: tokenResponse, error: tokenError } = await supabase
          .rpc('generate_bid_submission_token', {
            p_bid_request_id: bidRequestData,
            p_buyer_id: buyerId
          });

        if (tokenError || !tokenResponse) {
          console.error(`[${requestId}] Error generating token:`, tokenError);
          toast.error(`Failed to generate secure link for ${buyerData.buyer_name}`);
          continue;
        }

        // Extract token from response (the function returns the token string directly)
        const token = tokenResponse;

        // Generate bid submission URL with secure token
        const bidRequestUrl = `${window.location.origin}/bid-response/${bidRequestData}?token=${encodeURIComponent(token)}`;

        console.log(`[${requestId}] Sending SMS notification to buyer:`, {
          buyerId,
          name: buyerData.buyer_name,
          phone: buyerData.buyer_mobile.slice(-4).padStart(buyerData.buyer_mobile.length, '*'),
          token: token.substring(0, 8) + '...'
        });

        // Send SMS notification via Knock
        const { error: smsError } = await supabase.functions.invoke('send-knock-sms', {
          body: {
            type: 'bid_request',
            phoneNumber: buyerData.buyer_mobile,
            senderName: senderName,
            bidRequestUrl,
            vehicleDetails: {
              year: formData.year,
              make: formData.make,
              model: formData.model
            }
          }
        });

        if (smsError) {
          console.error(`[${requestId}] Error sending SMS to buyer:`, {
            phone: buyerData.buyer_mobile.slice(-4).padStart(buyerData.buyer_mobile.length, '*'),
            error: smsError
          });
          toast.error(`Failed to send SMS to ${buyerData.buyer_name}`);
        } else {
          console.log(`[${requestId}] SMS sent successfully to:`, buyerData.buyer_mobile.slice(-4).padStart(buyerData.buyer_mobile.length, '*'));
        }
      }

      toast.success('Bid request created successfully');
      navigate('/dashboard');

    } catch (error) {
      console.error(`[${requestId}] Error in submitBidRequest:`, error);
      toast.error('Failed to create bid request. Please try again.');
      throw error;
    }
  };

  return { submitBidRequest };
};
