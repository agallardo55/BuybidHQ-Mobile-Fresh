
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Check, Mail, Phone, Building } from "lucide-react";
import { MappedBuyer } from "@/hooks/buyers/types";
import { formatPhoneForDisplay } from "@/utils/buyerUtils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-3 p-2">
              {buyers.length > 0 ? (
                buyers.map((buyer) => (
                  <Card
                    key={buyer.id}
                    className={`cursor-pointer transition-colors ${
                      selectedBuyers.includes(buyer.id)
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleBuyer(buyer.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`buyer-${buyer.id}`}
                          checked={selectedBuyers.includes(buyer.id)}
                          onCheckedChange={() => toggleBuyer(buyer.id)}
                          className="h-4 w-4 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-2">{buyer.name}</h3>
                          <div className="space-y-1.5">
                            {buyer.dealership && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building className="h-4 w-4" />
                                <span>{buyer.dealership}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{formatPhoneForDisplay(buyer.mobile)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span className="truncate">{buyer.email || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No buyers found. Try adjusting your search or add a new buyer.
                </div>
              )}
            </div>
          ) : (
            // Desktop Table View
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] text-center">
                    <Check className="h-4 w-4 mx-auto" />
                  </TableHead>
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
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No buyers found. Try adjusting your search or add a new buyer.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <Button
          onClick={handleBack}
          variant="outline"
          className="h-11 px-8 py-2 w-full sm:w-auto sm:min-w-[140px]"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          className="h-11 px-8 py-2 w-full sm:w-auto sm:min-w-[140px] bg-custom-blue hover:bg-custom-blue/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </>
  );
};

export default BuyersSection;
