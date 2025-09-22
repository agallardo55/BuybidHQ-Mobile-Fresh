-- Create profile-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-images', 'profile-images', true);

-- Create RLS policies for profile images
-- Allow users to view all profile images (since they're public)
CREATE POLICY "Anyone can view profile images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload their own profile image
CREATE POLICY "Users can upload their own profile image" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own profile image
CREATE POLICY "Users can update their own profile image" 
ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile image
CREATE POLICY "Users can delete their own profile image" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);