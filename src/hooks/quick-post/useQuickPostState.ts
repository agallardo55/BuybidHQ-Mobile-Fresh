
import { useState } from "react";
import { MappedBuyer } from "@/hooks/buyers/types";

export type FormView = "vinEntry" | "vehicleDetails";

export interface VehicleDetailsType {
  year: string;
  make: string;
  model: string;
  trim: string;
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  availableTrims: any[];
}

export function useQuickPostState() {
  // Form state
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<FormView>("vinEntry");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  
  // Vehicle details after fetch
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetailsType | null>(null);
  
  // Additional fields for second view
  const [notes, setNotes] = useState("");

  return {
    vin,
    setVin,
    mileage,
    setMileage,
    isSubmitting,
    setIsSubmitting,
    currentView,
    setCurrentView,
    selectedBuyer,
    setSelectedBuyer,
    vehicleDetails,
    setVehicleDetails,
    notes,
    setNotes
  };
}
