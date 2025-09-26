
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { BidRequest } from "../types";
import carPlaceholder from "@/assets/car-placeholder.png";

interface TableRowProps {
  request: BidRequest;
  onClick: () => void;
}

export const TableRowComponent = ({ request, onClick }: TableRowProps) => {
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
      case 'accepted':
        return 'success';
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

  // Get the display status - show "Accepted" if any offer is accepted
  const getDisplayStatus = () => {
    console.log('🔍 Status Debug:', {
      requestId: request.id,
      requestStatus: request.status, 
      offerCount: request.offerSummary?.count || 0,
      hasAcceptedOffer: request.offerSummary?.hasAcceptedOffer,
      offers: request.offers?.map(o => ({ id: o.id, status: o.status }))
    });

    // If there are no offers yet, always show "Pending"
    if (!request.offerSummary?.count || request.offerSummary.count === 0) {
      return 'Pending';
    }
    
    // If any offer is accepted, show "Accepted"
    if (request.offerSummary?.hasAcceptedOffer) {
      return 'Accepted';
    }
    
    // Otherwise show the actual bid request status
    return request.status;
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
        <Badge variant={getStatusBadgeVariant(getDisplayStatus())}>
          {getDisplayStatus()}
        </Badge>
      </TableCell>
    </UITableRow>
  );
};
