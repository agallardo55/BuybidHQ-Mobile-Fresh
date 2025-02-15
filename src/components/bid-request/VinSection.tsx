
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Barcode } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ScannerModal from "./vin-scanner/ScannerModal";
import { useVinScanner } from "./vin-scanner/useVinScanner";
import { useVinDecoder } from "./vin-scanner/useVinDecoder";

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
  const isMobile = useIsMobile();
  const { isLoading, decodeVin } = useVinDecoder(onVehicleDataFetched);
  const { isScanning, videoRef, startScan, stopScan } = useVinScanner((scannedVin) => {
    const syntheticEvent = {
      target: {
        name: 'vin',
        value: scannedVin
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    setTimeout(() => decodeVin(scannedVin), 100);
  });

  return (
    <div className="space-y-2">
      {isMobile && (
        <Button 
          type="button"
          onClick={startScan}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isScanning || isLoading}
        >
          <Barcode className="h-4 w-4 mr-2" />
          Scan VIN
        </Button>
      )}
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
          <Button 
            type="button"
            className="bg-custom-blue hover:bg-custom-blue/90 px-6"
            onClick={() => decodeVin(vin)}
            disabled={isLoading || isScanning}
          >
            {isLoading ? "Loading..." : "Go"}
          </Button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
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
