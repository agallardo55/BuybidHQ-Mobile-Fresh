
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface AddBuyerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddBuyerDialog = ({ isOpen, onOpenChange }: AddBuyerDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Buyer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="Enter buyer name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Dealership</label>
            <Input placeholder="Enter dealership name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile</label>
            <Input placeholder="Enter mobile number" />
          </div>
          <Button 
            className="w-full bg-custom-blue hover:bg-custom-blue/90 text-white"
            onClick={() => onOpenChange(false)}
          >
            Add Buyer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBuyerDialog;
