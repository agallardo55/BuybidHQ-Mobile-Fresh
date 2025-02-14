
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type UserRole = 'basic' | 'individual' | 'dealer' | 'associate';

interface Dealership {
  id: string;
  dealer_name: string | null;
  business_phone: string | null;
  business_email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
}

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
  dealership?: Dealership | null;
}

export const useCurrentUser = () => {
  const navigate = useNavigate();

  const { data: currentUser, isLoading } = useQuery<UserData | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        // Get session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) return null;

        // Simple query to get user data
        const { data: userData, error: userError } = await supabase
          .from('buybidhq_users')
          .select(`
            *,
            dealership:dealerships(*)
          `)
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          if (userError.code === 'PGRST116') {
            // If user doesn't exist, create basic profile
            const basicProfile: Omit<UserData, 'dealership'> = {
              id: session.user.id,
              role: 'basic',
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
            };

            const { data: newProfile, error: insertError } = await supabase
              .from('buybidhq_users')
              .insert([basicProfile])
              .select(`
                *,
                dealership:dealerships(*)
              `)
              .single();

            if (insertError) throw insertError;
            return newProfile;
          }
          throw userError;
        }

        return userData;
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
