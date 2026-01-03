import React from "react";
import { Circle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuadrantData {
  frontLeft: number | null;
  frontRight: number | null;
  rearLeft: number | null;
  rearRight: number | null;
}

interface BrakesAndTiresSectionProps {
  brakesData: QuadrantData;
  tiresData: QuadrantData;
  onBrakesChange: (data: QuadrantData) => void;
  onTiresChange: (data: QuadrantData) => void;
}

// Measurement ranges for brakes (in mm)
const BRAKE_RANGES = [
  { label: "≥8", value: 8, color: "green" },
  { label: "5-7", value: 6, color: "yellow" },
  { label: "3-4", value: 3.5, color: "orange" },
  { label: "0-2", value: 1, color: "red" },
];

// Measurement ranges for tires (in 32nds of an inch)
const TIRE_RANGES = [
  { label: "8-10", value: 9, color: "green" },
  { label: "5-7", value: 6, color: "yellow" },
  { label: "3-4", value: 3.5, color: "orange" },
  { label: "0-2", value: 1, color: "red" },
];

const BrakesAndTiresSection = ({
  brakesData,
  tiresData,
  onBrakesChange,
  onTiresChange,
}: BrakesAndTiresSectionProps) => {
  // Get label for selected brake value
  const getBrakeLabel = (value: number | null): string => {
    if (value === null) return "Select";
    const range = BRAKE_RANGES.find((r) => r.value === value);
    return range ? range.label : "Select";
  };

  // Get label for selected tire value
  const getTireLabel = (value: number | null): string => {
    if (value === null) return "Select";
    const range = TIRE_RANGES.find((r) => r.value === value);
    return range ? range.label : "Select";
  };

  // Get color for selected brake value
  const getBrakeColor = (value: number | null): string => {
    if (value === null) return "gray";
    const range = BRAKE_RANGES.find((r) => r.value === value);
    return range ? range.color : "gray";
  };

  // Get color for selected tire value
  const getTireColor = (value: number | null): string => {
    if (value === null) return "gray";
    const range = TIRE_RANGES.find((r) => r.value === value);
    return range ? range.color : "gray";
  };

  // Get button classes based on color
  const getButtonClasses = (color: string) => {
    const baseClasses = "px-3 py-1.5 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1.5 min-w-[90px]";

    if (color === "green") {
      return cn(baseClasses, "bg-green-100 text-green-700 border border-green-300");
    } else if (color === "yellow") {
      return cn(baseClasses, "bg-yellow-100 text-yellow-700 border border-yellow-300");
    } else if (color === "orange") {
      return cn(baseClasses, "bg-orange-100 text-orange-700 border border-orange-300");
    } else if (color === "red") {
      return cn(baseClasses, "bg-red-100 text-red-700 border border-red-300");
    } else {
      return cn(baseClasses, "bg-blue-500 hover:bg-blue-600 text-white border border-blue-600");
    }
  };

  // Render brake pad dropdown for a position
  const renderBrakeDropdown = (position: keyof QuadrantData) => {
    const currentValue = brakesData[position];
    const label = getBrakeLabel(currentValue);
    const color = getBrakeColor(currentValue);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={getButtonClasses(color)}
          >
            <span>{label === "Select" ? label : `${label}MM`}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {BRAKE_RANGES.map((range) => (
            <DropdownMenuItem
              key={range.label}
              onClick={() => onBrakesChange({ ...brakesData, [position]: range.value })}
              className={cn(
                "cursor-pointer font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900",
                currentValue === range.value && "bg-gray-200 hover:bg-gray-200"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    range.color === "green" && "bg-green-500",
                    range.color === "yellow" && "bg-yellow-500",
                    range.color === "orange" && "bg-orange-500",
                    range.color === "red" && "bg-red-500"
                  )}
                />
                <span>{range.label} mm</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Render tire tread dropdown for a position
  const renderTireDropdown = (position: keyof QuadrantData) => {
    const currentValue = tiresData[position];
    const label = getTireLabel(currentValue);
    const color = getTireColor(currentValue);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={getButtonClasses(color)}
          >
            <span>{label === "Select" ? label : `${label}/32"`}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          {TIRE_RANGES.map((range) => (
            <DropdownMenuItem
              key={range.label}
              onClick={() => onTiresChange({ ...tiresData, [position]: range.value })}
              className={cn(
                "cursor-pointer font-medium text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900",
                currentValue === range.value && "bg-gray-200 hover:bg-gray-200"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    range.color === "green" && "bg-green-500",
                    range.color === "yellow" && "bg-yellow-500",
                    range.color === "orange" && "bg-orange-500",
                    range.color === "red" && "bg-red-500"
                  )}
                />
                <span>{range.label}/32"</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Render a quadrant cell
  const renderQuadrantCell = (
    position: keyof QuadrantData,
    label: string,
    type: "brake" | "tire"
  ) => {
    return (
      <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center gap-3 min-h-[120px]">
        <div className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </div>
        {type === "brake" ? renderBrakeDropdown(position) : renderTireDropdown(position)}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Tires & Brakes</h2>
      </div>

      {/* Tires and Brakes Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Tires Condition Section */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border-2 border-gray-200">
          <h3 className="text-sm sm:text-base font-bold text-gray-400 uppercase tracking-wider mb-4">
            Tires Condition
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {renderQuadrantCell("frontLeft", "Front Left", "tire")}
            {renderQuadrantCell("frontRight", "Front Right", "tire")}
            {renderQuadrantCell("rearLeft", "Rear Left", "tire")}
            {renderQuadrantCell("rearRight", "Rear Right", "tire")}
          </div>
        </div>

        {/* Brakes Condition Section */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border-2 border-gray-200">
          <h3 className="text-sm sm:text-base font-bold text-gray-400 uppercase tracking-wider mb-4">
            Brakes Condition
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {renderQuadrantCell("frontLeft", "Front Left", "brake")}
            {renderQuadrantCell("frontRight", "Front Right", "brake")}
            {renderQuadrantCell("rearLeft", "Rear Left", "brake")}
            {renderQuadrantCell("rearRight", "Rear Right", "brake")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrakesAndTiresSection;
