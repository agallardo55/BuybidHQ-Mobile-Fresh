
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { BrowserMultiFormatReader, Result } from '@zxing/library';

interface VinSectionProps {
  vin: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  onVehicleDataFetched?: (data: {
    year: string;
    make: string;
    model: string;
    trim: string;
    engineCylinders: string;
    transmission: string;
    drivetrain: string;
  }) => void;
}

const VinSection = ({ vin, onChange, error, onVehicleDataFetched }: VinSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader>();
  const isMobile = useIsMobile();

  const handleDecodeVin = async () => {
    if (vin.length !== 17) {
      toast.error("Please enter a valid 17-character VIN");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('decode-vin', {
        body: { vin }
      });

      if (functionError) throw functionError;

      if (data.error) {
        if (data.error === 'VIN not found') {
          toast.info(data.message || "VIN not found. Please enter vehicle details manually.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      const vehicleData = {
        year: data.year || "",
        make: data.make || "",
        model: data.model || "",
        trim: data.trim || "",
        engineCylinders: data.engineCylinders || "",
        transmission: data.transmission || "",
        drivetrain: data.drivetrain || "",
      };

      onVehicleDataFetched?.(vehicleData);
      toast.success("Vehicle information retrieved successfully");
    } catch (error) {
      console.error('Error decoding VIN:', error);
      const errorMessage = error.message?.includes('404') 
        ? "VIN not found. Please enter vehicle details manually."
        : "Failed to decode VIN. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startScan = async () => {
    try {
      setIsScanning(true);
      
      // Initialize the code reader if not already done
      if (!codeReader.current) {
        codeReader.current = new BrowserMultiFormatReader();
      }

      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start continuous scanning
      const result = await codeReader.current.decodeFromVideoElement(videoRef.current!);
      
      if (result) {
        handleScannedResult(result);
      }
    } catch (error) {
      console.error('Scanning error:', error);
      toast.error("Failed to start scanner. Please check camera permissions.");
      stopScan();
    }
  };

  const handleScannedResult = (result: Result) => {
    const scannedVin = result.getText();
    
    // Create a synthetic event to update the input
    const syntheticEvent = {
      target: {
        name: 'vin',
        value: scannedVin
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    stopScan();
    
    // Automatically trigger VIN decode after successful scan
    setTimeout(() => {
      handleDecodeVin();
    }, 100);
  };

  const stopScan = async () => {
    setIsScanning(false);
    
    if (codeReader.current) {
      codeReader.current.reset();
    }

    // Stop all video streams
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div>
      <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
        VIN <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2">
        <Input
          id="vin"
          name="vin"
          type="text"
          value={vin}
          onChange={onChange}
          required
          placeholder="1HGCM82633A123456"
          className={`${error ? "border-red-500" : ""} focus:ring-1 focus:ring-offset-0`}
          maxLength={17}
        />
        {isMobile && (
          <Button 
            type="button"
            onClick={startScan}
            className="bg-custom-blue hover:bg-custom-blue/90"
            disabled={isScanning || isLoading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Scan
          </Button>
        )}
        <Button 
          type="button"
          className="bg-custom-blue hover:bg-custom-blue/90 px-6"
          onClick={handleDecodeVin}
          disabled={isLoading || isScanning}
        >
          {isLoading ? "Loading..." : "Go"}
        </Button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      {isScanning && (
        <div className="fixed inset-0 bg-black/80 z-50">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <video 
              ref={videoRef}
              className="max-w-full max-h-[70vh] mb-4"
              autoPlay
              playsInline
            />
            <div className="text-white text-center">
              <p className="mb-4">Position the barcode in the center of the screen</p>
              <Button 
                onClick={stopScan}
                variant="outline"
                className="bg-white text-black hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VinSection;
