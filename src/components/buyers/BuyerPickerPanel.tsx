import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search, Users } from "lucide-react";
import { MappedBuyer } from "@/hooks/buyers/types";
import { cn } from "@/lib/utils";

interface BuyerPickerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  buyers: MappedBuyer[];
  selectedBuyers: string[];
  onSelectedBuyersChange: (buyerIds: string[]) => void;
}

const BuyerPickerPanel = ({
  isOpen,
  onClose,
  buyers,
  selectedBuyers,
  onSelectedBuyersChange
}: BuyerPickerPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedBuyers, setTempSelectedBuyers] = useState<string[]>(selectedBuyers);

  // Filter buyers based on search term
  const filteredBuyers = useMemo(() => {
    if (!searchTerm) return buyers;
    
    const term = searchTerm.toLowerCase();
    return buyers.filter(buyer => 
      buyer.name.toLowerCase().includes(term) ||
      buyer.dealership.toLowerCase().includes(term) ||
      buyer.email.toLowerCase().includes(term)
    );
  }, [buyers, searchTerm]);

  const handleToggleBuyer = (buyerId: string) => {
    if (tempSelectedBuyers.includes(buyerId)) {
      setTempSelectedBuyers(tempSelectedBuyers.filter(id => id !== buyerId));
    } else {
      setTempSelectedBuyers([...tempSelectedBuyers, buyerId]);
    }
  };

  const handleSelectAll = () => {
    if (tempSelectedBuyers.length === filteredBuyers.length) {
      setTempSelectedBuyers([]);
    } else {
      setTempSelectedBuyers(filteredBuyers.map(buyer => buyer.id));
    }
  };

  const handleClear = () => {
    setTempSelectedBuyers([]);
  };

  const handleCancel = () => {
    setTempSelectedBuyers(selectedBuyers);
    setSearchTerm("");
    onClose();
  };

  const handleDone = () => {
    onSelectedBuyersChange(tempSelectedBuyers);
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "absolute inset-0 z-[100] bg-background border-l shadow-xl transform transition-transform duration-300 ease-in-out",
      "flex flex-col",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Select Buyers</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buyers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <div className="text-sm text-muted-foreground">
          {tempSelectedBuyers.length} of {filteredBuyers.length} selected
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            disabled={filteredBuyers.length === 0}
          >
            {tempSelectedBuyers.length === filteredBuyers.length ? "Deselect All" : "Select All"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={tempSelectedBuyers.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Buyers List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredBuyers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No buyers found matching your search." : "No buyers available."}
            </div>
          ) : (
            filteredBuyers.map(buyer => (
              <div
                key={buyer.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  tempSelectedBuyers.includes(buyer.id)
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleToggleBuyer(buyer.id)}
              >
                <Checkbox
                  checked={tempSelectedBuyers.includes(buyer.id)}
                  onChange={() => handleToggleBuyer(buyer.id)}
                  className="pointer-events-none"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {buyer.name}
                  </div>
                  {buyer.dealership && (
                    <div className="text-xs text-muted-foreground truncate">
                      {buyer.dealership}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground truncate">
                    {buyer.email}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDone}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Done ({tempSelectedBuyers.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyerPickerPanel;