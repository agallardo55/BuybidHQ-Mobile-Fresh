
import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { BidResponseFormData } from "@/components/bid-response/types";
import VehicleDetailsSection from "@/components/bid-response/VehicleDetailsSection";
import BidForm from "@/components/bid-response/BidForm";
import BidResponseLayout from "@/components/bid-response/BidResponseLayout";
import { ErrorState, LoadingState, SubmittedState } from "@/components/bid-response/BidResponseStates";
import BidResponseMarketing from "@/components/bid-response/BidResponseMarketing";
import { useBidResponseDetails } from "@/hooks/useBidResponseDetails";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Info } from "lucide-react";

interface AlertState {
  open: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const BidResponse = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingBidAmount, setExistingBidAmount] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    title: "",
    message: "",
    type: 'info'
  });

  const token = searchParams.get('token');
  const { id } = useParams();
  
  const { data, isLoading, error } = useBidResponseDetails();

  const showAlert = (title: string, message: string, type: AlertState['type']) => {
    setAlert({
      open: true,
      title,
      message,
      type
    });
  };

  const handleSubmit = async (formData: BidResponseFormData) => {
    if (!token) {
      showAlert("Invalid Token", "Invalid submission token", "error");
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

      showAlert("Success", "Your bid has been submitted successfully!", "success");
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting bid:', error);
      showAlert(
        "Submission Error",
        "Failed to submit bid. Please try again or contact support if the issue persists.",
        "error"
      );
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
        showAlert(
          "Validation Error",
          "Error validating your bid token. Please try again.",
          "error"
        );
      }
    };

    checkExistingBid();
  }, [token]);

  const AlertIcon = () => {
    const className = "w-6 h-6 mb-2";
    switch (alert.type) {
      case 'success':
        return <CheckCircle className={`${className} text-green-500`} />;
      case 'error':
        return <XCircle className={`${className} text-red-500`} />;
      default:
        return <Info className={`${className} text-blue-500`} />;
    }
  };

  // Show error if no token is provided
  if (!token || !id) {
    return (
      <BidResponseLayout>
        <ErrorState message="Invalid bid submission link. Please check your email and try again." />
      </BidResponseLayout>
    );
  }

  return (
    <BidResponseLayout>
      <AlertDialog open={alert.open} onOpenChange={(open) => setAlert(prev => ({ ...prev, open }))}>
        <AlertDialogContent className="text-center">
          <AlertDialogHeader>
            <div className="flex flex-col items-center">
              <AlertIcon />
              <AlertDialogTitle className="text-xl">{alert.title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                {alert.message}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center">
            <AlertDialogAction 
              className={`px-4 py-2 rounded-md ${
                alert.type === 'success' ? 'bg-green-500' :
                alert.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              } text-white hover:opacity-90`}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

