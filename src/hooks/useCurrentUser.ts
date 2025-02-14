
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

        // First try to get existing user data
        const { data: userData, error: userError } = await supabase
          .from('buybidhq_users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          
          // Only create new profile if the error is that the record doesn't exist
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

        // If user has a dealership_id, fetch the dealership data
        if (userData?.dealership_id) {
          const { data: dealership, error: dealershipError } = await supabase
            .from('dealerships')
            .select('*')
            .eq('id', userData.dealership_id)
            .single();

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
