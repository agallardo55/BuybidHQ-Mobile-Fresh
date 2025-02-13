
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Buyer } from "@/types/buyers";

interface BuyersTableProps {
  buyers: Buyer[];
}

const BuyersTable = ({ buyers }: BuyersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Dealership</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Accepted</TableHead>
          <TableHead>Pending</TableHead>
          <TableHead>Declined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buyers.map((buyer) => (
          <TableRow key={buyer.id}>
            <TableCell className="py-2 px-4 min-h-[44px]">{buyer.name}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">{buyer.email}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">{buyer.dealership}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">{buyer.phone}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">{buyer.location}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">{buyer.acceptedBids}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">{buyer.pendingBids}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">{buyer.declinedBids}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BuyersTable;
