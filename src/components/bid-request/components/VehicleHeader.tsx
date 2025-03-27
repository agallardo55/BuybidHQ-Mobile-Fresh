
import React from "react";

interface VehicleHeaderProps {
  year: string;
  make: string;
  model: string;
  trim: string;
  vin: string;
}

const VehicleHeader: React.FC<VehicleHeaderProps> = ({ 
  year, 
  make, 
  model, 
  trim, 
  vin 
}) => {
  return (
    <>
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-semibold">
          {year} {make} {model}
        </h2>
        <span className="inline-block bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm font-medium">
          {trim}
        </span>
      </div>
      
      <p className="text-gray-700 mt-2">VIN: {vin}</p>
    </>
  );
};

export default VehicleHeader;
