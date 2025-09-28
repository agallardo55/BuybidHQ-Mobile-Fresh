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
  // Check if any book values exist
  const hasBookValues = !!(
    kbbWholesale || kbbRetail || 
    jdPowerWholesale || jdPowerRetail || 
    mmrWholesale || mmrRetail || 
    auctionWholesale || auctionRetail
  );

  if (!hasBookValues) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Book Values</CardTitle>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent>
        <div className="grid gap-1.5">
          {(mmrWholesale || mmrRetail) && (
            <>
              <div className="grid grid-cols-5 gap-1.5 py-0.5">
                <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black flex items-center">
                  <img src={manheimLogo} alt="MMR" className="h-6 w-auto" />
                </p>
                <p className="col-span-3 text-base lg:text-base text-lg font-normal">
                  W: {mmrWholesale ? formatCurrencyDisplay(mmrWholesale) : 'N/A'} | 
                  R: {mmrRetail ? formatCurrencyDisplay(mmrRetail) : 'N/A'}
                </p>
              </div>
            </>
          )}
          
          {(kbbWholesale || kbbRetail) && (
            <div className="grid grid-cols-5 gap-1.5 py-0.5">
              <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black flex items-center">
                <img src={kbbLogo} alt="Kelley Blue Book" className="h-7 w-auto" />
              </p>
              <p className="col-span-3 text-base lg:text-base text-lg font-normal">
                W: {kbbWholesale ? formatCurrencyDisplay(kbbWholesale) : 'N/A'} | 
                R: {kbbRetail ? formatCurrencyDisplay(kbbRetail) : 'N/A'}
              </p>
            </div>
          )}
          
          {(jdPowerWholesale || jdPowerRetail) && (
            <div className="grid grid-cols-5 gap-1.5 py-0.5">
              <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black flex items-center">
                <img src={jdpLogo} alt="J.D. Power" className="h-4 w-auto" />
              </p>
              <p className="col-span-3 text-base lg:text-base text-lg font-normal">
                W: {jdPowerWholesale ? formatCurrencyDisplay(jdPowerWholesale) : 'N/A'} | 
                R: {jdPowerRetail ? formatCurrencyDisplay(jdPowerRetail) : 'N/A'}
              </p>
            </div>
          )}
          
          {(auctionWholesale || auctionRetail) && (
            <div className="grid grid-cols-5 gap-1.5 py-0.5">
              <p className="col-span-2 text-base lg:text-base text-lg font-bold text-black">Auction :</p>
              <p className="col-span-3 text-base lg:text-base text-lg font-normal">
                W: {auctionWholesale ? formatCurrencyDisplay(auctionWholesale) : 'N/A'} | 
                R: {auctionRetail ? formatCurrencyDisplay(auctionRetail) : 'N/A'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookValuesCard;