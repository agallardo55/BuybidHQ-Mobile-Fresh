
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BuyerFormData } from "@/types/buyers";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";
import { useNavigate } from "react-router-dom";

export const useBuyers = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const { data: buyers = [], isLoading } = useQuery({
    queryKey: ['buyers', currentUser?.role],
    queryFn: async () => {
      try {
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.error("No valid session:", sessionError);
          navigate('/signin');
          return [];
        }

        // Get current user data
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Auth error:", userError);
          if (userError.message.includes("Invalid refresh token")) {
            navigate('/signin');
          }
          throw userError;
        }

        console.log("Current user role:", currentUser?.role);
        console.log("User data:", userData);

        let query = supabase
          .from('buyers')
          .select(`
            *,
            buybidhq_users!fk_user_id (
              full_name,
              email
            )
          `);
        
        // Apply filter based on role
        if (currentUser?.role !== 'dealer') {
          query = query.eq('user_id', userData.user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Buyer fetch error:", error);
          if (error.code === 'PGRST116') {
            navigate('/signin');
            return [];
          }
          throw error;
        }

        if (!data) {
          console.log("No data returned from query");
          return [];
        }

        console.log("Raw buyers data:", data);

        const mappedBuyers = data.map(buyer => ({
          id: buyer.id,
          name: buyer.buyer_name,
          email: buyer.email,
          dealership: buyer.dealer_name,
          phone: buyer.buyer_mobile,
          location: `${buyer.city || ''}, ${buyer.state || ''}`.replace(/, $/, ''),
          acceptedBids: buyer.accepted_bids || 0,
          pendingBids: buyer.pending_bids || 0,
          declinedBids: buyer.declined_bids || 0,
          ownerName: buyer.buybidhq_users?.full_name || 'N/A',
          ownerEmail: buyer.buybidhq_users?.email || 'N/A'
        }));

        console.log("Mapped buyers:", mappedBuyers);
        return mappedBuyers;
      } catch (error: any) {
        console.error("Error in buyers query:", error);
        if (error.message?.includes('JWT')) {
          navigate('/signin');
          return [];
        }
        toast.error("Failed to fetch buyers. Please try again.");
        throw error;
      }
    },
    enabled: !!currentUser,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('JWT') || 
          error?.message?.includes('Invalid refresh token')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const createBuyerMutation = useMutation({
    mutationFn: async (buyerData: BuyerFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        throw new Error('No valid session');
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      console.log("Creating buyer with data:", {
        user_id: userData.user.id,
        ...buyerData
      });

      const { data, error } = await supabase
        .from('buyers')
        .insert([
          {
            user_id: userData.user.id,
            buyer_name: buyerData.fullName,
            email: buyerData.email,
            buyer_mobile: buyerData.mobileNumber,
            buyer_phone: buyerData.businessNumber,
            dealer_name: buyerData.dealershipName,
            dealer_number: buyerData.licenseNumber,
            address: buyerData.dealershipAddress,
            city: buyerData.city,
            state: buyerData.state,
            zip_code: buyerData.zipCode,
            accepted_bids: 0,
            pending_bids: 0,
            declined_bids: 0
          }
        ])
        .select()
        .single();

      if (error) {
        console.error("Create buyer error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      toast.success("Buyer added successfully!");
    },
    onError: (error: any) => {
      console.error("Create buyer error:", error);
      if (error.message?.includes('JWT')) {
        navigate('/signin');
      } else {
        toast.error("Failed to add buyer. Please try again.");
      }
    },
  });

  const updateBuyerMutation = useMutation({
    mutationFn: async ({ buyerId, buyerData }: { buyerId: string; buyerData: BuyerFormData }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        throw new Error('No valid session');
      }

      console.log("Updating buyer:", buyerId, "with data:", buyerData);

      const { error } = await supabase
        .from('buyers')
        .update({
          buyer_name: buyerData.fullName,
          email: buyerData.email,
          buyer_mobile: buyerData.mobileNumber,
          buyer_phone: buyerData.businessNumber,
          dealer_name: buyerData.dealershipName,
          dealer_number: buyerData.licenseNumber,
          address: buyerData.dealershipAddress,
          city: buyerData.city,
          state: buyerData.state,
          zip_code: buyerData.zipCode,
        })
        .eq('id', buyerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      toast.success("Buyer updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update buyer error:", error);
      if (error.message?.includes('JWT')) {
        navigate('/signin');
      } else {
        toast.error("Failed to update buyer. Please try again.");
      }
    },
  });

  const deleteBuyerMutation = useMutation({
    mutationFn: async (buyerId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        throw new Error('No valid session');
      }

      console.log("Deleting buyer:", buyerId);

      const { error } = await supabase
        .from('buyers')
        .delete()
        .eq('id', buyerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      toast.success("Buyer deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Delete buyer error:", error);
      if (error.message?.includes('JWT')) {
        navigate('/signin');
      } else {
        toast.error("Failed to delete buyer. Please try again.");
      }
    },
  });

  return {
    buyers,
    isLoading,
    createBuyer: createBuyerMutation.mutate,
    updateBuyer: updateBuyerMutation.mutate,
    deleteBuyer: deleteBuyerMutation.mutate,
  };
};
