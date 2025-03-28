
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
    selectedBuyer: string
  ) => {
    if (!selectedBuyer) {
      toast.error("Please select a buyer");
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

      // Create bid submission token
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // Expires in 7 days

      const { data: tokenData, error: tokenError } = await supabase
        .from('bid_submission_tokens')
        .insert({
          bid_request_id: bidRequestData.id,
          buyer_id: selectedBuyer,
          token: crypto.randomUUID(),
          expires_at: expiryDate.toISOString(),
          is_used: false,
          notes: notes // Store any notes here
        })
        .select('token')
        .single();

      if (tokenError) {
        throw new Error(`Error creating submission token: ${tokenError.message}`);
      }

      // Get the selected buyer's details for SMS
      const selectedBuyerDetails = mappedBuyers.find(buyer => buyer.id === selectedBuyer);
      
      if (!selectedBuyerDetails) {
        throw new Error("Selected buyer not found");
      }

      // Send SMS notification
      const bidRequestUrl = `${window.location.origin}/quick-bid/${bidRequestData.id}?token=${tokenData.token}`;
      
      await supabase.functions.invoke('send-knock-sms', {
        body: {
          type: 'bid_request',
          phoneNumber: selectedBuyerDetails.mobileNumber,
          senderName: currentUser.full_name || 'A dealer',
          bidRequestUrl,
          vehicleDetails: {
            year: vehicleDetails?.year,
            make: vehicleDetails?.make,
            model: vehicleDetails?.model
          }
        }
      });

      toast.success("Bid request sent successfully to buyer");
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
