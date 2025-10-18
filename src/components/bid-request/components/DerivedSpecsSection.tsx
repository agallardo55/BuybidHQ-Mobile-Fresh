import React from "react";

interface DerivedSpecsSectionProps {
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
}

const DerivedSpecsSection = ({
  engineCylinders,
  transmission,
  drivetrain
}: DerivedSpecsSectionProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Engine */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          ENGINE
        </label>
        <div className="text-lg font-semibold text-blue-600 bg-gray-50 p-3 rounded border min-h-[3rem] flex items-center">
          {engineCylinders || "—"}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          TRANSMISSION
        </label>
        <div className="text-lg font-semibold text-blue-600 bg-gray-50 p-3 rounded border min-h-[3rem] flex items-center">
          {transmission || "—"}
        </div>
      </div>

      {/* Drivetrain */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          DRIVETRAIN
        </label>
        <div className="text-lg font-semibold text-blue-600 bg-gray-50 p-3 rounded border min-h-[3rem] flex items-center">
          {drivetrain || "—"}
        </div>
      </div>
    </div>
  );
};

export default DerivedSpecsSection;
