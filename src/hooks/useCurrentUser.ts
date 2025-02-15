
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, UserRole, BaseUser } from "@/types/users";

interface UserData extends BaseUser {
  dealership?: {
    id: string;
    dealer_name: string | null;
    business_phone: string | null;
    business_email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  } | null;
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

        // Check if user is a superadmin first
        const { data: isSuperAdmin, error: superAdminError } = await supabase
          .rpc('is_superadmin', { user_email: session.user.email });

        if (superAdminError) {
          console.error('Error checking superadmin status:', superAdminError);
        }

        console.log('Is superadmin:', isSuperAdmin);

        console.log('Fetching user data for ID:', session.user.id);
        const { data: userData, error: userError } = await supabase
          .from('buybidhq_users')
          .select(`
            id,
            email,
            role,
            status,
            full_name,
            mobile_number,
            address,
            city,
            state,
            zip_code,
            company,
            dealership_id,
            is_active,
            created_at,
            updated_at,
            dealership:dealerships (
              id,
              dealer_name,
              business_phone,
              business_email,
              address,
              city,
              state,
              zip_code
            )
          `)
          .eq('id', session.user.id)
          .maybeSingle();

        if (userError) {
          console.error('Error fetching user data:', userError);
          toast.error(`Error loading user data: ${userError.message}`);
          return null;
        }

        if (!userData) {
          console.log('No user data found for ID:', session.user.id);
          toast.error("User profile not found. Please try signing out and back in.");
          return null;
        }

        // If user is a superadmin, ensure they have admin role
        if (isSuperAdmin) {
          userData.role = 'admin' as UserRole;
        }

        console.log('Successfully fetched user data:', userData);
        return userData;
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
