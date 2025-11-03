import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBidRequestDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      console.log(`Deleting bid request ${id}`, reason ? `Reason: ${reason}` : '');
      
      // Verify session is valid before attempting deletion
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Your session has expired. Please sign out and sign back in, then try again.');
      }
      
      // Step 1: Delete bid responses (offers on this request)
      console.log('Step 1: Deleting bid_responses records...');
      const { data: responsesData, error: responsesError } = await supabase
        .from('bid_responses')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (responsesError) {
        console.error('Error deleting bid_responses:', responsesError);
        console.error('Error details:', JSON.stringify(responsesError, null, 2));
        throw new Error(`Failed to delete bid responses: ${responsesError.message} (Code: ${responsesError.code || 'unknown'})`);
      }
      console.log(`✓ Deleted ${responsesData?.length || 0} bid_responses records`);

      // Step 2: Delete bid submission tokens
      console.log('Step 2: Deleting bid_submission_tokens records...');
      const { data: tokensData, error: tokensError } = await supabase
        .from('bid_submission_tokens')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (tokensError) {
        console.error('Error deleting bid_submission_tokens:', tokensError);
        console.error('Error details:', JSON.stringify(tokensError, null, 2));
        throw new Error(`Failed to delete submission tokens: ${tokensError.message} (Code: ${tokensError.code || 'unknown'})`);
      }
      console.log(`✓ Deleted ${tokensData?.length || 0} bid_submission_tokens records`);

      // Step 3: Get image URLs before deleting (needed for storage cleanup)
      console.log(`Step 3: Fetching image records for bid_request_id: ${id}...`);
      
      // First, try a direct query
      const { data: imagesToDelete, error: fetchImagesError, count } = await supabase
        .from('images')
        .select('id, image_url', { count: 'exact' })
        .eq('bid_request_id', id);

      if (fetchImagesError) {
        console.error('Error fetching images:', fetchImagesError);
        console.error('Error details:', JSON.stringify(fetchImagesError, null, 2));
        throw new Error(`Failed to fetch images: ${fetchImagesError.message}`);
      }

      console.log(`Found ${imagesToDelete?.length || 0} image record(s) (count: ${count || 'unknown'})`);
      
      if (imagesToDelete && imagesToDelete.length > 0) {
        console.log('Image IDs found:', imagesToDelete.map(img => img.id));
        console.log('Image URLs found:', imagesToDelete.map(img => img.image_url));
      } else {
        // Debug: Try to see if there are any images at all, or if RLS is blocking
        console.log('⚠️ No images found for this bid_request_id. Checking if images exist with null bid_request_id...');
        const { data: nullImages, count: nullCount } = await supabase
          .from('images')
          .select('id, bid_request_id', { count: 'exact' })
          .is('bid_request_id', null)
          .limit(5);
        console.log(`Found ${nullCount || 0} images with null bid_request_id (sample: ${nullImages?.length || 0})`);
      }

      // Step 3a: Delete image files from storage
      if (imagesToDelete && imagesToDelete.length > 0) {
        console.log(`Step 3a: Deleting ${imagesToDelete.length} image file(s) from storage...`);
        const filePaths = imagesToDelete
          .map(img => {
            if (!img.image_url) {
              console.warn(`Image ${img.id} has no image_url`);
              return null;
            }
            // Extract filename from full URL (last part after /)
            const urlParts = img.image_url.split('/');
            const filename = urlParts[urlParts.length - 1];
            console.log(`Extracted filename: ${filename} from URL: ${img.image_url}`);
            return filename;
          })
          .filter((path): path is string => !!path);

        console.log(`File paths to delete from storage:`, filePaths);

        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('vehicle_images')
            .remove(filePaths);

          if (storageError) {
            console.error('Error deleting image files from storage:', storageError);
            console.error('Storage error details:', JSON.stringify(storageError, null, 2));
            // Don't throw - continue even if storage deletion fails (files might already be deleted)
            console.warn('⚠️ Storage deletion failed, but continuing with database cleanup');
          } else {
            console.log(`✓ Deleted ${filePaths.length} image file(s) from storage`);
          }
        } else {
          console.warn('⚠️ No valid file paths extracted from image URLs');
        }
      } else {
        console.log('No image records found to delete from storage');
      }

      // Step 3b: Delete image records from database
      console.log('Step 3b: Deleting images records from database...');
      const { data: imagesData, error: imagesError } = await supabase
        .from('images')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (imagesError) {
        console.error('Error deleting images:', imagesError);
        console.error('Error details:', JSON.stringify(imagesError, null, 2));
        throw new Error(`Failed to delete images: ${imagesError.message} (Code: ${imagesError.code || 'unknown'})`);
      }
      console.log(`✓ Deleted ${imagesData?.length || 0} images records from database`);
      
      if (imagesData && imagesData.length > 0) {
        console.log('Deleted image IDs:', imagesData.map(img => img.id));
      }

      // Step 4: Delete related access records
      console.log('Step 4: Deleting bid_request_access records...');
      const { data: accessData, error: accessError } = await supabase
        .from('bid_request_access')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (accessError) {
        console.error('Error deleting bid_request_access:', accessError);
        console.error('Error details:', JSON.stringify(accessError, null, 2));
        throw new Error(`Failed to delete access records: ${accessError.message} (Code: ${accessError.code || 'unknown'})`);
      }
      console.log(`✓ Deleted ${accessData?.length || 0} bid_request_access records`);

      // Step 5: Delete bid_request_access_cache records
      console.log('Step 5: Deleting bid_request_access_cache records...');
      const { data: accessCacheData, error: accessCacheError } = await supabase
        .from('bid_request_access_cache')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (accessCacheError) {
        console.error('Error deleting bid_request_access_cache:', accessCacheError);
        console.error('Error details:', JSON.stringify(accessCacheError, null, 2));
        throw new Error(`Failed to delete access cache records: ${accessCacheError.message} (Code: ${accessCacheError.code || 'unknown'})`);
      }
      console.log(`✓ Deleted ${accessCacheData?.length || 0} bid_request_access_cache records`);

      // Step 6: Delete bid_usage records
      console.log('Step 6: Deleting bid_usage records...');
      const { data: usageData, error: usageError } = await supabase
        .from('bid_usage')
        .delete()
        .eq('bid_request_id', id)
        .select();

      if (usageError) {
        console.error('Error deleting bid_usage:', usageError);
        console.error('Error details:', JSON.stringify(usageError, null, 2));
        throw new Error(`Failed to delete usage records: ${usageError.message} (Code: ${usageError.code || 'unknown'})`);
      }
      console.log(`✓ Deleted ${usageData?.length || 0} bid_usage records`);

      // Step 7: Verify bid request exists before attempting deletion
      console.log('Step 7: Verifying bid request exists before deletion...');
      const { data: existingBidRequest, error: checkError } = await supabase
        .from('bid_requests')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        // If record not found, it may have already been deleted
        if (checkError.code === 'PGRST116') {
          console.log('Bid request not found - it may have already been deleted');
          console.log('Bid request and all related records deleted successfully');
          return { id, reason };
        }
        console.error('Error checking bid request existence:', checkError);
        throw new Error(`Failed to verify bid request: ${checkError.message}`);
      }

      if (!existingBidRequest) {
        console.log('Bid request not found - it may have already been deleted');
        console.log('Bid request and all related records deleted successfully');
        return { id, reason };
      }

      console.log(`Bid request exists. Attempting deletion...`);
      
      // Step 8: Now safe to delete the bid request itself
      const { data: bidRequestData, error: bidRequestError } = await supabase
        .from('bid_requests')
        .delete()
        .eq('id', id)
        .select();

      if (bidRequestError) {
        console.error('Error deleting bid_request:', bidRequestError);
        console.error('Error details:', JSON.stringify(bidRequestError, null, 2));
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
          console.error('❌ Bid request deletion returned no data, but record still exists!');
          console.error('This likely means RLS policies blocked the deletion.');
          console.error('Current user may not have super_admin role required for deletion.');
          throw new Error('Failed to delete bid request: Deletion was blocked by security policies. You may need super_admin privileges to delete bid requests.');
        } else {
          console.log('✓ Bid request deleted successfully (verified)');
        }
      } else {
        console.log(`✓ Successfully deleted bid request ${id}`);
      }
      
      console.log('Bid request and all related records deleted successfully');
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
      console.error('Error deleting bid request:', error);
      toast.error(`Failed to delete bid request: ${error.message}`);
    },
  });
};
