
import { useState, useRef } from "react";
import { toast } from "sonner";
import { BrowserMultiFormatReader, Result } from '@zxing/library';

export function useVinScanner(onVinScanned: (vin: string) => void) {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader>();

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
      console.error('Scanning error:', error);
      toast.error("Failed to start scanner. Please check camera permissions.");
      stopScan(false);
    }
  };

  const handleScannedResult = (result: Result) => {
    const scannedVin = result.getText();
    onVinScanned(scannedVin);
    stopScan(false);
  };

  const stopScan = (isUserCancelled: boolean = true) => {
    setIsScanning(false);
    
    if (codeReader.current) {
      codeReader.current.reset();
    }

    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (isUserCancelled) {
      toast.info("VIN scan cancelled");
    }
  };

  return {
    isScanning,
    videoRef,
    startScan,
    stopScan
  };
}
