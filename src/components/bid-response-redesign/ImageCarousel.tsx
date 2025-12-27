
import React, { useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Card } from '@/components/ui/card'
import { ImageModal } from './ImageModal'

interface ImageCarouselProps {
  images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [emblaRef] = useEmblaCarousel()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [startIndex, setStartIndex] = useState(0)

  const openModal = (index: number) => {
    setStartIndex(index)
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="overflow-hidden rounded-xl cursor-pointer" onClick={() => openModal(0)}>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {images.map((src, index) => (
              <div className="relative flex-grow-0 flex-shrink-0 w-full" key={index}>
                <img src={src} alt={`Vehicle image ${index + 1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
          View {images.length} Photos
        </div>
      </Card>
      <ImageModal
        images={images}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        startIndex={startIndex}
      />
    </>
  )
}
