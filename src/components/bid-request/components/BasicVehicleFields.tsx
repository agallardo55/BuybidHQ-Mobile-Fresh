
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicVehicleFieldsProps {
  year: string;
  make: string;
  model: string;
  onYearChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMakeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onModelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicVehicleFields = ({ 
  year, 
  make, 
  model,
  onYearChange,
  onMakeChange,
  onModelChange
}: BasicVehicleFieldsProps) => {
  return (
    <>
      <div className="space-y-1 w-full">
        <Label htmlFor="year" className="text-sm">Year</Label>
        <Input 
          id="year" 
          placeholder="Year" 
          className="h-8 w-full" 
          value={year}
          onChange={onYearChange}
        />
      </div>

      <div className="space-y-1 w-full">
        <Label htmlFor="make" className="text-sm">Make</Label>
        <Input 
          id="make" 
          placeholder="Make" 
          className="h-8 w-full" 
          value={make}
          onChange={onMakeChange}
        />
      </div>
      
      <div className="space-y-1 w-full">
        <Label htmlFor="model" className="text-sm">Model</Label>
        <Input 
          id="model" 
          placeholder="Model" 
          className="h-8 w-full"
          value={model}
          onChange={onModelChange}
        />
      </div>
    </>
  );
};

export default BasicVehicleFields;
