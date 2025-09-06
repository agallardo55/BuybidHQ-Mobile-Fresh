
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
  previewImage: string | null;
  onOpenChange: (open: boolean) => void;
}

const ImagePreviewDialog = ({ previewImage, onOpenChange }: ImagePreviewDialogProps) => {
  return (
    <Dialog open={!!previewImage} onOpenChange={open => !open && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[90vw] p-0 bg-black border-0 shadow-none [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:focus:ring-white/50">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <DialogDescription className="sr-only">
          Full size preview of the selected vehicle image
        </DialogDescription>
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Vehicle preview" 
              className="w-full h-full object-contain rounded-lg" 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
