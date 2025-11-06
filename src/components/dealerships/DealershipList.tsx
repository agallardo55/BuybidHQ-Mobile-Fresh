
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
import { Pencil, Trash2 } from "lucide-react";
import { DealershipMobileCard } from "./DealershipMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface DealershipListProps {
  dealerships: Dealership[];
  onEdit: (dealership: Dealership) => void;
  onDelete: (dealership: Dealership) => void;
}

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
            <TableRow>
              <TableHead className="whitespace-nowrap text-xs">Dealership Name</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Dealer ID</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Contact</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Location</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Account Admin</TableHead>
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
                <div>{dealership.account_admin?.full_name || 'Not Assigned'}</div>
                <div className="text-sm text-gray-500">{dealership.account_admin?.email || 'N/A'}</div>
              </TableCell>
              <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
                <div className="flex items-center gap-2">
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
    </div>
  );
};

export default DealershipList;
