
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const RoleDisplay = () => {
  const { currentUser } = useCurrentUser();

  return (
    <div>
      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
        Role
      </label>
      <Select
        value={currentUser?.role}
        disabled
        onValueChange={() => {}}
      >
        <SelectTrigger className="bg-gray-50">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="basic">Basic</SelectItem>
          <SelectItem value="individual">Individual</SelectItem>
          <SelectItem value="dealer">Dealer</SelectItem>
          <SelectItem value="associate">Associate</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
