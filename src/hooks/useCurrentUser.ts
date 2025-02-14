
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { shouldEnforceRoleChecks } from "@/config/features";

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
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select(`
          *,
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
        .eq('id', user?.id)
        .maybeSingle();
        
      if (userError) throw userError;

      if (!userData && shouldEnforceRoleChecks()) {
        throw new Error("User data not found");
      }

      return userData || { 
        id: user?.id,
        role: 'basic' as UserRole, 
        status: 'active',
        full_name: '',
        email: user?.email || '',
        mobile_number: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        company: '',
        dealership_id: null,
        dealerships: null,
      };
    },
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching user data:', error);
        toast.error("Error loading user data. Please try signing in again.");
        navigate('/signin');
      }
    }
  });

  return { currentUser, isLoading };
};
