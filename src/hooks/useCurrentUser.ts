
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { shouldEnforceRoleChecks } from "@/config/features";

export type UserRole = 'admin' | 'dealer' | 'basic';

interface UserData {
  role: UserRole;
  status: string;
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
        .select('role, status')
        .eq('id', user?.id)
        .maybeSingle();
        
      if (userError) throw userError;

      if (!userData && shouldEnforceRoleChecks()) {
        throw new Error("User data not found");
      }

      // During development, provide a default role if none exists
      return userData || { role: 'admin' as UserRole, status: 'active' };
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

