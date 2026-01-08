
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImagePlus, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/utils/notificationToast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
      <DialogContent className="w-[90vw] max-w-3xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-center">Upload Photos</DialogTitle>
        </DialogHeader>

        {/* Selected Files Carousel */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <Carousel 
              className="relative w-full max-w-2xl mx-auto"
              opts={{
                align: "start",
                loop: true
              }}
            >
              <CarouselContent>
                {selectedFiles.map((file, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <div className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm font-medium">
                            {file.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>

            <p className="text-sm text-gray-500 mt-2 text-center">
              {selectedFiles.length} {selectedFiles.length === 1 ? 'photo' : 'photos'} selected
            </p>
          </div>
        )}

        {/* Upload Area */}
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
