
import { useState } from 'react';
import { publicSupabase } from "@/integrations/supabase/publicClient";
import { BidResponseFormData } from "@/components/bid-response/types";
import { AlertType } from './useAlertDialog';
import { toast } from "sonner";

interface UseBidSubmissionProps {
  token: string | null;
  showAlert: (title: string, message: string | { amount: string; description: string }, type: AlertType) => void;
  setSubmitted: (value: boolean) => void;
}

export const useBidSubmission = ({ token, showAlert, setSubmitted }: UseBidSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: BidResponseFormData) => {
    if (!token) {
      showAlert("Invalid Token", "No valid submission token found", "error");
      toast.error("Invalid submission token");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanAmount = parseFloat(formData.offerAmount.replace(/,/g, ''));
      
      if (isNaN(cleanAmount)) {
        throw new Error("Invalid offer amount");
      }

      if (cleanAmount <= 0) {
        throw new Error("Offer amount must be greater than 0");
      }

      const { data, error } = await publicSupabase.functions.invoke('submit-public-bid', {
        body: {
          token,
          offerAmount: cleanAmount
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || "Failed to submit bid");
      }

      if (!data?.success) {
        console.error('Bid submission failed:', data);
        throw new Error(data?.error || "Failed to submit bid");
      }

      const formattedAmount = cleanAmount.toLocaleString();
      
      // Set submitted first to prevent validation check from showing existing bid message
      setSubmitted(true);
      
      showAlert(
        "Thank you!", 
        {
          amount: `Your offer of $${formattedAmount} has been submitted`,
          description: "We'll notify you once the seller reviews your offer."
        },
        "success"
      );
      
    } catch (error: any) {
      console.error('Error submitting bid:', error);
      const errorMessage = error.message || "Failed to submit bid. Please try again or contact support.";
      
      if (errorMessage.includes("already submitted")) {
        toast.error("You have already submitted a bid for this vehicle");
        showAlert(
          "Duplicate Bid",
          errorMessage,
          "error"
        );
      } else if (errorMessage.includes("expired")) {
        toast.error("This submission link has expired");
        showAlert(
          "Expired Link",
          "This submission link has expired. Please request a new one.",
          "error"
        );
      } else {
        toast.error(errorMessage);
        showAlert(
          "Submission Error",
          errorMessage,
          "error"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
