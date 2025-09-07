import React from "react";
import { Label } from "@/components/ui/label";
import { Users, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MappedBuyer } from "@/hooks/buyers/types";

interface MultiBuyerSelectorProps {
  selectedBuyers: string[];
  buyers: MappedBuyer[];
  onToggleBuyer: (buyerId: string) => void;
}

const MultiBuyerSelector = ({ selectedBuyers, buyers, onToggleBuyer }: MultiBuyerSelectorProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Sort buyers alphabetically by name
  const sortedBuyers = [...buyers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Filter buyers based on search term
  const filteredBuyers = sortedBuyers.filter(buyer => 
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (buyer.dealership && buyer.dealership.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search buyers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="border rounded-lg bg-card max-h-64 overflow-hidden">
            <ScrollArea className="h-full">
              {filteredBuyers.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                  No buyers found
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredBuyers.map((buyer) => (
                    <div
                      key={buyer.id}
                      className={`p-3 rounded cursor-pointer transition-colors ${
                        selectedBuyers.includes(buyer.id) 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => onToggleBuyer(buyer.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm truncate ${
                          selectedBuyers.includes(buyer.id) 
                            ? "text-primary-foreground" 
                            : ""
                        }`}>
                          {buyer.name}
                        </div>
                        {buyer.dealership && (
                          <div className={`text-xs truncate ${
                            selectedBuyers.includes(buyer.id) 
                              ? "text-primary-foreground/80" 
                              : "text-muted-foreground"
                          }`}>
                            {buyer.dealership}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CollapsibleContent>
        
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between mt-3"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Select buyers...</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
      </Collapsible>

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