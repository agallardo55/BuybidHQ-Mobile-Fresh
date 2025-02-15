
import { Button } from "@/components/ui/button";

interface ScannerModalProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCancel: () => void;
}

const ScannerModal = ({ videoRef, onCancel }: ScannerModalProps) => {
  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-md aspect-[9/16]">
          <video 
            ref={videoRef}
            className="w-full h-full object-cover rounded-lg"
            autoPlay
            playsInline
          />
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
