import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface VinAndMileageSectionProps {
  vin: string;
  mileage: string;
  onVinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMileageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVinDecode?: () => void;
  vinError?: string;
  mileageError?: string;
  showValidation?: boolean;
}

const VinAndMileageSection = ({
  vin,
  mileage,
  onVinChange,
  onMileageChange,
  onVinDecode,
  vinError,
  mileageError,
  showValidation = false
}: VinAndMileageSectionProps) => {
  const vinIsEmpty = vin === "";
  const mileageIsEmpty = mileage === "";
  const showVinError = vinError || (showValidation && vinIsEmpty);
  const showMileageError = mileageError || (showValidation && mileageIsEmpty);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* VIN Input */}
      <div className="space-y-1">
        <Label htmlFor="vin" className="text-sm font-medium text-gray-700">
          VIN <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="vin"
            name="vin"
            value={vin}
            onChange={onVinChange}
            placeholder="Enter 17-character VIN"
            className={`flex-1 ${showVinError ? "border-red-500" : ""}`}
          />
          <Button
            type="button"
            onClick={onVinDecode}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2"
            disabled={vin.length !== 17}
          >
            Go
          </Button>
        </div>
        {showVinError && (
          <p className="text-red-500 text-sm">
            {vinError || "VIN is required"}
          </p>
        )}
      </div>

      {/* Mileage Input */}
      <div className="space-y-1">
        <Label htmlFor="mileage" className="text-sm font-medium text-gray-700">
          Mileage <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="mileage"
            name="mileage"
            type="number"
            value={mileage}
            onChange={onMileageChange}
            placeholder="35000"
            min="0"
            className={`flex-1 ${showMileageError ? "border-red-500" : ""}`}
          />
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded border">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        {showMileageError && (
          <p className="text-red-500 text-sm">
            {mileageError || "Mileage is required"}
          </p>
        )}
      </div>
    </div>
  );
};

export default VinAndMileageSection;
