
import { useToast } from "@/hooks/use-toast";
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

interface DeleteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteUserDialog = ({ isOpen, onOpenChange, onConfirm }: DeleteUserDialogProps) => {
  const { toast } = useToast();

  const handleDelete = () => {
    toast({
      title: "Delete User",
      description: "Are you sure you want to delete this user?",
      action: (
        <div className="flex gap-2">
          <button
            onClick={() => {
              onConfirm();
              toast({
                description: "User has been deleted",
              });
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 rounded-md px-3 text-xs"
          >
            Delete
          </button>
          <button
            onClick={() => {}}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 rounded-md px-3 text-xs"
          >
            Cancel
          </button>
        </div>
      ),
    });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
