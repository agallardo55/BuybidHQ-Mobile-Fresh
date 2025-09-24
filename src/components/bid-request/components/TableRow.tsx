
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
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
    </UITableRow>
  );
};
