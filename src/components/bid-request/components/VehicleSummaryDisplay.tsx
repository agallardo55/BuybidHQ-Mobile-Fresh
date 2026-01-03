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
        <div className="bg-gray-100 p-4 rounded-lg space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700 whitespace-nowrap min-w-[100px]">VIN #:</span>
            <p className="text-gray-600">{displayVin()}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700 whitespace-nowrap min-w-[100px]">Mileage:</span>
            <p className="text-gray-600">{displayValue(mileage)}</p>
          </div>

          {bodyStyle && (
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-700 whitespace-nowrap min-w-[100px]">Body Style:</span>
              <p className="text-gray-600">{bodyStyle}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700 whitespace-nowrap min-w-[100px]">{engineLabel}:</span>
            <p className="text-gray-600">{displayValue(engineValue)}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700 whitespace-nowrap min-w-[100px]">Transmission:</span>
            <p className="text-gray-600">{displayValue(transmission)}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700 whitespace-nowrap min-w-[100px]">Drivetrain:</span>
            <p className="text-gray-600">{displayValue(drivetrain)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleSummaryDisplay;
