
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
            <TableHead>Dealership Name</TableHead>
            <TableHead>Dealer ID</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Primary Dealer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dealerships.map((dealership) => (
            <TableRow key={dealership.id}>
              <TableCell className="font-medium">{dealership.dealer_name}</TableCell>
              <TableCell>{dealership.dealer_id}</TableCell>
              <TableCell>
                <div>{dealership.business_phone}</div>
                <div className="text-sm text-gray-500">{dealership.business_email}</div>
              </TableCell>
              <TableCell>
                <div>{dealership.city}</div>
                <div className="text-sm text-gray-500">{dealership.state}</div>
              </TableCell>
              <TableCell>
                <div>{dealership.primary_dealer?.full_name}</div>
                <div className="text-sm text-gray-500">{dealership.primary_dealer?.email}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(dealership)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(dealership)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(dealership)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
