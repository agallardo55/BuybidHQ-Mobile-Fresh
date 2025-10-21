import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";

const compressionOptions = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 800,
  useWebWorker: true,
  initialQuality: 0.85,
  fileType: 'image/webp' as const,
};

export const ProfileImageSection = () => {
  const { currentUser } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Compress image to WebP format
      console.log(`Compressing profile image: ${file.name} (${file.size} bytes)`);
      const compressedFile = await imageCompression(file, compressionOptions);
      console.log(`Compression complete: ${compressedFile.size} bytes`);

      // Use .webp extension since we're converting to WebP
      const fileName = `${currentUser.id}.webp`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, compressedFile, {
          upsert: true,
          contentType: 'image/webp',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Add cache-busting timestamp to force browser refresh
      const cacheBustedUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update user profile with cache-busted URL
      const { error: updateError } = await supabase
        .from('buybidhq_users')
        .update({ profile_photo: cacheBustedUrl } as any)
        .eq('id', currentUser.id as any);

      if (updateError) throw updateError;

      // Show success toast
      toast({
        title: "Success!",
        description: "Profile image updated successfully.",
      });

      // Invalidate current user query to refresh data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to update profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4 pb-6 border-b">
      <div className="relative">
        <Avatar className="h-24 w-24" key={currentUser?.profile_photo}>
          <AvatarImage 
            src={currentUser?.profile_photo || undefined} 
            alt={currentUser?.full_name || "Profile"} 
          />
          <AvatarFallback className="text-lg bg-accent text-accent-foreground">
            {getInitials(currentUser?.full_name)}
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          variant="secondary"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 shadow-md"
          onClick={triggerFileInput}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground">
          {currentUser?.full_name || "User"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentUser?.dealer_name || "No Dealership"}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};