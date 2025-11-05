import React from "react";
import { vinService } from "@/services/vinService";

interface DerivedSpecsSectionProps {
  engineCylinders: string;
  transmission: string;
  drivetrain: string;
  trim?: string;
  displayTrim?: string;
  make?: string;
  model?: string;
}

const DerivedSpecsSection = ({
  engineCylinders,
  transmission,
  drivetrain,
  trim,
  displayTrim,
  make,
  model
}: DerivedSpecsSectionProps) => {
  // Determine if vehicle is electric and compute label/value
  const engine = engineCylinders || '';
  const isElectric = engine?.toLowerCase().includes('electric');
  const engineLabel = isElectric ? 'MOTOR' : 'ENGINE';
  const engineValue = isElectric
    ? vinService.extractMotorConfig(trim || displayTrim || '', engine, drivetrain, make, model)
    : engine;

  return (
    <div className="grid grid-cols-3 gap-4">
             {/* Engine/Motor */}
             <div className="space-y-0.5">
               <label className="text-sm font-medium text-gray-500 uppercase">
                 {engineLabel}
               </label>
               <div className="text-sm font-medium text-blue-600 py-1 min-h-[2rem] flex items-start">
                 {engineValue || "—"}
               </div>
             </div>

             {/* Transmission */}
             <div className="space-y-0.5">
               <label className="text-sm font-medium text-gray-500 uppercase">
                 TRANSMISSION
               </label>
               <div className="text-sm font-medium text-blue-600 py-1 min-h-[2rem] flex items-start">
                 {transmission || "—"}
               </div>
             </div>

             {/* Drivetrain */}
             <div className="space-y-0.5">
               <label className="text-sm font-medium text-gray-500 uppercase">
                 DRIVETRAIN
               </label>
               <div className="text-sm font-medium text-blue-600 py-1 min-h-[2rem] flex items-start">
                 {drivetrain || "—"}
               </div>
             </div>
    </div>
  );
};

export default DerivedSpecsSection;
