
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, UserRound } from "lucide-react";

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
          <div className="space-y-2">
            {buyers.map((buyer) => (
              <div
                key={buyer.id}
                className="flex items-start space-x-2 p-1.5 rounded hover:bg-gray-50"
              >
                <Checkbox
                  id={`buyer-${buyer.id}`}
                  checked={selectedBuyers.includes(buyer.id)}
                  onCheckedChange={() => toggleBuyer(buyer.id)}
                  className="h-4 w-4 mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`buyer-${buyer.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <UserRound className="h-4 w-4 text-gray-500" />
                        <span>{buyer.name}</span>
                      </div>
                      <div className="text-gray-500">
                        <span className="text-sm">M: {buyer.mobile}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{buyer.dealership}</p>
                  </label>
                </div>
              </div>
            ))}
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
