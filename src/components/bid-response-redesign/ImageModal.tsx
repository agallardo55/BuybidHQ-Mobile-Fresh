
import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

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
