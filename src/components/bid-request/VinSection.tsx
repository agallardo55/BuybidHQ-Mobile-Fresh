
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Barcode, Pencil } from "lucide-react";
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

  const handleTrimChange = (trimValue: string) => {
    const trim = availableTrims.find(
      t => t.id?.toString() === trimValue || t.name === trimValue
    );
    
    if (trim) {
      setSelectedTrim(trim);
      
      if (vehicleData) {
        const updatedVehicleData: VehicleData = {
          ...vehicleData,
          trim: trim.name,
          displayTrim: trim.name,
          engineCylinders: trim.specs?.engine || vehicleData.engineCylinders,
          transmission: trim.specs?.transmission || vehicleData.transmission,
          drivetrain: trim.specs?.drivetrain || vehicleData.drivetrain
        };
        onVehicleDataFetched?.(updatedVehicleData);
      }
    }
  };

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
          {/* Header with title and edit icon */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
            
            {/* Compact edit icon button in top-right */}
            {onEditManually && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEditManually}
                className="h-8 w-8"
                title="Edit vehicle information manually"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="font-medium">Year:</span> {vehicleData?.year || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Make:</span> {vehicleData?.make || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Model:</span> {vehicleData?.model || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Trim:</span> {selectedTrim?.name || 'Select from dropdown'}
            </div>
            {vehicleData?.engineCylinders && (
              <div>
                <span className="font-medium">Engine:</span> {vehicleData.engineCylinders}
              </div>
            )}
            {vehicleData?.transmission && (
              <div>
                <span className="font-medium">Transmission:</span> {vehicleData.transmission}
              </div>
            )}
            {vehicleData?.drivetrain && (
              <div>
                <span className="font-medium">Drivetrain:</span> {vehicleData.drivetrain}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trim Selection */}
      {availableTrims.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="trim-select">
            Trim Level
            {!selectedTrim && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          {/* Show match status */}
          {selectedTrim ? (
            <p className="text-sm text-green-600 mb-2">
              ✓ Automatically matched trim based on VIN data
            </p>
          ) : (
            <p className="text-sm text-amber-600 mb-2">
              ⚠ Multiple trims match this VIN. Please select the correct one for your vehicle.
            </p>
          )}
          
          <Select
            value={selectedTrim?.id?.toString() || selectedTrim?.name || ""}
            onValueChange={handleTrimChange}
          >
            <SelectTrigger id="trim-select" className="w-full">
              <SelectValue placeholder="Select trim level..." />
            </SelectTrigger>
            <SelectContent>
              {availableTrims.map((trim, index) => {
                const uniqueKey = trim.id?.toString() || trim.name;
                const isSelected = selectedTrim?.name === trim.name;
                
                return (
                  <SelectItem key={uniqueKey} value={uniqueKey}>
                    <div className="flex flex-col">
                      <span className={`font-medium ${isSelected ? 'text-green-600' : ''}`}>
                        {trim.name}
                        {isSelected && ' ✓'}
                      </span>
                      {trim.description && (
                        <span className="text-xs text-gray-500">
                          {trim.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Single Trim Display */}
      {availableTrims.length === 1 && (
        <div className="space-y-2">
          <Label>Trim Level</Label>
          <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-gray-50">
            <span className="font-medium">{availableTrims[0].name}</span>
            {availableTrims[0].description && (
              <span className="ml-2 text-sm text-gray-500">
                - {availableTrims[0].description}
              </span>
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
