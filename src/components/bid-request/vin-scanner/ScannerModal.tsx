
import { Button } from "@/components/ui/button";

interface ScannerModalProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCancel: () => void;
}

const ScannerModal = ({ videoRef, onCancel }: ScannerModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <video 
          ref={videoRef}
          className="max-w-full max-h-[70vh] mb-4"
          autoPlay
          playsInline
        />
        <div className="text-white text-center">
          <p className="mb-4">Position the barcode in the center of the screen</p>
          <Button 
            onClick={onCancel}
            variant="outline"
            className="bg-white text-black hover:bg-gray-100"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
