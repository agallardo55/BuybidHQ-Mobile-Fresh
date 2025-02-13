
import { useFormState } from "./useFormState";
import { useFormValidation } from "./useFormValidation";
import { useBidRequestSubmission } from "./useBidRequestSubmission";
import { toast } from "sonner";

export const useCreateBidRequest = () => {
  const formState = useFormState();
  const { validateForm } = useFormValidation();
  const { submitBidRequest } = useBidRequestSubmission();

  const handleSubmit = async (userId: string) => {
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
    await submitBidRequest({
      formData: formState.formData,
      uploadedImageUrls: formState.uploadedImageUrls,
      selectedBuyers: formState.selectedBuyers,
      userId,
      setIsSubmitting: formState.setIsSubmitting
    });
  };

  return {
    ...formState,
    handleSubmit,
  };
};
