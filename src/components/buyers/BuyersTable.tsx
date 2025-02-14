
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Trash, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Buyer } from "@/types/buyers";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface BuyersTableProps {
  buyers: Buyer[];
  onDelete: (buyerId: string) => void;
  onView: (buyer: Buyer) => void;
  onEdit: (buyer: Buyer) => void;
}

const BuyersTable = ({ buyers, onDelete, onView, onEdit }: BuyersTableProps) => {
  const { currentUser } = useCurrentUser();

  const canManageBuyer = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'dealer';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-sm">Name</TableHead>
          <TableHead className="text-sm">Email</TableHead>
          <TableHead className="text-sm">Dealership</TableHead>
          <TableHead className="text-sm">Phone</TableHead>
          <TableHead className="text-sm">Location</TableHead>
          <TableHead className="text-sm">Accepted</TableHead>
          <TableHead className="text-sm">Pending</TableHead>
          <TableHead className="text-sm">Declined</TableHead>
          <TableHead className="text-sm">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buyers.map((buyer) => (
          <TableRow key={buyer.id}>
            <TableCell className="py-2 px-4 min-h-[44px] text-sm">{buyer.name}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px] text-sm">{buyer.email}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px] text-sm">{buyer.dealership}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px] text-sm">{buyer.phone}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px] text-sm">{buyer.location}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px] text-sm">{buyer.acceptedBids}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px] text-sm">{buyer.pendingBids}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px] text-sm">{buyer.declinedBids}</TableCell>
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
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(buyer)}
                      className="h-7 w-7"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(buyer.id)}
                      className="h-7 w-7 text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
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
