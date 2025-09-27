
import { useFormState } from "./useFormState";
import { useFormValidation } from "./useFormValidation";
import { useBidRequestSubmission } from "./useBidRequestSubmission";
import { toast } from "sonner";

export const useCreateBidRequest = () => {
  const formState = useFormState();
  const { validateForm } = useFormValidation();
  const { submitBidRequest } = useBidRequestSubmission();

  const handleSubmit = async (userId: string, accountId: string) => {
    const newErrors = validateForm(formState.formData, formState.selectedBuyers);
    formState.setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please complete all required fields");
      return;
    }

    if (!userId) {
      toast.error("User ID is required to create a bid request");
      return;
    }

    formState.setIsSubmitting(true);
    try {
      await submitBidRequest({
        formState,
        userId,
        accountId,
      });
    } catch (error) {
      // Error is already handled in submitBidRequest
    } finally {
      formState.setIsSubmitting(false);
    }
  };

  return {
    ...formState,
    handleSubmit,
    handleBatchChanges: formState.handleBatchChanges, // Explicitly expose handleBatchChanges
  };
};
