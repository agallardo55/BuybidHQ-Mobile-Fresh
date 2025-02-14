
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type UserRole = 'basic' | 'individual' | 'dealer' | 'associate';

interface UserData {
  id: string;
  role: UserRole;
  status: string;
  full_name: string | null;
  email: string;
  mobile_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  company: string | null;
  dealership_id: string | null;
  dealerships: {
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

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        console.log('Starting user data fetch...');
        
        // First check if we have a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        if (!sessionData.session) {
          console.log('No active session found');
          return null;
        }
        console.log('Session found:', sessionData.session.user.id);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('User error:', userError);
          throw userError;
        }
        if (!user) {
          console.log('No authenticated user found');
          return null;
        }
        console.log('Auth user found:', user.id);

        // Try to fetch the user profile
        const { data: userData, error: profileError } = await supabase
          .from('buybidhq_users')
          .select(`
            id,
            role,
            status,
            full_name,
            email,
            mobile_number,
            address,
            city,
            state,
            zip_code,
            company,
            dealership_id,
            dealerships:dealership_id (
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
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile error:', profileError);
          throw profileError;
        }

        if (!userData) {
          console.log('No user profile found, creating basic profile...');
          const basicProfile = {
            id: user.id,
            role: 'basic' as UserRole,
            status: 'active',
            full_name: '',
            email: user.email || '',
            mobile_number: '',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            company: '',
            dealership_id: null,
            dealerships: null,
          };

          const { data: newProfile, error: insertError } = await supabase
            .from('buybidhq_users')
            .insert([basicProfile])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating basic profile:', insertError);
            throw insertError;
          }

          console.log('Successfully created basic profile:', newProfile);
          return newProfile;
        }

        console.log('Successfully fetched user profile:', userData);
        return userData;
      } catch (error) {
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
