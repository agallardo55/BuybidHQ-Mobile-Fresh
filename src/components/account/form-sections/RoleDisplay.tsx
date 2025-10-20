
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatRoleName } from "@/utils/auth-helpers";

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
          <SelectItem value="basic">{formatRoleName('basic')}</SelectItem>
          <SelectItem value="individual">{formatRoleName('individual')}</SelectItem>
          <SelectItem value="dealer">{formatRoleName('dealer')}</SelectItem>
          <SelectItem value="associate">{formatRoleName('associate')}</SelectItem>
          <SelectItem value="admin">{formatRoleName('admin')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
