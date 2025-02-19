import { ImagePlus } from "lucide-react";
import { useState } from "react";
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
  onImagesUploaded
}: ColorsAndAccessoriesProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFileUrls, setSelectedFileUrls] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const filesArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...filesArray]);

      // Create URLs for preview
      const newUrls = filesArray.map(file => URL.createObjectURL(file));
      setSelectedFileUrls(prev => [...prev, ...newUrls]);
    }
  };

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
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      console.log('Starting file upload process...');
      
      for (const file of selectedFiles) {
        try {
          console.log(`Processing file: ${file.name}`);
          
          // Compress the image before upload
          const compressedFile = await compressImage(file);
          
          const fileExt = file.name.split('.').pop();
          const filePath = `${crypto.randomUUID()}.${fileExt}`;
          
          console.log(`Generated file path: ${filePath}`);
          
          const {
            data: uploadData,
            error: uploadError,
          } = await supabase.storage.from('vehicle_images').upload(filePath, compressedFile, {
            cacheControl: '3600',
            upsert: false
          });
          
          if (uploadError) {
            console.error('Upload error for file:', file.name, uploadError);
            toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
            continue; // Skip to next file instead of failing completely
          }
          
          console.log('File uploaded successfully:', uploadData);
          
          const {
            data: { publicUrl }
          } = supabase.storage.from('vehicle_images').getPublicUrl(filePath);
          
          console.log('Generated public URL:', publicUrl);
          
          uploadedUrls.push(publicUrl);
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          toast.error(`Error processing ${file.name}. Skipping to next file.`);
        }
      }

      if (uploadedUrls.length > 0) {
        console.log('Successfully uploaded files:', uploadedUrls);

        // Update uploaded images state and call the callback
        const newUploadedImages = [...uploadedImages, ...uploadedUrls];
        setUploadedImages(newUploadedImages);
        onImagesUploaded?.(uploadedUrls);
        
        toast.success(`Successfully uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''}`);

        // Clear selected files for next upload
        setSelectedFiles([]);
        selectedFileUrls.forEach(url => URL.revokeObjectURL(url));
        setSelectedFileUrls([]);
        
        // Close the upload dialog
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

  const handleSelectChange = (value: string, name: string) => {
    const syntheticEvent = {
      target: {
        name,
        value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  const handleDeleteImage = async (url: string, isUploaded: boolean) => {
    try {
      if (isUploaded) {
        // Extract the file path from the URL
        const filePath = url.split('/').pop();
        if (filePath) {
          const { error } = await supabase.storage
            .from('vehicle_images')
            .remove([filePath]);

          if (error) {
            console.error('Error deleting file:', error);
            toast.error('Failed to delete image');
            return;
          }

          setUploadedImages(prev => prev.filter(img => img !== url));
          toast.success('Image deleted successfully');
        }
      } else {
        // For preview images, just remove from state
        setSelectedFileUrls(prev => prev.filter(img => img !== url));
        setSelectedFiles(prev => {
          const index = selectedFileUrls.indexOf(url);
          return prev.filter((_, i) => i !== index);
        });
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error handling image deletion:', error);
      toast.error('Failed to delete image');
    }
  };

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
      >
        <ImagePlus className="h-4 w-4" />
        Add Photo
      </Button>

      <ImageUploadDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        selectedFiles={selectedFiles}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />

      <ImageCarousel
        uploadedImages={uploadedImages}
        selectedFileUrls={selectedFileUrls}
        onImageClick={setPreviewImage}
        onDeleteImage={handleDeleteImage}
      />

      <ImagePreviewDialog
        previewImage={previewImage}
        onOpenChange={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default ColorsAndAccessories;
