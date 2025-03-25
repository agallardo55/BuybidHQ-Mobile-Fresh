
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { BidRequest } from "../types";

interface TableRowProps {
  request: BidRequest;
  offer?: BidRequest['offers'][0];
  onClick: () => void;
  onStatusUpdate?: (responseId: string, status: "pending" | "accepted" | "declined") => void;
}

export const TableRowComponent = ({ request, offer, onClick, onStatusUpdate }: TableRowProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleStatusUpdate = (value: "pending" | "accepted" | "declined") => {
    if (onStatusUpdate) {
      const id = offer?.id || request.id;
      onStatusUpdate(id, value);
    }
  };

  const currentStatus = offer?.status || request.status;
  
  // Extract only the buyer name without dealership information
  const buyerName = offer ? 
    (offer.buyerName ? offer.buyerName.split(' - ')[0].trim() : '') : 
    (request.buyer ? request.buyer.split(' - ')[0].trim() : '');

  return (
    <UITableRow 
      className="text-sm hover:bg-muted/50 cursor-pointer"
      onClick={onClick}
    >
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
          <SelectTrigger className={`w-[90px] h-6 text-sm font-medium
            ${currentStatus.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' : ''}
            ${currentStatus.toLowerCase() === 'pending' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
            ${currentStatus.toLowerCase() === 'declined' ? 'bg-red-100 text-red-800 border-red-200' : ''}
          `}>
            <SelectValue>{currentStatus}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
    </UITableRow>
  );
};
