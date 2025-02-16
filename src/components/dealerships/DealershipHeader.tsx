
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DealershipHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  setIsCreateDialogOpen: (open: boolean) => void;
}

const DealershipHeader = ({
  searchTerm,
  onSearchChange,
  setIsCreateDialogOpen,
}: DealershipHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Dealerships</h1>
      <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 sm:items-center">
        <Input
          placeholder="Search dealerships..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Dealership
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
};

export default DealershipHeader;
