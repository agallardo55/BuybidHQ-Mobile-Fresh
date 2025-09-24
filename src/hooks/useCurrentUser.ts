
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, UserRole } from "@/types/users";
import { AppRole } from "@/types/accounts";

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

  const { data: currentUser, isLoading } = useQuery<UserData | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        console.log('Fetching current user session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return null;
        }

        if (!session?.user?.id) {
          console.log('No active session found');
          return null;
        }

        // Get user data from buybidhq_users table with dealership info
        const { data: userDataArray, error: userError } = await supabase
          .from('buybidhq_users')
          .select(`
            *,
            dealerships!buybidhq_users_dealership_id_fkey (
              dealer_name,
              business_phone,
              business_email,
              license_number
            )
          `)
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          toast.error(`Error loading user data: ${userError.message}`);
          return null;
        }

        if (!userDataArray) {
          console.log('No user data found for ID:', session.user.id);
          toast.error("User profile not found. Please try signing out and back in.");
          return null;
        }

        const userData = userDataArray;

        // Check if user is a superadmin
        const { data: isSuperAdmin, error: superAdminError } = await supabase
          .rpc('is_superadmin', { user_email: session.user.email });

        if (superAdminError) {
          console.error('Error checking superadmin status:', superAdminError);
        }

        console.log('Is superadmin:', isSuperAdmin);

        // Format the response
        const formattedUser: UserData = {
          id: userData.id,
          email: userData.email,
          role: isSuperAdmin ? 'admin' as UserRole : userData.role,
          app_role: isSuperAdmin ? 'super_admin' : (userData.app_role as AppRole),
          full_name: userData.full_name,
          mobile_number: userData.mobile_number,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zip_code: userData.zip_code,
          dealership_id: userData.dealership_id,
          dealer_name: userData.dealerships?.dealer_name || null,
          business_phone: userData.dealerships?.business_phone || null,
          business_email: userData.dealerships?.business_email || null,
          license_number: userData.dealerships?.license_number || null,
          phone_carrier: userData.phone_carrier,
          profile_photo: userData.profile_photo || null,
          bid_request_email_enabled: userData.bid_request_email_enabled ?? true,
          bid_request_sms_enabled: userData.bid_request_sms_enabled ?? false
        };

        console.log('Successfully fetched user data:', formattedUser);
        return formattedUser;
      } catch (error: any) {
        console.error('Error in useCurrentUser:', error);
        toast.error("An unexpected error occurred. Please try again.");
        return null;
      }
    },
    retry: 2,
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });

  return { currentUser, isLoading };
};
