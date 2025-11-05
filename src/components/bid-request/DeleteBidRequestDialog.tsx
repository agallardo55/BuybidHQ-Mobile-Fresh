import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { BidRequest } from "./types";

interface DeleteBidRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  bidRequest: BidRequest | null;
}

export const DeleteBidRequestDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  bidRequest,
}: DeleteBidRequestDialogProps) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(reason || undefined);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bid Request</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p>Are you sure you want to permanently delete this bid request?</p>
              {bidRequest && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <div className="font-medium">
                    {bidRequest.year} {bidRequest.make} {bidRequest.model}
                  </div>
                  <div className="text-sm text-muted-foreground">VIN: {bidRequest.vin}</div>
                </div>
              )}
              <div className="mt-4">
                <Label htmlFor="deletion-reason" className="text-sm">
                  Reason for deletion (optional)
                </Label>
                <Textarea
                  id="deletion-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for deleting this bid request..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
