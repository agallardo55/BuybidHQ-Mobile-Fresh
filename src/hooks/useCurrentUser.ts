
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, UserRole } from "@/types/users";

interface UserData {
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

        // Get user data using our new security definer function
        const { data: userData, error: userError } = await supabase
          .rpc('get_user_with_dealership', {
            user_id: session.user.id
          });

        if (userError) {
          console.error('Error fetching user data:', userError);
          toast.error(`Error loading user data: ${userError.message}`);
          return null;
        }

        if (!userData || userData.length === 0) {
          console.log('No user data found for ID:', session.user.id);
          toast.error("User profile not found. Please try signing out and back in.");
          return null;
        }

        // Check if user is a superadmin
        const { data: isSuperAdmin, error: superAdminError } = await supabase
          .rpc('is_superadmin', { user_email: session.user.email });

        if (superAdminError) {
          console.error('Error checking superadmin status:', superAdminError);
        }

        console.log('Is superadmin:', isSuperAdmin);

        // Format the response to match our User type
        const formattedUser: UserData = {
          ...userData[0],
          role: isSuperAdmin ? 'admin' as UserRole : userData[0].role
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
