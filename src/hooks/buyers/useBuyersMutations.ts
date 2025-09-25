
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BuyerFormData } from "@/types/buyers";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { UpdateBuyerParams } from "./types";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const useBuyersMutations = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const createBuyerMutation = useMutation({
    mutationFn: async (buyerData: BuyerFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        throw new Error('No valid session');
      }

      if (!currentUser?.account_id) {
        throw new Error('User account information not available');
      }

      console.log("Creating buyer with data:", {
        user_id: currentUser.id,
        account_id: currentUser.account_id,
        owner_user_id: currentUser.id,
        ...buyerData
      });

      const { data, error } = await supabase
        .from('buyers')
        .insert([
          {
            user_id: currentUser.id,
            account_id: currentUser.account_id,
            owner_user_id: currentUser.id,
            buyer_name: buyerData.fullName,
            email: buyerData.email,
            buyer_mobile: buyerData.mobileNumber,
            buyer_phone: buyerData.businessNumber,
            dealer_name: buyerData.dealershipName,
            dealer_id: buyerData.licenseNumber,
            address: buyerData.dealershipAddress,
            city: buyerData.city,
            state: buyerData.state,
            zip_code: buyerData.zipCode,
            phone_carrier: buyerData.phoneCarrier,
            phone_validation_status: 'pending'
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
    mutationFn: async ({ buyerId, buyerData }: UpdateBuyerParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/signin');
        throw new Error('No valid session');
      }

      console.log("Updating buyer:", buyerId, "with data:", buyerData);

      const phoneCarrier = buyerData.phoneCarrier === 'N/A' ? null : buyerData.phoneCarrier || null;

      const { error } = await supabase
        .from('buyers')
        .update({
          buyer_name: buyerData.fullName,
          email: buyerData.email,
          buyer_mobile: buyerData.mobileNumber,
          buyer_phone: buyerData.businessNumber,
          dealer_name: buyerData.dealershipName,
          dealer_id: buyerData.licenseNumber,
          address: buyerData.dealershipAddress,
          city: buyerData.city,
          state: buyerData.state,
          zip_code: buyerData.zipCode,
          phone_carrier: phoneCarrier,
          phone_validation_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', buyerId);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      toast.success("Buyer updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update buyer error:", error);
      if (error.message?.includes('JWT')) {
        navigate('/signin');
      } else if (error.message?.includes('valid_phone_carrier')) {
        toast.error("Invalid phone carrier selected. Please choose a valid carrier.");
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
    createBuyer: createBuyerMutation.mutateAsync,
    updateBuyer: updateBuyerMutation.mutate,
    deleteBuyer: deleteBuyerMutation.mutate,
  };
};
