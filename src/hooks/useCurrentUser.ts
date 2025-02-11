
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

      if (!userData) {
        throw new Error("User data not found");
      }

      return userData as UserData;
    },
    meta: {
      onSuccess: (data: UserData) => {
        if (data.role !== 'admin' && data.role !== 'dealer') {
          toast.error("You don't have permission to access this page");
          navigate('/dashboard');
        }
      }
    }
  });

  return { currentUser, isLoading };
};
