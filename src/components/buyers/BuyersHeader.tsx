
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Buyers</h1>
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">
          Buyer Network Management
        </p>
      </div>

      <div className="flex items-center gap-3">
        <BuyersSearch
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1.5 bg-brand hover:bg-brand/90 text-white h-9 px-4 text-[13px] font-medium shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all">
              <Plus className="h-4 w-4" />
              <span>Buyer</span>
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
