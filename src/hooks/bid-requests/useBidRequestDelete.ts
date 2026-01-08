import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/notificationToast";
import { logger } from '@/utils/logger';

export const useBidRequestDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      logger.debug(`Deleting bid request ${id}`, reason ? `Reason: ${reason}` : '');
      
      // Verify session is valid before attempting deletion
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        logger.error('Session error:', sessionError);
        throw new Error('Your session has expired. Please sign out and sign back in, then try again.');
      }
      
      // Step 1: Delete bid responses (offers on this request)
      logger.debug('Step 1: Deleting bid_responses records...');
      const { data: responsesData, error: responsesError } = await supabase
        .from('bid_responses')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (responsesError) {
        logger.error('Error deleting bid_responses:', responsesError);
        logger.error('Error details:', JSON.stringify(responsesError, null, 2));
        throw new Error(`Failed to delete bid responses: ${responsesError.message} (Code: ${responsesError.code || 'unknown'})`);
      }
      logger.debug(`✓ Deleted ${responsesData?.length || 0} bid_responses records`);

      // Step 2: Delete bid submission tokens
      logger.debug('Step 2: Deleting bid_submission_tokens records...');
      const { data: tokensData, error: tokensError } = await supabase
        .from('bid_submission_tokens')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (tokensError) {
        logger.error('Error deleting bid_submission_tokens:', tokensError);
        logger.error('Error details:', JSON.stringify(tokensError, null, 2));
        throw new Error(`Failed to delete submission tokens: ${tokensError.message} (Code: ${tokensError.code || 'unknown'})`);
      }
      logger.debug(`✓ Deleted ${tokensData?.length || 0} bid_submission_tokens records`);

      // Step 3: Get image URLs before deleting (needed for storage cleanup)
      logger.debug(`Step 3: Fetching image records for bid_request_id: ${id}...`);
      
      // First, try a direct query
      const { data: imagesToDelete, error: fetchImagesError, count } = await supabase
        .from('images')
        .select('id, image_url', { count: 'exact' })
        .eq('bid_request_id', id);

      if (fetchImagesError) {
        logger.error('Error fetching images:', fetchImagesError);
        logger.error('Error details:', JSON.stringify(fetchImagesError, null, 2));
        throw new Error(`Failed to fetch images: ${fetchImagesError.message}`);
      }

      logger.debug(`Found ${imagesToDelete?.length || 0} image record(s) (count: ${count || 'unknown'})`);
      
      if (imagesToDelete && imagesToDelete.length > 0) {
        logger.debug('Image IDs found:', imagesToDelete.map(img => img.id));
        logger.debug('Image URLs found:', imagesToDelete.map(img => img.image_url));
      } else {
        // Debug: Try to see if there are any images at all, or if RLS is blocking
        logger.debug('⚠️ No images found for this bid_request_id. Checking if images exist with null bid_request_id...');
        const { data: nullImages, count: nullCount } = await supabase
          .from('images')
          .select('id, bid_request_id', { count: 'exact' })
          .is('bid_request_id', null)
          .limit(5);
        logger.debug(`Found ${nullCount || 0} images with null bid_request_id (sample: ${nullImages?.length || 0})`);
      }

      // Step 3a: Delete image files from storage
      if (imagesToDelete && imagesToDelete.length > 0) {
        logger.debug(`Step 3a: Deleting ${imagesToDelete.length} image file(s) from storage...`);
        const filePaths = imagesToDelete
          .map(img => {
            if (!img.image_url) {
              logger.warn(`Image ${img.id} has no image_url`);
              return null;
            }
            // Extract filename from full URL (last part after /)
            const urlParts = img.image_url.split('/');
            const filename = urlParts[urlParts.length - 1];
            logger.debug(`Extracted filename: ${filename} from URL: ${img.image_url}`);
            return filename;
          })
          .filter((path): path is string => !!path);

        logger.debug(`File paths to delete from storage:`, filePaths);

        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('vehicle_images')
            .remove(filePaths);

          if (storageError) {
            logger.error('Error deleting image files from storage:', storageError);
            logger.error('Storage error details:', JSON.stringify(storageError, null, 2));
            // Don't throw - continue even if storage deletion fails (files might already be deleted)
            logger.warn('⚠️ Storage deletion failed, but continuing with database cleanup');
          } else {
            logger.debug(`✓ Deleted ${filePaths.length} image file(s) from storage`);
          }
        } else {
          logger.warn('⚠️ No valid file paths extracted from image URLs');
        }
      } else {
        logger.debug('No image records found to delete from storage');
      }

      // Step 3b: Delete image records from database
      logger.debug('Step 3b: Deleting images records from database...');
      const { data: imagesData, error: imagesError } = await supabase
        .from('images')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (imagesError) {
        logger.error('Error deleting images:', imagesError);
        logger.error('Error details:', JSON.stringify(imagesError, null, 2));
        throw new Error(`Failed to delete images: ${imagesError.message} (Code: ${imagesError.code || 'unknown'})`);
      }
      logger.debug(`✓ Deleted ${imagesData?.length || 0} images records from database`);
      
      if (imagesData && imagesData.length > 0) {
        logger.debug('Deleted image IDs:', imagesData.map(img => img.id));
      }

      // Step 4: Delete related access records
      logger.debug('Step 4: Deleting bid_request_access records...');
      const { data: accessData, error: accessError } = await supabase
        .from('bid_request_access')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (accessError) {
        logger.error('Error deleting bid_request_access:', accessError);
        logger.error('Error details:', JSON.stringify(accessError, null, 2));
        throw new Error(`Failed to delete access records: ${accessError.message} (Code: ${accessError.code || 'unknown'})`);
      }
      logger.debug(`✓ Deleted ${accessData?.length || 0} bid_request_access records`);

      // Step 5: Delete bid_request_access_cache records
      logger.debug('Step 5: Deleting bid_request_access_cache records...');
      const { data: accessCacheData, error: accessCacheError } = await supabase
        .from('bid_request_access_cache')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (accessCacheError) {
        logger.error('Error deleting bid_request_access_cache:', accessCacheError);
        logger.error('Error details:', JSON.stringify(accessCacheError, null, 2));
        throw new Error(`Failed to delete access cache records: ${accessCacheError.message} (Code: ${accessCacheError.code || 'unknown'})`);
      }
      logger.debug(`✓ Deleted ${accessCacheData?.length || 0} bid_request_access_cache records`);

      // Step 6: Delete bid_usage records
      logger.debug('Step 6: Deleting bid_usage records...');
      const { data: usageData, error: usageError } = await supabase
        .from('bid_usage')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (usageError) {
        logger.error('Error deleting bid_usage:', usageError);
        logger.error('Error details:', JSON.stringify(usageError, null, 2));
        throw new Error(`Failed to delete usage records: ${usageError.message} (Code: ${usageError.code || 'unknown'})`);
      }
      logger.debug(`✓ Deleted ${usageData?.length || 0} bid_usage records`);

      // Step 7: Verify bid request exists before attempting deletion
      logger.debug('Step 7: Verifying bid request exists before deletion...');
      const { data: existingBidRequest, error: checkError } = await supabase
        .from('bid_requests')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        // If record not found, it may have already been deleted
        if (checkError.code === 'PGRST116') {
          logger.debug('Bid request not found - it may have already been deleted');
          logger.debug('Bid request and all related records deleted successfully');
          return { id, reason };
        }
        logger.error('Error checking bid request existence:', checkError);
        throw new Error(`Failed to verify bid request: ${checkError.message}`);
      }

      if (!existingBidRequest) {
        logger.debug('Bid request not found - it may have already been deleted');
        logger.debug('Bid request and all related records deleted successfully');
        return { id, reason };
      }

      logger.debug(`Bid request exists. Attempting deletion...`);
      
      // Step 8: Now safe to delete the bid request itself
      const { data: bidRequestData, error: bidRequestError } = await supabase
        .from('bid_requests')
        .delete()
        .eq('id', id)
        .select();

      if (bidRequestError) {
        logger.error('Error deleting bid_request:', bidRequestError);
        logger.error('Error details:', JSON.stringify(bidRequestError, null, 2));
        throw new Error(`Failed to delete bid request: ${bidRequestError.message} (Code: ${bidRequestError.code || 'unknown'})`);
      }
      
      // Verify the deletion actually happened
      if (!bidRequestData || bidRequestData.length === 0) {
        // Check if it still exists (RLS might have blocked the deletion silently)
        const { data: stillExists } = await supabase
          .from('bid_requests')
          .select('id')
          .eq('id', id)
          .single();
        
        if (stillExists) {
          logger.error('❌ Bid request deletion returned no data, but record still exists!');
          logger.error('This likely means RLS policies blocked the deletion.');
          logger.error('Current user may not have super_admin role required for deletion.');
          throw new Error('Failed to delete bid request: Deletion was blocked by security policies. You may need super_admin privileges to delete bid requests.');
        } else {
          logger.debug('✓ Bid request deleted successfully (verified)');
        }
      } else {
        logger.debug(`✓ Successfully deleted bid request ${id}`);
      }
      
      logger.debug('Bid request and all related records deleted successfully');
      return { id, reason };
    },
    onSuccess: () => {
      // Invalidate all related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['bidRequests'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-images'] });
      queryClient.invalidateQueries({ queryKey: ['bidResponse'] });
      toast.success("Bid request deleted successfully");
    },
    onError: (error: Error) => {
      logger.error('Error deleting bid request:', error);
      toast.error(`Failed to delete bid request: ${error.message}`);
    },
  });
};
