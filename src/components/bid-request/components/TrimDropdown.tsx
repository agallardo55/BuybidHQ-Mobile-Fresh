
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrimOption } from "../types";
import { deduplicateTrims } from "../utils/trimUtils";
import { vinService } from "@/services/vinService";

interface TrimDropdownProps {
  trims: TrimOption[];
  selectedTrim: string;
  onTrimChange: (value: string) => void;
  error?: string;
  showValidation?: boolean;
}

const TrimDropdown = ({ 
  trims, 
  selectedTrim, 
  onTrimChange, 
  error, 
  showValidation 
}: TrimDropdownProps) => {
  const uniqueTrims = deduplicateTrims(trims);

  return (
    <div>
      <label htmlFor="trim" className="block text-sm font-medium text-gray-700 mb-1">
        Trim <span className="text-red-500">*</span>
      </label>
      <Select
        value={selectedTrim || ''} 
        onValueChange={onTrimChange}
        name="trim"
      >
        <SelectTrigger 
          id="trim"
          name="trim"
          className={`w-full bg-white hover:bg-gray-50 transition-colors [&>span]:!line-clamp-none ${error && showValidation ? "border-red-500" : ""}`}
        >
          <SelectValue placeholder="Select Trim" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {uniqueTrims && uniqueTrims.length > 0 ? (
            uniqueTrims
              .filter(trim => {
                const displayValue = vinService.getDisplayTrim(trim);
                return displayValue && displayValue.trim() !== '';
              })
              .map((trim, index) => {
                const displayValue = vinService.getDisplayTrim(trim);
                return (
                  <SelectItem 
                    key={`${displayValue}-${index}`} 
                    value={displayValue}
                    className="hover:bg-gray-100 focus:bg-gray-100 data-[highlighted]:!bg-gray-100 data-[highlighted]:!text-gray-900 transition-colors cursor-pointer"
                  >
                    <div className="w-full whitespace-normal break-words">
                      <div className="font-medium text-gray-900">
                        {displayValue}
                      </div>
                    </div>
                  </SelectItem>
                );
              })
          ) : (
            <SelectItem value="default" disabled>No trim levels available</SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && showValidation && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default TrimDropdown;
