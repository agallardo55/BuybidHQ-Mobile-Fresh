
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { BidResponseFormData } from "@/components/bid-response/types";
import { AlertType } from './useAlertDialog';
import { toast } from "sonner";

interface UseBidSubmissionProps {
  token: string | null;
  showAlert: (title: string, message: string, type: AlertType) => void;
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
      // Remove commas and convert to number
      const cleanAmount = parseFloat(formData.offerAmount.replace(/,/g, ''));
      
      if (isNaN(cleanAmount)) {
        throw new Error("Invalid offer amount");
      }

      const { data, error } = await supabase.functions.invoke('submit-public-bid', {
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

      toast.success("Bid submitted successfully!");
      showAlert("Success", "Your bid has been submitted successfully!", "success");
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting bid:', error);
      const errorMessage = error.message || "Failed to submit bid. Please try again or contact support.";
      toast.error(errorMessage);
      showAlert(
        "Submission Error",
        errorMessage,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
