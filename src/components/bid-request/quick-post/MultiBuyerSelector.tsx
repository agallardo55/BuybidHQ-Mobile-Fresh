import React from "react";
import { Label } from "@/components/ui/label";
import { Users, ChevronDown, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MappedBuyer } from "@/hooks/buyers/types";

interface MultiBuyerSelectorProps {
  selectedBuyers: string[];
  buyers: MappedBuyer[];
  onToggleBuyer: (buyerId: string) => void;
}

const MultiBuyerSelector = ({ selectedBuyers, buyers, onToggleBuyer }: MultiBuyerSelectorProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Sort buyers alphabetically by name
  const sortedBuyers = [...buyers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const selectedBuyerNames = selectedBuyers.map(id => 
    buyers.find(buyer => buyer.id === id)?.name
  ).filter(Boolean);

  const handleRemoveBuyer = (buyerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBuyer(buyerId);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="buyer-select">Select Buyers</Label>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto min-h-[2.5rem] p-3"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              {selectedBuyers.length === 0 ? (
                <span className="text-muted-foreground">Select buyers</span>
              ) : (
                <span className="text-sm">
                  {selectedBuyers.length === 1 
                    ? `${selectedBuyerNames[0]}`
                    : `${selectedBuyers.length} buyers selected`
                  }
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <div className="border rounded-lg bg-card">
            <ScrollArea className="h-[200px] p-2">
              {sortedBuyers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No buyers available
                </div>
              ) : (
                <div className="space-y-1">
                  {sortedBuyers.map((buyer) => (
                    <div
                      key={buyer.id}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-accent/50 cursor-pointer"
                      onClick={() => onToggleBuyer(buyer.id)}
                    >
                      <Checkbox
                        checked={selectedBuyers.includes(buyer.id)}
                        onChange={() => onToggleBuyer(buyer.id)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{buyer.name}</span>
                        </div>
                        {buyer.dealership && (
                          <span className="text-xs text-muted-foreground truncate">
                            {buyer.dealership}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {selectedBuyers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedBuyers.map((buyerId) => {
            const buyer = buyers.find(b => b.id === buyerId);
            return buyer ? (
              <Badge key={buyerId} variant="secondary" className="text-xs">
                {buyer.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={(e) => handleRemoveBuyer(buyerId, e)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default MultiBuyerSelector;