
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { BidRequest } from "../types";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface TableHeadersProps {
  sortConfig: {
    field: keyof BidRequest | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof BidRequest) => void;
}

const SortIcon = ({ field, sortConfig }: { field: keyof BidRequest, sortConfig: TableHeadersProps['sortConfig'] }) => {
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
  field: keyof BidRequest;
  children: React.ReactNode;
  sortConfig: TableHeadersProps['sortConfig'];
  onSort: (field: keyof BidRequest) => void;
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

export const TableHeaders = ({ sortConfig, onSort }: TableHeadersProps) => {
  const { currentUser } = useCurrentUser();
  // Actions column (delete button) is only visible to super_admin users
  const isSuperAdmin = currentUser?.app_role === 'super_admin';

  return (
    <TableHeader>
      <TableRow className="border-b border-slate-100 hover:bg-transparent">
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 w-16 border-b-0">Vehicle</TableHead>
        <SortableHeader field="createdAt" sortConfig={sortConfig} onSort={onSort}>Date</SortableHeader>
        <SortableHeader field="year" sortConfig={sortConfig} onSort={onSort}>Year</SortableHeader>
        <SortableHeader field="make" sortConfig={sortConfig} onSort={onSort}>Make</SortableHeader>
        <SortableHeader field="model" sortConfig={sortConfig} onSort={onSort}>Model</SortableHeader>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0">VIN</TableHead>
        <SortableHeader field="mileage" sortConfig={sortConfig} onSort={onSort}>Mileage</SortableHeader>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0"># Offers</TableHead>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0">Summary</TableHead>
        <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0">Status</TableHead>
        {isSuperAdmin && (
          <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 text-center border-b-0">Actions</TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};
