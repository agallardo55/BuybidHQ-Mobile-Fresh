
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import carPlaceholder from "@/assets/car-placeholder.png";

interface ImageCarouselProps {
  uploadedImages: string[];
  selectedFileUrls: string[];
  onImageClick: (url: string) => void;
  onDeleteImage?: (url: string, isUploaded: boolean) => void;
  onImageLoadError?: (url: string) => void;
  isDeleting?: boolean;
}

const ImageCarousel = ({ 
  uploadedImages, 
  selectedFileUrls, 
  onImageClick,
  onDeleteImage,
  onImageLoadError,
  isDeleting 
}: ImageCarouselProps) => {
  const sortedUploadedImages = [...uploadedImages];

  // Show placeholder if no images are available
  if (sortedUploadedImages.length === 0 && selectedFileUrls.length === 0) {
    return (
      <div className="mt-4">
        <div className="w-full max-w-[95%] mx-auto">
          <div className="flex gap-4 pb-4">
            <div className="flex-none relative">
              <div className="h-24 w-36 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <img 
                  src={carPlaceholder} 
                  alt="No vehicle photos available" 
                  className="h-16 w-auto object-contain opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  onError={(e) => {
                    // Fallback to placeholder on error
                    e.currentTarget.src = carPlaceholder;
                  }}
                />
                {onDeleteImage && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🗑️ Delete button clicked for uploaded image:', url);
                      if (!isDeleting) {
                        onDeleteImage(url, true);
                      } else {
                        console.log('⏳ Delete already in progress, ignoring click');
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
                  onError={(e) => {
                    // Fallback to placeholder on error
                    e.currentTarget.src = carPlaceholder;
                  }}
                />
                {onDeleteImage && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🗑️ Delete button clicked for preview image:', url);
                      if (!isDeleting) {
                        onDeleteImage(url, false);
                      } else {
                        console.log('⏳ Delete already in progress, ignoring click');
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

