-- Migration: Clean up orphaned image records
-- This migration removes database records that reference non-existent files in storage

-- First, let's see what we're dealing with
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    -- Count orphaned records
    SELECT COUNT(*) INTO orphaned_count
    FROM images i
    LEFT JOIN storage.objects s ON s.name = split_part(i.image_url, '/', -1) AND s.bucket_id = 'vehicle_images'
    WHERE s.name IS NULL;
    
    RAISE NOTICE 'Found % orphaned image records', orphaned_count;
    
    -- Delete orphaned records
    DELETE FROM images 
    WHERE id IN (
      SELECT i.id 
      FROM images i
      LEFT JOIN storage.objects s ON s.name = split_part(i.image_url, '/', -1) AND s.bucket_id = 'vehicle_images'
      WHERE s.name IS NULL
    );
    
    RAISE NOTICE 'Cleanup completed';
END $$;
