
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ImagePreviewDialogProps {
  previewImage: string | null;
  onOpenChange: (open: boolean) => void;
}

const ImagePreviewDialog = ({ previewImage, onOpenChange }: ImagePreviewDialogProps) => {
  return (
    <Dialog open={!!previewImage} onOpenChange={open => !open && onOpenChange(false)}>
      <DialogContent className="sm:max-w-3xl p-0 bg-black border-black">
        <div className="relative w-full h-[80vh]">
          {previewImage && <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />}
        </div>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-white">
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
