
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Buyer } from "@/types/buyers";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface BuyersTableProps {
  buyers: Buyer[];
  onDelete: (buyerId: string) => void;
  onView: (buyer: Buyer) => void;
}

const BuyersTable = ({ buyers, onDelete, onView }: BuyersTableProps) => {
  const { currentUser } = useCurrentUser();

  const canManageBuyer = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'dealer';
  };

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
          <TableHead>Actions</TableHead>
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
            <TableCell className="py-2 px-4 min-h-[44px]">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(buyer)}
                  className="h-7 w-7"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canManageBuyer() && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(buyer.id)}
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BuyersTable;
