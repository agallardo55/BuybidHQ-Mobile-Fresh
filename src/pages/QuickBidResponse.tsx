
import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { AlertDialogCustom } from "@/components/bid-response/AlertDialogCustom";
import { supabase } from "@/integrations/supabase/client";
import BidResponseLayout from "@/components/bid-response/BidResponseLayout";
import { ErrorState, LoadingState, SubmittedState } from "@/components/bid-response/BidResponseStates";
import { useBidSubmission } from "@/hooks/useBidSubmission";
import QuickBidDetailsView from "@/components/quick-bid/QuickBidDetailsView";
import { useQuickBidDetails } from "@/hooks/quick-bid/useQuickBidDetails";
import { VehicleDetails } from "@/components/bid-response/types";

const QuickBidResponse = () => {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [existingBidAmount, setExistingBidAmount] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [initialValidationDone, setInitialValidationDone] = useState(false);

  const token = searchParams.get('token');
  const { id } = useParams();
  
  const { data, isLoading, error } = useQuickBidDetails();
  const { alert, showAlert, setAlert } = useAlertDialog();
  const { isSubmitting, handleSubmit } = useBidSubmission({
    token,
    showAlert,
    setSubmitted
  });

  // Check for existing bid only on initial load
  useEffect(() => {
    const checkExistingBid = async () => {
      if (!token) {
        setTokenError("Bid Request Not Available");
        return;
      }

      try {
        const { data, error } = await supabase.rpc('validate_bid_submission_token', {
          p_token: token
        });

        if (error) {
          setTokenError(error.message);
          if (!submitted) {
            showAlert(
              "Token Error",
              error.message,
              "error"
            );
          }
          return;
        }
        
        const tokenInfo = data?.[0];
        if (!tokenInfo?.is_valid) {
          if (tokenInfo?.has_existing_bid) {
            setExistingBidAmount(tokenInfo.existing_bid_amount.toString());
            setSubmitted(true);
            if (!submitted) {
              showAlert(
                "Existing Bid",
                `You have already submitted an offer of $${tokenInfo.existing_bid_amount.toLocaleString()}`,
                "info"
              );
            }
          } else {
            setTokenError("Invalid or expired submission token");
            if (!submitted) {
              showAlert(
                "Invalid Token",
                "This submission link has expired or is invalid. Please request a new one.",
                "error"
              );
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing bid:', error);
        setTokenError("Error validating submission token");
      }
      setInitialValidationDone(true);
    };

    if (!initialValidationDone && !submitted) {
      checkExistingBid();
    }
  }, [token, showAlert, initialValidationDone, submitted]);

  // Show error if no id is provided
  if (!id) {
    return (
      <BidResponseLayout>
        <ErrorState message="Invalid bid submission link. Please check your email and try again." />
      </BidResponseLayout>
    );
  }

  // Show error if token is invalid
  if (tokenError && !submitted) {
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
        <QuickBidDetailsView
          vehicle={data.vehicle as VehicleDetails}
          buyer={data.buyer}
          notes={data.notes || ''} // Ensure we pass a string by adding fallback
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          existingBidAmount={existingBidAmount}
        />
      ) : null}
    </BidResponseLayout>
  );
};

export default QuickBidResponse;
