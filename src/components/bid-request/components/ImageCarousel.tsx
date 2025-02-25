
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  uploadedImages: string[];
  selectedFileUrls: string[];
  onImageClick: (url: string) => void;
  onDeleteImage?: (url: string, isUploaded: boolean) => void;
  isDeleting?: boolean;
}

const ImageCarousel = ({ 
  uploadedImages, 
  selectedFileUrls, 
  onImageClick,
  onDeleteImage,
  isDeleting 
}: ImageCarouselProps) => {
  const sortedUploadedImages = [...uploadedImages].reverse();

  if (sortedUploadedImages.length === 0 && selectedFileUrls.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="w-full max-w-[95%] mx-auto overflow-x-auto">
        <div className="flex gap-4 pb-4">
          {sortedUploadedImages.map((url, index) => (
            <div key={`uploaded-${url}-${index}`} className="flex-none relative">
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
                      if (!isDeleting) {
                        onDeleteImage(url, true);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {selectedFileUrls.map((url, index) => (
            <div key={`preview-${url}-${index}`} className="flex-none relative">
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
                      if (!isDeleting) {
                        onDeleteImage(url, false);
                      }
                    }}
                    disabled={isDeleting}
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

