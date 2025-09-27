
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import VehicleDetailsSection from "@/components/bid-response/VehicleDetailsSection";
import BidForm from "@/components/bid-response/BidForm";
import BidResponseLayout from "@/components/bid-response/BidResponseLayout";
import { ErrorState, LoadingState, SubmittedState } from "@/components/bid-response/BidResponseStates";
import BidResponseMarketing from "@/components/bid-response/BidResponseMarketing";
import { useQuickBidDetails } from "@/hooks/quick-bid/useQuickBidDetails";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { AlertDialogCustom } from "@/components/bid-response/AlertDialogCustom";
import { useBidSubmission } from "@/hooks/useBidSubmission";
import { publicSupabase } from "@/integrations/supabase/publicClient";

const BidResponse = () => {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const token = searchParams.get('token');
  
  const { data, isLoading, error } = useQuickBidDetails();
  const { alert, showAlert, setAlert } = useAlertDialog();
  const { isSubmitting, handleSubmit } = useBidSubmission({
    token,
    showAlert,
    setSubmitted
  });

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
          message="Thank you! Your offer has been submitted successfully."
        />
      ) : data ? (
        <div className="max-w-2xl mx-auto p-4 space-y-6 flex-grow">
          <VehicleDetailsSection 
            vehicle={{
              ...data.vehicle,
              year: String(data.vehicle.year),
              mileage: String(data.vehicle.mileage),
              images: []
            }}
            buyer={data.buyer}
          />
          <BidForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            existingBidAmount={null}
          />
          <BidResponseMarketing />
        </div>
      ) : null}
    </BidResponseLayout>
  );
};

export default BidResponse;
