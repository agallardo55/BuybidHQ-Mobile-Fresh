
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { BidRequest } from "../types";
import carPlaceholder from "@/assets/car-placeholder.png";

interface TableRowProps {
  request: BidRequest;
  onClick: () => void;
  onBidRequestStatusUpdate?: (requestId: string, status: "pending" | "accepted" | "declined") => void;
}

export const TableRowComponent = ({ request, onClick, onBidRequestStatusUpdate }: TableRowProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleStatusUpdate = (value: "pending" | "accepted" | "declined") => {
    if (onBidRequestStatusUpdate) {
      onBidRequestStatusUpdate(request.id, value);
    }
  };

  const currentStatus = request.status;
  
  // Helper function to get display text for status
  const getStatusDisplayText = (status: string) => {
    if (status.toLowerCase() === 'declined') return 'Not Selected';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Format offer summary for display
  const formatOfferSummary = () => {
    const summary = request.offerSummary;
    if (!summary || summary.count === 0) {
      return <span className="text-gray-500">No offers yet</span>;
    }
    
    const highestOffer = summary.highestOffer ? `$${summary.highestOffer.toLocaleString()}` : 'N/A';
    const statusText = summary.hasAcceptedOffer ? 'Accepted' : 
                     summary.pendingCount > 0 ? 'Pending' : 'Declined';
    
    return (
      <div className="flex flex-col">
        <span className="font-medium">{summary.count} offer{summary.count !== 1 ? 's' : ''}</span>
        <span className="text-sm text-gray-600">High: {highestOffer}</span>
        <span className={`text-xs px-1 py-0.5 rounded ${
          summary.hasAcceptedOffer ? 'bg-green-100 text-green-700' :
          summary.pendingCount > 0 ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {statusText}
        </span>
      </div>
    );
  };

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
        {formatOfferSummary()}
      </TableCell>
      <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <Select
          value={currentStatus.toLowerCase()}
          onValueChange={handleStatusUpdate}
        >
          <SelectTrigger className={`w-[90px] h-6 text-sm focus:ring-0 focus:ring-offset-0
            ${currentStatus.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : ''}
            ${currentStatus.toLowerCase() === 'declined' ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' : ''}
          `}>
            <SelectValue>{getStatusDisplayText(currentStatus)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending" className="data-[highlighted]:!bg-gray-100 data-[highlighted]:!text-gray-700 focus:!bg-gray-100 focus:!text-gray-700 [&>span:first-child]:hidden">Pending</SelectItem>
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
