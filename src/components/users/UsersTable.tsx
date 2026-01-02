
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
      return <ArrowUpDown className="h-3 w-3 ml-1.5 opacity-40" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1.5 text-brand" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1.5 text-brand" />
    );
  };

  const SortableHeader = ({ field, children }: { field: keyof User; children: React.ReactNode }) => (
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
          <SortableHeader field="full_name">Name</SortableHeader>
          <SortableHeader field="email">Email</SortableHeader>
          <SortableHeader field="role">Role</SortableHeader>
          <SortableHeader field="status">Status</SortableHeader>
          <SortableHeader field="dealership_id">Dealership</SortableHeader>
          <TableHead className="text-[11px] font-bold uppercase tracking-widest text-slate-600 border-b-0 text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="group border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
            <TableCell className="py-3 px-4 text-[13px] font-medium text-slate-900">{user.full_name || 'N/A'}</TableCell>
            <TableCell className="py-3 px-4">
              <div className="text-[13px] text-slate-900">{user.email}</div>
            </TableCell>
            <TableCell className="py-3 px-4">
              <div className="text-[13px] text-slate-900">{formatRoleName(user.role)}</div>
            </TableCell>
            <TableCell className="py-3 px-4">
              <div className="text-[13px] text-slate-900 capitalize">{user.status}</div>
            </TableCell>
            <TableCell className="py-3 px-4">
              <div className="text-[13px] text-slate-900">{user.dealership?.dealer_name || 'N/A'}</div>
            </TableCell>
            <TableCell className="py-3 px-4">
              <div className="flex items-center justify-center gap-1">
                {canManageUser(user) && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      className="h-7 w-7 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user.id)}
                      className="h-7 w-7 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <Trash className="h-3.5 w-3.5" />
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
