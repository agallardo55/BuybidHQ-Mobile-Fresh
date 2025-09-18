import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Calendar, Users, Eye } from "lucide-react";
import { BidRequest } from "./types";

interface BidRequestMobileCardProps {
  request: BidRequest;
  offer?: any;
  onClick: () => void;
  onStatusUpdate?: (responseId: string, status: "pending" | "accepted" | "declined") => void;
  onBidRequestStatusUpdate?: (requestId: string, status: "pending" | "accepted" | "declined") => void;
}

export const BidRequestMobileCard = ({
  request,
  offer,
  onClick,
  onStatusUpdate,
  onBidRequestStatusUpdate
}: BidRequestMobileCardProps) => {
  const currentStatus = offer?.status || request.status;
  
  const getStatusDisplayText = (status: string) => {
    if (status.toLowerCase() === 'declined') return 'Not Selected';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getBuyerName = (buyerString: string) => {
    if (!buyerString) return "N/A";
    return buyerString.split(' at ')[0] || buyerString;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
          {offer?.buyer_name && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{getBuyerName(offer.buyer_name)}</span>
            </div>
          )}
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

          {offer && onStatusUpdate ? (
            <Select
              value={currentStatus}
              onValueChange={(value: "pending" | "accepted" | "declined") => 
                onStatusUpdate(offer.id, value)
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
          ) : onBidRequestStatusUpdate ? (
            <Select
              value={currentStatus}
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
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};