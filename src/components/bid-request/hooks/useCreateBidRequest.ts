
import { useState } from "react";
import { BidRequestFormData, FormErrors } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useCreateBidRequest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<BidRequestFormData>({
    year: "",
    make: "",
    model: "",
    trim: "",
    vin: "",
    mileage: "",
    exteriorColor: "",
    interiorColor: "",
    accessories: "",
    windshield: "",
    engineLights: "",
    brakes: "",
    tire: "",
    maintenance: "",
    reconEstimate: "",
    reconDetails: "",
    engineCylinders: "",
    transmission: "",
    drivetrain: "",
  });

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Core vehicle information validation
    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.make) newErrors.make = "Make is required";
    if (!formData.model) newErrors.model = "Model is required";
    if (!formData.trim) newErrors.trim = "Trim is required";
    if (!formData.vin) newErrors.vin = "VIN is required";
    if (!formData.mileage) newErrors.mileage = "Mileage is required";
    if (selectedBuyers.length === 0) newErrors.buyers = "Please select at least one buyer";
    
    // VIN validation
    if (formData.vin && formData.vin.length !== 17) {
      newErrors.vin = "VIN must be 17 characters";
    }
    
    // Year validation
    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.year);
    if (year < 1900 || year > currentYear + 1) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }

    // Mileage validation
    if (parseInt(formData.mileage) < 0) {
      newErrors.mileage = "Mileage cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (userId: string) => {
    if (!validateForm()) {
      toast.error("Please complete all required fields");
      return;
    }

    if (!userId) {
      toast.error("User ID is required to create a bid request");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting bid request with data:', {
        vehicle_data: {
          year: formData.year,
          make: formData.make,
          model: formData.model,
          trim: formData.trim,
          vin: formData.vin,
          mileage: formData.mileage,
          engine: formData.engineCylinders,
          transmission: formData.transmission,
          drivetrain: formData.drivetrain,
          exterior: formData.exteriorColor,
          interior: formData.interiorColor,
          options: formData.accessories
        },
        recon_data: {
          windshield: formData.windshield,
          engineLights: formData.engineLights,
          brakes: formData.brakes,
          tire: formData.tire,
          maintenance: formData.maintenance,
          reconEstimate: formData.reconEstimate,
          reconDetails: formData.reconDetails
        },
        image_urls: uploadedImageUrls,
        buyer_ids: selectedBuyers,
        creator_id: userId
      });

      const { data, error } = await supabase.rpc('create_complete_bid_request', {
        vehicle_data: {
          year: formData.year,
          make: formData.make,
          model: formData.model,
          trim: formData.trim,
          vin: formData.vin,
          mileage: formData.mileage,
          engine: formData.engineCylinders,
          transmission: formData.transmission,
          drivetrain: formData.drivetrain,
          exterior: formData.exteriorColor,
          interior: formData.interiorColor,
          options: formData.accessories
        },
        recon_data: {
          windshield: formData.windshield,
          engineLights: formData.engineLights,
          brakes: formData.brakes,
          tire: formData.tire,
          maintenance: formData.maintenance,
          reconEstimate: formData.reconEstimate,
          reconDetails: formData.reconDetails
        },
        image_urls: uploadedImageUrls,
        buyer_ids: selectedBuyers,
        creator_id: userId
      });

      if (error) {
        console.error('Bid request error:', error);
        throw error;
      }

      toast.success("Bid request created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error creating bid request:', error);
      if (error.message?.includes('uuid')) {
        toast.error("Invalid buyer selection. Please try again.");
      } else {
        toast.error("Failed to create bid request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
    setSearchTerm,
    handleChange,
    handleSelectChange,
    handleImagesUploaded,
    toggleBuyer,
    handleSubmit,
  };
};
