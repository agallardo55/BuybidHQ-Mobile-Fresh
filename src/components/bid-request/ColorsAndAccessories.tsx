
import { ImagePlus } from "lucide-react";
import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import ColorPicker from "./components/ColorPicker";
import ImageUploadDialog from "./components/ImageUploadDialog";
import ImagePreviewDialog from "./components/ImagePreviewDialog";
import ImageCarousel from "./components/ImageCarousel";

interface ColorsAndAccessoriesProps {
  formData: {
    exteriorColor: string;
    interiorColor: string;
    accessories: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImagesUploaded?: (urls: string[]) => void;
  uploadedImageUrls?: string[];
  selectedFileUrls?: string[];
  setSelectedFileUrls?: (urls: string[] | ((prev: string[]) => string[])) => void;
}

interface FileWithPreview {
  id: string;
  file: File;
  previewUrl: string;
}

const exteriorColors = ["White", "Black", "Gray", "Green", "Red", "Gold", "Silver", "Blue", "Yellow"];
const interiorColors = ["Black", "Blue", "Brown", "Grey", "Red", "Tan", "White"];

const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
};

const ColorsAndAccessories = ({
  formData,
  onChange,
  onImagesUploaded,
  uploadedImageUrls = [],
  selectedFileUrls = [],
  setSelectedFileUrls
}: ColorsAndAccessoriesProps) => {
  const [selectedFilesWithPreviews, setSelectedFilesWithPreviews] = useState<FileWithPreview[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      const newFilesWithPreviews = filesArray.map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file)
      }));

      setSelectedFilesWithPreviews(prev => [...prev, ...newFilesWithPreviews]);
      setSelectedFileUrls?.(prev => [...prev, ...newFilesWithPreviews.map(f => f.previewUrl)]);
    }
  }, [setSelectedFileUrls]);

  const compressImage = async (file: File): Promise<File> => {
    try {
      console.log(`Compressing file: ${file.name} (${file.size} bytes)`);
      const compressedFile = await imageCompression(file, compressionOptions);
      console.log(`Compression complete: ${compressedFile.size} bytes`);
      return compressedFile;
    } catch (error) {
      console.error('Compression error:', error);
      throw new Error(`Failed to compress ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (selectedFilesWithPreviews.length === 0) return;
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      console.log('Starting file upload process...');
      
      for (const { file } of selectedFilesWithPreviews) {
        try {
          console.log(`Processing file: ${file.name}`);
          
          const compressedFile = await compressImage(file);
          
          const fileExt = file.name.split('.').pop();
          const filePath = `${crypto.randomUUID()}.${fileExt}`;
          
          console.log(`Generated file path: ${filePath}`);
          
          const { error: uploadError } = await supabase.storage
            .from('vehicle_images')
            .upload(filePath, compressedFile);
          
          if (uploadError) {
            console.error('Upload error for file:', file.name, uploadError);
            toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
            continue;
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('vehicle_images')
            .getPublicUrl(filePath);
          
          console.log('Generated public URL:', publicUrl);
          uploadedUrls.push(publicUrl);
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          toast.error(`Error processing ${file.name}. Skipping to next file.`);
        }
      }

      if (uploadedUrls.length > 0) {
        console.log('Successfully uploaded files:', uploadedUrls);

        // Clean up preview URLs and state
        selectedFilesWithPreviews.forEach(({ previewUrl }) => {
          URL.revokeObjectURL(previewUrl);
        });
        
        setSelectedFilesWithPreviews([]);
        setSelectedFileUrls?.([]);
        
        // Update uploaded images through callback with new array
        const newUploadedUrls = [...(uploadedImageUrls || []), ...uploadedUrls];
        onImagesUploaded?.(newUploadedUrls);
        
        toast.success(`Successfully uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''}`);
        setIsUploadDialogOpen(false);
      } else {
        toast.error('No images were successfully uploaded. Please try again.');
      }
    } catch (error) {
      console.error('Upload process error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectChange = useCallback((value: string, name: string) => {
    const syntheticEvent = {
      target: {
        name,
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  }, [onChange]);

  const handleDeleteImage = useCallback(async (url: string, isUploaded: boolean) => {
    if (isDeleting) return; // Prevent multiple deletion attempts
    setIsDeleting(true);

    try {
      if (isUploaded) {
        const filePath = url.split('/').pop();
        if (!filePath) {
          throw new Error('Invalid file path');
        }

        console.log('Deleting uploaded image:', filePath);
        const { error } = await supabase.storage
          .from('vehicle_images')
          .remove([filePath]);

        if (error) {
          console.error('Error deleting file:', error);
          throw error;
        }

        // Update uploaded images through callback with new filtered array
        const newUploadedUrls = (uploadedImageUrls || []).filter(img => img !== url);
        onImagesUploaded?.(newUploadedUrls);
        
        toast.success('Image deleted successfully');
      } else {
        // Find and remove the preview file
        setSelectedFilesWithPreviews(prev => {
          const fileToDelete = prev.find(item => item.previewUrl === url);
          if (fileToDelete) {
            // Clean up the preview URL
            URL.revokeObjectURL(fileToDelete.previewUrl);
            return prev.filter(item => item.id !== fileToDelete.id);
          }
          return prev;
        });

        // Update selected file URLs using functional update
        setSelectedFileUrls?.(prev => prev.filter(previewUrl => previewUrl !== url));
      }
    } catch (error) {
      console.error('Error handling image deletion:', error);
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  }, [onImagesUploaded, setSelectedFileUrls, isDeleting, uploadedImageUrls]);

  return (
    <div className="space-y-4">
      <ColorPicker
        label="Exterior Color"
        value={formData.exteriorColor}
        colors={exteriorColors}
        name="exteriorColor"
        onSelectChange={handleSelectChange}
      />

      <ColorPicker
        label="Interior Color"
        value={formData.interiorColor}
        colors={interiorColors}
        name="interiorColor"
        onSelectChange={handleSelectChange}
      />

      <div>
        <label htmlFor="accessories" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Equipment/Accessories
        </label>
        <Textarea 
          id="accessories" 
          name="accessories" 
          value={formData.accessories} 
          onChange={onChange} 
          placeholder="List any additional equipment or accessories..." 
          className="min-h-[100px] focus-visible:ring-custom-blue" 
        />
      </div>

      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2"
        onClick={() => setIsUploadDialogOpen(true)}
        disabled={isUploading || isDeleting}
      >
        <ImagePlus className="h-4 w-4" />
        Add Photo
      </Button>

      <ImageUploadDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        selectedFiles={selectedFilesWithPreviews.map(item => item.file)}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />

      <ImageCarousel
        uploadedImages={uploadedImageUrls}
        selectedFileUrls={selectedFileUrls}
        onImageClick={setPreviewImage}
        onDeleteImage={handleDeleteImage}
        isDeleting={isDeleting}
      />

      <ImagePreviewDialog
        previewImage={previewImage}
        onOpenChange={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default ColorsAndAccessories;
