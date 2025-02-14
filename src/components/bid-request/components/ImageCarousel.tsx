
interface ImageCarouselProps {
  uploadedImages: string[];
  selectedFileUrls: string[];
  onImageClick: (url: string) => void;
}

const ImageCarousel = ({ uploadedImages, selectedFileUrls, onImageClick }: ImageCarouselProps) => {
  if (uploadedImages.length === 0 && selectedFileUrls.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="w-full max-w-[95%] mx-auto overflow-x-auto">
        <div className="flex gap-4 pb-4">
          {uploadedImages.map((url, index) => (
            <div key={`uploaded-${index}`} className="flex-none cursor-pointer" onClick={() => onImageClick(url)}>
              <div className="h-32 relative rounded-lg overflow-hidden">
                <img src={url} alt={`Vehicle photo ${index + 1}`} className="h-full w-auto object-contain" />
              </div>
            </div>
          ))}
          {selectedFileUrls.map((url, index) => (
            <div key={`preview-${index}`} className="flex-none cursor-pointer" onClick={() => onImageClick(url)}>
              <div className="h-32 relative rounded-lg overflow-hidden">
                <img src={url} alt={`Vehicle photo ${index + 1}`} className="h-full w-auto object-contain" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
