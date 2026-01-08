
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { BidRequest } from "../types";
import carPlaceholder from "@/assets/car-placeholder.png";
import { Trash2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatMileage } from "@/utils/mileageFormatter";

interface TableRowProps {
  request: BidRequest;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const TableRowComponent = ({ request, onClick, onDelete }: TableRowProps) => {
  const { currentUser } = useCurrentUser();
  // Actions column (delete button) is only visible to super_admin users
  const isSuperAdmin = currentUser?.app_role === 'super_admin';
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

  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'approved':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'declined':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Get the display status - show "Accepted" if any offer is accepted
  const getDisplayStatus = () => {
    // console.log('🔍 Status Debug:', {
    //   requestId: request.id,
    //   requestStatus: request.status, 
    //   offerCount: request.offerSummary?.count || 0,
    //   hasAcceptedOffer: request.offerSummary?.hasAcceptedOffer,
    //   offers: request.offers?.map(o => ({ id: o.id, status: o.status }))
    // });

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
      className="group border-b border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <TableCell className="py-3 px-4">
        <div className="w-16 h-11 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
          {request.primaryImage ? (
            <img
              src={request.primaryImage}
              alt="Vehicle thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = carPlaceholder;
                e.currentTarget.className = "w-full h-full object-cover opacity-40";
              }}
            />
          ) : (
            <img
              src={carPlaceholder}
              alt="Vehicle placeholder"
              className="w-full h-full object-cover opacity-40"
            />
          )}
        </div>
      </TableCell>
      <TableCell className="py-3 px-4 text-[13px] text-slate-700">
        {formatDate(request.createdAt)}
      </TableCell>
      <TableCell className="py-3 px-4 text-[13px] text-slate-700">
        {request.year}
      </TableCell>
      <TableCell className="py-3 px-4 text-[13px] font-medium text-slate-900">
        {request.make}
      </TableCell>
      <TableCell className="py-3 px-4 text-[13px] text-slate-700">
        {request.model}
      </TableCell>
      <TableCell className="py-3 px-4">
        <code className="font-mono text-[10px] px-2 py-1 bg-slate-100 text-slate-700 rounded">
          {request.vin}
        </code>
      </TableCell>
      <TableCell className="py-3 px-4 text-[13px] text-slate-700">
        {formatMileage(request.mileage)}
      </TableCell>
      <TableCell className="py-3 px-4 text-[13px] text-center font-medium text-slate-900">
        {getOfferCount()}
      </TableCell>
      <TableCell className="py-3 px-4 text-[13px] text-slate-700">
        {formatOfferSummary()}
      </TableCell>
      <TableCell className="py-3 px-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wide border ${getStatusBadgeClass(getDisplayStatus())}`}>
          {getDisplayStatus()}
        </span>
      </TableCell>
      {isSuperAdmin && (
        <TableCell className="py-3 px-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(request.id);
            }}
            className="h-7 w-7 p-0 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TableCell>
      )}
    </UITableRow>
  );
};
