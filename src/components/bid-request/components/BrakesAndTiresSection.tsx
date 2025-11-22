import React, { useState, useCallback } from "react";
import { Circle, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getBrakeRanges,
  getTireRanges,
  getRangeFromMeasurement,
  MeasurementRange,
} from "../utils/measurementUtils";

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

const BrakesAndTiresSection = ({
  brakesData,
  tiresData,
  onBrakesChange,
  onTiresChange,
}: BrakesAndTiresSectionProps) => {
  const [copyAnimation, setCopyAnimation] = useState(false);

  // Computed values for checkmarks (re-compute on every render)
  const showBrakesCheck = Object.values(brakesData).every((v) => v === 8);
  const showTiresCheck = Object.values(tiresData).every((v) => v === 9);

  // Get status color classes
  const getStatusColor = (color: "green" | "yellow" | "orange" | "red") => {
    switch (color) {
      case "green":
        return {
          active: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
          inactive: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
        };
      case "yellow":
        return {
          active: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200",
          inactive: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
        };
      case "orange":
        return {
          active: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200",
          inactive: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
        };
      case "red":
        return {
          active: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
          inactive: "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
        };
    }
  };

  // Handle brake chip click
  const handleBrakeChipClick = useCallback(
    (position: keyof QuadrantData, range: MeasurementRange) => {
      const currentRange = getRangeFromMeasurement(brakesData[position], "brake");
      const newValue =
        currentRange?.color === range.color ? null : range.representativeValue;
      onBrakesChange({ ...brakesData, [position]: newValue });
    },
    [brakesData, onBrakesChange]
  );

  // Handle tire chip click
  const handleTireChipClick = useCallback(
    (position: keyof QuadrantData, range: MeasurementRange) => {
      const currentRange = getRangeFromMeasurement(tiresData[position], "tire");
      const newValue =
        currentRange?.color === range.color ? null : range.representativeValue;
      onTiresChange({ ...tiresData, [position]: newValue });
    },
    [tiresData, onTiresChange]
  );

  // Global action handlers
  const handleAllBrakesOptimal = useCallback(() => {
    onBrakesChange({
      frontLeft: 8,
      frontRight: 8,
      rearLeft: 8,
      rearRight: 8,
    });
  }, [onBrakesChange]);

  const handleAllTiresOptimal = useCallback(() => {
    onTiresChange({
      frontLeft: 9,
      frontRight: 9,
      rearLeft: 9,
      rearRight: 9,
    });
  }, [onTiresChange]);

  const handleCopyFrontToRear = useCallback(() => {
    onBrakesChange({
      ...brakesData,
      rearLeft: brakesData.frontLeft,
      rearRight: brakesData.frontRight,
    });
    onTiresChange({
      ...tiresData,
      rearLeft: tiresData.frontLeft,
      rearRight: tiresData.frontRight,
    });
    // Trigger animation
    setCopyAnimation(true);
    setTimeout(() => setCopyAnimation(false), 600);
  }, [brakesData, tiresData, onBrakesChange, onTiresChange]);

  const handleClear = useCallback(() => {
    onBrakesChange({
      frontLeft: null,
      frontRight: null,
      rearLeft: null,
      rearRight: null,
    });
    onTiresChange({
      frontLeft: null,
      frontRight: null,
      rearLeft: null,
      rearRight: null,
    });
  }, [onBrakesChange, onTiresChange]);

  // Check for mismatch warnings (brake set but tire null, or vice versa)
  const hasMismatch = useCallback(
    (position: keyof QuadrantData) => {
      const hasBrake = brakesData[position] !== null;
      const hasTire = tiresData[position] !== null;
      return hasBrake !== hasTire; // One is set, other is not
    },
    [brakesData, tiresData]
  );

  // Render chip for a measurement range
  const renderChip = (
    range: MeasurementRange,
    isSelected: boolean,
    onClick: () => void,
    ariaLabel: string
  ) => {
    const colors = getStatusColor(range.color);
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "h-9 w-full px-2.5 py-1.5 rounded-md border-2 text-sm font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
          "text-center flex items-center justify-center",
          isSelected ? colors.active : colors.inactive
        )}
        aria-label={ariaLabel}
        aria-pressed={isSelected}
      >
        {range.displayText}
      </button>
    );
  };

  // Render wheel card
  const renderWheelCard = (
    position: keyof QuadrantData,
    positionLabel: string
  ) => {
    const brakeRanges = getBrakeRanges();
    const tireRanges = getTireRanges();
    const selectedBrakeRange = getRangeFromMeasurement(
      brakesData[position],
      "brake"
    );
    const selectedTireRange = getRangeFromMeasurement(
      tiresData[position],
      "tire"
    );
    const showWarning = hasMismatch(position);
    const isRear = position === "rearLeft" || position === "rearRight";

    return (
      <div
        className={cn(
          "bg-white rounded-lg p-3 sm:p-4 md:p-5 border-2 transition-all",
          "space-y-2 sm:space-y-3",
          showWarning && "border-yellow-400",
          !showWarning && "border-gray-200",
          isRear && copyAnimation && "copy-pulse-animation"
        )}
      >
        <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{positionLabel}</h3>

        {/* Brake Pad Section */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm font-bold text-gray-700">BRAKE PAD</span>
            <span className="text-xs text-gray-500">(mm)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {brakeRanges.map((range) => {
              const isSelected = selectedBrakeRange?.color === range.color;
              const ariaLabel = `Brake pad ${range.displayText} millimeters${
                range.color === "green" ? " or greater" : ""
              }`;
              return renderChip(
                range,
                isSelected,
                () => handleBrakeChipClick(position, range),
                ariaLabel
              );
            })}
          </div>
        </div>

        {/* Tire Tread Section */}
        <div>
          <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
            <span className="text-xs sm:text-sm font-bold text-gray-700">TIRE TREAD</span>
            <span className="text-xs text-gray-500">(32nds)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {tireRanges.map((range) => {
              const isSelected = selectedTireRange?.color === range.color;
              const ariaLabel = `Tire tread ${range.displayText} thirty-seconds of an inch`;
              return renderChip(
                range,
                isSelected,
                () => handleTireChipClick(position, range),
                ariaLabel
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Brakes & Tires</h2>
      </div>

      {/* Global Action Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleAllBrakesOptimal}
          className={cn(
            "h-10 px-3 py-2 rounded-md border text-sm font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
            "flex-1 min-w-[140px] sm:flex-initial",
            "inline-flex items-center justify-center",
            showBrakesCheck
              ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          )}
          aria-pressed={showBrakesCheck}
        >
          {showBrakesCheck ? "✓ " : ""}All Brakes ≥8mm
        </button>
        <button
          type="button"
          onClick={handleAllTiresOptimal}
          className={cn(
            "h-10 px-3 py-2 rounded-md border text-sm font-medium transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
            "flex-1 min-w-[140px] sm:flex-initial",
            "inline-flex items-center justify-center",
            showTiresCheck
              ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          )}
          aria-pressed={showTiresCheck}
        >
          {showTiresCheck ? "✓ " : ""}All Tires 8-10/32"
        </button>
        <button
          type="button"
          onClick={handleCopyFrontToRear}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 flex-1 min-w-[140px] sm:flex-initial inline-flex items-center justify-center gap-1.5"
        >
          <Copy className="h-4 w-4" />
          Copy Front→Rear
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 flex-1 min-w-[140px] sm:flex-initial inline-flex items-center justify-center gap-1.5"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Wheel Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
        {renderWheelCard("frontLeft", "Front Left")}
        {renderWheelCard("frontRight", "Front Right")}
        {renderWheelCard("rearLeft", "Rear Left")}
        {renderWheelCard("rearRight", "Rear Right")}
      </div>
    </div>
  );
};

export default BrakesAndTiresSection;

