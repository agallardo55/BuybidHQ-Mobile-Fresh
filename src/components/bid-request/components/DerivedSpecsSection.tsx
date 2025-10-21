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
             <div className="space-y-0.5">
               <label className="text-sm font-medium text-gray-500 uppercase">
                 ENGINE
               </label>
               <div className="text-sm font-medium text-blue-600 py-1 min-h-[2rem] flex items-start">
                 {engineCylinders || "—"}
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
