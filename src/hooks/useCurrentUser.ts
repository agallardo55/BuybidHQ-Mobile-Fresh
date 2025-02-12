
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { shouldEnforceRoleChecks } from "@/config/features";

export type UserRole = 'admin' | 'dealer' | 'basic';

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
        .select('*, dealerships:dealership_id(*)')
        .eq('id', user?.id)
        .maybeSingle();
        
      if (userError) throw userError;

      if (!userData && shouldEnforceRoleChecks()) {
        throw new Error("User data not found");
      }

      return {
        id: user?.id,
        ...userData || { 
          role: 'admin' as UserRole, 
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
        }
      };
    },
    meta: {
      onSuccess: (data: UserData) => {
        if (shouldEnforceRoleChecks() && data.role !== 'admin' && data.role !== 'dealer') {
          toast.error("You don't have permission to access this page");
          navigate('/dashboard');
        }
      }
    }
  });

  return { currentUser, isLoading };
};
