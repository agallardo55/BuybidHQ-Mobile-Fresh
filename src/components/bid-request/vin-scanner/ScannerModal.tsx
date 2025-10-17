
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ScannerModalProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCancel: () => void;
}

const ScannerModal = ({ videoRef, onCancel }: ScannerModalProps) => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (screen.orientation) {
        const isCurrentlyLandscape = screen.orientation.type.includes('landscape');
        setIsLandscape(isCurrentlyLandscape);
      } else {
        // Fallback: check window dimensions
        setIsLandscape(window.innerWidth > window.innerHeight);
      }
    };

    // Check initial orientation
    checkOrientation();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      checkOrientation();
    };

    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback: listen to window resize
      window.addEventListener('resize', handleOrientationChange);
    }

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      } else {
        window.removeEventListener('resize', handleOrientationChange);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className={`absolute inset-0 flex ${isLandscape ? 'flex-row' : 'flex-col'} items-center justify-center p-4`}>
        <div className={`relative ${isLandscape ? 'w-3/4 h-full max-w-none' : 'w-full max-w-2xl aspect-video'}`}>
          <video 
            ref={videoRef}
            className="w-full h-full object-cover rounded-lg"
            autoPlay
            playsInline
          />
          {/* Scanning overlay lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-red-500/70" />
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-red-500/70" />
            {/* Corner brackets for better scanning guidance */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-red-500/70" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-500/70" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-red-500/70" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-red-500/70" />
          </div>
        </div>
        <div className={`text-white text-center ${isLandscape ? 'ml-6 w-1/4' : 'mt-4'}`}>
          <p className="mb-4 text-lg font-medium">
            Position the VIN barcode in the center of the screen
          </p>
          <div className="mb-6 text-sm text-gray-300 space-y-2">
            <p className="font-medium text-white">Scanning Tips:</p>
            <ul className="text-left space-y-1">
              <li>• Hold device steady and level</li>
              <li>• Ensure good lighting (avoid shadows)</li>
              <li>• Keep barcode flat and unwrinkled</li>
              <li>• Try 6-12 inches from the barcode</li>
              <li>• Center the barcode in the frame</li>
            </ul>
            <p className="text-xs text-gray-400 mt-3">
              {isLandscape ? 'Landscape mode provides better scanning' : 'Rotate device for optimal scanning'}
            </p>
          </div>
          <Button 
            onClick={onCancel}
            variant="outline"
            className="bg-white/10 text-white hover:bg-white/20 border-white/20 px-8 py-3"
          >
            Cancel Scan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
