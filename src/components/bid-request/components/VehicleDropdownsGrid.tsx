import React from "react";
import DropdownField from "./DropdownField";
import TrimDropdown from "./TrimDropdown";
import { TrimOption } from "../types";
import { vinService } from "@/services/vinService";

interface VehicleDropdownsGridProps {
  year: string;
  make: string;
  model: string;
  displayTrim: string;
  availableTrims: TrimOption[];
  onYearChange: (value: string) => void;
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onTrimChange: (value: string) => void;
  yearError?: string;
  makeError?: string;
  modelError?: string;
  trimError?: string;
  showValidation?: boolean;
}

const VehicleDropdownsGrid = ({
  year,
  make,
  model,
  displayTrim,
  availableTrims,
  onYearChange,
  onMakeChange,
  onModelChange,
  onTrimChange,
  yearError,
  makeError,
  modelError,
  trimError,
  showValidation = false
}: VehicleDropdownsGridProps) => {
  // Generate year options (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) => {
    const year = currentYear - 10 + i;
    return { value: year.toString(), label: year.toString() };
  });

  // Common make options
  const makeOptions = [
    { value: "LAND ROVER", label: "LAND ROVER" },
    { value: "PORSCHE", label: "PORSCHE" },
    { value: "MCLAREN", label: "MCLAREN" },
    { value: "ROLLS-ROYCE", label: "ROLLS-ROYCE" },
    { value: "BMW", label: "BMW" },
    { value: "MERCEDES-BENZ", label: "MERCEDES-BENZ" },
    { value: "AUDI", label: "AUDI" },
    { value: "LEXUS", label: "LEXUS" },
    { value: "TOYOTA", label: "TOYOTA" },
    { value: "HONDA", label: "HONDA" },
    { value: "FORD", label: "FORD" },
    { value: "CHEVROLET", label: "CHEVROLET" },
    { value: "NISSAN", label: "NISSAN" },
    { value: "HYUNDAI", label: "HYUNDAI" },
    { value: "KIA", label: "KIA" },
    { value: "MAZDA", label: "MAZDA" },
    { value: "SUBARU", label: "SUBARU" },
    { value: "VOLKSWAGEN", label: "VOLKSWAGEN" },
    { value: "VOLVO", label: "VOLVO" },
    { value: "JAGUAR", label: "JAGUAR" },
    { value: "INFINITI", label: "INFINITI" },
    { value: "ACURA", label: "ACURA" },
    { value: "GENESIS", label: "GENESIS" },
    { value: "LINCOLN", label: "LINCOLN" },
    { value: "CADILLAC", label: "CADILLAC" },
    { value: "BUICK", label: "BUICK" },
    { value: "CHRYSLER", label: "CHRYSLER" },
    { value: "DODGE", label: "DODGE" },
    { value: "JEEP", label: "JEEP" },
    { value: "RAM", label: "RAM" },
    { value: "GMC", label: "GMC" },
    { value: "ALFA ROMEO", label: "ALFA ROMEO" },
    { value: "MASERATI", label: "MASERATI" },
    { value: "BENTLEY", label: "BENTLEY" },
    { value: "ASTON MARTIN", label: "ASTON MARTIN" },
    { value: "FERRARI", label: "FERRARI" },
    { value: "LAMBORGHINI", label: "LAMBORGHINI" },
    { value: "BUGATTI", label: "BUGATTI" },
    { value: "KOENIGSEGG", label: "KOENIGSEGG" },
    { value: "PAGANI", label: "PAGANI" }
  ];

  // Generate model options from available trims (Manheim style)
  const modelOptions = availableTrims?.length > 0 ? 
    [{ value: model, label: model }] : 
    [];

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Year Dropdown */}
      <DropdownField
        id="year"
        label="Year"
        value={year}
        options={yearOptions}
        onChange={onYearChange}
        error={yearError}
        showValidation={showValidation}
      />

      {/* Make Dropdown */}
      <DropdownField
        id="make"
        label="Make"
        value={make}
        options={makeOptions}
        onChange={onMakeChange}
        error={makeError}
        showValidation={showValidation}
      />

      {/* Model Dropdown (Manheim Style) */}
      <DropdownField
        id="model"
        label="Model"
        value={model}
        options={modelOptions}
        onChange={onModelChange}
        error={modelError}
        showValidation={showValidation}
      />

      {/* Trim Dropdown (Body Style + Trim Level) */}
      <div>
        <label htmlFor="trim" className="block text-sm font-medium text-gray-700 mb-1">
          Trim <span className="text-red-500">*</span>
        </label>
        <TrimDropdown
          trims={availableTrims}
          selectedTrim={displayTrim || ''}
          onTrimChange={onTrimChange}
          error={trimError}
          showValidation={showValidation}
        />
      </div>
    </div>
  );
};

export default VehicleDropdownsGrid;
