
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
      
      if (!codeReader.current) {
        codeReader.current = new BrowserMultiFormatReader();
      }

      // Try with environment camera first
      let stream = await tryGetUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
