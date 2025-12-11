
import React, { useState, useEffect } from 'react';
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
  
  // Cascading dropdown state
  const [availableMakes, setAvailableMakes] = useState<Array<{ value: string; label: string }>>([]);
  const [availableModels, setAvailableModels] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingTrims, setIsLoadingTrims] = useState(false);
  
  // Track where trims came from to prevent redundant fetches
  const [trimsSource, setTrimsSource] = useState<'vin' | 'manual' | null>(null);
  
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
    if (formData?.year) {
      setIsLoadingMakes(true);
      vinService.fetchMakesByYear(formData.year)
        .then(makes => {
          const makeOptions = makes.map(make => ({ value: make, label: make }));
          
          // If formData already has a make (from VIN decode), ensure it's in the options
          if (formData.make && !makeOptions.find(m => m.value === formData.make)) {
            makeOptions.unshift({ value: formData.make, label: formData.make });
          }
          
          setAvailableMakes(makeOptions);
          setIsLoadingMakes(false);
        })
        .catch(error => {
          logger.error('Error fetching makes:', error);
          setIsLoadingMakes(false);
        });
    } else {
      setAvailableMakes([]);
    }
  }, [formData?.year, formData?.make]);

  // Load models when year and make change
  useEffect(() => {
    if (formData?.year && formData?.make) {
      setIsLoadingModels(true);
      vinService.fetchModelsByYearMake(formData.year, formData.make)
        .then(models => {
          const modelOptions = models.map(model => ({ value: model, label: model }));
          
          // If formData already has a model (from VIN decode), ensure it's in the options
          if (formData.model) {
            // Normalize VIN-decoded model by removing engine/trim suffixes
            // "DEFENDER HYBRID" → "DEFENDER"
            // "RANGE ROVER SPORT V8" → "RANGE ROVER SPORT"
            const normalizeModel = (model: string) => {
              // Remove common suffixes like HYBRID, V6, V8, etc.
              return model
                .replace(/\s+(HYBRID|PHEV|V6|V8|P\d+|SE|HSE|AUTOBIOGRAPHY).*$/i, '')
                .trim();
            };
            
            const normalizedModel = normalizeModel(formData.model);
            
            // Check if normalized model exists in options
            const exactMatch = modelOptions.find(m => m.value === normalizedModel);
            
            if (exactMatch) {
              // Use the API's model name (without VIN decoder's extra details)
              // Update formData to match dropdown
              const syntheticEvent = {
                target: { name: 'model', value: normalizedModel }
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent);
            } else if (!modelOptions.find(m => m.value === formData.model)) {
              // Model doesn't exist even after normalization, add the VIN-decoded version
              modelOptions.unshift({ value: formData.model, label: formData.model });
            }
          }
          
          setAvailableModels(modelOptions);
          setIsLoadingModels(false);
        })
        .catch(error => {
          logger.error('Error fetching models:', error);
          setIsLoadingModels(false);
        });
    } else {
      setAvailableModels([]);
    }
  }, [formData?.year, formData?.make, formData?.model]);

  // Load trims when year, make, and model change
  useEffect(() => {
    logger.debug('🔄 Trim useEffect triggered:', {
      year: formData?.year,
      make: formData?.make,
      model: formData?.model,
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
    if (formData?.year && formData?.make && formData?.model && onTrimsUpdate && !isLoadingTrims) {
      logger.debug('🚀 Fetching trims for manual selection');
      setTrimsSource('manual'); // Mark as manual fetch
      
      setIsLoadingTrims(true);
      vinService.fetchTrimsByYearMakeModel(formData.year, formData.make, formData.model)
        .then(trims => {
          logger.debug('✅ Received trims:', trims.length, 'trims');
          onTrimsUpdate(trims);
          
          // Auto-select if only one trim available
          if (trims.length === 1 && onTrimChange) {
            const singleTrim = trims[0];
            const displayValue = vinService.getDisplayTrim(singleTrim);
            logger.debug('🔍 Auto-selecting single trim:', displayValue);
            onTrimChange(displayValue);
          }
          
          setIsLoadingTrims(false);
        })
        .catch(error => {
          logger.error('❌ Error fetching trims:', error);
          setIsLoadingTrims(false);
        });
    }
  }, [formData?.year, formData?.make, formData?.model]); // CRITICAL: Only year/make/model in dependencies

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
    if (onMakeChange && formData?.make) onMakeChange("");
    if (onModelChange && formData?.model) onModelChange("");
    if (onTrimChange && formData?.displayTrim) onTrimChange("");
    // Clear availableTrims when year changes to force fresh trim fetch
    if (onTrimsUpdate) {
      onTrimsUpdate([]);
    }
  };

  // Handle make change with clearing dependents
  const handleMakeChange = (value: string) => {
    if (onMakeChange) onMakeChange(value);
    if (onModelChange && formData?.model) onModelChange("");
    if (onTrimChange && formData?.displayTrim) onTrimChange("");
    // Clear availableTrims when make changes to force fresh trim fetch
    if (onTrimsUpdate) {
      onTrimsUpdate([]);
    }
  };

  // Handle model change with clearing dependents
  const handleModelChange = (value: string) => {
    if (onModelChange) onModelChange(value);
    if (onTrimChange && formData?.displayTrim) onTrimChange("");
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
    <div className="space-y-4">
      {/* VIN Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* VIN Input */}
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="vin" className="text-sm font-medium text-gray-700">
            VIN <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
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
              className="px-3 md:hidden"
            >
              <Barcode className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={handleGoClick}
              className="bg-custom-blue hover:bg-custom-blue/90 text-white px-4 py-2"
              disabled={vin.length !== 17 || isLoading}
            >
              {isLoading ? "Decoding..." : "Go"}
            </Button>
          </div>
          {showError && (
            <p className="text-red-500 text-sm">
              {error || decodeError || "VIN is required"}
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
              type="text"
              value={formData?.mileage || ''}
              onChange={handleMileageChange}
              placeholder="35,000"
              autoComplete="off"
              className={errors?.mileage && showValidation ? "border-red-500" : ""}
            />
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded border">
              <img 
                src={gaugeIcon} 
                alt="Mileage gauge" 
                className="w-4 h-4"
              />
            </div>
          </div>
          {errors?.mileage && showValidation && (
            <p className="text-red-500 text-sm">{errors.mileage}</p>
          )}
        </div>
      </div>

      {/* Dropdowns - Only show if not hidden */}
      {!hideDropdowns && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DropdownField
            id="year"
            label="Year"
            value={formData?.year || ''}
            options={yearOptions}
            onChange={handleYearChange}
            error={errors?.year}
            showValidation={showValidation}
            disabled={isLoading}
          />

          <DropdownField
            id="make"
            label="Make"
            value={formData?.make || ''}
            options={availableMakes}
            onChange={handleMakeChange}
            error={errors?.make}
            showValidation={showValidation}
            disabled={isLoading || isLoadingMakes || !formData?.year}
          />

          <DropdownField
            id="model"
            label="Model"
            value={formData?.model || ''}
            options={availableModels}
            onChange={handleModelChange}
            error={errors?.model}
            showValidation={showValidation}
            disabled={isLoading || isLoadingModels || !formData?.make}
          />

          <TrimDropdown
            trims={formData?.availableTrims || []}
            selectedTrim={formData?.displayTrim || ''}
            onTrimChange={onTrimChange || (() => {})}
            error={errors?.trim}
            showValidation={showValidation}
            disabled={isLoading || isLoadingTrims || !formData?.model}
          />
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
