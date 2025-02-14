
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User, UserRole } from "@/types/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onView: (user: User) => void;
  sortConfig: {
    field: keyof User | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof User) => void;
}

const UsersTable = ({ users, onEdit, onDelete, onView, sortConfig, onSort }: UsersTableProps) => {
  const { currentUser } = useCurrentUser();

  const canManageUser = (user: User) => {
    if (!currentUser) return false;
    
    // Dealers can only manage associates from their dealership
    if (currentUser.role === 'dealer') {
      return (
        user.dealership_id === currentUser.dealership_id &&
        user.role === 'associate'
      );
    }
    
    return false;
  };

  const SortIcon = ({ field }: { field: keyof User }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const SortableHeader = ({ field, children }: { field: keyof User; children: React.ReactNode }) => (
    <TableHead 
      className={cn(
        "whitespace-nowrap text-xs cursor-pointer select-none",
        sortConfig.field === field && "text-primary"
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
        <TableRow>
          <SortableHeader field="full_name">Name</SortableHeader>
          <SortableHeader field="email">Email</SortableHeader>
          <SortableHeader field="role">Role</SortableHeader>
          <SortableHeader field="status">Status</SortableHeader>
          <SortableHeader field="dealership_id">Dealership</SortableHeader>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="py-2 px-4 min-h-[44px]">{user.full_name || 'N/A'}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">{user.email}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px] capitalize">{user.role}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px] capitalize">{user.status}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">{user.dealership?.dealer_name || 'N/A'}</TableCell>
            <TableCell className="py-2 px-4 min-h-[44px]">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(user)}
                  className="h-7 w-7"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canManageUser(user) && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      className="h-7 w-7"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user.id)}
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

export default UsersTable;
