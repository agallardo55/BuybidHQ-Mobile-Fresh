
import React from "react";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MappedBuyer } from "@/hooks/buyers/types";

interface BuyerSelectorProps {
  selectedBuyer: string;
  buyers: MappedBuyer[];
  onBuyerChange: (value: string) => void;
}

const BuyerSelector = ({ selectedBuyer, buyers, onBuyerChange }: BuyerSelectorProps) => {
  // Sort buyers alphabetically by name
  const sortedBuyers = [...buyers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-1 w-full">
      <Label htmlFor="buyer-select">Select Buyer</Label>
      <Select value={selectedBuyer} onValueChange={onBuyerChange} name="buyer-select">
        <SelectTrigger id="buyer-select" name="buyer-select" className="w-full h-9">
          <SelectValue placeholder="Select a buyer" />
        </SelectTrigger>
        <SelectContent>
          {sortedBuyers.map((buyer) => (
            <SelectItem key={buyer.id} value={buyer.id}>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-muted-foreground group-data-[highlighted]:text-white" />
                <span>{buyer.name}</span>
                {buyer.dealership && (
                  <span className="text-xs text-muted-foreground group-data-[highlighted]:text-white">({buyer.dealership || 'No dealership'})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BuyerSelector;
