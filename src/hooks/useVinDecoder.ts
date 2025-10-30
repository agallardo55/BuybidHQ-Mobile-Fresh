/**
 * Complete VIN decoder hook with vehicle data and trim management
 */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { vinService, VehicleData, TrimOption } from "@/services/vinService";
import { useAuth } from "@/contexts/AuthContext";

interface VinDecoderState {
  vehicleData: VehicleData | null;
  availableTrims: TrimOption[];
  selectedTrim: TrimOption | null;
  isLoading: boolean;
  error: string | null;
}

export function useVinDecoder() {
  const [state, setState] = useState<VinDecoderState>({
    vehicleData: null,
    availableTrims: [],
    selectedTrim: null, // ✅ KEY FIX: Initialize with null, not {}
    isLoading: false,
    error: null
  });

  const { user } = useAuth();

  const decodeVin = async (vin: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await vinService.decodeVin(vin);
      
      if (result.success && result.data) {
        const vehicleData = result.data;
        const availableTrims = vehicleData.availableTrims || [];

        // Use the trim that vinService intelligently matched
        // If vinService didn't find a match, selectedTrim will be null
        const selectedTrim = vehicleData.selectedTrim || 
          (availableTrims.length === 1 ? availableTrims[0] : null);
        
        // ✅ FIX: Use functional update to ensure we get the latest state
        setState(prevState => {
          const newState = {
            vehicleData,
            availableTrims,
            selectedTrim,
            isLoading: false,
            error: null
          };
          
          return newState;
        });
        
        toast.success("Vehicle information retrieved successfully", {
          closeButton: false
        });
      } else if (result.fallbackToManual) {
        // No trim data available - fallback to manual
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Trim data unavailable. Please select manually.'
        }));
        
        toast.warning(result.error || 'Trim data unavailable. Please select manually.', {
          duration: 5000,
          description: 'You can still enter vehicle details using the dropdowns below.'
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || "Failed to decode VIN"
        }));
        
        toast.error("Something went wrong", {
          duration: 3000,
          description: "Please try again with a US Vin Number 1990 or Newer vehicle."
        });
      }
    } catch (error) {
      console.error('VIN decode error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred"
      }));
      
      toast.error("Something went wrong", {
        duration: 3000,
        description: "Please try again with a US Vin Number 1990 or Newer vehicle."
      });
    }
  };

  const setSelectedTrim = (trim: TrimOption | null) => {
    setState(prev => ({ ...prev, selectedTrim: trim }));
  };

  const clearData = () => {
    setState({
      vehicleData: null,
      availableTrims: [],
      selectedTrim: null,
      isLoading: false,
      error: null
    });
  };

  return {
    vehicleData: state.vehicleData,
    availableTrims: state.availableTrims,
    selectedTrim: state.selectedTrim,
    isLoading: state.isLoading,
    error: state.error,
    decodeVin,
    setSelectedTrim,
    clearData
  };
}
