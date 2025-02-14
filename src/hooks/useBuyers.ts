
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BuyerFormData } from "@/types/buyers";
import { toast } from "sonner";
import { useCurrentUser } from "./useCurrentUser";

export const useBuyers = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const { data: buyers = [], isLoading } = useQuery({
    queryKey: ['buyers', currentUser?.role],
    queryFn: async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const query = supabase
          .from('buyers')
          .select(`
            *,
            buybidhq_users!fk_user_id (
              full_name,
              email
            )
          `);
        
        // Apply filter based on role that was determined before the query
        if (currentUser?.role !== 'admin') {
          query.eq('user_id', userData.user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Buyer fetch error:", error);
          throw error;
        }

        if (!data) {
          return [];
        }

        return data.map(buyer => ({
          id: buyer.id,
          name: buyer.buyer_name,
          email: buyer.email,
          dealership: buyer.dealer_name,
          phone: buyer.buyer_mobile, // Changed from buyer_phone to buyer_mobile
          location: `${buyer.city || ''}, ${buyer.state || ''}`.replace(/, $/, ''),
          acceptedBids: buyer.accepted_bids || 0,
          pendingBids: buyer.pending_bids || 0,
          declinedBids: buyer.declined_bids || 0,
          ownerName: buyer.buybidhq_users?.full_name || 'N/A',
          ownerEmail: buyer.buybidhq_users?.email || 'N/A'
        }));
      } catch (error) {
        console.error("Error in buyers query:", error);
        toast.error("Failed to fetch buyers. Please try again.");
        throw error;
      }
    },
    enabled: !!currentUser,
  });

  const createBuyerMutation = useMutation({
    mutationFn: async (buyerData: BuyerFormData) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      toast.success("Buyer added successfully!");
    },
    onError: (error) => {
      console.error("Create buyer error:", error);
      toast.error("Failed to add buyer. Please try again.");
    },
  });

  const updateBuyerMutation = useMutation({
    mutationFn: async ({ buyerId, buyerData }: { buyerId: string; buyerData: BuyerFormData }) => {
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
    onError: (error) => {
      console.error("Update buyer error:", error);
      toast.error("Failed to update buyer. Please try again.");
    },
  });

  const deleteBuyerMutation = useMutation({
    mutationFn: async (buyerId: string) => {
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
    onError: (error) => {
      console.error("Delete buyer error:", error);
      toast.error("Failed to delete buyer. Please try again.");
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
