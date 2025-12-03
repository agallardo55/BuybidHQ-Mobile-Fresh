
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FormState } from "../types";
import { toast } from "sonner";
import { extractNumericValue } from "@/utils/currencyUtils";

interface BidRequestSubmissionProps {
  formState: FormState;
  userId: string;
  accountId: string;
}

export const useBidRequestSubmission = () => {
  const navigate = useNavigate();

  const submitBidRequest = async ({ formState, userId, accountId }: BidRequestSubmissionProps) => {
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

      const senderName = userData.full_name || 'BuybidHQ User';

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
        windshield: formData.windshield || 'notSpecified',
        engine_light: formData.engineLights || 'notSpecified',
        brakes: formData.brakes || 'notSpecified',
        tires: formData.tire || 'notSpecified',
        maintenance: formData.maintenance || 'notSpecified',
        recon_estimate: extractNumericValue(formData.reconEstimate),
        recon_details: formData.reconDetails || 'No additional details',
        history: formData.history || 'unknown'
      };

      // Create the bid request
      const { data: bidRequestData, error: bidRequestError } = await supabase.rpc('create_complete_bid_request', {
        vehicle_data: vehicleData,
        recon_data: reconData,
        image_urls: uploadedImageUrls,
        buyer_ids: selectedBuyers,
        creator_id: userId,
        account_id: accountId
      });

      if (bidRequestError) {
        console.error(`[${requestId}] Error creating bid request:`, bidRequestError);
        toast.error('Failed to create bid request: ' + bidRequestError.message);
        throw bidRequestError;
      }

      console.log(`[${requestId}] Bid request created successfully:`, bidRequestData);

      // Save book values if they exist - we need to get the vehicle_id from the created bid request
      const hasBookValues = formData.mmrWholesale || formData.mmrRetail || 
                           formData.kbbWholesale || formData.kbbRetail ||
                           formData.jdPowerWholesale || formData.jdPowerRetail ||
                           formData.auctionWholesale || formData.auctionRetail;

      if (hasBookValues) {
        // Get the vehicle_id from the created bid request
        const { data: bidRequest, error: vehicleError } = await supabase
          .from('bid_requests')
          .select('vehicle_id')
          .eq('id', bidRequestData)
          .single();

        if (vehicleError || !bidRequest) {
          console.error(`[${requestId}] Error getting vehicle ID:`, vehicleError);
        } else {
          const { error: bookValuesError } = await supabase
            .from('bookValues')
            .insert({
              vehicle_id: bidRequest.vehicle_id,
              condition: formData.bookValuesCondition || 'good',
              mmr_wholesale: formData.mmrWholesale ? parseFloat(extractNumericValue(formData.mmrWholesale)) : null,
              mmr_retail: formData.mmrRetail ? parseFloat(extractNumericValue(formData.mmrRetail)) : null,
              kbb_wholesale: formData.kbbWholesale ? parseFloat(extractNumericValue(formData.kbbWholesale)) : null,
              kbb_retail: formData.kbbRetail ? parseFloat(extractNumericValue(formData.kbbRetail)) : null,
              jd_power_wholesale: formData.jdPowerWholesale ? parseFloat(extractNumericValue(formData.jdPowerWholesale)) : null,
              jd_power_retail: formData.jdPowerRetail ? parseFloat(extractNumericValue(formData.jdPowerRetail)) : null,
              auction_wholesale: formData.auctionWholesale ? parseFloat(extractNumericValue(formData.auctionWholesale)) : null,
              auction_retail: formData.auctionRetail ? parseFloat(extractNumericValue(formData.auctionRetail)) : null
            });

          if (bookValuesError) {
            console.error(`[${requestId}] Error saving book values:`, bookValuesError);
            // Don't throw - book values are optional, continue with the process
          } else {
            console.log(`[${requestId}] Book values saved successfully`);
          }

          // Save history service selection if provided
          if (formData.historyService) {
            const { error: historyError } = await supabase
              .from('vehicle_history')
              .insert({
                vehicle_id: bidRequest.vehicle_id,
                history_service: formData.historyService
              });

            if (historyError) {
              console.error(`[${requestId}] Error saving vehicle history service:`, historyError);
              // Don't throw - history service is optional
            } else {
              console.log(`[${requestId}] Vehicle history service saved successfully`);
            }
          }
        }
      }

      // Send notifications via Twilio to selected buyers
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

        // Generate bid submission URL with secure token
        const baseUrl = import.meta.env.VITE_APP_URL;
        
        if (!baseUrl) {
          console.error(`[${requestId}] VITE_APP_URL environment variable not set`);
          toast.error(`Configuration error: Unable to generate bid URL for ${buyerData.buyer_name}`);
          continue;
        }
        const bidRequestUrl = `${baseUrl}/bid-response/${bidRequestData}?token=${encodeURIComponent(tokenResponse)}`;

        // Send notification via Twilio
        const { error: twilioError } = await supabase.functions.invoke('send-twilio-sms', {
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

        if (twilioError) {
          console.error(`[${requestId}] Error sending notification to buyer:`, {
            name: buyerData.buyer_name,
            error: twilioError
          });
          toast.error(`Failed to send notification to ${buyerData.buyer_name}`);
        } else {
          console.log(`[${requestId}] Notification sent successfully to:`, buyerData.buyer_name);
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
