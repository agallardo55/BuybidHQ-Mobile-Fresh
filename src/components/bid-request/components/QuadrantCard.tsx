import React from "react";
import { cn } from "@/lib/utils";
import { getTireRanges, getBrakeRanges, getRangeFromMeasurement, MeasurementRange } from "../utils/measurementUtils";

interface QuadrantCardProps {
  position: string;
  measurement: number | null;
  measurementType: "tire" | "brake";
  onMeasurementChange: (value: number | null) => void;
}

const QuadrantCard = ({ position, measurement, measurementType, onMeasurementChange }: QuadrantCardProps) => {
  // Get ranges based on measurement type
  const ranges: MeasurementRange[] = measurementType === "tire" ? getTireRanges() : getBrakeRanges();
  
  // Get current selected range
  const selectedRange = getRangeFromMeasurement(measurement, measurementType);

  // Get status color classes
  const getStatusColor = (color: "green" | "yellow" | "orange" | "red") => {
    switch (color) {
      case "green":
        return {
          active: "bg-green-600 text-white border-green-700",
          inactive: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
        };
      case "yellow":
        return {
          active: "bg-yellow-600 text-white border-yellow-700",
          inactive: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200"
        };
      case "orange":
        return {
          active: "bg-orange-600 text-white border-orange-700",
          inactive: "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
        };
      case "red":
        return {
          active: "bg-red-600 text-white border-red-700",
          inactive: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
        };
    }
  };

  // Handle badge click
  const handleBadgeClick = (range: MeasurementRange) => {
    // If clicking the same range, deselect (set to null)
    if (selectedRange?.color === range.color) {
      onMeasurementChange(null);
    } else {
      // Select the range (set to representative value)
      onMeasurementChange(range.representativeValue);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      {/* Position Title */}
      <h3 className="font-semibold text-base mb-3">{position}</h3>
      
      {/* Range Badges */}
      <div className="flex flex-wrap gap-2">
        {ranges.map((range) => {
          const isSelected = selectedRange?.color === range.color;
          const colors = getStatusColor(range.color);
          
          return (
            <button
              key={range.color}
              type="button"
              onClick={() => handleBadgeClick(range)}
              className={cn(
                "px-3 py-2 rounded-full cursor-pointer transition-colors border text-sm font-medium",
                isSelected ? colors.active : colors.inactive
              )}
            >
              {range.displayText}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuadrantCard;
