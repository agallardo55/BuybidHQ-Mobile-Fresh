
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
        console.log('Starting user data fetch...');
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData.session) return null;

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return null;

        // First fetch the user data
        const { data: userData, error: profileError } = await supabase
          .from('buybidhq_users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (!userData) {
          const basicProfile: UserData = {
            id: user.id,
            role: 'basic',
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
            dealership: null,
          };

          const { data: newProfile, error: insertError } = await supabase
            .from('buybidhq_users')
            .insert([basicProfile])
            .select()
            .single();

          if (insertError) throw insertError;
          return { ...newProfile, dealership: null } as UserData;
        }

        // If user has a dealership_id, fetch the dealership data separately
        let dealershipData = null;
        if (userData.dealership_id) {
          const { data: dealership, error: dealershipError } = await supabase
            .from('dealerships')
            .select('*')
            .eq('id', userData.dealership_id)
            .single();

          if (dealershipError) {
            console.error('Error fetching dealership:', dealershipError);
          } else {
            dealershipData = dealership;
          }
        }

        return {
          ...userData,
          dealership: dealershipData
        } as UserData;
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
