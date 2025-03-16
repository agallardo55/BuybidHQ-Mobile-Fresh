
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QuickPostForm from "./components/QuickPostForm";
import { useQuickPostForm } from "./hooks/useQuickPostForm";

interface QuickPostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickPostDialog = ({ isOpen, onOpenChange }: QuickPostDialogProps) => {
  const {
    formData,
    isLoading,
    handleChange,
    handleSubmit,
    handleFetchVinDetails
  } = useQuickPostForm(() => onOpenChange(false));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Quick Post</DialogTitle>
        </DialogHeader>
        
        <QuickPostForm
          formData={formData}
          isLoading={isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onFetchVinDetails={handleFetchVinDetails}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuickPostDialog;
