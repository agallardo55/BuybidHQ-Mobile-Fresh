import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
interface DeleteBuyerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
}
const DeleteBuyerDialog = ({
  isOpen,
  onOpenChange,
  onConfirm
}: DeleteBuyerDialogProps) => {
  const [reason, setReason] = useState("");
  const handleDelete = () => {
    onConfirm(reason);
    onOpenChange(false);
    setReason("");
  };
  return <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the buyer as deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <label htmlFor="deletion-reason" className="text-sm font-medium mb-2 block">
            Reason for deletion (optional)
          </label>
          <Textarea
            id="deletion-reason"
            placeholder="e.g., Duplicate entry, no longer in business..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>;
};
export default DeleteBuyerDialog;