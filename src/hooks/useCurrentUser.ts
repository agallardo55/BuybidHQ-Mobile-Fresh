
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, UserRole } from "@/types/users";

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
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

        // Use our new security definer function to get user data
        const { data: userDataArray, error: userError } = await supabase
          .rpc('get_user_with_dealership', {
            user_id: session.user.id
          });

        if (userError) {
          console.error('Error fetching user data:', userError);
          toast.error(`Error loading user data: ${userError.message}`);
          return null;
        }

        if (!userDataArray || userDataArray.length === 0) {
          console.log('No user data found for ID:', session.user.id);
          toast.error("User profile not found. Please try signing out and back in.");
          return null;
        }

        // Get the first (and only) user record
        const userData = userDataArray[0];

        // Fetch profile photo separately
        const { data: profileData } = await supabase
          .from('buybidhq_users')
          .select('profile_photo')
          .eq('id', session.user.id)
          .single();

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
          full_name: userData.full_name,
          mobile_number: userData.mobile_number,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zip_code: userData.zip_code,
          dealership_id: userData.dealership_id,
          dealer_name: userData.dealer_name,
          business_phone: userData.business_phone,
          business_email: userData.business_email,
          phone_carrier: userData.phone_carrier,
          profile_photo: profileData?.profile_photo || null
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
