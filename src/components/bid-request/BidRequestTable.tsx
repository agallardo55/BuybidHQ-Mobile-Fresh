
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { BidRequest } from "./types";

interface BidRequestTableProps {
  requests: BidRequest[];
  onStatusUpdate: (id: string, status: "Pending" | "Approved" | "Declined") => void;
}

const BidRequestTable = ({ requests, onStatusUpdate }: BidRequestTableProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-6 scrollbar-thin scrollbar-thumb-gray-300">
      <div className="inline-block min-w-full align-middle px-4 sm:px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap text-xs">Date</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Year</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Make</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Model</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Trim</TableHead>
              <TableHead className="whitespace-nowrap text-xs">VIN</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Mileage</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Buyer</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Dealership</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Highest Offer</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} className="text-xs">
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  {formatDate(request.createdAt)}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  {request.year}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  {request.make}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  {request.model}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  {request.trim}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  {request.vin}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  {request.mileage.toLocaleString()}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  {request.buyer}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  {request.dealership}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  ${request.highestOffer.toLocaleString()}
                </TableCell>
                <TableCell className="py-1 px-2 whitespace-nowrap">
                  <Select
                    value={request.status}
                    onValueChange={(value: "Pending" | "Approved" | "Declined") => 
                      onStatusUpdate(request.id, value)
                    }
                  >
                    <SelectTrigger className={`w-[90px] h-6 text-xs font-medium
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BidRequestTable;
