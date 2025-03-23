
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MileageInputProps {
  mileage: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MileageInput = ({ mileage, onChange }: MileageInputProps) => {
  // Handle mileage input to only accept numbers without decimals
  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Replace any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas for thousands
    let formattedValue = numericValue;
    if (numericValue) {
      formattedValue = Number(numericValue).toLocaleString('en-US', {
        maximumFractionDigits: 0,
        useGrouping: true
      });
    }
    
    // Create a synthetic event to pass to the parent component
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formattedValue
      }
    };
    
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-1 w-full">
      <Label htmlFor="mileage" className="text-sm">Mileage</Label>
      <Input 
        id="mileage" 
        placeholder="Mileage" 
        className="h-8 w-full"
        value={mileage}
        onChange={handleMileageChange}
        inputMode="numeric"
        pattern="[0-9,]*"
      />
    </div>
  );
};

export default MileageInput;
