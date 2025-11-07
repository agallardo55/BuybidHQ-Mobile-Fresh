
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="flex items-center gap-3">
        {/* Search input - aligned to the right */}
        <div className="relative w-full sm:w-[225px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-9"
        />
        </div>

        {/* Buttons container */}
        <div className="flex items-center gap-2">
        <Link to="/create-bid-request">
          <Button variant="default" className="hidden md:flex items-center gap-1 bg-accent hover:bg-accent/90 text-white h-9">
            <Plus className="h-4 w-4" />
            <span>Bid Request</span>
          </Button>
        </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;
