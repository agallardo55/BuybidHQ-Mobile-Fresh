
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BuyersSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const BuyersSearch = ({ searchTerm, onSearchChange }: BuyersSearchProps) => {
  return (
    <div className="relative w-full sm:w-[280px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
      <Input
        type="text"
        placeholder="Search buyers..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-9 bg-white border-slate-200 text-sm placeholder:text-slate-400 focus:border-brand focus:ring-brand/20"
      />
    </div>
  );
};

export default BuyersSearch;
