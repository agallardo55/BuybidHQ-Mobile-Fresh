
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

  const token = searchParams.get('token');
  const requestId = searchParams.get('request');
  
  const { isLoading, error, vehicleDetails } = useBidResponseDetails(requestId);

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
        <ErrorState message={error} />
      ) : isLoading ? (
        <LoadingState />
      ) : submitted ? (
        <SubmittedState message="Thank you! Your offer has been submitted successfully." />
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
