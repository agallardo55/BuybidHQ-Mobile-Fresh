import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseBidRequestImagesResult {
  images: string[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  selectedImage: string | null;
  setSelectedImage: (image: string | null) => void;
}

/**
 * Hook for managing bid request images and carousel state
 */
export function useBidRequestImages(
  requestId: string | undefined,
  isOpen: boolean
): UseBidRequestImagesResult {
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!requestId) return;

      try {
        const { data, error } = await supabase
          .from("images")
          .select("image_url")
          .eq("bid_request_id", requestId)
          .order("sequence_order", { ascending: true });

        if (error) {
          console.error("Error fetching images:", error);
          return;
        }

        const urls = data
          .map((img) => img.image_url)
          .filter((url): url is string => url !== null);
        setImages(urls);
      } catch (error) {
        console.error("Error in fetchImages:", error);
      }
    };

    if (isOpen) {
      fetchImages();
      setCurrentImageIndex(0);
    }
  }, [requestId, isOpen]);

  return {
    images,
    currentImageIndex,
    setCurrentImageIndex,
    selectedImage,
    setSelectedImage,
  };
}
