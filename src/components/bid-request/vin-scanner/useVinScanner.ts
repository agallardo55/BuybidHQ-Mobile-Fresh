
import { useState, useRef } from "react";
import { toast } from "sonner";
import { BrowserMultiFormatReader, Result, DecodeHintType, BarcodeFormat } from '@zxing/library';

export function useVinScanner(onVinScanned: (vin: string) => void) {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader>();
  const originalOrientation = useRef<string | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const lockOrientationToLandscape = async () => {
    try {
      // Store current orientation
      if (screen.orientation) {
        originalOrientation.current = screen.orientation.type;
        
        // Lock to landscape
        if (screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      }
    } catch (error) {
      console.warn('Could not lock orientation:', error);
    }
  };

  const unlockOrientation = () => {
    try {
      // Unlock orientation
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      originalOrientation.current = null;
    } catch (error) {
      console.warn('Could not unlock orientation:', error);
    }
  };

  const cleanupScanner = () => {
    try {
      // Clear any pending timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }

      if (codeReader.current) {
        codeReader.current.reset();
      }

      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      // Unlock orientation when cleaning up
      unlockOrientation();
    } catch (error) {
      console.error('Error cleaning up scanner:', error);
    }
  };

  const tryGetUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream | null> => {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('getUserMedia error:', error);
      return null;
    }
  };

  const startScan = async () => {
    try {
      setIsScanning(true);
      
      // Lock screen to landscape for better scanning experience
      await lockOrientationToLandscape();
      
      if (!codeReader.current) {
        // Configure scanner for VIN barcode formats
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_93,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        codeReader.current = new BrowserMultiFormatReader(hints);
      }

      // Try with environment camera first - higher resolution for better barcode scanning
      let stream = await tryGetUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 15 }
        }
      });

      // If that fails, try with any camera
      if (!stream) {
        stream = await tryGetUserMedia({
          video: true
        });
      }

      // If still no stream, show error
      if (!stream) {
        throw new Error("Could not access any camera");
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Set a timeout for scanning (30 seconds)
      scanTimeoutRef.current = setTimeout(() => {
        if (isScanning) {
          toast.info("Scanning timed out. Please try again or enter VIN manually.");
          cleanupScanner();
          setIsScanning(false);
        }
      }, 30000);

      // Start decoding from video element
      const result = await codeReader.current.decodeFromVideoElement(videoRef.current!);
      
      if (result) {
        handleScannedResult(result);
      }
    } catch (error: any) {
      if (isScanning) { // Only show error if we haven't cancelled
        console.error('Scanning error:', error);
        let errorMessage = "Failed to start scanner.";
        if (error.name === 'NotAllowedError') {
          errorMessage += " Please check camera permissions.";
        } else if (error.name === 'NotFoundError') {
          errorMessage += " No camera found.";
        } else if (error.name === 'NotReadableError') {
          errorMessage += " Camera may be in use by another application.";
        }
        toast.error(errorMessage);
      }
      cleanupScanner();
      setIsScanning(false);
    }
  };

  const handleScannedResult = (result: Result) => {
    const scannedVin = result.getText();
    
    // Validate VIN length (should be 17 characters)
    if (scannedVin.length !== 17) {
      toast.error(`Invalid VIN length: ${scannedVin.length} characters. VIN should be 17 characters.`);
      return; // Don't close scanner, let user try again
    }
    
    // Basic VIN validation (should contain only alphanumeric characters, no I, O, Q)
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(scannedVin)) {
      toast.error("Invalid VIN format. Please ensure the barcode is clear and try again.");
      return; // Don't close scanner, let user try again
    }
    
    onVinScanned(scannedVin);
    cleanupScanner();
    setIsScanning(false);
  };

  const stopScan = (isUserCancelled: boolean = true) => {
    if (isUserCancelled && isScanning) {
      toast.info("VIN scan cancelled");
    }
    cleanupScanner();
    setIsScanning(false);
  };

  return {
    isScanning,
    videoRef,
    startScan,
    stopScan
  };
}
