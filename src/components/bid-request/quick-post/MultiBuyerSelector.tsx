import React from "react";
import { Label } from "@/components/ui/label";
import { Users, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MappedBuyer } from "@/hooks/buyers/types";

interface MultiBuyerSelectorProps {
  selectedBuyers: string[];
  buyers: MappedBuyer[];
  onToggleBuyer: (buyerId: string) => void;
}

const MultiBuyerSelector = ({ selectedBuyers, buyers, onToggleBuyer }: MultiBuyerSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  
  // Sort buyers alphabetically by name
  const sortedBuyers = [...buyers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-3">
      <Label>Select Buyers</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {selectedBuyers.length === 0 ? (
                <span className="text-muted-foreground">Select buyers...</span>
              ) : (
                <span className="text-sm">
                  {selectedBuyers.length} buyer{selectedBuyers.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search buyers..." />
            <CommandList>
              <CommandEmpty>No buyers found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {sortedBuyers.map((buyer) => (
                  <CommandItem
                    key={buyer.id}
                    value={buyer.name}
                    onSelect={() => onToggleBuyer(buyer.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedBuyers.includes(buyer.id) ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{buyer.name}</div>
                      {buyer.dealership && (
                        <div className="text-xs text-muted-foreground truncate">
                          {buyer.dealership}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedBuyers.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Selected: {selectedBuyers.map(id => 
            buyers.find(b => b.id === id)?.name
          ).filter(Boolean).join(", ")}
        </div>
      )}
    </div>
  );
};

export default MultiBuyerSelector;