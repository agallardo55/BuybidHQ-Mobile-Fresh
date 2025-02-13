
import { useState } from "react";
import { BidRequestFormData, FormErrors, FormState, FormStateActions } from "../types";

const initialFormData: BidRequestFormData = {
  year: "",
  make: "",
  model: "",
  trim: "",
  vin: "",
  mileage: "",
  exteriorColor: "",
  interiorColor: "",
  accessories: "",
  windshield: "clear",
  engineLights: "none",
  brakes: "acceptable",
  tire: "acceptable",
  maintenance: "upToDate",
  reconEstimate: "",
  reconDetails: "",
  engineCylinders: "",
  transmission: "",
  drivetrain: "",
};

export const useFormState = (): FormState & FormStateActions => {
  const [state, setState] = useState<FormState>({
    formData: initialFormData,
    errors: {},
    selectedBuyers: [],
    uploadedImageUrls: [],
    isSubmitting: false,
  });

  const setFormData = (data: Partial<BidRequestFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  };

  const setErrors = (errors: FormErrors) => {
    setState(prev => ({ ...prev, errors }));
  };

  const setSelectedBuyers = (buyers: string[]) => {
    setState(prev => ({ ...prev, selectedBuyers: buyers }));
  };

  const setUploadedImageUrls = (urls: string[]) => {
    setState(prev => ({ ...prev, uploadedImageUrls: urls }));
  };

  const setIsSubmitting = (isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
    
    if (state.errors[name]) {
      setErrors({ ...state.errors, [name]: "" });
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ [name]: value });
  };

  const handleImagesUploaded = (urls: string[]) => {
    setUploadedImageUrls([...state.uploadedImageUrls, ...urls]);
  };

  const toggleBuyer = (buyerId: string) => {
    const newBuyers = state.selectedBuyers.includes(buyerId)
      ? state.selectedBuyers.filter(id => id !== buyerId)
      : [...state.selectedBuyers, buyerId];
    
    setSelectedBuyers(newBuyers);
    
    if (state.errors.buyers) {
      setErrors({ ...state.errors, buyers: "" });
    }
  };

  return {
    ...state,
    setFormData,
    setErrors,
    setSelectedBuyers,
    setUploadedImageUrls,
    setIsSubmitting,
    handleChange,
    handleSelectChange,
    handleImagesUploaded,
    toggleBuyer,
  };
};
