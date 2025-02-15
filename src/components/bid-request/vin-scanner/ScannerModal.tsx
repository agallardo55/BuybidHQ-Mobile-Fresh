
import { Button } from "@/components/ui/button";

interface ScannerModalProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCancel: () => void;
}

const ScannerModal = ({ videoRef, onCancel }: ScannerModalProps) => {
  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-2xl aspect-video">
          <video 
            ref={videoRef}
            className="w-full h-full object-cover rounded-lg"
            autoPlay
            playsInline
          />
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-red-500/70" />
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-red-500/70" />
        </div>
        <div className="text-white text-center mt-4">
          <p className="mb-4">Position the barcode in the center of the screen</p>
          <Button 
            onClick={onCancel}
            variant="outline"
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
