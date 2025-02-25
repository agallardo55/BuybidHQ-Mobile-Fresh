
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
import { Eye, Pencil, Trash2 } from "lucide-react";

interface DealershipListProps {
  dealerships: Dealership[];
  onView: (dealership: Dealership) => void;
  onEdit: (dealership: Dealership) => void;
  onDelete: (dealership: Dealership) => void;
}

const ActionButton = ({ 
  icon: Icon, 
  onClick, 
  variant = "ghost",
  className = "",
}: { 
  icon: typeof Eye | typeof Pencil | typeof Trash2;
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
  onView,
  onEdit,
  onDelete
}: DealershipListProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap text-xs">Dealership Name</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Dealer ID</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Contact</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Location</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Primary Dealer</TableHead>
            <TableHead className="whitespace-nowrap text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dealerships.map((dealership) => (
            <TableRow key={dealership.id} className="text-sm hover:bg-muted/50">
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{dealership.dealer_name}</TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{dealership.dealer_id}</TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
                <div>{dealership.business_phone}</div>
                <div className="text-sm text-gray-500">{dealership.business_email}</div>
              </TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
                <div>{dealership.city}</div>
                <div className="text-sm text-gray-500">{dealership.state}</div>
              </TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
                <div>{dealership.primary_dealer?.full_name}</div>
                <div className="text-sm text-gray-500">{dealership.primary_dealer?.email}</div>
              </TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <ActionButton
                    icon={Eye}
                    onClick={() => onView(dealership)}
                  />
                  <ActionButton
                    icon={Pencil}
                    onClick={() => onEdit(dealership)}
                  />
                  <ActionButton
                    icon={Trash2}
                    onClick={() => onDelete(dealership)}
                    className="text-destructive hover:text-destructive"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DealershipList;
