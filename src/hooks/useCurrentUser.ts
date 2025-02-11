
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useCurrentUser = () => {
  const navigate = useNavigate();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      const { data: userData, error: userError } = await supabase
        .from('buybidhq_users')
        .select('role')
        .eq('id', user?.id)
        .single();
        
      if (userError) throw userError;
      return userData;
    },
    meta: {
      onSuccess: (data: { role: string }) => {
        if (data.role !== 'admin' && data.role !== 'dealer') {
          toast.error("You don't have permission to access this page");
          navigate('/dashboard');
        }
      }
    }
  });

  return { currentUser, isLoading };
};
