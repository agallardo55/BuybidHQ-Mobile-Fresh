
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { BidRequest } from "./types";

interface BidRequestTableProps {
  requests: BidRequest[];
  onStatusUpdate: (id: string, status: "Pending" | "Approved" | "Declined") => void;
}

const BidRequestTable = ({ requests, onStatusUpdate }: BidRequestTableProps) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-6">
      <div className="inline-block min-w-full align-middle px-4 sm:px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Year</TableHead>
              <TableHead className="whitespace-nowrap">Make</TableHead>
              <TableHead className="whitespace-nowrap">Model</TableHead>
              <TableHead className="whitespace-nowrap">Trim</TableHead>
              <TableHead className="whitespace-nowrap">VIN</TableHead>
              <TableHead className="whitespace-nowrap">Mileage</TableHead>
              <TableHead className="whitespace-nowrap">Buyer</TableHead>
              <TableHead className="whitespace-nowrap">Dealership</TableHead>
              <TableHead className="whitespace-nowrap">Highest Offer</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="py-2 px-4">
                  {format(new Date(request.createdAt), 'MM/dd/yyyy')}
                </TableCell>
                <TableCell className="py-2 px-4">{request.year}</TableCell>
                <TableCell className="py-2 px-4">{request.make}</TableCell>
                <TableCell className="py-2 px-4">{request.model}</TableCell>
                <TableCell className="py-2 px-4">{request.trim}</TableCell>
                <TableCell className="py-2 px-4">{request.vin}</TableCell>
                <TableCell className="py-2 px-4">{request.mileage.toLocaleString()}</TableCell>
                <TableCell className="py-2 px-4">{request.buyer}</TableCell>
                <TableCell className="py-2 px-4">{request.dealership}</TableCell>
                <TableCell className="py-2 px-4">${request.highestOffer.toLocaleString()}</TableCell>
                <TableCell className="py-2 px-4">
                  <Select
                    value={request.status}
                    onValueChange={(value: "Pending" | "Approved" | "Declined") => 
                      onStatusUpdate(request.id, value)
                    }
                  >
                    <SelectTrigger className={`w-[110px] h-7 text-xs font-medium
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
