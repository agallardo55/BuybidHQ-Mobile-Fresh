
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DealershipFormData } from "@/types/dealerships";

export const useDealershipMutations = () => {
  const queryClient = useQueryClient();

  const createDealership = useMutation({
    mutationFn: async (data: DealershipFormData) => {
      const { error } = await supabase
        .from('dealerships')
        .insert([{
          dealer_name: data.dealerName,
          dealer_id: data.dealerId,
          business_phone: data.businessPhone,
          business_email: data.businessEmail,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          license_number: data.licenseNumber,
          website: data.website,
          notes: data.notes
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerships'] });
      toast.success('Dealership created successfully');
    },
    onError: (error) => {
      console.error('Error creating dealership:', error);
      toast.error('Failed to create dealership');
    }
  });

  const updateDealership = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DealershipFormData> }) => {
      const { error } = await supabase
        .from('dealerships')
        .update({
          dealer_name: data.dealerName,
          dealer_id: data.dealerId,
          business_phone: data.businessPhone,
          business_email: data.businessEmail,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          license_number: data.licenseNumber,
          website: data.website,
          notes: data.notes
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerships'] });
      toast.success('Dealership updated successfully');
    },
    onError: (error) => {
      console.error('Error updating dealership:', error);
      toast.error('Failed to update dealership');
    }
  });

  const deleteDealership = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dealerships')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerships'] });
      toast.success('Dealership deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting dealership:', error);
      toast.error('Failed to delete dealership');
    }
  });

  return {
    createDealership,
    updateDealership,
    deleteDealership
  };
};
