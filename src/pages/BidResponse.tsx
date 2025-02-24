
import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import VehicleDetailsSection from "@/components/bid-response/VehicleDetailsSection";
import BidForm from "@/components/bid-response/BidForm";
import BidResponseLayout from "@/components/bid-response/BidResponseLayout";
import { ErrorState, LoadingState, SubmittedState } from "@/components/bid-response/BidResponseStates";
import BidResponseMarketing from "@/components/bid-response/BidResponseMarketing";
import { useBidResponseDetails } from "@/hooks/useBidResponseDetails";
import { supabase } from "@/integrations/supabase/client";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { AlertDialogCustom } from "@/components/bid-response/AlertDialogCustom";
import { useBidSubmission } from "@/hooks/useBidSubmission";

const BidResponse = () => {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [existingBidAmount, setExistingBidAmount] = useState<string | null>(null);

  const token = searchParams.get('token');
  const { id } = useParams();
  
  const { data, isLoading, error } = useBidResponseDetails();
  const { alert, showAlert, setAlert } = useAlertDialog();
  const { isSubmitting, handleSubmit } = useBidSubmission({
    token,
    showAlert,
    setSubmitted
  });

  // Check for existing bid when component mounts
  useEffect(() => {
    const checkExistingBid = async () => {
      if (!token) return;

      try {
        const { data, error } = await supabase.rpc('validate_bid_submission_token', {
          p_token: token
        });

        if (error) throw error;
        
        const tokenInfo = data?.[0];
        if (tokenInfo?.has_existing_bid) {
          setExistingBidAmount(tokenInfo.existing_bid_amount.toString());
          setSubmitted(true);
          showAlert(
            "Existing Bid",
            `You have already submitted an offer of $${tokenInfo.existing_bid_amount}`,
            "info"
          );
        }
      } catch (error) {
        console.error('Error checking existing bid:', error);
      }
    };

    // Only check for existing bid if token is provided
    if (token) {
      checkExistingBid();
    }
  }, [token, showAlert]);

  // Show error if no id is provided
  if (!id) {
    return (
      <BidResponseLayout>
        <ErrorState message="Invalid bid submission link. Please check your email and try again." />
      </BidResponseLayout>
    );
  }

  return (
    <BidResponseLayout>
      <AlertDialogCustom
        open={alert.open}
        onOpenChange={(open) => setAlert(prev => ({ ...prev, open }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

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
          <VehicleDetailsSection 
            vehicle={{
              ...data.vehicle,
              year: String(data.vehicle.year),
              mileage: String(data.vehicle.mileage)
            }}
            buyer={data.buyer}
          />
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
