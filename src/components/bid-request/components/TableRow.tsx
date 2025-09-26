
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { BidRequest } from "../types";
import carPlaceholder from "@/assets/car-placeholder.png";

interface TableRowProps {
  request: BidRequest;
  onClick: () => void;
  onStatusUpdate?: (responseId: string, status: "pending" | "accepted" | "declined") => void;
}

export const TableRowComponent = ({ request, onClick, onStatusUpdate }: TableRowProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };


  // Format offer summary for display
  const formatOfferSummary = () => {
    const summary = request.offerSummary;
    if (!summary || summary.count === 0) {
      return <span className="text-gray-500">No offers yet</span>;
    }
    
    const highestOffer = summary.highestOffer ? `$${summary.highestOffer.toLocaleString()}` : 'N/A';
    
    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-600">High: {highestOffer}</span>
      </div>
    );
  };

  // Get offer count for display
  const getOfferCount = () => {
    const summary = request.offerSummary;
    return summary?.count || 0;
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'declined':
        return 'destructive';
      case 'pending':
      default:
        return 'outline';
    }
  };

  return (
    <UITableRow 
      className="text-sm hover:bg-muted/50 cursor-pointer"
      onClick={onClick}
    >
      <TableCell className="py-2 px-4 h-[44px] w-20">
        {request.primaryImage ? (
          <img 
            src={request.primaryImage} 
            alt="Vehicle thumbnail" 
            className="w-14 h-10 object-cover rounded"
          />
        ) : (
          <img 
            src={carPlaceholder} 
            alt="Vehicle placeholder" 
            className="w-14 h-10 object-cover rounded opacity-50"
          />
        )}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {formatDate(request.createdAt)}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {request.year}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {request.make}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {request.model}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {request.vin}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {request.mileage.toLocaleString()}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap text-center">
        {getOfferCount()}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {formatOfferSummary()}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {request.offers.length > 0 && onStatusUpdate ? (
          <div className="space-y-1">
            {request.offers.map((offer) => (
              <div key={offer.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 min-w-0 truncate">{offer.buyerName}:</span>
                <Select
                  value={offer.status.toLowerCase()}
                  onValueChange={(value: "pending" | "accepted" | "declined") => {
                    console.log('🎯 TableRow status update:', { offerId: offer.id, newStatus: value });
                    onStatusUpdate(offer.id, value);
                  }}
                >
                  <SelectTrigger 
                    className={`w-[90px] h-6 text-xs focus:ring-0 focus:ring-offset-0
                      ${offer.status.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                      ${offer.status.toLowerCase() === 'declined' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                    `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue>
                      {offer.status.toLowerCase() === 'declined' ? 'Not Selected' : 
                       offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Not Selected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        ) : (
          <Badge variant={getStatusBadgeVariant(request.status)}>
            {request.status}
          </Badge>
        )}
      </TableCell>
    </UITableRow>
  );
};
