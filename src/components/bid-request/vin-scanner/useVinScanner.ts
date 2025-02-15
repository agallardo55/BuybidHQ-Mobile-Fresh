
import { useState, useRef } from "react";
import { toast } from "sonner";
import { BrowserMultiFormatReader, Result } from '@zxing/library';

export function useVinScanner(onVinScanned: (vin: string) => void) {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader>();

  const cleanupScanner = () => {
    try {
      if (codeReader.current) {
        codeReader.current.reset();
      }

      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    } catch (error) {
      console.error('Error cleaning up scanner:', error);
    }
  };

  const startScan = async () => {
    try {
      setIsScanning(true);
      
      if (!codeReader.current) {
        codeReader.current = new BrowserMultiFormatReader();
      }

      const constraints = {
        video: { 
          facingMode: { exact: 'environment' }, // Force rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const result = await codeReader.current.decodeFromVideoElement(videoRef.current!);
      
      if (result) {
        handleScannedResult(result);
      }
    } catch (error) {
      if (isScanning) { // Only show error if we haven't cancelled
        console.error('Scanning error:', error);
        toast.error("Failed to start scanner. Please check camera permissions.");
      }
      cleanupScanner();
      setIsScanning(false);
    }
  };

  const handleScannedResult = (result: Result) => {
    const scannedVin = result.getText();
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
