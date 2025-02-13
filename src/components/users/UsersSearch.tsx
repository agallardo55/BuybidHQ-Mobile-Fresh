
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UsersSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const UsersSearch = ({ searchTerm, onSearchChange }: UsersSearchProps) => {
  return (
    <div className="relative w-full sm:w-[300px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => {
          onSearchChange(e.target.value);
        }}
        className="pl-10"
      />
    </div>
  );
};

export default UsersSearch;
