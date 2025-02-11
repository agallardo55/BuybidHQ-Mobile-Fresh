
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BuyersSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const BuyersSearch = ({ searchTerm, onSearchChange }: BuyersSearchProps) => {
  return (
    <div className="relative w-full sm:w-[300px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search buyers..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  );
};

export default BuyersSearch;
