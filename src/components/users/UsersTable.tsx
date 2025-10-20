
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { formatRoleName } from "@/utils/auth-helpers";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  sortConfig: {
    field: keyof User | null;
    direction: 'asc' | 'desc' | null;
  };
  onSort: (field: keyof User) => void;
}

const UsersTable = ({ users, onEdit, onDelete, sortConfig, onSort }: UsersTableProps) => {
  const { currentUser } = useCurrentUser();

  const canManageUser = (user: User) => {
    if (!currentUser) return false;

    // Admin can manage all users
    if (currentUser.role === 'admin') {
      return true;
    }

    // Account admins (former dealers) can only manage users in their dealership
    if (currentUser.role === 'basic' && currentUser.dealership_id) {
      return user.dealership_id === currentUser.dealership_id;
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
          <TableRow key={user.id} className="text-sm hover:bg-muted/50">
            <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{user.full_name || 'N/A'}</TableCell>
            <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{user.email}</TableCell>
            <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{formatRoleName(user.role)}</TableCell>
            <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap capitalize">{user.status}</TableCell>
            <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">{user.dealership?.dealer_name || 'N/A'}</TableCell>
            <TableCell className="py-2 px-4 h-[44px] whitespace-nowrap">
              <div className="flex items-center gap-2">
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
                      className="h-7 w-7 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
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
