
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BidResponseFormData } from "@/components/bid-response/types";
import VehicleDetailsSection from "@/components/bid-response/VehicleDetailsSection";
import BidForm from "@/components/bid-response/BidForm";
import BidResponseLayout from "@/components/bid-response/BidResponseLayout";
import { ErrorState, LoadingState, SubmittedState } from "@/components/bid-response/BidResponseStates";
import BidResponseMarketing from "@/components/bid-response/BidResponseMarketing";
import { useBidResponseDetails } from "@/hooks/useBidResponseDetails";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BidResponse = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requestId = searchParams.get('request');
  const buyerId = searchParams.get('buyer');
  
  const { isLoading, error, vehicleDetails, creatorInfo } = useBidResponseDetails(requestId);

  const handleSubmit = async (formData: BidResponseFormData) => {
    if (!requestId || !buyerId) {
      toast.error("Invalid request or buyer ID");
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert bid response
      const { error: insertError } = await supabase
        .from('bid_responses')
        .insert({
          bid_request_id: requestId,
          buyer_id: buyerId,
          offer_amount: parseFloat(formData.offerAmount),
          status: 'pending'
        });

      if (insertError) throw insertError;

      // Send SMS notification to creator if we have their contact info
      if (creatorInfo?.phoneNumber && vehicleDetails) {
        const { error: smsError } = await supabase.functions.invoke('send-bid-sms', {
          body: {
            type: 'bid_response',
            phoneNumber: creatorInfo.phoneNumber,
            vehicleDetails: {
              year: vehicleDetails.year,
              make: vehicleDetails.make,
              model: vehicleDetails.model
            },
            offerAmount: formData.offerAmount,
            buyerName: vehicleDetails.dealership || 'Unknown Buyer'
          }
        });

        if (smsError) {
          console.error('Error sending SMS notification:', smsError);
        }
      }

      toast.success("Your bid has been submitted successfully!");
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error("Failed to submit bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BidResponseLayout>
      {error ? (
        <ErrorState message={error} />
      ) : isLoading ? (
        <LoadingState />
      ) : submitted ? (
        <SubmittedState message="The offer for this bid request has been submitted" />
      ) : vehicleDetails ? (
        <div className="max-w-2xl mx-auto p-4 space-y-6 flex-grow">
          <VehicleDetailsSection vehicle={vehicleDetails} />
          <BidForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          <BidResponseMarketing />
        </div>
      ) : null}
    </BidResponseLayout>
  );
};

export default BidResponse;

