
import { useFormState } from "./useFormState";
import { useFormValidation } from "./useFormValidation";
import { useBidRequestSubmission } from "./useBidRequestSubmission";
import { toast } from "sonner";

export const useCreateBidRequest = () => {
  const {
    formData,
    errors,
    isSubmitting,
    selectedBuyers,
    searchTerm,
    uploadedImageUrls,
    setIsSubmitting,
    setErrors,
    setSearchTerm,
    handleChange,
    handleSelectChange,
    handleImagesUploaded,
    toggleBuyer,
  } = useFormState();

  const { validateForm } = useFormValidation();
  const { submitBidRequest } = useBidRequestSubmission();

  const handleSubmit = async (userId: string) => {
    const newErrors = validateForm(formData, selectedBuyers);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please complete all required fields");
      return;
    }

    if (!userId) {
      toast.error("User ID is required to create a bid request");
      return;
    }

    setIsSubmitting(true);
    await submitBidRequest({
      formData,
      uploadedImageUrls,
      selectedBuyers,
      userId,
      setIsSubmitting
    });
  };

  return {
    formData,
    errors,
    isSubmitting,
    selectedBuyers,
    searchTerm,
    setSearchTerm,
    handleChange,
    handleSelectChange,
    handleImagesUploaded,
    toggleBuyer,
    handleSubmit,
  };
};
