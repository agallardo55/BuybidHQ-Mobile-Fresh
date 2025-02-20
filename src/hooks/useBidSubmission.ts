
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { BidResponseFormData } from "@/components/bid-response/types";
import { AlertType } from './useAlertDialog';

interface UseBidSubmissionProps {
  token: string | null;
  showAlert: (title: string, message: string, type: AlertType) => void;
  setSubmitted: (value: boolean) => void;
}

export const useBidSubmission = ({ token, showAlert, setSubmitted }: UseBidSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return {
    isSubmitting,
    handleSubmit
  };
};
