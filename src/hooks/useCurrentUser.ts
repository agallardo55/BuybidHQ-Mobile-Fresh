
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, UserRole } from "@/types/users";
import { AppRole } from "@/types/accounts";
import { useAuth } from "@/contexts/AuthContext";

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  app_role: AppRole;
  full_name: string | null;
  mobile_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  account_id: string | null;
  dealership_id: string | null;
  dealer_name: string | null;
  business_phone: string | null;
  business_email: string | null;
  phone_carrier: string | null;
  profile_photo: string | null;
  bid_request_email_enabled: boolean;
  bid_request_sms_enabled: boolean;
  license_number?: string | null;
}

export const useCurrentUser = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const { data: currentUser, isLoading } = useQuery<UserData | null>({
    queryKey: ['currentUser', authUser?.id], // Add authUser.id to key for better cache invalidation
    queryFn: async ({ signal }) => {
      try {
        console.log('Fetching current user session...');
        
        // Check if request was already aborted
        if (signal?.aborted) {
          console.log('Request aborted before starting');
          return null;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return null;
        }

        if (!session?.user?.id) {
          console.log('No active session found');
          return null;
        }

        // Check abort signal again
        if (signal?.aborted) {
          console.log('Request aborted after session check');
          return null;
        }

        // Get user data from buybidhq_users table
        console.log('Attempting to fetch user data for ID:', session.user.id);
        
        // Remove timeout promise - let React Query handle it
        // Try to get the specific user data
        const { data: userData, error: userError } = await supabase
          .from('buybidhq_users')
          .select('*')
          .eq('id', session.user.id)
          .abortSignal(signal) // Keep this for proper cancellation
          .maybeSingle();

        // Check if aborted after fetch
        if (signal?.aborted) {
          console.log('Request aborted after user fetch');
          return null;
        }

        if (userError) {
          console.error('Error fetching user data:', userError);
          
          // Don't show toast for AbortError
          if (userError.message?.includes('AbortError') || userError.message?.includes('aborted')) {
            console.log('Request was aborted, likely due to component unmounting');
            return null;
          }
            
          // If we have AuthContext data, use it as fallback
          if (authUser) {
            console.log('Database query failed, falling back to AuthContext data');
            
            const fallbackUser: UserData = {
              id: authUser.id,
              email: authUser.email || '',
              role: 'basic',
              app_role: 'member',
              full_name: authUser.user_metadata?.full_name || null,
              mobile_number: authUser.user_metadata?.mobile_number || null,
              address: authUser.user_metadata?.address || null,
              city: authUser.user_metadata?.city || null,
              state: authUser.user_metadata?.state || null,
              zip_code: authUser.user_metadata?.zip_code || null,
              account_id: authUser.app_metadata?.account_id || null,
              dealership_id: authUser.app_metadata?.dealership_id || null,
              dealer_name: null,
              business_phone: null,
              business_email: null,
              license_number: null,
              phone_carrier: authUser.user_metadata?.phone_carrier || null,
              profile_photo: authUser.user_metadata?.profile_photo || null,
              bid_request_email_enabled: true,
              bid_request_sms_enabled: false
            };
            console.log('Fallback user created:', fallbackUser);
            return fallbackUser;
          }
          
          toast.error(`Error loading user data: ${userError.message}`);
          return null;
        }

        if (!userData) {
          console.log('No user data found for ID:', session.user.id);
          
          // Fallback to AuthContext data if available
          if (authUser) {
            console.log('Using AuthContext data as fallback');
            
            const fallbackUser: UserData = {
              id: authUser.id,
              email: authUser.email || '',
              role: 'basic',
              app_role: 'member',
              full_name: authUser.user_metadata?.full_name || null,
              mobile_number: authUser.user_metadata?.mobile_number || null,
              address: authUser.user_metadata?.address || null,
              city: authUser.user_metadata?.city || null,
              state: authUser.user_metadata?.state || null,
              zip_code: authUser.user_metadata?.zip_code || null,
              account_id: authUser.app_metadata?.account_id || null,
              dealership_id: authUser.app_metadata?.dealership_id || null,
              dealer_name: null,
              business_phone: null,
              business_email: null,
              license_number: null,
              phone_carrier: authUser.user_metadata?.phone_carrier || null,
              profile_photo: authUser.user_metadata?.profile_photo || null,
              bid_request_email_enabled: true,
              bid_request_sms_enabled: false
            };
            console.log('Fallback user created:', fallbackUser);
            return fallbackUser;
          }
          
          toast.error("User profile not found. Please try signing out and back in.");
          return null;
        }

        // Check abort signal before continuing
        if (signal?.aborted) {
          console.log('Request aborted before fetching dealership info');
          return null;
        }

        // Get dealership info based on user role
        let dealershipInfo = {
          dealer_name: null,
          business_phone: null,
          business_email: null,
          license_number: null
        };

        if (userData.app_role === 'member') {
          // For Members, get info from individual_dealers table
          const { data: individualDealer } = await supabase
            .from('individual_dealers')
            .select('business_name, business_phone, business_email, license_number')
            .eq('user_id', userData.id)
            .abortSignal(signal) // Add abort signal
            .maybeSingle();
          
          if (individualDealer) {
            dealershipInfo = {
              dealer_name: individualDealer.business_name,
              business_phone: individualDealer.business_phone,
              business_email: individualDealer.business_email,
              license_number: individualDealer.license_number
            };
          }
        } else if (userData.dealership_id) {
          // For Account Admins/Super Admins, get info from dealerships table
          const { data: dealership } = await supabase
            .from('dealerships')
            .select('dealer_name, business_phone, business_email, license_number')
            .eq('id', userData.dealership_id)
            .abortSignal(signal) // Add abort signal
            .maybeSingle();
          
          if (dealership) {
            dealershipInfo = dealership;
          }
        }

        // Check abort signal one more time
        if (signal?.aborted) {
          console.log('Request aborted before checking super admin status');
          return null;
        }

          // Use the new admin detection system instead of legacy is_superadmin
          // Check if user is a super admin using the new system
          const { data: isSuperAdmin, error: superAdminError } = await supabase
            .rpc('is_super_admin', { checking_user_id: userData.id });

          if (superAdminError) {
            console.error('Error checking super admin status:', superAdminError);
          }

          console.log('Is super admin:', isSuperAdmin);

          // Format the response
          const formattedUser: UserData = {
            id: userData.id,
            email: userData.email,
            role: isSuperAdmin ? 'admin' as UserRole : userData.role as UserRole,
            app_role: isSuperAdmin ? 'super_admin' : (userData.app_role as AppRole),
            full_name: userData.full_name,
            mobile_number: userData.mobile_number,
            address: userData.address,
            city: userData.city,
            state: userData.state,
            zip_code: userData.zip_code,
            account_id: userData.account_id,
            dealership_id: userData.dealership_id,
            dealer_name: dealershipInfo.dealer_name,
            business_phone: dealershipInfo.business_phone,
            business_email: dealershipInfo.business_email,
            license_number: dealershipInfo.license_number,
            phone_carrier: userData.phone_carrier,
            profile_photo: userData.profile_photo || null,
            bid_request_email_enabled: userData.bid_request_email_enabled ?? true,
            bid_request_sms_enabled: userData.bid_request_sms_enabled ?? false
          };

        console.log('Successfully fetched user data:', formattedUser);
        return formattedUser;
      } catch (error: any) {
        // Don't log or toast AbortErrors
        if (error?.message?.includes('AbortError') || error?.message?.includes('aborted')) {
          console.log('Query aborted cleanly');
          return null;
        }
        
        console.error('Error in useCurrentUser:', error);
        toast.error("An unexpected error occurred. Please try again.");
        return null;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on AbortError or authentication errors
      if (error?.message?.includes('AbortError') || 
          error?.message?.includes('aborted') || 
          error?.message?.includes('JWT')) {
        return false;
      }
      return failureCount < 2; // Reduce retries from 3 to 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Reduce max delay
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: !!authUser, // Only run query when authUser exists
  });

  return { currentUser, isLoading };
};
