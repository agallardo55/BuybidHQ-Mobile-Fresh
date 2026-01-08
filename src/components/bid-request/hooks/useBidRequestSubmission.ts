
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FormState } from "../types";
import { toast } from "@/utils/notificationToast";
import { extractNumericValue } from "@/utils/currencyUtils";
import { logger } from '@/utils/logger';

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
      logger.debug(`[${requestId}] Starting bid request submission`);

      // Get sender's name
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (userError) {
        logger.error(`[${requestId}] Error fetching sender details:`, userError);
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
        mileage: extractNumericValue(formData.mileage), // Strip commas before submission
        engine: formData.engineCylinders,
        transmission: formData.transmission,
        drivetrain: formData.drivetrain,
        exterior: formData.exteriorColor,
        interior: formData.interiorColor,
        options: formData.accessories,
        body_style: formData.bodyStyle || null,
        history_report: formData.history || null,
        history_service: formData.historyService || null
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
        history: formData.history || 'unknown',
        history_service: formData.historyService || 'Unknown'
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
        logger.error(`[${requestId}] Error creating bid request:`, bidRequestError);
        toast.error('Failed to create bid request: ' + bidRequestError.message);
        throw bidRequestError;
      }

      logger.debug(`[${requestId}] Bid request created successfully:`, bidRequestData);

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
          logger.error(`[${requestId}] Error getting vehicle ID:`, vehicleError);
        } else {
          const { error: bookValuesError } = await supabase
            .from('book_values')
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
            logger.error(`[${requestId}] Error saving book values:`, bookValuesError);
            // Don't throw - book values are optional, continue with the process
          } else {
            logger.debug(`[${requestId}] Book values saved successfully`);
          }
        }
      }

      // Send notifications via Twilio to selected buyers
      logger.debug(`[${requestId}] 📋 Total buyers selected:`, selectedBuyers.length);
      logger.debug(`[${requestId}] 📋 Buyer IDs:`, selectedBuyers);

      // Track notification results
      const failedBuyers: string[] = [];

      for (let i = 0; i < selectedBuyers.length; i++) {
        const buyerId = selectedBuyers[i];
        logger.debug(`[${requestId}] 🔄 Processing buyer ${i + 1}/${selectedBuyers.length} - ID:`, buyerId);

        // Get buyer details
        const { data: buyerData, error: buyerError } = await supabase
          .from('buyers')
          .select('buyer_name, buyer_mobile')
          .eq('id', buyerId)
          .single();

        if (buyerError) {
          logger.error(`[${requestId}] ❌ Error fetching buyer ${i + 1} details:`, buyerError);
          failedBuyers.push(`Buyer #${i + 1}`);
          continue;
        }

        logger.debug(`[${requestId}] ✅ Buyer ${i + 1} details retrieved:`, {
          name: buyerData.buyer_name,
          mobile: buyerData.buyer_mobile
        });

        // Generate bid submission token
        logger.debug(`[${requestId}] 🔑 Generating token for buyer ${i + 1}:`, buyerData.buyer_name);
        const { data: tokenResponse, error: tokenError } = await supabase
          .rpc('generate_bid_submission_token', {
            p_bid_request_id: bidRequestData,
            p_buyer_id: buyerId
          });

        if (tokenError || !tokenResponse) {
          logger.error(`[${requestId}] ❌ Error generating token for buyer ${i + 1}:`, tokenError);
          failedBuyers.push(buyerData.buyer_name);
          continue;
        }

        logger.debug(`[${requestId}] ✅ Token generated for buyer ${i + 1}:`, tokenResponse);

        // Generate bid submission URL with secure token
        const baseUrl = import.meta.env.VITE_APP_URL;

        if (!baseUrl) {
          logger.error(`[${requestId}] ❌ VITE_APP_URL environment variable not set`);
          failedBuyers.push(buyerData.buyer_name);
          continue;
        }
        const bidRequestUrl = `${baseUrl}/bid-response/${bidRequestData}?token=${encodeURIComponent(tokenResponse)}`;

        logger.debug(`[${requestId}] 🔗 Generated URL for buyer ${i + 1}:`, bidRequestUrl);

        // Send notification via Twilio
        logger.debug(`[${requestId}] 📱 Sending SMS to buyer ${i + 1}:`, {
          name: buyerData.buyer_name,
          phone: buyerData.buyer_mobile
        });

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
          logger.error(`[${requestId}] ❌ Error sending notification to buyer ${i + 1}:`, {
            name: buyerData.buyer_name,
            error: twilioError
          });
          failedBuyers.push(buyerData.buyer_name);
        } else {
          logger.debug(`[${requestId}] ✅ Notification sent successfully to buyer ${i + 1}:`, buyerData.buyer_name);
        }
      }

      logger.debug(`[${requestId}] 🏁 Finished processing all ${selectedBuyers.length} buyers`);

      // Show notification results
      if (failedBuyers.length === 0) {
        // All notifications sent successfully
        toast.success('Notification sent to all buyers');
      } else {
        // Some notifications failed
        failedBuyers.forEach(buyerName => {
          toast.error(`${buyerName} was not sent successfully. Confirm the mobile number is correct.`);
        });
      }

      toast.success('Bid request created successfully');
      navigate('/dashboard');

    } catch (error) {
      logger.error(`[${requestId}] Error in submitBidRequest:`, error);
      toast.error('Failed to create bid request. Please try again.');
      throw error;
    }
  };

  return { submitBidRequest };
};
