
import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface ImageModalProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startIndex?: number;
}

export function ImageModal({ images, open, onOpenChange, startIndex = 0 }: ImageModalProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(startIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex });

  // Update current index when carousel scrolls
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentImgIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reset to startIndex when modal opens
  useEffect(() => {
    if (open && emblaApi) {
      emblaApi.scrollTo(startIndex);
      setCurrentImgIndex(startIndex);
    }
  }, [open, startIndex, emblaApi]);

  const scrollToIndex = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
      setCurrentImgIndex(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border-none p-0 max-w-full h-full [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Vehicle Images</DialogTitle>
          <DialogDescription>View vehicle images in full screen</DialogDescription>
        </VisuallyHidden>

        {/* Custom Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="!block absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative h-full w-full flex flex-col">
          {/* Main Carousel */}
          <div className="flex-1 overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((src, index) => (
                <div className="relative flex-grow-0 flex-shrink-0 w-full h-full flex items-center justify-center" key={index}>
                  <img src={src} alt={`Vehicle image ${index + 1}`} className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Thumbnail Navigation Strip */}
          <div className="mt-6 mb-6 flex gap-3 overflow-x-auto px-6 max-w-full no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToIndex(idx);
                }}
                className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  currentImgIndex === idx
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
