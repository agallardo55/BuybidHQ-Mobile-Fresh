
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import QuickPostDrawer from "./QuickPostDrawer";

interface SearchHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchHeader = ({ searchTerm, setSearchTerm }: SearchHeaderProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <div className="relative w-[180px] sm:w-[225px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        
        <Button 
          variant="secondary" 
          className="flex items-center gap-1 h-9"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Zap className="h-4 w-4" />
          <span>Quick Post</span>
        </Button>
        
        <Link to="/create-bid-request">
          <Button variant="default" className="flex items-center gap-1 bg-accent hover:bg-accent/90 text-white h-9">
            <Plus className="h-4 w-4" />
            <span>Bid Request</span>
          </Button>
        </Link>
      </div>

      <QuickPostDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default SearchHeader;
