
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
        // Get session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          return null;
        }
        
        if (!session?.user?.id) {
          console.log('No active session');
          return null;
        }

        // First check if user is a superadmin using maybeSingle()
        const { data: superadminData, error: superadminError } = await supabase
          .from('superadmin')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();

        if (superadminError) {
          console.error('Error checking superadmin:', superadminError);
        }

        if (superadminData) {
          console.log('User is a superadmin');
          return {
            id: session.user.id,
            email: superadminData.email,
            role: 'dealer' as UserRole, // Use dealer role for UI compatibility
            status: superadminData.status || 'active',
            full_name: superadminData.full_name,
            mobile_number: superadminData.mobile_number,
            address: null,
            city: null,
            state: null,
            zip_code: null,
            company: null,
            dealership_id: null,
            is_active: true,
            dealership: null
          };
        }

        // If not superadmin, get regular user data using rpc function to avoid recursion
        const { data: userData, error: userError } = await supabase
          .rpc('get_user_profile', { user_id: session.user.id });

        if (userError) {
          console.error('Error fetching user data:', userError);
          
          // Only create new profile if we couldn't find the user
          if (userError.code === 'PGRST116') {
            console.log('Creating new user profile');
            const basicProfile = {
              id: session.user.id,
              role: 'basic' as UserRole,
              status: 'active',
              full_name: '',
              email: session.user.email || '',
              mobile_number: '',
              address: '',
              city: '',
              state: '',
              zip_code: '',
              company: '',
              dealership_id: null,
              is_active: true
            };

            const { data: newProfile, error: insertError } = await supabase
              .from('buybidhq_users')
              .insert(basicProfile)
              .select()
              .single();

            if (insertError) {
              console.error('Error creating user profile:', insertError);
              throw insertError;
            }

            return {
              ...newProfile,
              dealership: null
            };
          }
          
          throw userError;
        }

        if (!userData) {
          throw new Error('No user data found');
        }

        // If user has a dealership_id, fetch the dealership data
        if (userData.dealership_id) {
          const { data: dealership, error: dealershipError } = await supabase
            .from('dealerships')
            .select('*')
            .eq('id', userData.dealership_id)
            .maybeSingle();

          if (dealershipError) {
            console.error('Error fetching dealership:', dealershipError);
            return {
              ...userData,
              dealership: null
            };
          }

          return {
            ...userData,
            dealership
          };
        }

        return {
          ...userData,
          dealership: null
        };
      } catch (error: any) {
        console.error('Error in useCurrentUser:', error);
        toast.error("Error loading user data. Please try signing in again.");
        navigate('/signin');
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  return { currentUser, isLoading };
};
