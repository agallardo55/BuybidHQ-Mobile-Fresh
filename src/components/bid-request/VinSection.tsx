
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Barcode } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ScannerModal from "./vin-scanner/ScannerModal";
import { useVinScanner } from "./vin-scanner/useVinScanner";
import { useVinDecoder } from "@/hooks/useVinDecoder";
import { VehicleData, TrimOption, vinService } from "@/services/vinService";
import DropdownField from "./components/DropdownField";
import TrimDropdown from "./components/TrimDropdown";
import gaugeIcon from "@/assets/gauge_image.png";
import { logger } from '@/utils/logger';

// Normalize model name by removing engine/trim suffixes
// "DEFENDER HYBRID" → "DEFENDER"
// "RANGE ROVER SPORT V8" → "RANGE ROVER SPORT"
const normalizeModelName = (model: string): string => {
  return model
    .replace(/\s+(HYBRID|PHEV|V6|V8|P\d+|SE|HSE|AUTOBIOGRAPHY).*$/i, '')
    .trim();
};

interface VinSectionProps {
  vin: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  onVehicleDataFetched?: (data: VehicleData) => void;
  showValidation?: boolean;
  formData?: { 
    year: string; 
    make: string; 
    model: string; 
    displayTrim: string; 
    mileage: string;
    engineCylinders?: string; 
    transmission?: string; 
    drivetrain?: string;
    availableTrims: TrimOption[];
  };
  errors?: {
    year?: string;
    make?: string;
    model?: string;
    trim?: string;
    vin?: string;
    mileage?: string;
  };
  onYearChange?: (value: string) => void;
  onMakeChange?: (value: string) => void;
  onModelChange?: (value: string) => void;
  onTrimChange?: (value: string) => void;
  onTrimsUpdate?: (trims: TrimOption[]) => void;
  hideDropdowns?: boolean; // ✅ ADD THIS
}

const VinSection = ({ 
  vin, 
  onChange, 
  error, 
  onVehicleDataFetched, 
  showValidation, 
  formData,
  errors,
  onYearChange,
  onMakeChange,
  onModelChange,
  onTrimChange,
  onTrimsUpdate,
  hideDropdowns = false // ✅ ADD THIS
}: VinSectionProps) => {
  const isMobile = useIsMobile();
  
  const {
    vehicleData,
    isLoading,
    error: decodeError,
    decodeVin,
  } = useVinDecoder();

  // Destructure formData values for optimized dependency arrays
  const year = formData?.year;
  const make = formData?.make;
  const model = formData?.model;
  const displayTrim = formData?.displayTrim;

  // Cascading dropdown state
  const [availableMakes, setAvailableMakes] = useState<Array<{ value: string; label: string }>>([]);
  const [availableModels, setAvailableModels] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingTrims, setIsLoadingTrims] = useState(false);

  // Error states for API calls
  const [makesError, setMakesError] = useState<string | null>(null);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [trimsError, setTrimsError] = useState<string | null>(null);

  // Track where trims came from to prevent redundant fetches
  const [trimsSource, setTrimsSource] = useState<'vin' | 'manual' | null>(null);

  // Track normalized models to avoid calling onChange in useEffect
  const normalizedModelRef = useRef<string | null>(null);

  const { isScanning, videoRef, startScan, stopScan } = useVinScanner((scannedVin) => {
    const syntheticEvent = {
      target: { name: 'vin', value: scannedVin }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    setTimeout(() => {
      decodeVin(scannedVin);
    }, 100);
  });

  // Notify parent when VIN decode succeeds
  useEffect(() => {
    if (vehicleData && onVehicleDataFetched) {
      // Mark trims as coming from VIN decode
      setTrimsSource('vin');
      logger.debug('📥 VIN decode data received, setting trimsSource to "vin"');
      logger.debug('📥 VinSection: vehicleData being passed to onVehicleDataFetched:', {
        displayTrim: vehicleData.displayTrim,
        trim: vehicleData.trim,
        availableTrims: vehicleData.availableTrims?.map(t => ({
          name: t.name,
          description: t.description,
          getDisplayTrim: vinService.getDisplayTrim(t)
        })),
        selectedTrim: vehicleData.selectedTrim ? {
          name: vehicleData.selectedTrim.name,
          description: vehicleData.selectedTrim.description,
          getDisplayTrim: vinService.getDisplayTrim(vehicleData.selectedTrim)
        } : null
      });
      onVehicleDataFetched(vehicleData);
    }
  }, [vehicleData]);

  // Load makes when year changes
  useEffect(() => {
    if (year) {
      const abortController = new AbortController();
      setIsLoadingMakes(true);
      setMakesError(null); // Clear previous errors

      vinService.fetchMakesByYear(year)
        .then(makes => {
          if (abortController.signal.aborted) return;

          const makeOptions = makes.map(make => ({ value: make, label: make }));

          // If formData already has a make (from VIN decode), ensure it's in the options
          if (make && !makeOptions.find(m => m.value === make)) {
            makeOptions.unshift({ value: make, label: make });
          }

          setAvailableMakes(makeOptions);
          setMakesError(null); // Clear errors on success
          setIsLoadingMakes(false);
        })
        .catch(error => {
          if (abortController.signal.aborted) return;
          logger.error('Error fetching makes:', error);
          setMakesError('Unable to load makes. Please try again.');
          setIsLoadingMakes(false);
        });

      return () => abortController.abort();
    } else {
      setAvailableMakes([]);
      setMakesError(null);
    }
  }, [year, make]);

  // Load models when year and make change
  useEffect(() => {
    if (year && make) {
      const abortController = new AbortController();
      setIsLoadingModels(true);
      setModelsError(null); // Clear previous errors

      vinService.fetchModelsByYearMake(year, make)
        .then(models => {
          if (abortController.signal.aborted) return;

          const modelOptions = models.map(model => ({ value: model, label: model }));

          // If formData already has a model (from VIN decode), ensure it's in the options
          if (model) {
            const normalizedModel = normalizeModelName(model);

            // Check if normalized model exists in options
            const exactMatch = modelOptions.find(m => m.value === normalizedModel);

            if (exactMatch && model !== normalizedModel) {
              // Only normalize once per model value to avoid loops
              if (normalizedModelRef.current !== model) {
                normalizedModelRef.current = model;

                // Use the API's model name (without VIN decoder's extra details)
                // Call onModelChange callback if available, otherwise use onChange
                if (onModelChange) {
                  logger.debug('🔧 Normalizing model from VIN decode:', {
                    original: model,
                    normalized: normalizedModel
                  });
                  onModelChange(normalizedModel);
                } else {
                  // Fallback to onChange for backwards compatibility
                  const syntheticEvent = {
                    target: { name: 'model', value: normalizedModel }
                  } as React.ChangeEvent<HTMLInputElement>;
                  onChange(syntheticEvent);
                }
              }
            } else if (!modelOptions.find(m => m.value === model)) {
              // Model doesn't exist even after normalization, add the VIN-decoded version
              modelOptions.unshift({ value: model, label: model });
              normalizedModelRef.current = null; // Reset since we're keeping the original
            } else {
              // Model matches exactly, no normalization needed
              normalizedModelRef.current = null;
            }
          } else {
            // No model in formData, reset tracking
            normalizedModelRef.current = null;
          }

          setAvailableModels(modelOptions);
          setModelsError(null); // Clear errors on success
          setIsLoadingModels(false);
        })
        .catch(error => {
          if (abortController.signal.aborted) return;
          logger.error('Error fetching models:', error);
          setModelsError('Unable to load models. Please try again.');
          setIsLoadingModels(false);
        });

      return () => abortController.abort();
    } else {
      setAvailableModels([]);
      setModelsError(null);
    }
  }, [year, make, model, onModelChange, onChange]);

  // Load trims when year, make, and model change
  useEffect(() => {
    logger.debug('🔄 Trim useEffect triggered:', {
      year,
      make,
      model,
      availableTrimsLength: formData?.availableTrims?.length,
      isLoadingTrims,
      hasOnTrimsUpdate: !!onTrimsUpdate,
      trimsSource
    });

    // Skip fetch if trims just came from VIN decode
    if (trimsSource === 'vin') {
      logger.debug('⏭️ Skipping trim fetch - just populated from VIN decode');
      setTrimsSource(null); // Reset flag for future manual changes
      return;
    }

    // Normal fetch logic for manual selection
    logger.debug('🔍 Checking trim fetch conditions:', {
      hasYear: !!year,
      hasMake: !!make,
      hasModel: !!model,
      hasOnTrimsUpdate: !!onTrimsUpdate,
      isLoadingTrims
    });

    if (year && make && model && onTrimsUpdate && !isLoadingTrims) {
      logger.debug('🚀 Fetching trims for manual selection');

      const abortController = new AbortController();
      setIsLoadingTrims(true);
      setTrimsError(null); // Clear previous errors

      vinService.fetchTrimsByYearMakeModel(year, make, model)
        .then(trims => {
          if (abortController.signal.aborted) return;

          logger.debug('✅ Received trims:', trims.length, 'trims');
          onTrimsUpdate(trims);

          // Auto-select if only one trim available AND trim is not already selected
          if (trims.length === 1 && onTrimChange && !displayTrim) {
            const singleTrim = trims[0];
            const displayValue = vinService.getDisplayTrim(singleTrim);
            logger.debug('🔍 Auto-selecting single trim:', displayValue);
            onTrimChange(displayValue);
          }

          setTrimsError(null); // Clear errors on success
          setIsLoadingTrims(false);
        })
        .catch(error => {
          if (abortController.signal.aborted) return;
          logger.error('❌ Error fetching trims:', error);
          setTrimsError('Unable to load trims. Please try again.');
          setIsLoadingTrims(false);
        });

      return () => abortController.abort();
    }
  }, [year, make, model, displayTrim, trimsSource]); // Include trimsSource for VIN decode skip logic

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  const handleGoClick = () => {
    if (vin && vin.length === 17) {
      decodeVin(vin);
    }
  };

  // Handle mileage input with formatting
  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas for thousands
    let formattedValue = numericValue;
    if (numericValue) {
      formattedValue = Number(numericValue).toLocaleString('en-US', {
        maximumFractionDigits: 0,
        useGrouping: true
      });
    }
    
    // Create synthetic event with formatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'mileage',
        value: formattedValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  // Handle year change with clearing dependents
  const handleYearChange = (value: string) => {
    if (onYearChange) onYearChange(value);
    if (onMakeChange && make) onMakeChange("");
    if (onModelChange && model) onModelChange("");
    if (onTrimChange && displayTrim) onTrimChange("");
    // Clear availableTrims when year changes to force fresh trim fetch
    if (onTrimsUpdate) {
      onTrimsUpdate([]);
    }
  };

  // Handle make change with clearing dependents
  const handleMakeChange = (value: string) => {
    if (onMakeChange) onMakeChange(value);
    if (onModelChange && model) onModelChange("");
    if (onTrimChange && displayTrim) onTrimChange("");
    // Clear availableTrims when make changes to force fresh trim fetch
    if (onTrimsUpdate) {
      onTrimsUpdate([]);
    }
  };

  // Handle model change with clearing dependents
  const handleModelChange = (value: string) => {
    if (onModelChange) onModelChange(value);
    if (onTrimChange && displayTrim) onTrimChange("");
    // Clear availableTrims when model changes to force fresh trim fetch
    if (onTrimsUpdate) {
      onTrimsUpdate([]);
    }
  };

  // Generate year options (current year + 1 to 1990 - descending)
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;
  const minYear = 1990;
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
    const year = maxYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  const showError = (error || decodeError) && showValidation;

  return (
    <div className="space-y-3">
      {/* VIN Input */}
      <div>
        <div className="flex items-center gap-3">
          <Label htmlFor="vin" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px]">
            VIN <span className="text-red-500">*</span>
          </Label>
          <Input
            id="vin"
            name="vin"
            value={vin}
            onChange={handleVinChange}
            placeholder="Enter 17-character VIN"
            autoComplete="off"
            className={showError ? "border-red-500" : ""}
          />
          <Button
            type="button"
            onClick={startScan}
            variant="outline"
            className="px-3 md:hidden flex-shrink-0"
          >
            <Barcode className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={handleGoClick}
            className="bg-custom-blue hover:bg-custom-blue/90 text-white px-4 py-2 flex-shrink-0"
            disabled={vin.length !== 17 || isLoading}
          >
            {isLoading ? "Decoding..." : "Go"}
          </Button>
        </div>
        {showError && (
          <p className="text-red-500 text-sm ml-[92px]">
            {error || decodeError || "VIN is required"}
          </p>
        )}
      </div>

      {/* Mileage Input */}
      <div>
        <div className="flex items-center gap-3">
          <Label htmlFor="mileage" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[80px]">
            Mileage <span className="text-red-500">*</span>
          </Label>
          <Input
            id="mileage"
            name="mileage"
            type="text"
            value={formData?.mileage || ''}
            onChange={handleMileageChange}
            placeholder="35,000"
            autoComplete="off"
            className={errors?.mileage && showValidation ? "border-red-500" : ""}
          />
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded border flex-shrink-0">
            <img
              src={gaugeIcon}
              alt="Mileage gauge"
              className="w-4 h-4"
            />
          </div>
        </div>
        {errors?.mileage && showValidation && (
          <p className="text-red-500 text-sm ml-[92px]">{errors.mileage}</p>
        )}
      </div>

      {/* Dropdowns - Only show if not hidden */}
      {!hideDropdowns && (
        <div className="space-y-3">
          <DropdownField
            id="year"
            label="Year"
            value={formData?.year || ''}
            options={yearOptions}
            onChange={handleYearChange}
            error={errors?.year}
            showValidation={showValidation}
            disabled={isLoading}
            inline
          />

          <DropdownField
            id="make"
            label="Make"
            value={formData?.make || ''}
            options={availableMakes}
            onChange={handleMakeChange}
            error={errors?.make}
            showValidation={showValidation}
            disabled={isLoading || isLoadingMakes || !year}
            inline
          />

          <DropdownField
            id="model"
            label="Model"
            value={formData?.model || ''}
            options={availableModels}
            onChange={handleModelChange}
            error={errors?.model}
            showValidation={showValidation}
            disabled={isLoading || isLoadingModels || !make}
            inline
          />

          <TrimDropdown
            trims={formData?.availableTrims || []}
            selectedTrim={formData?.displayTrim || ''}
            onTrimChange={onTrimChange || (() => {})}
            error={errors?.trim}
            showValidation={showValidation}
            disabled={isLoading || isLoadingTrims || !model}
            inline
          />

          {/* Error messages for API failures */}
          {(makesError || modelsError || trimsError) && (
            <div className="text-sm text-red-500 space-y-1 mt-2">
              {makesError && <p>{makesError}</p>}
              {modelsError && <p>{modelsError}</p>}
              {trimsError && <p>{trimsError}</p>}
            </div>
          )}
        </div>
      )}

      {isScanning && (
        <ScannerModal
          videoRef={videoRef}
          onCancel={stopScan}
        />
      )}
    </div>
  );
};

export default VinSection;
