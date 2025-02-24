
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { BidRequest } from "../types";
import { cn } from "@/lib/utils";

interface TableHeadersProps {
  sortConfig: {
    field: keyof BidRequest | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof BidRequest) => void;
}

const SortIcon = ({ field, sortConfig }: { field: keyof BidRequest, sortConfig: TableHeadersProps['sortConfig'] }) => {
  if (sortConfig.field !== field) {
    return <ArrowUpDown className="h-4 w-4 ml-1" />;
  }
  return sortConfig.direction === 'asc' ? (
    <ArrowUp className="h-4 w-4 ml-1" />
  ) : (
    <ArrowDown className="h-4 w-4 ml-1" />
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
      "text-sm cursor-pointer select-none",
      sortConfig.field === field && "text-primary"
    )}
    onClick={() => onSort(field)}
  >
    <div className="flex items-center">
      {children}
      <SortIcon field={field} sortConfig={sortConfig} />
    </div>
  </TableHead>
);

export const TableHeaders = ({ sortConfig, onSort }: TableHeadersProps) => (
  <TableHeader>
    <TableRow>
      <SortableHeader field="createdAt" sortConfig={sortConfig} onSort={onSort}>Date</SortableHeader>
      <SortableHeader field="year" sortConfig={sortConfig} onSort={onSort}>Year</SortableHeader>
      <SortableHeader field="make" sortConfig={sortConfig} onSort={onSort}>Make</SortableHeader>
      <SortableHeader field="model" sortConfig={sortConfig} onSort={onSort}>Model</SortableHeader>
      <TableHead className="text-sm">VIN</TableHead>
      <SortableHeader field="mileage" sortConfig={sortConfig} onSort={onSort}>Mileage</SortableHeader>
      <TableHead className="text-sm">Buyer</TableHead>
      <TableHead className="text-sm">Offer</TableHead>
      <TableHead className="text-sm">Status</TableHead>
    </TableRow>
  </TableHeader>
);
