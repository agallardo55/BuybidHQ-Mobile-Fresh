
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
      return <ArrowUpDown className="h-3 w-3 ml-1.5 opacity-40" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1.5 text-brand" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1.5 text-brand" />
    );
  };

  const SortableHeader = ({ field, children }: { field: keyof Buyer; children: React.ReactNode }) => (
    <TableHead
      className={cn(
        "text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none transition-colors border-b-0",
        sortConfig.field === field ? "text-brand" : "text-slate-600 hover:text-slate-900"
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-slate-100 hover:bg-transparent">
          <SortableHeader field="name">Name</SortableHeader>
          <SortableHeader field="email">Email</SortableHeader>
          <SortableHeader field="dealership">Dealership</SortableHeader>
          <SortableHeader field="mobileNumber">Mobile Number</SortableHeader>
          <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3" />
            </div>
          </TableHead>
          <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
            </div>
          </TableHead>
          <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0">
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
            </div>
          </TableHead>
          <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0 text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {buyers && buyers.length > 0 ? (
          buyers.map((buyer) => (
            <TableRow key={buyer.id} className="group border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
              <TableCell className="py-3 px-4 text-[13px] font-medium text-slate-900">{buyer.name}</TableCell>
              <TableCell className="py-3 px-4">
                <div className="text-[13px] text-slate-900">{buyer.email}</div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="text-[13px] text-slate-900">{buyer.dealership}</div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="text-[13px] text-slate-900">{formatPhoneForDisplay(buyer.mobileNumber)}</div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="text-[13px] text-slate-900">{buyer.acceptedBids}</div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="text-[13px] text-slate-900">{buyer.pendingBids}</div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="text-[13px] text-slate-900">{buyer.declinedBids}</div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex items-center justify-center gap-1">
                  {canManageBuyer(buyer) && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(buyer)}
                        className="h-7 w-7 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(buyer.id)}
                        className="h-7 w-7 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-slate-500">
              No buyers found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default BuyersTable;
