import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { vinService } from "@/services/vinService";

interface VehicleSummaryDisplayProps {
  year: string;
  make: string;
  model: string;
  trim: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  vin: string;
  mileage?: string;
  bodyStyle?: string;
  onEdit: () => void;
}

const VehicleSummaryDisplay = ({
  year,
  make,
  model,
  trim,
  engine,
  transmission,
  drivetrain,
  vin,
  mileage,
  bodyStyle,
  onEdit
}: VehicleSummaryDisplayProps) => {
  // ✅ FIX 4: Don't treat hybrids as pure electric (check for "electric" but not "hybrid" or "gas/electric")
  const isPureElectric = engine?.toLowerCase().includes('electric') && 
                         !engine?.toLowerCase().includes('hybrid') &&
                         !engine?.toLowerCase().includes('gas');
  const engineLabel = isPureElectric ? 'Motor' : 'Engine';
  const engineValue = isPureElectric
    ? vinService.extractMotorConfig(trim || '', engine, drivetrain, make, model)
    : engine;

  // ✅ FIX 1: VIN display logic - show "Not available" when empty (manual dropdown flow)
  const displayVin = () => {
    if (!vin || vin.trim() === '') return "Not available";
    return vin;
  };

  // Other fields show "Not available" if empty
  const displayValue = (value: string | undefined) => {
    if (value === undefined || value === null || value.trim() === '') return "Not available";
    return value;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-2xl">
            {year} {make} {model} {trim}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
            title="Edit vehicle details"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <Separator className="mb-3" />
      <CardContent className="pt-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <span className="font-medium text-gray-700">VIN #:</span>
              <p className="text-gray-600 mt-1">{displayVin()}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Mileage:</span>
              <p className="text-gray-600 mt-1">{displayValue(mileage)}</p>
            </div>
            
            {bodyStyle ? (
              <div>
                <span className="font-medium text-gray-700">Body Style:</span>
                <p className="text-gray-600 mt-1">{bodyStyle}</p>
              </div>
            ) : null}
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">{engineLabel}:</span>
              <p className="text-gray-600 mt-1">{displayValue(engineValue)}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Transmission:</span>
              <p className="text-gray-600 mt-1">{displayValue(transmission)}</p>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Drivetrain:</span>
              <p className="text-gray-600 mt-1">{displayValue(drivetrain)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleSummaryDisplay;
