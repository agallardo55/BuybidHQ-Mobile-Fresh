
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
          Bid Request Management
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by VIN, make, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 bg-white border-slate-200 text-sm placeholder:text-slate-400 focus:border-brand focus:ring-brand/20"
          />
        </div>

        {/* Create button */}
        <Button
          asChild
          className="hidden md:flex items-center gap-1.5 bg-brand hover:bg-brand/90 text-white h-9 px-4 text-[13px] font-medium shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all"
        >
          <Link to="/create-bid-request">
            <Plus className="h-4 w-4" />
            <span>Bid Request</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SearchHeader;
