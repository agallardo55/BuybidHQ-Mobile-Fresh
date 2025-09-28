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
        <div className="grid gap-1.5">
          <div className="grid grid-cols-5 gap-1.5 py-0.5">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black flex items-center">
              <img src={manheimLogo} alt="MMR" className="h-6 w-auto" />
            </p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">
              W: {formatCurrencyDisplay(mmrWholesale)} | 
              R: {formatCurrencyDisplay(mmrRetail)}
            </p>
          </div>
          
          <div className="grid grid-cols-5 gap-1.5 py-0.5">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black flex items-center">
              <img src={kbbLogo} alt="Kelley Blue Book" className="h-7 w-auto" />
            </p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">
              W: {formatCurrencyDisplay(kbbWholesale)} | 
              R: {formatCurrencyDisplay(kbbRetail)}
            </p>
          </div>
          
          <div className="grid grid-cols-5 gap-1.5 py-0.5">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black flex items-center">
              <img src={jdpLogo} alt="J.D. Power" className="h-4 w-auto" />
            </p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">
              W: {formatCurrencyDisplay(jdPowerWholesale)} | 
              R: {formatCurrencyDisplay(jdPowerRetail)}
            </p>
          </div>
          
          <div className="grid grid-cols-5 gap-1.5 py-0.5">
            <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Auction :</p>
            <p className="col-span-3 text-base lg:text-base text-lg font-normal">
              W: {formatCurrencyDisplay(auctionWholesale)} | 
              R: {formatCurrencyDisplay(auctionRetail)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookValuesCard;