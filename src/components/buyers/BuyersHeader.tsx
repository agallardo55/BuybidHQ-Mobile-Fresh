
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BuyerFormData } from "@/types/buyers";
import AddBuyerForm from "./AddBuyerForm";
import BuyersSearch from "./BuyersSearch";

interface BuyersHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  formData: BuyerFormData;
  onFormDataChange: (data: Partial<BuyerFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const BuyersHeader = ({
  searchTerm,
  onSearchChange,
  isDialogOpen,
  setIsDialogOpen,
  formData,
  onFormDataChange,
  onSubmit,
}: BuyersHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Buyers</h1>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <BuyersSearch 
          searchTerm={searchTerm} 
          onSearchChange={onSearchChange} 
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Buyer
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[672px] h-[90vh] sm:h-auto overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Buyer</DialogTitle>
            </DialogHeader>
            <AddBuyerForm
              onSubmit={onSubmit}
              formData={formData}
              onFormDataChange={onFormDataChange}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BuyersHeader;
