-- Drop the existing problematic RLS policies for profile images
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;

-- Create new RLS policies that match the filename pattern (userId.ext)
-- Allow authenticated users to upload their own profile image
CREATE POLICY "Users can upload their own profile image" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL
    AND starts_with(name, auth.uid()::text)
);

-- Allow users to update their own profile image
CREATE POLICY "Users can update their own profile image" 
ON storage.objects 
FOR UPDATE 
USING (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL
    AND starts_with(name, auth.uid()::text)
);

-- Allow users to delete their own profile image
CREATE POLICY "Users can delete their own profile image" 
ON storage.objects 
FOR DELETE 
USING (
    bucket_id = 'profile-images' 
    AND auth.uid() IS NOT NULL
    AND starts_with(name, auth.uid()::text)
);