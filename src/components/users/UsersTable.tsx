
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/types/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onView: (user: User) => void;
}

const UsersTable = ({ users, onEdit, onDelete, onView }: UsersTableProps) => {
  const { currentUser } = useCurrentUser();

  const canManageUser = (user: User) => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.role === 'dealer') {
      return (
        user.dealershipId === currentUser.dealership_id &&
        ['basic', 'individual'].includes(user.role)
      );
    }
    return false;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Dealership</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="py-2 px-4">{user.fullName || 'N/A'}</TableCell>
            <TableCell className="py-2 px-4">{user.email}</TableCell>
            <TableCell className="py-2 px-4 capitalize">{user.role}</TableCell>
            <TableCell className="py-2 px-4 capitalize">{user.status}</TableCell>
            <TableCell className="py-2 px-4">{user.dealershipName || 'N/A'}</TableCell>
            <TableCell className="py-2 px-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(user)}
                  className="h-8 w-8"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {canManageUser(user) && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
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
