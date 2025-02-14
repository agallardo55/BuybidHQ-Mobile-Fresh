
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImagePlus, Upload } from "lucide-react";
import { toast } from "sonner";

// Maximum file size in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface ImageUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFiles: File[];
  isUploading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

const ImageUploadDialog = ({
  isOpen,
  onOpenChange,
  selectedFiles,
  isUploading,
  onFileChange,
  onUpload
}: ImageUploadDialogProps) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const oversizedFiles = Array.from(files).filter(file => file.size > MAX_FILE_SIZE);
      
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(file => file.name).join(', ');
        toast.error(`File(s) too large: ${fileNames}. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
        return;
      }
      
      onFileChange(event);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <label htmlFor="photos" className="w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Click to select photos or drag and drop
                </span>
                <span className="text-xs text-gray-400">
                  Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
                </span>
              </div>
              <input 
                type="file" 
                id="photos" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
            </label>
            
            {selectedFiles.length > 0 && (
              <div className="w-full">
                <p className="text-sm font-medium mb-2">Selected files:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImagePlus className="h-4 w-4" />
                        {file.name}
                      </div>
                      <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              onClick={onUpload} 
              className="w-full" 
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Photo' : 'Photos'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
