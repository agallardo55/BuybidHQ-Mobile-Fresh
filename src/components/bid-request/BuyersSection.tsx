
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, UserRound } from "lucide-react";
import { MappedBuyer } from "@/hooks/buyers/types";
import { formatPhoneForDisplay } from "@/utils/buyerUtils";

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
    email: string;
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] text-center"></TableHead>
                <TableHead className="w-[32px] text-center"></TableHead>
                <TableHead className="py-2 px-4 whitespace-nowrap">Name</TableHead>
                <TableHead className="py-2 px-4 whitespace-nowrap">Dealership</TableHead>
                <TableHead className="py-2 px-4 whitespace-nowrap">Phone</TableHead>
                <TableHead className="py-2 px-4 whitespace-nowrap">Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.length > 0 ? (
                buyers.map((buyer) => (
                  <TableRow
                    key={buyer.id}
                    className="h-[44px] hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleBuyer(buyer.id)}
                  >
                    <TableCell className="py-2 px-4 text-center">
                      <Checkbox
                        id={`buyer-${buyer.id}`}
                        checked={selectedBuyers.includes(buyer.id)}
                        onCheckedChange={() => toggleBuyer(buyer.id)}
                        className="h-4 w-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="py-2 px-4 text-center">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="py-2 px-4 font-medium whitespace-nowrap">
                      {buyer.name}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-muted-foreground">
                      {buyer.dealership || '-'}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-muted-foreground whitespace-nowrap">
                      {formatPhoneForDisplay(buyer.mobile)}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-muted-foreground">
                      {buyer.email || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No buyers found. Try adjusting your search or add a new buyer.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
