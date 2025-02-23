
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface SearchHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchHeader = ({ searchTerm, setSearchTerm }: SearchHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <div className="relative w-full sm:w-[225px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Link to="/create-bid-request" className="w-full sm:w-auto">
          <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Bid Request
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SearchHeader;
