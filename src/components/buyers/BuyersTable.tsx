
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
            <TableCell>{buyer.name}</TableCell>
            <TableCell>{buyer.email}</TableCell>
            <TableCell>{buyer.dealership}</TableCell>
            <TableCell>{buyer.phone}</TableCell>
            <TableCell>{buyer.location}</TableCell>
            <TableCell>{buyer.acceptedBids}</TableCell>
            <TableCell>{buyer.pendingBids}</TableCell>
            <TableCell>{buyer.declinedBids}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BuyersTable;
