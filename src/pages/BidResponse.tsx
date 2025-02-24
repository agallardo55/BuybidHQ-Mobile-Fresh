
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
  const [tokenError, setTokenError] = useState<string | null>(null);

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
      if (!token) {
        setTokenError("No submission token provided");
        return;
      }

      try {
        const { data, error } = await supabase.rpc('validate_bid_submission_token', {
          p_token: token
        });

        if (error) {
          setTokenError(error.message);
          showAlert(
            "Token Error",
            error.message,
            "error"
          );
          return;
        }
        
        const tokenInfo = data?.[0];
        if (!tokenInfo?.is_valid) {
          if (tokenInfo?.has_existing_bid) {
            setExistingBidAmount(tokenInfo.existing_bid_amount.toString());
            setSubmitted(true);
            showAlert(
              "Existing Bid",
              `You have already submitted an offer of $${tokenInfo.existing_bid_amount.toLocaleString()}`,
              "info"
            );
          } else {
            setTokenError("Invalid or expired submission token");
            showAlert(
              "Invalid Token",
              "This submission link has expired or is invalid. Please request a new one.",
              "error"
            );
          }
        }
      } catch (error) {
        console.error('Error checking existing bid:', error);
        setTokenError("Error validating submission token");
      }
    };

    checkExistingBid();
  }, [token, showAlert]);

  // Show error if no id is provided
  if (!id) {
    return (
      <BidResponseLayout>
        <ErrorState message="Invalid bid submission link. Please check your email and try again." />
      </BidResponseLayout>
    );
  }

  // Show error if token is invalid
  if (tokenError) {
    return (
      <BidResponseLayout>
        <ErrorState message={tokenError} />
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
            ? `You have already submitted an offer of $${parseInt(existingBidAmount).toLocaleString()}` 
            : "Thank you! Your offer has been submitted successfully."
          } 
        />
      ) : data ? (
        <div className="max-w-2xl mx-auto p-4 space-y-6 flex-grow">
          <VehicleDetailsSection 
            vehicle={{
              ...data.vehicle,
              year: String(data.vehicle.year),
              mileage: String(data.vehicle.mileage),
              // Ensure images are in the correct order (first uploaded first)
              images: data.vehicle.images ? [...data.vehicle.images].reverse() : []
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
