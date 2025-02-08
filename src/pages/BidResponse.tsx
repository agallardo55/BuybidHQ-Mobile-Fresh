
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BidResponseFormData, VehicleDetails } from "@/components/bid-response/types";
import VehicleDetailsSection from "@/components/bid-response/VehicleDetailsSection";
import BidForm from "@/components/bid-response/BidForm";
import { toast } from "sonner";

const BidResponse = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Mock vehicle details - in a real app, this would come from an API based on the URL params
  const vehicleDetails: VehicleDetails = {
    year: "2024",
    make: "Toyota",
    model: "Camry",
    trim: "XSE",
    mileage: "15000",
    exteriorColor: "Midnight Black",
    interiorColor: "Black Leather",
    vin: "1HGCM82633A123456"
  };

  const handleSubmit = async (formData: BidResponseFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Your bid has been submitted successfully!");
      setSubmitted(true);
    } catch (error) {
      toast.error("Failed to submit bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-lg text-center space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
          <p className="text-gray-600">
            Your bid has been received. We'll be in touch shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <VehicleDetailsSection vehicle={vehicleDetails} />
        <BidForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default BidResponse;
