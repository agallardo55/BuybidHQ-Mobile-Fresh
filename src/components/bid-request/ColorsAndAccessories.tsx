
import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
const interiorColors = ["Black", "Tan", "Grey", "Red", "White", "Brown"];

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

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      console.log('Starting file upload process...');
      
      for (const file of selectedFiles) {
        console.log(`Uploading file: ${file.name}`);
        
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        console.log(`Generated file path: ${filePath}`);
        
        const {
          data: uploadData,
          error: uploadError,
        } = await supabase.storage.from('vehicle_images').upload(filePath, file);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        
        console.log('File uploaded successfully:', uploadData);
        
        const {
          data: { publicUrl }
        } = supabase.storage.from('vehicle_images').getPublicUrl(filePath);
        
        console.log('Generated public URL:', publicUrl);
        
        uploadedUrls.push(publicUrl);
      }

      console.log('All files uploaded successfully:', uploadedUrls);

      // Update uploaded images state and call the callback
      const newUploadedImages = [...uploadedImages, ...uploadedUrls];
      setUploadedImages(newUploadedImages);
      onImagesUploaded?.(uploadedUrls);
      
      toast.success(`Successfully uploaded ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}`);

      // Clear selected files for next upload
      setSelectedFiles([]);
      selectedFileUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFileUrls([]);
      
      // Close the upload dialog
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
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
      />

      <ImagePreviewDialog
        previewImage={previewImage}
        onOpenChange={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default ColorsAndAccessories;

