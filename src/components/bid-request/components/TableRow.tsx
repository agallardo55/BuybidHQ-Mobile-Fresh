
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { BidRequest } from "../types";
import carPlaceholder from "@/assets/car-placeholder.png";

interface TableRowProps {
  request: BidRequest;
  offer?: BidRequest['offers'][0];
  onClick: () => void;
  onStatusUpdate?: (responseId: string, status: "pending" | "accepted" | "declined") => void;
  onBidRequestStatusUpdate?: (requestId: string, status: "pending" | "accepted" | "declined") => void;
}

export const TableRowComponent = ({ request, offer, onClick, onStatusUpdate, onBidRequestStatusUpdate }: TableRowProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleStatusUpdate = (value: "pending" | "accepted" | "declined") => {
    if (offer && onStatusUpdate) {
      // Update bid response for offers
      onStatusUpdate(offer.id, value);
    } else if (!offer && onBidRequestStatusUpdate) {
      // Update bid request directly when no offer exists
      onBidRequestStatusUpdate(request.id, value);
    }
  };

  const currentStatus = offer?.status || request.status;
  
  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Get just the buyer name without any dealership info
  const buyerName = getBuyerNameOnly(offer ? offer.buyerName : request.buyer);

  return (
    <UITableRow 
      className="text-sm hover:bg-muted/50 cursor-pointer"
      onClick={onClick}
    >
      <TableCell className="py-2 px-4 h-[44px] w-16">
        {request.primaryImage ? (
          <img 
            src={request.primaryImage} 
            alt="Vehicle thumbnail" 
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <img 
            src={carPlaceholder} 
            alt="Vehicle placeholder" 
            className="w-10 h-10 object-cover rounded opacity-50"
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
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {buyerName || <span className="text-gray-500">No buyer</span>}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
        {offer ? `$${offer.amount.toLocaleString()}` : <span className="text-gray-500">No offers yet</span>}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <Select
          value={currentStatus.toLowerCase()}
          onValueChange={handleStatusUpdate}
        >
          <SelectTrigger className={`w-[90px] h-6 text-sm font-medium focus:ring-0 focus:ring-offset-0
            ${currentStatus.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : ''}
            ${currentStatus.toLowerCase() === 'declined' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' : ''}
          `}>
            <SelectValue>{capitalizeFirstLetter(currentStatus)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending" className="[&>span:first-child]:hidden">Pending</SelectItem>
            <SelectItem value="accepted" className="data-[highlighted]:!bg-green-100 data-[highlighted]:!text-green-700 focus:!bg-green-100 focus:!text-green-700 [&>span:first-child]:hidden">Accepted</SelectItem>
            <SelectItem value="declined" className="data-[highlighted]:!bg-red-100 data-[highlighted]:!text-red-700 focus:!bg-red-100 focus:!text-red-700 [&>span:first-child]:hidden">Not Selected</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
    </UITableRow>
  );
};

// Helper function to extract only the buyer name from any format
const getBuyerNameOnly = (fullBuyerText: string | undefined): string => {
  if (!fullBuyerText) return '';
  
  // Handle various potential formats:
  // "John Doe - ABC Dealership" or "John Doe (ABC Dealership)" or just "John Doe"
  const dashSplit = fullBuyerText.split(' - ');
  if (dashSplit.length > 1) {
    return dashSplit[0].trim();
  }
  
  const parenSplit = fullBuyerText.split('(');
  if (parenSplit.length > 1) {
    return parenSplit[0].trim();
  }
  
  return fullBuyerText.trim();
};
