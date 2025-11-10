import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface VehicleSummaryDisplayProps {
  year: string;
  make: string;
  model: string;
  trim: string;
  exteriorColor?: string;
  interiorColor?: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  style: string;
  vin: string;
}

const VehicleSummaryDisplay = ({
  year,
  make,
  model,
  trim,
  exteriorColor = "-",
  interiorColor = "-",
  engine,
  transmission = "-",
  drivetrain,
  style,
  vin
}: VehicleSummaryDisplayProps) => {
  const handleCopyVin = async () => {
    try {
      await navigator.clipboard.writeText(vin);
      toast.success('VIN copied to clipboard');
    } catch (error) {
      console.error('Error copying VIN:', error);
      toast.error('Failed to copy VIN');
    }
  };

  // Extract style from trim if not provided (e.g., "RWD" from "Model Y RWD")
  const displayStyle = style || trim || drivetrain || "-";
  
  // Format engine display (handle electric motor)
  const displayEngine = engine || "-";
  
  // Format drivetrain display
  const displayDrivetrain = drivetrain || "-";

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">
          {year} {make} {model} {trim}
        </CardTitle>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent>
        <div className="grid gap-1.5">
          {/* EXTERIOR */}
          <div className="grid grid-cols-5 gap-1.5 py-2">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">EXTERIOR:</p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">{exteriorColor}</p>
          </div>
          <Separator />
          
          {/* INTERIOR */}
          <div className="grid grid-cols-5 gap-1.5 py-2">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">INTERIOR:</p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">{interiorColor}</p>
          </div>
          <Separator />
          
          {/* ENGINE */}
          <div className="grid grid-cols-5 gap-1.5 py-2">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">ENGINE:</p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">{displayEngine}</p>
          </div>
          <Separator />
          
          {/* TRANSMISSION */}
          <div className="grid grid-cols-5 gap-1.5 py-2">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">TRANSMISSION:</p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">{transmission}</p>
          </div>
          <Separator />
          
          {/* DRIVE TRAIN */}
          <div className="grid grid-cols-5 gap-1.5 py-2">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">DRIVE TRAIN:</p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">{displayDrivetrain}</p>
          </div>
          <Separator />
          
          {/* STYLE */}
          <div className="grid grid-cols-5 gap-1.5 py-2">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">STYLE:</p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">{displayStyle}</p>
          </div>
          <Separator />
          
          {/* VIN */}
          <div className="grid grid-cols-5 gap-1.5 py-2">
            <div className="col-span-2 flex items-center gap-2">
              <p className="text-base lg:text-base text-lg font-bold text-black">VIN:</p>
              <button
                onClick={handleCopyVin}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Copy VIN"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal break-all">{vin}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleSummaryDisplay;
