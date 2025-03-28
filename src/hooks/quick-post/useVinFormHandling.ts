
import { useState } from "react";
import { useVinDecoder } from "@/components/bid-request/vin-scanner/useVinDecoder";
import { formatVin, formatMileage } from "@/components/bid-request/quick-post/helpers";
import { toast } from "sonner";
import { VehicleDetailsType } from "./useQuickPostState";

export function useVinFormHandling(
  setVehicleDetails: (data: VehicleDetailsType) => void,
  setIsSubmitting: (value: boolean) => void,
  setCurrentView: (view: "vinEntry" | "vehicleDetails") => void
) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { decodeVin } = useVinDecoder((vehicleData) => {
    // Store the vehicle data once fetched
    setVehicleDetails(vehicleData);
    setIsSubmitting(false);
    
    // Switch to the vehicle details view
    setCurrentView("vehicleDetails");
    toast.success("Vehicle details retrieved successfully");
  });

  const handleSubmit = (e: React.FormEvent, vin: string) => {
    e.preventDefault();
    
    if (!vin || vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }
    
    setIsSubmitting(true);
    setIsLoading(true);
    decodeVin(vin);
  };

  // Format and validate VIN input
  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>, setVin: (value: string) => void) => {
    const formattedVin = formatVin(e.target.value);
    setVin(formattedVin);
  };

  // Handle mileage input to only accept numbers
  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>, setMileage: (value: string) => void) => {
    const formattedValue = formatMileage(e.target.value);
    setMileage(formattedValue);
  };

  return {
    isLoading,
    handleSubmit,
    handleVinChange,
    handleMileageChange
  };
}
