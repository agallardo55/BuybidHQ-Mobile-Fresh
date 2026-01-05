-- Ensure vehicle_images bucket exists and is public
-- This migration is idempotent and can be run multiple times safely

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle_images', 'vehicle_images', true)
ON CONFLICT (id)
DO UPDATE SET public = true;

-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "Public read access for vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete vehicle images" ON storage.objects;

-- Create policy for public read access (anyone can view)
CREATE POLICY "Public read access for vehicle images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vehicle_images');

-- Create policy to allow authenticated users to upload vehicle images
CREATE POLICY "Authenticated users can upload vehicle images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle_images'
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update vehicle images
CREATE POLICY "Users can update vehicle images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vehicle_images'
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete vehicle images
CREATE POLICY "Users can delete vehicle images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vehicle_images'
  AND auth.role() = 'authenticated'
);
