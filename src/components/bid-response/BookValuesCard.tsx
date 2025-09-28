import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyDisplay } from "@/utils/currencyUtils";
import manheimLogo from "@/assets/manheimLogo.svg";
import kbbLogo from "@/assets/kbbLogo.webp";
import jdpLogo from "@/assets/jdpLogo.svg";

interface BookValuesCardProps {
  kbbWholesale?: number;
  kbbRetail?: number;
  jdPowerWholesale?: number;
  jdPowerRetail?: number;
  mmrWholesale?: number;
  mmrRetail?: number;
  auctionWholesale?: number;
  auctionRetail?: number;
}

const BookValuesCard = ({
  kbbWholesale,
  kbbRetail,
  jdPowerWholesale,
  jdPowerRetail,
  mmrWholesale,
  mmrRetail,
  auctionWholesale,
  auctionRetail,
}: BookValuesCardProps) => {
  // Always show the card - formatCurrencyDisplay handles null/undefined by showing $0

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Book Values</CardTitle>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Header Row */}
          <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
            <div className="p-3 font-semibold text-sm">Service</div>
            <div className="p-3 font-semibold text-sm text-center border-l border-border">Wholesale</div>
            <div className="p-3 font-semibold text-sm text-center border-l border-border">Retail</div>
          </div>
          
          {/* MMR Row */}
          <div className="grid grid-cols-3 border-b border-border">
            <div className="p-3 flex items-center">
              <img src={manheimLogo} alt="MMR" className="h-6 w-auto" />
            </div>
            <div className="p-3 text-center border-l border-border font-medium">
              {formatCurrencyDisplay(mmrWholesale)}
            </div>
            <div className="p-3 text-center border-l border-border font-medium">
              {formatCurrencyDisplay(mmrRetail)}
            </div>
          </div>
          
          {/* KBB Row */}
          <div className="grid grid-cols-3 border-b border-border">
            <div className="p-3 flex items-center">
              <img src={kbbLogo} alt="Kelley Blue Book" className="h-7 w-auto" />
            </div>
            <div className="p-3 text-center border-l border-border font-medium">
              {formatCurrencyDisplay(kbbWholesale)}
            </div>
            <div className="p-3 text-center border-l border-border font-medium">
              {formatCurrencyDisplay(kbbRetail)}
            </div>
          </div>
          
          {/* J.D. Power Row */}
          <div className="grid grid-cols-3 border-b border-border">
            <div className="p-3 flex items-center">
              <img src={jdpLogo} alt="J.D. Power" className="h-4 w-auto" />
            </div>
            <div className="p-3 text-center border-l border-border font-medium">
              {formatCurrencyDisplay(jdPowerWholesale)}
            </div>
            <div className="p-3 text-center border-l border-border font-medium">
              {formatCurrencyDisplay(jdPowerRetail)}
            </div>
          </div>
          
          {/* Auction Row */}
          <div className="grid grid-cols-3">
            <div className="p-3 font-semibold">
              Auction
            </div>
            <div className="p-3 text-center border-l border-border font-medium">
              {formatCurrencyDisplay(auctionWholesale)}
            </div>
            <div className="p-3 text-center border-l border-border font-medium">
              {formatCurrencyDisplay(auctionRetail)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookValuesCard;