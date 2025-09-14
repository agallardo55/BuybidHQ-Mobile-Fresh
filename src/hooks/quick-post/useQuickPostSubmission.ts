
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MappedBuyer } from "@/hooks/buyers/types";
import { UserData } from "@/hooks/useCurrentUser";

export function useQuickPostSubmission(
  onClose: () => void,
  currentUser: UserData | null,
  mappedBuyers: MappedBuyer[]
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBidRequest = async (
    vehicleDetails: any,
    vin: string,
    mileage: string,
    notes: string,
    selectedBuyers: string[]
  ) => {
    if (!selectedBuyers || selectedBuyers.length === 0) {
      toast.error("Please select at least one buyer");
      return;
    }

    if (!currentUser?.id) {
      toast.error("You must be logged in to submit a bid request");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert vehicle record
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          year: vehicleDetails?.year,
          make: vehicleDetails?.make,
          model: vehicleDetails?.model,
          trim: vehicleDetails?.trim,
          vin: vin,
          mileage: mileage.replace(/,/g, ''),
          engine: vehicleDetails?.engineCylinders,
          transmission: vehicleDetails?.transmission,
          drivetrain: vehicleDetails?.drivetrain
        })
        .select('id')
        .single();

      if (vehicleError) {
        throw new Error(`Error creating vehicle: ${vehicleError.message}`);
      }

      // Create bid request - Use "Pending" instead of "pending" to match the expected type
      const { data: bidRequestData, error: bidRequestError } = await supabase
        .from('bid_requests')
        .insert({
          user_id: currentUser.id,
          vehicle_id: vehicleData.id,
          status: 'Pending'
        })
        .select('id')
        .single();

      if (bidRequestError) {
        throw new Error(`Error creating bid request: ${bidRequestError.message}`);
      }

      // Create bid submission tokens for each selected buyer
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // Expires in 7 days

      const smsPromises = [];

      for (const buyerId of selectedBuyers) {
        // Create submission token for this buyer
        const { data: tokenData, error: tokenError } = await supabase
          .from('bid_submission_tokens')
          .insert({
            bid_request_id: bidRequestData.id,
            buyer_id: buyerId,
            token: crypto.randomUUID(),
            expires_at: expiryDate.toISOString(),
            is_used: false
          })
          .select('token')
          .single();

        if (tokenError) {
          throw new Error(`Error creating submission token for buyer ${buyerId}: ${tokenError.message}`);
        }

        // Get buyer details for SMS
        const buyerDetails = mappedBuyers.find(buyer => buyer.id === buyerId);
        
        if (!buyerDetails) {
          console.warn(`Buyer with ID ${buyerId} not found, skipping SMS`);
          continue;
        }

        // Prepare SMS notification
        const bidRequestUrl = `${window.location.origin}/quick-bid/${bidRequestData.id}?token=${tokenData.token}`;
        
        smsPromises.push(
          supabase.functions.invoke('send-twilio-sms', {
            body: {
              type: 'bid_request',
              phoneNumber: buyerDetails.mobileNumber,
              senderName: currentUser.full_name || 'A dealer',
              bidRequestUrl,
              vehicleDetails: {
                year: vehicleDetails?.year,
                make: vehicleDetails?.make,
                model: vehicleDetails?.model
              }
            }
          })
        );
      }

      // Send all SMS notifications in parallel
      await Promise.all(smsPromises);

      toast.success(`Bid request sent successfully to ${selectedBuyers.length} buyer${selectedBuyers.length === 1 ? '' : 's'}`);
      onClose();
      
    } catch (error: any) {
      console.error('Error submitting quick bid request:', error);
      toast.error(error.message || "Failed to submit bid request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    handleCreateBidRequest
  };
}
