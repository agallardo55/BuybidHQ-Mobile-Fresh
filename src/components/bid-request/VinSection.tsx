
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Barcode, Pencil, Check, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ScannerModal from "./vin-scanner/ScannerModal";
import { useVinScanner } from "./vin-scanner/useVinScanner";
import { useVinDecoder } from "@/hooks/useVinDecoder";
import { VehicleData, TrimOption } from "@/services/vinService";

interface VinSectionProps {
  vin: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  onVehicleDataFetched?: (data: VehicleData) => void;
  showValidation?: boolean;
  onEditManually?: () => void; // Add callback for manual edit
}

const VinSection = ({ vin, onChange, error, onVehicleDataFetched, showValidation, onEditManually }: VinSectionProps) => {
  const isMobile = useIsMobile();
  
  const { 
    vehicleData, 
    availableTrims, 
    selectedTrim, 
    isLoading, 
    error: decodeError,
    decodeVin, 
    setSelectedTrim 
  } = useVinDecoder();
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedYear, setEditedYear] = useState('');
  const [editedMake, setEditedMake] = useState('');
  const [editedModel, setEditedModel] = useState('');
  const [editedTrim, setEditedTrim] = useState('');
  
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
    console.log('🔄 VinSection useEffect triggered:', {
      hasVehicleData: !!vehicleData,
      hasCallback: !!onVehicleDataFetched,
      vehicleDataKeys: vehicleData ? Object.keys(vehicleData) : [],
    });
    
    if (vehicleData && onVehicleDataFetched) {
      console.log('📦 VinSection calling onVehicleDataFetched with:', vehicleData);
      onVehicleDataFetched(vehicleData);
    }
  }, [vehicleData]); // Only depend on vehicleData, not the callback

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  const handleGoClick = () => {
    if (vin && vin.length === 17) {
      decodeVin(vin);
    }
  };

  // Edit mode handlers
  const handleEditClick = () => {
    // Initialize edit state with current values
    setEditedYear(vehicleData?.year || '');
    setEditedMake(vehicleData?.make || '');
    setEditedModel(vehicleData?.model || '');
    setEditedTrim(selectedTrim?.name || '');
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    // Save changes to formData via onChange
    const changes = [
      { name: 'year', value: editedYear },
      { name: 'make', value: editedMake },
      { name: 'model', value: editedModel },
      { name: 'trim', value: editedTrim },
    ];
    
    // Apply changes one by one
    changes.forEach(({ name, value }) => {
      const syntheticEvent = {
        target: { name, value }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    });
    
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    // Revert changes
    setIsEditMode(false);
  };

  // Handle trim change in edit mode
  const handleTrimChange = (trimName: string) => {
    const newTrim = trimOptions.find(t => t.name === trimName);
    
    console.log('🔧 Trim changed:', {
      newTrimName: trimName,
      newTrim: newTrim,
      engine: newTrim?.specs?.engine,
      transmission: newTrim?.specs?.transmission,
      drivetrain: newTrim?.specs?.drivetrain,
    });
    
    setEditedTrim(trimName);
    setSelectedTrim(newTrim || null);
  };

  // Generate dropdown options for inline editing
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) => {
    const year = currentYear - 10 + i;
    return year.toString();
  });

  const makeOptions = [
    "LAND ROVER", "PORSCHE", "MCLAREN", "ROLLS-ROYCE", "BMW", "MERCEDES-BENZ", 
    "AUDI", "LEXUS", "TOYOTA", "HONDA", "FORD", "CHEVROLET", "NISSAN", 
    "HYUNDAI", "KIA", "MAZDA", "SUBARU", "VOLKSWAGEN", "VOLVO", "JAGUAR", 
    "INFINITI", "ACURA", "GENESIS", "LINCOLN", "CADILLAC", "BUICK", 
    "CHRYSLER", "DODGE", "JEEP", "RAM", "GMC", "ALFA ROMEO", "MASERATI", 
    "BENTLEY", "ASTON MARTIN", "FERRARI", "LAMBORGHINI", "BUGATTI", 
    "KOENIGSEGG", "PAGANI"
  ];

  const modelOptions = availableTrims?.length > 0 ? 
    [{ value: vehicleData?.model || '', label: vehicleData?.model || '' }] : 
    [];

  const trimOptions = availableTrims || [];

  const showError = (error || decodeError) && showValidation;

  return (
    <div className="space-y-4">
      {/* VIN Input Section */}
      <div className="space-y-2">
        {isMobile && (
          <div className="space-y-2">
            <Button 
              type="button"
              onClick={startScan}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isScanning || isLoading}
            >
              <Barcode className="h-4 w-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Scan VIN'}
            </Button>
            {isScanning && (
              <p className="text-xs text-gray-500 text-center">
                Hold device steady and position barcode in center of screen
              </p>
            )}
          </div>
        )}
        
        <div>
          <Label htmlFor="vin">
            VIN
          </Label>
          <div className="flex gap-2">
            <Input
              id="vin"
              name="vin"
              type="text"
              value={vin}
              onChange={handleVinChange}
              required={false}
              placeholder="1HGCM82633A123456"
              className={`${showError ? "border-red-500" : ""} focus:ring-1 focus:ring-offset-0`}
              maxLength={17}
            />
            <Button 
              type="button"
              className="bg-custom-blue hover:bg-custom-blue/90 px-6"
              onClick={handleGoClick}
              disabled={isLoading || isScanning}
            >
              {isLoading ? "Loading..." : "Go"}
            </Button>
          </div>
          {showError && (
            <p className="text-red-500 text-sm mt-1">{error || decodeError}</p>
          )}
        </div>
      </div>

      {/* Vehicle Data Display */}
      {vehicleData && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          {/* Header with title and edit/save buttons */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
            
            {!isEditMode ? (
              /* Edit button */
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                className="h-8 w-8"
                title="Edit vehicle information"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              /* Save/Cancel buttons */
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-7 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveEdit}
                  className="h-7 px-2 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {/* Year Field */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Year:</span>
              {!isEditMode ? (
                <span className="text-sm">{vehicleData?.year || 'N/A'}</span>
              ) : (
                <Select
                  value={editedYear}
                  onValueChange={setEditedYear}
                >
                  <SelectTrigger className="h-6 w-20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {/* Make Field */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Make:</span>
              {!isEditMode ? (
                <span className="text-sm">{vehicleData?.make || 'N/A'}</span>
              ) : (
                <Select
                  value={editedMake}
                  onValueChange={setEditedMake}
                >
                  <SelectTrigger className="h-6 min-w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {makeOptions.map(make => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {/* Model Field */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Model:</span>
              {!isEditMode ? (
                <span className="text-sm">{vehicleData?.model || 'N/A'}</span>
              ) : (
                <Select
                  value={editedModel}
                  onValueChange={setEditedModel}
                >
                  <SelectTrigger className="h-6 min-w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map(model => (
                      <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {/* Trim Field */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Trim:</span>
              {!isEditMode ? (
                <span className="text-sm">{selectedTrim?.name || 'N/A'}</span>
              ) : (
                <Select
                  value={editedTrim}
                  onValueChange={handleTrimChange}
                >
                  <SelectTrigger className="h-6 min-w-[160px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trimOptions.map(trim => (
                      <SelectItem key={trim.id || trim.name} value={trim.name}>
                        {trim.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {/* Engine - Dynamic from selected trim */}
            {(selectedTrim?.specs?.engine || vehicleData?.engineCylinders) && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Engine:</span>
                <span className="text-sm text-gray-600">
                  {selectedTrim?.specs?.engine || vehicleData?.engineCylinders || 'N/A'}
                </span>
              </div>
            )}
            
            {/* Transmission - Dynamic from selected trim */}
            {(selectedTrim?.specs?.transmission || vehicleData?.transmission) && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Transmission:</span>
                <span className="text-sm text-gray-600">
                  {selectedTrim?.specs?.transmission || vehicleData?.transmission || 'N/A'}
                </span>
              </div>
            )}
            
            {/* Drivetrain - Dynamic from selected trim */}
            {(selectedTrim?.specs?.drivetrain || vehicleData?.drivetrain) && (
              <div className="flex items-center gap-2 col-span-2">
                <span className="font-medium text-sm">Drivetrain:</span>
                <span className="text-sm text-gray-600">
                  {selectedTrim?.specs?.drivetrain || vehicleData?.drivetrain || 'N/A'}
                </span>
              </div>
            )}
          </div>
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
