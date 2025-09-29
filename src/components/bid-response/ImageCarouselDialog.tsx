import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { X } from "lucide-react";

interface ImageCarouselDialogProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageCarouselDialog = ({ images, initialIndex, isOpen, onClose }: ImageCarouselDialogProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    // Set initial slide
    if (initialIndex >= 0 && initialIndex < images.length) {
      api.scrollTo(initialIndex);
      setCurrentIndex(initialIndex);
    }

    // Listen for slide changes
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api, initialIndex, images.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        api?.scrollPrev();
      } else if (event.key === "ArrowRight") {
        api?.scrollNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, api]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] h-[95vh] p-0 bg-black border-0 shadow-none [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:focus:ring-white/50">
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>
        <DialogDescription className="sr-only">
          Navigate through vehicle images using arrow keys or swipe gestures
        </DialogDescription>
        
        <div className="relative w-full h-full flex flex-col">
          {/* Close button */}
          <button
            className="absolute right-4 top-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
            {currentIndex + 1} of {images.length}
          </div>

          {/* Carousel */}
          <div className="flex-1 flex items-center justify-center p-4">
            <Carousel 
              setApi={setApi} 
              className="w-full h-full max-w-6xl"
              opts={{
                startIndex: initialIndex,
                loop: true,
              }}
            >
              <CarouselContent className="h-full">
                {images.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <div className="flex items-center justify-center h-full">
                      <img
                        src={image}
                        alt={`Vehicle image ${index + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {images.length > 1 && (
                <>
                  <CarouselPrevious 
                    className="left-4 bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white"
                  />
                  <CarouselNext 
                    className="right-4 bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-white"
                  />
                </>
              )}
            </Carousel>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCarouselDialog;