
import React from 'react'
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
  const [emblaRef] = useEmblaCarousel({ startIndex });

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
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative h-full w-full">
          <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((src, index) => (
                <div className="relative flex-grow-0 flex-shrink-0 w-full h-full flex items-center justify-center" key={index}>
                  <img src={src} alt={`Vehicle image ${index + 1}`} className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
