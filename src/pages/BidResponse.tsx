
import { useState, useEffect } from "react";
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
  const [existingBidAmount, setExistingBidAmount] = useState<string | null>(null);

  const token = searchParams.get('token');
  const requestId = searchParams.get('request');
  
  const { data, isLoading, error } = useBidResponseDetails();

  const handleSubmit = async (formData: BidResponseFormData) => {
    if (!token) {
      toast.error("Invalid submission token");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: submitError } = await supabase.functions.invoke('submit-public-bid', {
        body: {
          token,
          offerAmount: parseFloat(formData.offerAmount)
        }
      });

      if (submitError) throw submitError;

      toast.success("Your bid has been submitted successfully!");
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error("Failed to submit bid. Please try again or contact support if the issue persists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for existing bid when component mounts
  useEffect(() => {
    const checkExistingBid = async () => {
      if (!token) return;

      try {
        const { data, error } = await supabase.rpc('validate_bid_submission_token', {
          p_token: token
        });

        if (error) throw error;
        
        // Get the first result from the array
        const tokenInfo = data?.[0];
        if (tokenInfo?.has_existing_bid) {
          setExistingBidAmount(tokenInfo.existing_bid_amount.toString());
          setSubmitted(true);
        }
      } catch (error) {
        console.error('Error checking existing bid:', error);
      }
    };

    checkExistingBid();
  }, [token]);

  // Show error if no token is provided
  if (!token) {
    return (
      <BidResponseLayout>
        <ErrorState message="Invalid bid submission link. Please check your email and try again." />
      </BidResponseLayout>
    );
  }

  return (
    <BidResponseLayout>
      {error ? (
        <ErrorState message={error.message} />
      ) : isLoading ? (
        <LoadingState />
      ) : submitted ? (
        <SubmittedState 
          message={existingBidAmount 
            ? `You have already submitted an offer of $${existingBidAmount}` 
            : "Thank you! Your offer has been submitted successfully."
          } 
        />
      ) : data ? (
        <div className="max-w-2xl mx-auto p-4 space-y-6 flex-grow">
          <VehicleDetailsSection vehicle={data.vehicle} />
          <BidForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            existingBidAmount={existingBidAmount}
          />
          <BidResponseMarketing />
        </div>
      ) : null}
    </BidResponseLayout>
  );
};

export default BidResponse;
