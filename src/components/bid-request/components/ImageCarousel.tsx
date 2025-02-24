
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  uploadedImages: string[];
  selectedFileUrls: string[];
  onImageClick: (url: string) => void;
  onDeleteImage?: (url: string, isUploaded: boolean) => void;
}

const ImageCarousel = ({ 
  uploadedImages, 
  selectedFileUrls, 
  onImageClick,
  onDeleteImage 
}: ImageCarouselProps) => {
  // Sort both arrays in reverse chronological order
  // Note: selectedFileUrls are already in reverse order since they're newest first when selected
  const sortedUploadedImages = [...uploadedImages].reverse();

  if (sortedUploadedImages.length === 0 && selectedFileUrls.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="w-full max-w-[95%] mx-auto overflow-x-auto">
        <div className="flex gap-4 pb-4">
          {sortedUploadedImages.map((url, index) => (
            <div key={`uploaded-${index}`} className="flex-none relative">
              <div className="h-32 relative rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`Vehicle photo ${index + 1}`} 
                  className="h-full w-auto object-contain cursor-pointer" 
                  onClick={() => onImageClick(url)}
                />
                {onDeleteImage && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage(url, true);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {selectedFileUrls.map((url, index) => (
            <div key={`preview-${index}`} className="flex-none relative">
              <div className="h-32 relative rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`Vehicle photo ${index + 1}`} 
                  className="h-full w-auto object-contain cursor-pointer"
                  onClick={() => onImageClick(url)}
                />
                {onDeleteImage && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage(url, false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
