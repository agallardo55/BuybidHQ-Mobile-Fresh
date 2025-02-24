
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

// Helper function to smart truncate filename
const smartTruncateFileName = (filename: string, maxLength: number = 25) => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return filename; // No extension

  const extension = filename.slice(lastDotIndex);
  const baseName = filename.slice(0, lastDotIndex);
  
  if (baseName.length <= maxLength) return filename;
  
  const halfLength = Math.floor((maxLength - 3) / 2); // -3 for the ellipsis
  const start = baseName.slice(0, halfLength);
  const end = baseName.slice(-halfLength);
  
  return `${start}...${end}${extension}`;
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
      <DialogContent className="w-[90vw] max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-center">Upload Photos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <label 
              htmlFor="photos" 
              className="w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm sm:text-base text-gray-500">
                  Click to select photos or drag and drop
                </span>
                <span className="text-xs sm:text-sm text-gray-400">
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
                <p className="text-sm sm:text-base font-medium mb-2">Selected files:</p>
                <div className="max-h-32 overflow-y-auto space-y-1 px-2">
                  {selectedFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className="text-xs sm:text-sm text-gray-600 flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                        <ImagePlus className="h-4 w-4 flex-shrink-0" />
                        <span className="block min-w-0" title={file.name}>
                          {smartTruncateFileName(file.name)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              onClick={onUpload} 
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base" 
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
