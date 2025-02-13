
import { useState } from "react";
import { BidRequestFormData, FormErrors } from "../types";

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

export const useFormState = () => {
  const [formData, setFormData] = useState<BidRequestFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagesUploaded = (urls: string[]) => {
    setUploadedImageUrls(prev => [...prev, ...urls]);
  };

  const toggleBuyer = (buyerId: string) => {
    setSelectedBuyers(prev => {
      if (prev.includes(buyerId)) {
        return prev.filter(id => id !== buyerId);
      }
      return [...prev, buyerId];
    });
    if (errors.buyers) {
      setErrors(prev => ({ ...prev, buyers: "" }));
    }
  };

  return {
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
  };
};
