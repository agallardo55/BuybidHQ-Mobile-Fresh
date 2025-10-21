
import React from "react";
import { Label } from "@/components/ui/label";
import { TrimOption } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deduplicateTrims, getDisplayValue } from "../utils/trimUtils";

interface TrimSelectorProps {
  selectedTrim: string;
  availableTrims: TrimOption[];
  onTrimChange: (value: string) => void;
}

const TrimSelector = ({ selectedTrim, availableTrims, onTrimChange }: TrimSelectorProps) => {
  // Deduplicate trims before rendering
  const uniqueTrims = deduplicateTrims(availableTrims);

  return (
    <div className="space-y-1 w-full">
      <Label htmlFor="trim" className="text-sm">Trim</Label>
      <Select value={selectedTrim} onValueChange={onTrimChange} name="trim">
        <SelectTrigger id="trim" name="trim" className="w-full h-8">
          <SelectValue placeholder="Select a trim" />
        </SelectTrigger>
        <SelectContent>
          {uniqueTrims.map((trim, index) => {
            const displayValue = getDisplayValue(trim);
            return (
              <SelectItem key={`${trim.name}-${index}`} value={trim.name}>
                <span className="font-medium group-data-[highlighted]:text-white">
                  {displayValue}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TrimSelector;
