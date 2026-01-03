
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
import { logger } from '@/utils/logger';

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
  onDeleteImage?: (url: string, isUploaded: boolean) => Promise<void>;
}

interface FileWithPreview {
  id: string;
  file: File;
  previewUrl: string;
}

const exteriorColors = ["White", "Black", "Gray", "Green", "Red", "Gold", "Silver", "Blue", "Yellow"];
const interiorColors = ["Black", "Blue", "Brown", "Grey", "Red", "Tan", "White"];

const compressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.85,
  fileType: 'image/webp' as const,
};

const ColorsAndAccessories = ({
  formData,
  onChange,
  onImagesUploaded,
  uploadedImageUrls = [],
  selectedFileUrls = [],
  setSelectedFileUrls,
  onDeleteImage
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
      logger.debug(`Compressing file: ${file.name} (${file.size} bytes)`);
      logger.debug(`Original file type: ${file.type}`);
      
      const compressedFile = await imageCompression(file, compressionOptions);
      logger.debug(`Compression complete: ${compressedFile.size} bytes`);
      logger.debug(`Compressed file type: ${compressedFile.type}`);
      
      // Validate the compressed file
      if (compressedFile.size === 0) {
        throw new Error('Compressed file is empty');
      }
      
      return compressedFile;
    } catch (error) {
      logger.error('Compression error:', error);
      throw new Error(`Failed to compress ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (selectedFilesWithPreviews.length === 0) return;
    setIsUploading(true);
    const uploadedFiles: { filePath: string; publicUrl: string }[] = [];
    const uploadedUrls: string[] = [];

    try {
      logger.debug('Starting file upload process...');
      
      // Step 1: Upload all files to storage
      for (const { file } of selectedFilesWithPreviews) {
        try {
          logger.debug(`Processing file: ${file.name}`);
          
          const compressedFile = await compressImage(file);
          
          // Use .webp extension since we're converting to WebP
          const filePath = `${crypto.randomUUID()}.webp`;
          
          logger.debug(`Generated file path: ${filePath}`);
          
          const { error: uploadError } = await supabase.storage
            .from('vehicle_images')
            .upload(filePath, compressedFile, {
              contentType: 'image/webp'
            });
          
          if (uploadError) {
            logger.error('Upload error for file:', file.name, uploadError);
            toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
            continue; // Skip URL generation for failed uploads
          }
          
          // Only generate URL if upload succeeded
          const { data: { publicUrl }, error: urlError } = supabase.storage
            .from('vehicle_images')
            .getPublicUrl(filePath);
          
          if (urlError) {
            logger.error('URL generation error:', urlError);
            continue;
          }
          
          logger.debug('Generated public URL:', publicUrl);
          uploadedFiles.push({ filePath, publicUrl });
          uploadedUrls.push(publicUrl);
        } catch (fileError) {
          logger.error(`Error processing file ${file.name}:`, fileError);
          toast.error(`Error processing ${file.name}. Skipping to next file.`);
        }
      }

      // Step 2: Verify all uploaded files actually exist
      if (uploadedFiles.length > 0) {
        logger.debug('Verifying uploaded files...');
        const verifiedUrls: string[] = [];
        
        // Verify each uploaded file by checking metadata (efficient)
        for (const { filePath, publicUrl } of uploadedFiles) {
          try {
            const { data, error } = await supabase.storage
              .from('vehicle_images')
              .list('', { 
                limit: 1,
                search: filePath 
              });
            
            // File exists if list returns results
            const fileExists = !error && data && data.length > 0;
            
            if (!fileExists) {
              logger.warn(`File verification failed for ${filePath}:`, error);
              // Don't add to verified URLs - this file doesn't exist
            } else {
              verifiedUrls.push(publicUrl);
            }
          } catch (verifyError) {
            logger.warn(`File verification error for ${filePath}:`, verifyError);
            // Don't add to verified URLs - verification failed
          }
        }

        // Step 3: Comprehensive rollback if verification fails
        if (verifiedUrls.length !== uploadedFiles.length) {
          logger.error('Upload verification failed - rolling back ALL files');
          
          // Clean up ALL uploaded files (comprehensive rollback)
          const filePathsToRemove = uploadedFiles.map(({ filePath }) => filePath);
          try {
            const { error: rollbackError } = await supabase.storage
              .from('vehicle_images')
              .remove(filePathsToRemove);
            
            if (rollbackError) {
              logger.error('CRITICAL: Rollback failed, manual cleanup required:', {
                error: rollbackError,
                files: filePathsToRemove,
                timestamp: new Date().toISOString()
              });
              // TODO: Add monitoring alert here (Sentry, CloudWatch, etc.)
            } else {
              logger.debug('Rollback completed - all uploaded files removed');
            }
          } catch (rollbackError) {
            logger.error('CRITICAL: Rollback failed, manual cleanup required:', {
              error: rollbackError,
              files: filePathsToRemove,
              timestamp: new Date().toISOString()
            });
            // TODO: Add monitoring alert here (Sentry, CloudWatch, etc.)
          }
          
          toast.error('Upload verification failed. All files have been removed. Please try again.');
          return;
        }

        // Step 4: Success - all files verified
        if (verifiedUrls.length > 0) {
          logger.debug('Successfully verified all files:', verifiedUrls);

          // Clean up preview URLs and state
          selectedFilesWithPreviews.forEach(({ previewUrl }) => {
            URL.revokeObjectURL(previewUrl);
          });
          
          setSelectedFilesWithPreviews([]);
          setSelectedFileUrls?.([]);
          
          // Update uploaded images through callback with verified URLs only
          onImagesUploaded?.(verifiedUrls);
          
          toast.success(`Successfully uploaded ${verifiedUrls.length} image${verifiedUrls.length > 1 ? 's' : ''}`);
          setIsUploadDialogOpen(false);
        } else {
          toast.error('No images were successfully uploaded. Please try again.');
        }
      } else {
        toast.error('No images were successfully uploaded. Please try again.');
      }
    } catch (error) {
      logger.error('Error in upload process:', error);
      
      // Comprehensive rollback: Clean up ALL uploaded files
      if (uploadedFiles.length > 0) {
        logger.warn('Rolling back all uploaded files due to error...');
        const filePathsToRemove = uploadedFiles.map(({ filePath }) => filePath);
        
        try {
          const { error: rollbackError } = await supabase.storage
            .from('vehicle_images')
            .remove(filePathsToRemove);
          
          if (rollbackError) {
            logger.error('CRITICAL: Rollback failed, manual cleanup required:', {
              error: rollbackError,
              files: filePathsToRemove,
              timestamp: new Date().toISOString()
            });
            // TODO: Add monitoring alert here (Sentry, CloudWatch, etc.)
          } else {
            logger.debug('Rollback completed - all uploaded files removed');
          }
        } catch (rollbackError) {
          logger.error('CRITICAL: Rollback failed, manual cleanup required:', {
            error: rollbackError,
            files: filePathsToRemove,
            timestamp: new Date().toISOString()
          });
          // TODO: Add monitoring alert here (Sentry, CloudWatch, etc.)
        }
      }
      
      toast.error('Failed to upload images. All files have been removed. Please try again.');
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

  const handleImageLoadError = useCallback(async (url: string) => {
    logger.warn('🚨 Image load error detected for URL:', url);

    // Remove the failed image from the uploaded URLs
    await onDeleteImage?.(url, true);

    // Show user-friendly error message
    toast.error('Failed to load image. It has been removed from your uploads.', {
      closeButton: false
    });
  }, [onDeleteImage]);

  const handleDeleteImage = useCallback(async (url: string, isUploaded: boolean) => {
    logger.debug('🔄 handleDeleteImage called:', { url, isUploaded, isDeleting });

    if (isDeleting) {
      logger.debug('⏳ Delete already in progress, returning early');
      return;
    }

    setIsDeleting(true);
    logger.debug('🔒 Set isDeleting to true');

    try {
      if (isUploaded) {
        logger.debug('📤 Deleting uploaded image from storage');

        // Use the parent's onDeleteImage function
        logger.debug('🔄 Calling onDeleteImage with URL:', url);
        await onDeleteImage?.(url, true);
        logger.debug('✅ onDeleteImage called successfully');

        toast.success('Image deleted successfully', {
          closeButton: false
        });
      } else {
        logger.debug('📋 Deleting preview image from local state');
        // Find and remove the preview file
        setSelectedFilesWithPreviews(prev => {
          const fileToDelete = prev.find(item => item.previewUrl === url);
          if (fileToDelete) {
            URL.revokeObjectURL(fileToDelete.previewUrl);
            return prev.filter(item => item.id !== fileToDelete.id);
          }
          return prev;
        });

        setSelectedFileUrls?.(prev => prev.filter(previewUrl => previewUrl !== url));
      }
    } catch (error) {
      logger.error('Error handling image deletion:', error);
      toast.error('Failed to delete image');
    } finally {
      logger.debug('🔓 Set isDeleting to false');
      setIsDeleting(false);
    }
  }, [isDeleting, onDeleteImage, setSelectedFileUrls]);

  return (
    <div className="space-y-4">
      {/* Color Picker Row - Exterior and Interior on same row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

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
        onImageLoadError={handleImageLoadError}
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
