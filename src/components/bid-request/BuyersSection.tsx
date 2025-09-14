
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, UserRound } from "lucide-react";
import { MappedBuyer } from "@/hooks/buyers/types";

interface BuyersSectionProps {
  errors: { buyers?: string };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsAddBuyerOpen: (isOpen: boolean) => void;
  buyers: Array<{
    id: string;
    name: string;
    dealership: string;
    mobile: string;
  }>;
  selectedBuyers: string[];
  toggleBuyer: (buyerId: string) => void;
  handleBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const BuyersSection = ({
  errors,
  searchTerm,
  setSearchTerm,
  setIsAddBuyerOpen,
  buyers,
  selectedBuyers,
  toggleBuyer,
  handleBack,
  onSubmit,
  isSubmitting,
}: BuyersSectionProps) => {
  return (
    <>
      <div className="flex-1 border rounded-lg p-2.5">
        {errors.buyers && (
          <p className="text-xs text-red-500 mb-2">{errors.buyers}</p>
        )}
        <div className="flex gap-2 mb-2">
          <Input
            type="text"
            placeholder="Enter buyer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-custom-blue text-white hover:bg-custom-blue/90"
            onClick={() => setIsAddBuyerOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Buyer</span>
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <div>
            {buyers.length > 0 ? (
              buyers.map((buyer, index) => (
                <div
                  key={buyer.id}
                  className="grid grid-cols-[40px_32px_1fr_1fr_120px] items-center gap-3 py-3 px-1.5 border border-gray-200 bg-white hover:bg-gray-100"
                >
                  <div className="flex justify-center">
                    <Checkbox
                      id={`buyer-${buyer.id}`}
                      checked={selectedBuyers.includes(buyer.id)}
                      onCheckedChange={() => toggleBuyer(buyer.id)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex justify-center">
                    <UserRound className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-sm font-medium cursor-pointer" onClick={() => toggleBuyer(buyer.id)}>
                    {buyer.name}
                  </div>
                  <div className="text-sm text-gray-500 cursor-pointer" onClick={() => toggleBuyer(buyer.id)}>
                    {buyer.dealership || '-'}
                  </div>
                  <div className="text-sm text-gray-500 cursor-pointer" onClick={() => toggleBuyer(buyer.id)}>
                    {buyer.mobile || '-'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No buyers found. Try adjusting your search or add a new buyer.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="mt-6 flex justify-between">
        <Button 
          onClick={handleBack}
          variant="outline"
        >
          Back
        </Button>
        <Button 
          onClick={onSubmit}
          className="bg-custom-blue hover:bg-custom-blue/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </>
  );
};

export default BuyersSection;
