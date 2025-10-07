
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, Pencil, Check, AlertCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Buyer } from "@/types/buyers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { formatPhoneForDisplay } from "@/utils/buyerUtils";

interface BuyersTableProps {
  buyers: Buyer[];
  onDelete: (buyerId: string) => void;
  onEdit: (buyer: Buyer) => void;
  sortConfig: {
    field: keyof Buyer | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof Buyer) => void;
}

const BuyersTable = ({ buyers, onDelete, onEdit, sortConfig, onSort }: BuyersTableProps) => {
  const { currentUser } = useCurrentUser();

  const canManageBuyer = (buyer: Buyer) => {
    return currentUser?.role === 'admin' || // Admin can manage all buyers
           currentUser?.id === buyer.user_id; // Users can only manage their own buyers
  };

  const SortIcon = ({ field }: { field: keyof Buyer }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const SortableHeader = ({ field, children }: { field: keyof Buyer; children: React.ReactNode }) => (
    <TableHead 
      className={cn(
        "text-sm cursor-pointer select-none",
        sortConfig.field === field && "text-primary"
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader field="name">Name</SortableHeader>
          <SortableHeader field="email">Email</SortableHeader>
          <SortableHeader field="dealership">Dealership</SortableHeader>
          <SortableHeader field="mobileNumber">Mobile Number</SortableHeader>
          <TableHead className="text-sm">
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="text-sm">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="text-sm">
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="text-sm">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buyers && buyers.length > 0 ? (
          buyers.map((buyer) => (
            <TableRow key={buyer.id} className="text-sm hover:bg-muted/50">
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{buyer.name}</TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{buyer.email}</TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{buyer.dealership}</TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{formatPhoneForDisplay(buyer.mobileNumber)}</TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{buyer.acceptedBids}</TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{buyer.pendingBids}</TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{buyer.declinedBids}</TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {canManageBuyer(buyer) && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(buyer)}
                        className="h-7 w-7"
                      >
                        <Pencil className="h-4 w-4" />
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
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
              No buyers found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default BuyersTable;
