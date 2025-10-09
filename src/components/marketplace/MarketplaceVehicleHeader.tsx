import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BidRequest } from "../bid-request/types";

interface MarketplaceVehicleHeaderProps {
  request: BidRequest;
}

const MarketplaceVehicleHeader = ({ request }: MarketplaceVehicleHeaderProps) => {
  return (
    <div className="border-b pb-4">
      <DialogTitle className="text-2xl font-bold text-foreground mb-2">
        Vehicle Details
      </DialogTitle>
      <DialogDescription className="text-base">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-lg font-semibold text-foreground">
            {request.year} {request.make} {request.model}
          </span>
        </div>
      </DialogDescription>
    </div>
  );
};

export default MarketplaceVehicleHeader;
