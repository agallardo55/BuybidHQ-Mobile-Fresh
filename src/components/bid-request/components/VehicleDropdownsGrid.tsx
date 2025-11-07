import React, { useState, useEffect } from "react";
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
  onTrimsUpdate?: (trims: TrimOption[]) => void;
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
  onTrimsUpdate,
  yearError,
  makeError,
  modelError,
  trimError,
  showValidation = false
}: VehicleDropdownsGridProps) => {
  const [availableMakes, setAvailableMakes] = useState<Array<{ value: string; label: string }>>([]);
  const [availableModels, setAvailableModels] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingTrims, setIsLoadingTrims] = useState(false);

  // Generate year options (current year + 1 to 1990 - newest to oldest)
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1; // Include 1 future model year
  const minYear = 1990; // Start from 1990
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
    const year = maxYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Load makes when year changes
  useEffect(() => {
    if (year) {
      setIsLoadingMakes(true);
      vinService.fetchMakesByYear(year)
        .then(makes => {
          const makeOptions = makes.map(make => ({ value: make, label: make }));
          setAvailableMakes(makeOptions);
          setIsLoadingMakes(false);
        })
        .catch(error => {
          console.error('Error fetching makes:', error);
          setIsLoadingMakes(false);
        });
    } else {
      setAvailableMakes([]);
    }
  }, [year]);

  // Load models when year and make change
  useEffect(() => {
    if (year && make) {
      setIsLoadingModels(true);
      vinService.fetchModelsByYearMake(year, make)
        .then(models => {
          const modelOptions = models.map(model => ({ value: model, label: model }));
          setAvailableModels(modelOptions);
          setIsLoadingModels(false);
        })
        .catch(error => {
          console.error('Error fetching models:', error);
          setIsLoadingModels(false);
        });
    } else {
      setAvailableModels([]);
    }
  }, [year, make]);

  // Load trims when year, make, and model change
  useEffect(() => {
    if (year && make && model && onTrimsUpdate && !isLoadingTrims) {
      console.log('Fetching trims for:', { year, make, model });
      setIsLoadingTrims(true);
      vinService.fetchTrimsByYearMakeModel(year, make, model)
        .then(trims => {
          console.log('Received trims:', trims);
          onTrimsUpdate(trims);
          setIsLoadingTrims(false);
        })
        .catch(error => {
          console.error('Error fetching trims:', error);
          setIsLoadingTrims(false);
        });
    }
  }, [year, make, model]); // Removed onTrimsUpdate from dependencies

  // Handle year change
  const handleYearChange = (value: string) => {
    onYearChange(value);
    // Clear dependent fields when year changes
    if (make) onMakeChange("");
    if (model) onModelChange("");
    if (displayTrim) onTrimChange("");
  };

  // Handle make change
  const handleMakeChange = (value: string) => {
    onMakeChange(value);
    // Clear dependent fields when make changes
    if (model) onModelChange("");
    if (displayTrim) onTrimChange("");
  };

  // Handle model change
  const handleModelChange = (value: string) => {
    onModelChange(value);
    // Clear dependent fields when model changes
    if (displayTrim) onTrimChange("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Year Dropdown */}
      <DropdownField
        id="year"
        label="Year"
        value={year}
        options={yearOptions}
        onChange={handleYearChange}
        error={yearError}
        showValidation={showValidation}
        placeholder="Select Year"
      />

      {/* Make Dropdown */}
      <DropdownField
        id="make"
        label="Make"
        value={make}
        options={availableMakes}
        onChange={handleMakeChange}
        error={makeError}
        showValidation={showValidation}
        placeholder={isLoadingMakes ? "Loading..." : "Select Make"}
      />

      {/* Model Dropdown */}
      <DropdownField
        id="model"
        label="Model"
        value={model}
        options={availableModels}
        onChange={handleModelChange}
        error={modelError}
        showValidation={showValidation}
        placeholder={isLoadingModels ? "Loading..." : "Select Model"}
      />

      {/* Trim Dropdown (Body Style + Trim Level) */}
      <TrimDropdown
        trims={availableTrims}
        selectedTrim={displayTrim || ''}
        onTrimChange={onTrimChange}
        error={trimError}
        showValidation={showValidation}
      />
    </div>
  );
};

export default VehicleDropdownsGrid;
