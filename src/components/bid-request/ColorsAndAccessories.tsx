
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

const getCompressionOptions = (fileType: string) => {
  // Normalize file type to what the library expects
  let normalizedType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg';

  if (fileType.includes('png')) {
    normalizedType = 'image/png';
  } else if (fileType.includes('webp')) {
    normalizedType = 'image/webp';
  } else {
    // Default to jpeg for jpg, jpeg, and anything else
    normalizedType = 'image/jpeg';
  }

  console.log('🔧 Compression options:', { originalType: fileType, normalizedType });

  return {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.85,
    fileType: normalizedType,
  };
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

      console.log('📁 Files selected:', {
        fileCount: filesArray.length,
        previewUrls: newFilesWithPreviews.map(f => f.previewUrl)
      });

      setSelectedFilesWithPreviews(prev => [...prev, ...newFilesWithPreviews]);
      setSelectedFileUrls?.(prev => {
        const updated = [...prev, ...newFilesWithPreviews.map(f => f.previewUrl)];
        console.log('📁 Updated selectedFileUrls:', updated);
        return updated;
      });
    }
  }, [setSelectedFileUrls]);

  const compressImage = async (file: File): Promise<File> => {
    try {
      console.log('📦 Starting compression:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const compressedFile = await imageCompression(file, getCompressionOptions(file.type));

      console.log('✅ Compression complete:', {
        size: compressedFile.size,
        type: compressedFile.type,
        name: compressedFile.name
      });

      // Validate the compressed file
      if (compressedFile.size === 0) {
        throw new Error('Compressed file is empty');
      }

      if (!compressedFile.type || compressedFile.type === '') {
        console.error('❌ Compressed file has no type!');
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
          console.log('🚀 Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

          // Compress the image to reduce size and improve upload speed
          const compressedFile = await compressImage(file);

          // Get the file extension from the compressed file type
          const fileExtension = compressedFile.type.split('/')[1] || 'jpg';
          const filePath = `${crypto.randomUUID()}.${fileExtension}`;

          console.log('📤 Uploading to:', filePath, 'Content-Type:', compressedFile.type, 'Compressed size:', compressedFile.size);

          // Get auth session
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('No auth session');
          }

          // Get Supabase URL and key from environment
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          // Upload directly via fetch API to bypass SDK content-type bug
          const uploadUrl = `${supabaseUrl}/storage/v1/object/vehicle_images/${filePath}`;

          console.log('🔗 Upload URL:', uploadUrl);

          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': supabaseKey,
              'Content-Type': compressedFile.type,
              'x-upsert': 'false',
            },
            body: compressedFile,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
          }

          const uploadError = uploadResponse.ok ? null : new Error('Upload failed');
          
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

      {/* Vehicle Photos Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
          Vehicle Photos
        </h3>

        <div className="flex gap-4 items-start">
          {/* Add Photo Button */}
          <button
            type="button"
            onClick={() => setIsUploadDialogOpen(true)}
            disabled={isUploading || isDeleting}
            className="flex-shrink-0 w-[200px] h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Add Photo</span>
          </button>

          {/* Image Grid */}
          <div className="flex-1">
            <ImageCarousel
              uploadedImages={uploadedImageUrls}
              selectedFileUrls={selectedFileUrls}
              onImageClick={setPreviewImage}
              onDeleteImage={handleDeleteImage}
              onImageLoadError={handleImageLoadError}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </div>

      <ImageUploadDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        selectedFiles={selectedFilesWithPreviews.map(item => item.file)}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />

      <ImagePreviewDialog
        previewImage={previewImage}
        onOpenChange={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default ColorsAndAccessories;
