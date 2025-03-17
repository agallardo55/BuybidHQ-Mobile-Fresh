
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRound } from "lucide-react";

interface Buyer {
  id: string;
  name: string;
  dealership: string;
  mobile: string;
}

interface BuyersListBoxProps {
  buyers: Buyer[];
  selectedBuyers: string[];
  onToggleBuyer: (buyerId: string) => void;
}

const BuyersListBox = ({
  buyers,
  selectedBuyers,
  onToggleBuyer
}: BuyersListBoxProps) => {
  // Sort buyers alphabetically by name
  const sortedBuyers = [...buyers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div className="border rounded-lg bg-white">
      <ScrollArea className="h-[200px] p-2">
        {sortedBuyers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 italic">
            No buyers available
          </div>
        ) : (
          <div className="space-y-2 px-1">
            {sortedBuyers.map((buyer) => (
              <div
                key={buyer.id}
                className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-50"
              >
                <Checkbox
                  id={`buyer-${buyer.id}`}
                  checked={selectedBuyers.includes(buyer.id)}
                  onCheckedChange={() => onToggleBuyer(buyer.id)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`buyer-${buyer.id}`}
                  className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-gray-500" />
                    <span>{buyer.name}</span>
                    {buyer.dealership && (
                      <>
                        <span className="text-gray-500">-</span>
                        <span className="text-gray-500">{buyer.dealership}</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default BuyersListBox;
