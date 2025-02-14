
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
        // First check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user?.id) {
          console.log('No active session');
          return null;
        }

        // Get user data with dealership information
        const { data: userData, error: userError } = await supabase
          .from('buybidhq_users')
          .select(`
            *,
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
          toast.error("Error loading user data. Please try signing in again.");
          navigate('/signin');
          throw userError;
        }

        if (!userData) {
          console.error('No user data found');
          return null;
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
