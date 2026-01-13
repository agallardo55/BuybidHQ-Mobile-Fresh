
import { Dealership } from "@/types/dealerships";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { DealershipMobileCard } from "./DealershipMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type SortField = 'dealer_name' | 'dealer_id' | 'city' | 'state' | 'business_phone';

type SortConfig = {
  field: SortField | null;
  direction: 'asc' | 'desc' | null;
};

interface DealershipListProps {
  dealerships: Dealership[];
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
  onEdit: (dealership: Dealership) => void;
  onDelete: (dealership: Dealership) => void;
}

const SortIcon = ({ field, sortConfig }: { field: SortField, sortConfig: SortConfig }) => {
  if (sortConfig.field !== field) {
    return <ArrowUpDown className="h-3 w-3 ml-1.5 opacity-40" />;
  }
  return sortConfig.direction === 'asc' ? (
    <ArrowUp className="h-3 w-3 ml-1.5 text-brand" />
  ) : (
    <ArrowDown className="h-3 w-3 ml-1.5 text-brand" />
  );
};

const SortableHeader = ({
  field,
  children,
  sortConfig,
  onSort
}: {
  field: SortField;
  children: React.ReactNode;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
}) => (
  <TableHead
    className={cn(
      "text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none transition-colors border-b-0",
      sortConfig.field === field ? "text-brand" : "text-slate-600 hover:text-slate-900"
    )}
    onClick={() => onSort(field)}
  >
    <div className="flex items-center">
      {children}
      <SortIcon field={field} sortConfig={sortConfig} />
    </div>
  </TableHead>
);

const ActionButton = ({
  icon: Icon,
  onClick,
  variant = "ghost",
  className = "",
}: {
  icon: typeof Pencil | typeof Trash2;
  onClick: () => void;
  variant?: "ghost";
  className?: string;
}) => (
  <Button
    variant={variant}
    size="icon"
    onClick={onClick}
    className={`h-7 w-7 ${className}`}
  >
    <Icon className="h-4 w-4" />
  </Button>
);

const DealershipList = ({
  dealerships,
  sortConfig,
  onSort,
  onEdit,
  onDelete
}: DealershipListProps) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <div className="space-y-4">
        {dealerships.map((dealership) => (
          <DealershipMobileCard
            key={dealership.id}
            dealership={dealership}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-6 scrollbar-thin scrollbar-thumb-gray-300">
      <div className="inline-block min-w-full align-middle px-4 sm:px-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <SortableHeader field="dealer_name" sortConfig={sortConfig} onSort={onSort}>Dealership Name</SortableHeader>
              <SortableHeader field="dealer_id" sortConfig={sortConfig} onSort={onSort}>Dealer ID</SortableHeader>
              <SortableHeader field="business_phone" sortConfig={sortConfig} onSort={onSort}>Contact</SortableHeader>
              <SortableHeader field="city" sortConfig={sortConfig} onSort={onSort}>Location</SortableHeader>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0">Account Admin</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {dealerships.map((dealership) => (
            <TableRow
              key={dealership.id}
              className="group border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
            >
              <TableCell className="py-3 px-4 text-[13px] font-medium text-slate-900">
                {dealership.dealer_name}
              </TableCell>
              <TableCell className="py-3 px-4">
                <code className="font-mono text-[10px] px-2 py-1 bg-slate-100 text-slate-700 rounded">
                  {dealership.dealer_id}
                </code>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="text-[13px] text-slate-900">{dealership.business_phone}</div>
                <div className="text-[11px] text-slate-500">{dealership.business_email}</div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="text-[13px] text-slate-900">{dealership.city}</div>
                <div className="text-[11px] text-slate-500">{dealership.state}</div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="text-[13px] text-slate-900">{dealership.account_admin?.full_name || 'Not Assigned'}</div>
                <div className="text-[11px] text-slate-500">{dealership.account_admin?.email || 'N/A'}</div>
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(dealership)}
                    className="h-7 w-7 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(dealership)}
                    className="h-7 w-7 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DealershipList;
