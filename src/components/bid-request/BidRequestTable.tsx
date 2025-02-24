
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { BidRequest } from "./types";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import BidRequestDialog from "./BidRequestDialog";

interface BidRequestTableProps {
  requests: BidRequest[];
  onStatusUpdate: (id: string, status: "Pending" | "Approved" | "Declined") => void;
  sortConfig: {
    field: keyof BidRequest | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof BidRequest) => void;
}

const BidRequestTable = ({ requests, onStatusUpdate, sortConfig, onSort }: BidRequestTableProps) => {
  const [selectedRequest, setSelectedRequest] = useState<BidRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleRowClick = (request: BidRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const renderOffers = (request: BidRequest) => {
    if (!request.offers?.length) {
      return <span className="text-gray-500">No offers yet</span>;
    }
    return (
      <div className="space-y-1">
        {request.offers.map((offer, index) => (
          <div key={index}>
            ${offer.amount.toLocaleString()} - {offer.buyerName}
          </div>
        ))}
      </div>
    );
  };

  const SortIcon = ({ field }: { field: keyof BidRequest }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const SortableHeader = ({ field, children }: { field: keyof BidRequest; children: React.ReactNode }) => (
    <TableHead 
      className={cn(
        "text-sm cursor-pointer select-none",
        sortConfig.field === field && "text-primary"
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  console.log('Rendering BidRequestTable with requests:', requests);

  return (
    <>
      <div className="overflow-x-auto -mx-4 sm:-mx-6 scrollbar-thin scrollbar-thumb-gray-300">
        <div className="inline-block min-w-full align-middle px-4 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="createdAt">Date</SortableHeader>
                <SortableHeader field="year">Year</SortableHeader>
                <SortableHeader field="make">Make</SortableHeader>
                <SortableHeader field="model">Model</SortableHeader>
                <TableHead className="text-sm">VIN</TableHead>
                <SortableHeader field="mileage">Mileage</SortableHeader>
                <TableHead className="text-sm">Offers</TableHead>
                <SortableHeader field="status">Status</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests && requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow 
                    key={request.id} 
                    className="text-sm hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleRowClick(request)}
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
                    <TableCell className="py-2 px-4 h-[44px]">
                      {renderOffers(request)}
                    </TableCell>
                    <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={request.status}
                        onValueChange={(value: "Pending" | "Approved" | "Declined") => 
                          onStatusUpdate(request.id, value)
                        }
                      >
                        <SelectTrigger className={`w-[90px] h-6 text-sm font-medium
                          ${request.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                          ${request.status === 'Pending' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                          ${request.status === 'Declined' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                        `}>
                          <SelectValue>{request.status}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No bid requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <BidRequestDialog
        request={selectedRequest}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
};

export default BidRequestTable;
