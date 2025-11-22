
import { useState } from "react";
import { BidRequestFormData, FormErrors, FormState, FormStateActions } from "../types";
import { DEFAULT_BRAKES, DEFAULT_TIRES } from "../constants/defaultValues";

const initialFormData: BidRequestFormData = {
  year: "",
  make: "",
  model: "",
  trim: "",
  displayTrim: "", // Added for dropdown display
  availableTrims: [],
  vin: "",
  mileage: "",
  exteriorColor: "",
  interiorColor: "",
  accessories: "",
  windshield: "clear", // Default to "Clear" (optimal)
  engineLights: "none", // Default to "None" (optimal)
  brakes: DEFAULT_BRAKES, // Default to green range (≥8 mm)
  tire: DEFAULT_TIRES, // Default to green range (8-10/32")
  maintenance: "upToDate", // Default to "Up to date" (optimal)
  history: "noAccidents", // Default to "No Accidents" (optimal)
  reconEstimate: "0",
  reconDetails: "",
  engineCylinders: "",
  transmission: "",
  drivetrain: "",
  bodyStyle: "",
  // Book Values
  mmrWholesale: "",
  mmrRetail: "",
  kbbWholesale: "",
  kbbRetail: "",
  jdPowerWholesale: "",
  jdPowerRetail: "",
  auctionWholesale: "",
  auctionRetail: "",
  bookValuesCondition: "",
};

export const useFormState = (): FormState & FormStateActions => {
  const [state, setState] = useState<FormState>({
    formData: initialFormData,
    errors: {},
    selectedBuyers: [],
    uploadedImageUrls: [],
    selectedFileUrls: [],
    isSubmitting: false,
    searchTerm: "",
    showValidation: false,
  });

  const setFormData = (data: Partial<BidRequestFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
    
    console.log('Form data updated:', { 
      previous: state.formData,
      updates: data,
      new: { ...state.formData, ...data }
    });
  };

  const setErrors = (errors: FormErrors) => {
    setState(prev => ({ ...prev, errors }));
  };

  const setSelectedBuyers = (buyers: string[]) => {
    setState(prev => ({ ...prev, selectedBuyers: buyers }));
  };

  // Updated to replace instead of append
  const setUploadedImageUrls = (urls: string[]) => {
    setState(prev => ({ ...prev, uploadedImageUrls: urls }));
    console.log('Updated uploaded image URLs:', urls);
  };

  const addUploadedImages = (newUrls: string[]) => {
    setState(prev => ({
      ...prev,
      uploadedImageUrls: [...prev.uploadedImageUrls, ...newUrls],
      selectedFileUrls: [] // Clear selected files after upload
    }));
    console.log('Added new uploaded images:', newUrls);
  };

  const removeUploadedImage = (urlToRemove: string) => {
    setState(prev => ({
      ...prev,
      uploadedImageUrls: prev.uploadedImageUrls.filter(url => url !== urlToRemove)
    }));
    console.log('Removed uploaded image:', urlToRemove);
  };

  const setSelectedFileUrls = (urls: string[]) => {
    setState(prev => ({ ...prev, selectedFileUrls: urls }));
  };

  const setIsSubmitting = (isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  };

  const setSearchTerm = (term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  };

  const setShowValidation = (show: boolean) => {
    setState(prev => ({ ...prev, showValidation: show }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    
    if (name === 'reconEstimate') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({ [name]: numericValue });
      console.log('Recon estimate updated in form state:', {
        raw: value,
        numeric: numericValue,
        currentState: state.formData.reconEstimate
      });
    } else {
      setFormData({ [name]: value });
    }
    
    if (state.errors[name]) {
      setErrors({ ...state.errors, [name]: "" });
    }
  };

  const handleBatchChanges = (changes: Array<{ name: string; value: any }>) => {
    console.log('useFormState: handleBatchChanges called with:', changes);
    const updates: Partial<BidRequestFormData> = {};
    const newErrors = { ...state.errors };

    changes.forEach(({ name, value }) => {
      updates[name] = value;
      if (newErrors[name]) {
        delete newErrors[name];
      }
    });

    console.log('useFormState: Applying updates:', updates);
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...updates },
      errors: newErrors
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({ [name]: value });

    if (name === 'trim') {
      const selectedTrim = state.formData.availableTrims.find(trim => trim.name === value);
      if (selectedTrim?.specs) {
        const updates: Partial<BidRequestFormData> = {};
        if (selectedTrim.specs.engine) {
          updates.engineCylinders = selectedTrim.specs.engine;
        }
        if (selectedTrim.specs.transmission) {
          updates.transmission = selectedTrim.specs.transmission;
        }
        if (selectedTrim.specs.drivetrain) {
          updates.drivetrain = selectedTrim.specs.drivetrain;
        }
        if (Object.keys(updates).length > 0) {
          setFormData(updates);
        }
      }
    }
  };

  const handleImagesUploaded = (urls: string[]) => {
    addUploadedImages(urls);
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
    setSelectedFileUrls,
    setIsSubmitting,
    setSearchTerm,
    setShowValidation,
    handleChange,
    handleSelectChange,
    handleImagesUploaded,
    toggleBuyer,
    handleBatchChanges,
    removeUploadedImage, // Add new function to the return object
  };
};
