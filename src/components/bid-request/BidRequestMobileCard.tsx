import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Calendar, Users, Eye } from "lucide-react";
import { BidRequest } from "./types";

interface BidRequestMobileCardProps {
  request: BidRequest;
  onClick: () => void;
  onBidRequestStatusUpdate?: (requestId: string, status: "pending" | "accepted" | "declined") => void;
}

export const BidRequestMobileCard = ({
  request,
  onClick,
  onBidRequestStatusUpdate
}: BidRequestMobileCardProps) => {
  const currentStatus = request.status;
  
  const getStatusDisplayText = (status: string) => {
    if (status.toLowerCase() === 'declined') return 'Not Selected';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-base">
              {request.year} {request.make} {request.model}
            </h3>
            <p className="text-sm text-muted-foreground">{request.trim}</p>
          </div>
          <Badge variant="outline" className={getStatusColor(currentStatus)}>
            {getStatusDisplayText(currentStatus)}
          </Badge>
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

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>

          {onBidRequestStatusUpdate && (
            <Select
              value={currentStatus.toLowerCase()}
              onValueChange={(value: "pending" | "accepted" | "declined") => 
                onBidRequestStatusUpdate(request.id, value)
              }
            >
              <SelectTrigger className={`w-32 text-xs ${getStatusColor(currentStatus)}`}>
                <SelectValue>{getStatusDisplayText(currentStatus)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Not Selected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardContent>
    </Card>
  );
};