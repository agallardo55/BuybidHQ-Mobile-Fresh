
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useVinDecoder } from "../vin-scanner/useVinDecoder";

export interface QuickPostFormData {
  vin: string;
  mileage: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  reconEstimate: string;
  reconDetails: string;
}

export const useQuickPostForm = (onClose: () => void) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuickPostFormData>({
    vin: "",
    mileage: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    engineCylinders: "",
    transmission: "",
    drivetrain: "",
    reconEstimate: "",
    reconDetails: ""
  });

  const { decodeVin, isLoading } = useVinDecoder((vehicleData) => {
    setFormData(prev => ({
      ...prev,
      year: vehicleData.year || "",
      make: vehicleData.make || "",
      model: vehicleData.model || "",
      trim: vehicleData.trim || "",
      engineCylinders: vehicleData.engineCylinders || "",
      transmission: vehicleData.transmission || "",
      drivetrain: vehicleData.drivetrain || "",
    }));
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.vin || !formData.mileage) {
      toast.error("VIN and mileage are required");
      return;
    }
    
    // Navigate to create bid request page with form data as state
    navigate("/create-bid-request", { state: { quickPostData: formData } });
    onClose();
  };

  const handleFetchVinDetails = () => {
    if (!formData.vin || formData.vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }

    decodeVin(formData.vin);
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleSubmit,
    handleFetchVinDetails
  };
};
