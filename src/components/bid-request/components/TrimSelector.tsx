
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

interface TrimSelectorProps {
  selectedTrim: string;
  availableTrims: TrimOption[];
  onTrimChange: (value: string) => void;
}

const TrimSelector = ({ selectedTrim, availableTrims, onTrimChange }: TrimSelectorProps) => {
  return (
    <div className="space-y-1 w-full">
      <Label htmlFor="trim" className="text-sm">Trim</Label>
      <Select value={selectedTrim} onValueChange={onTrimChange}>
        <SelectTrigger className="w-full h-8">
          <SelectValue placeholder="Select a trim" />
        </SelectTrigger>
        <SelectContent>
          {availableTrims.map((trim) => (
            <SelectItem key={trim.name} value={trim.name}>
              <span className="font-medium group-data-[highlighted]:text-white">
                {trim.name}{trim.description ? ` - ${trim.description}` : ''}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TrimSelector;
