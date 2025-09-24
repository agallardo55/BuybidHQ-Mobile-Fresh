import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Calendar, Users, Eye } from "lucide-react";
import { BidRequest } from "./types";

interface BidRequestMobileCardProps {
  request: BidRequest;
  onClick: () => void;
}

export const BidRequestMobileCard = ({
  request,
  onClick
}: BidRequestMobileCardProps) => {
  const formatOfferSummary = () => {
    const summary = request.offerSummary;
    if (!summary || summary.count === 0) {
      return "No offers yet";
    }
    
    const highestOffer = summary.highestOffer ? `$${summary.highestOffer.toLocaleString()}` : 'N/A';
    return `${summary.count} offer${summary.count !== 1 ? 's' : ''} • High: ${highestOffer}`;
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-base">
            {request.year} {request.make} {request.model}
          </h3>
          <p className="text-sm text-muted-foreground">{request.trim}</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span>VIN: {request.vin}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{request.mileage?.toLocaleString()} miles</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{formatOfferSummary()}</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};