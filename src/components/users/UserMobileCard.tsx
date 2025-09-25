import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Building, Edit, Trash } from "lucide-react";
import { User as UserType } from "@/types/users";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface UserMobileCardProps {
  user: UserType;
  onEdit: (user: UserType) => void;
  onDelete: (userId: string) => void;
}

export const UserMobileCard = ({
  user,
  onEdit,
  onDelete
}: UserMobileCardProps) => {
  const { currentUser } = useCurrentUser();

  const canManageUser = (user: UserType) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'dealer') {
      return user.dealership_id === currentUser.dealership_id;
    }
    return false;
  };


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dealer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'associate': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-base">{user.full_name || 'N/A'}</h3>
            <p className="text-sm text-muted-foreground">{user.dealership?.dealer_name || 'N/A'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className={getRoleColor(user.role)}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
            <Badge variant="outline" className={getStatusColor(user.status)}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Role: {user.role}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{user.dealership?.dealer_name || 'No dealership assigned'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {canManageUser(user) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(user.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};